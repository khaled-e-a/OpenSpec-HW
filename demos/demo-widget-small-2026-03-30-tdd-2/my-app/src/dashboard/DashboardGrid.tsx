// UC1-S3..S7, UC1-E4a, UC1-E4a1, UC1-E5a, UC1-E5a2
// UC2-S3..S7, UC2-E4a, UC2-E4a2, UC2-E5a
// UC3-S1..S6, UC3-E3a
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import type { DashboardGridProps, WidgetLayout } from './types'
import { WIDGET_TYPE, type DragItem } from './DraggableWidget'
import { pixelToCell, clampToGrid, isValidDrop } from './grid-utils'

interface CandidateState {
  pos: { x: number; y: number; w: number; h: number }
  isValid: boolean
  isOriginal: boolean
}

export function DashboardGrid({
  layout: layoutProp,
  onLayoutChange,
  cellSize = 100,
  colCount: colCountProp,
  rowCount = 8,
  children,
}: DashboardGridProps) {
  // Uncontrolled: internal state. Controlled: render from prop.
  const [internalLayout, setInternalLayout] = useState<WidgetLayout[]>(layoutProp ?? [])
  const activeLayout = layoutProp !== undefined ? layoutProp : internalLayout

  // Compute colCount from container width when not provided
  const containerRef = useRef<HTMLDivElement>(null)
  const [computedCols, setComputedCols] = useState(colCountProp ?? 6)

  useEffect(() => {
    if (colCountProp !== undefined) {
      setComputedCols(colCountProp)
      return
    }
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setComputedCols(Math.max(1, Math.floor(w / cellSize)))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [colCountProp, cellSize])

  const colCount = computedCols

  // Candidate drop highlight state (UC3-S3, UC3-S4, UC3-E3a)
  const [candidate, setCandidate] = useState<CandidateState | null>(null)

  const updateLayout = useCallback(
    (newLayout: WidgetLayout[]) => {
      if (layoutProp === undefined) {
        setInternalLayout(newLayout)
      }
      onLayoutChange(newLayout)
    },
    [layoutProp, onLayoutChange]
  )

  const [, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: WIDGET_TYPE,
    hover(item, monitor) {
      const offset = monitor.getClientOffset()
      const el = containerRef.current
      if (!offset || !el) return

      const rect = el.getBoundingClientRect()
      const relX = offset.x - rect.left
      const relY = offset.y - rect.top

      // Pointer outside canvas
      if (relX < 0 || relY < 0 || relX >= colCount * cellSize || relY >= rowCount * cellSize) {
        setCandidate(null)
        return
      }

      const raw = pixelToCell(relX, relY, cellSize)
      const clamped = clampToGrid(raw.x, raw.y, item.w, item.h, colCount, rowCount)
      const candidateWidget: WidgetLayout = { id: item.id, ...clamped, w: item.w, h: item.h }
      const valid = isValidDrop(candidateWidget, activeLayout, colCount, rowCount, item.id)
      const isOriginal = clamped.x === item.x && clamped.y === item.y

      setCandidate({ pos: { ...clamped, w: item.w, h: item.h }, isValid: valid, isOriginal })
    },
    drop(item, monitor) {
      setCandidate(null)
      const offset = monitor.getClientOffset()
      const el = containerRef.current
      if (!offset || !el) return

      const rect = el.getBoundingClientRect()
      const relX = offset.x - rect.left
      const relY = offset.y - rect.top

      const raw = pixelToCell(relX, relY, cellSize)
      const clamped = clampToGrid(raw.x, raw.y, item.w, item.h, colCount, rowCount)
      const candidateWidget: WidgetLayout = { id: item.id, ...clamped, w: item.w, h: item.h }

      if (!isValidDrop(candidateWidget, activeLayout, colCount, rowCount, item.id)) return

      const existing = activeLayout.find((w) => w.id === item.id)
      let newLayout: WidgetLayout[]
      if (existing) {
        // Reposition existing widget
        newLayout = activeLayout.map((w) =>
          w.id === item.id ? { ...w, x: clamped.x, y: clamped.y } : w
        )
      } else {
        // Place new widget
        newLayout = [...activeLayout, candidateWidget]
      }
      updateLayout(newLayout)
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  })

  // Clear candidate when not hovering
  const prevIsOverRef = useRef(false)
  const [, { handlerId }] = useDrop({ accept: WIDGET_TYPE, collect: (m) => ({ handlerId: m.getHandlerId(), isOver: m.isOver() }) })

  drop(containerRef)

  // Highlight overlay color
  const highlightColor = candidate
    ? candidate.isOriginal
      ? 'rgba(150,150,150,0.35)'
      : candidate.isValid
      ? 'rgba(72,199,116,0.40)'
      : 'rgba(220,53,69,0.40)'
    : undefined

  return (
    <div
      ref={containerRef}
      data-testid="dashboard-grid"
      style={{
        position: 'relative',
        width: colCount * cellSize,
        height: rowCount * cellSize,
        boxSizing: 'border-box',
      }}
    >
      {children}

      {/* Drop-target highlight overlay (UC3-S3, UC3-S4, UC3-E3a) */}
      {candidate && highlightColor && (
        <div
          data-testid="drop-highlight"
          style={{
            position: 'absolute',
            left: candidate.pos.x * cellSize,
            top: candidate.pos.y * cellSize,
            width: candidate.pos.w * cellSize,
            height: candidate.pos.h * cellSize,
            backgroundColor: highlightColor,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </div>
  )
}
