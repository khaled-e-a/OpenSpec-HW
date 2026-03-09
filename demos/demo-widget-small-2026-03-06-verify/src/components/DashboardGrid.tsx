import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import type { DashboardGridProps, WidgetLayout } from '../types'
import { pointerToCell, clampPosition, hasCollision } from '../utils/grid'
import { GridWidget } from './GridWidget'
import { GridCell } from './GridCell'

interface DropTarget {
  col: number
  row: number
  valid: boolean
}

/**
 * Dashboard grid with drag-and-drop widget placement and grid snapping.
 * Tasks 3.1–3.8, 5.1–5.4, 6.1–6.3
 */
export function DashboardGrid({
  widgets,
  cols,
  cellWidth,
  cellHeight,
  gap,
  onLayoutChange,
}: DashboardGridProps) {
  const rows = Math.max(
    ...widgets.map((w) => w.row + w.rowSpan),
    4,
  )

  // Task 3.3: track active drag item and computed drop target
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const activeWidget = widgets.find((w) => w.id === activeId) ?? null

  // Task 3.4: onDragStart — record dragged widget ID (UC1-S1)
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
    setDropTarget(null)
  }

  // Task 3.5: onDragOver — compute target cell, update drop target state
  // (UC1-S4, UC2-S2, UC2-S3)
  function handleDragOver(event: DragOverEvent) {
    if (!activeWidget || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const pointer = event.activatorEvent instanceof PointerEvent || event.activatorEvent instanceof MouseEvent
      ? { x: (event.activatorEvent as MouseEvent).clientX, y: (event.activatorEvent as MouseEvent).clientY }
      : null

    // Use over cell id if available (more reliable)
    if (event.over?.id) {
      const [, colStr, rowStr] = (event.over.id as string).split('-')
      const rawCol = parseInt(colStr, 10)
      const rawRow = parseInt(rowStr, 10)
      const { col, row } = clampPosition(rawCol, rawRow, activeWidget.colSpan, activeWidget.rowSpan, cols, rows)
      const valid = !hasCollision(widgets, activeWidget.id, col, row, activeWidget.colSpan, activeWidget.rowSpan)
      setDropTarget({ col, row, valid })
      return
    }

    if (pointer) {
      const relX = pointer.x - rect.left
      const relY = pointer.y - rect.top
      const { col: rawCol, row: rawRow } = pointerToCell(relX, relY, cellWidth, cellHeight, gap)
      const { col, row } = clampPosition(rawCol, rawRow, activeWidget.colSpan, activeWidget.rowSpan, cols, rows)
      const valid = !hasCollision(widgets, activeWidget.id, col, row, activeWidget.colSpan, activeWidget.rowSpan)
      setDropTarget({ col, row, valid })
    }
  }

  // Task 3.6: onDragEnd — validate drop, commit or cancel, call onLayoutChange
  // (UC1-S5, UC1-S6, UC1-S7, UC1-E5a, UC1-E5b, UC2-S4, UC2-S5)
  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    setDropTarget(null)

    if (!activeWidget) return

    // UC1-E5a: dropped outside grid (no over target and no valid drop target)
    if (!event.over && !dropTarget) return

    // Determine final position
    let finalCol = activeWidget.col
    let finalRow = activeWidget.row

    if (event.over?.id) {
      const [, colStr, rowStr] = (event.over.id as string).split('-')
      finalCol = parseInt(colStr, 10)
      finalRow = parseInt(rowStr, 10)
    } else if (dropTarget) {
      finalCol = dropTarget.col
      finalRow = dropTarget.row
    } else {
      // UC1-E5a: out-of-bounds, cancel
      return
    }

    const { col, row } = clampPosition(finalCol, finalRow, activeWidget.colSpan, activeWidget.rowSpan, cols, rows)

    // UC1-E5b: occupied cell, cancel
    if (hasCollision(widgets, activeWidget.id, col, row, activeWidget.colSpan, activeWidget.rowSpan)) return

    // Commit — UC1-S7
    const updated = widgets.map((w) =>
      w.id === activeWidget.id ? { ...w, col, row } : w,
    )
    onLayoutChange(updated)
  }

  // Cells for the background grid
  const cells: Array<{ col: number; row: number }> = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ col: c, row: r })
    }
  }

  const gridStyle: React.CSSProperties = {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`,
    gap: `${gap}px`,
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div ref={gridRef} style={gridStyle} data-testid="dashboard-grid">
        {/* Background cells — drop targets (task 5.1) */}
        {cells.map(({ col, row }) => {
          const isTargeted =
            dropTarget !== null &&
            col >= dropTarget.col &&
            col < dropTarget.col + (activeWidget?.colSpan ?? 1) &&
            row >= dropTarget.row &&
            row < dropTarget.row + (activeWidget?.rowSpan ?? 1)

          return (
            <GridCell
              key={`cell-${col}-${row}`}
              col={col}
              row={row}
              isHighlighted={isTargeted && (dropTarget?.valid ?? false)}
              isBlocked={isTargeted && !(dropTarget?.valid ?? true)}
            />
          )
        })}

        {/* Widgets */}
        {widgets.map((w) => (
          <GridWidget key={w.id} layout={w} isDragging={activeId === w.id}>
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#1e293b',
                borderRadius: 6,
                padding: 8,
                color: '#f1f5f9',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {w.id}
            </div>
          </GridWidget>
        ))}
      </div>

      {/* Task 3.7: DragOverlay — floating preview during drag (UC1-S2) */}
      <DragOverlay>
        {activeWidget ? (
          <div
            style={{
              width: activeWidget.colSpan * cellWidth + (activeWidget.colSpan - 1) * gap,
              height: activeWidget.rowSpan * cellHeight + (activeWidget.rowSpan - 1) * gap,
              background: '#334155',
              borderRadius: 6,
              padding: 8,
              color: '#f1f5f9',
              fontSize: 13,
              opacity: 0.85,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
          >
            {activeWidget.id}
          </div>
        ) : null}
      </DragOverlay>
      {/* Task 3.8: DragOverlay is unmounted (null) when activeId is null — UC2-S6 */}
    </DndContext>
  )
}
