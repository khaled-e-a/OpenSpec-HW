import { useState, useRef, useCallback, useMemo } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { WidgetLayout } from '../../types/layout'
import { LayoutContext, type LayoutContextValue } from './LayoutContext'
import { GridBackground } from './GridBackground'
import { DragPreview } from './DragPreview'
import { WidgetWrapper } from './WidgetWrapper'
import { useLayout } from '../../hooks/useLayout'
import { useDashboardPersistence, loadLayout } from '../../hooks/useDashboardPersistence'
import { buildOnDragMove, buildOnDragEnd } from '../../hooks/useDragWidget'

interface DashboardGridProps {
  columns?: number
  rowHeight?: number
  persistenceKey?: string
  /** Controlled mode: provide layout */
  layout?: WidgetLayout[]
  /** Controlled mode: called with updated layout on change */
  onLayoutChange?: (layout: WidgetLayout[]) => void
}

export function DashboardGrid({
  columns = 12,
  rowHeight = 80,
  persistenceKey,
  layout: controlledLayout,
  onLayoutChange,
}: DashboardGridProps) {
  const isControlled = controlledLayout !== undefined

  // Load persisted layout for uncontrolled mode
  const initialLayout = useMemo(() => {
    if (isControlled) return []
    if (persistenceKey) return loadLayout(persistenceKey) ?? []
    return []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount

  const internal = useLayout(initialLayout)

  const layout = isControlled ? controlledLayout : internal.layout

  // Sync controlled layout changes back via onLayoutChange
  const notifyChange = useCallback(
    (updated: WidgetLayout[]) => {
      if (isControlled) onLayoutChange?.(updated)
    },
    [isControlled, onLayoutChange],
  )

  // Persist uncontrolled layout
  useDashboardPersistence(persistenceKey ?? '', isControlled ? [] : internal.layout)

  const [dropTarget, setDropTarget] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const rect = containerRef.current?.getBoundingClientRect() ?? null
      buildOnDragMove(layout, columns, rowHeight, rect, setDropTarget)(event)
    },
    [layout, columns, rowHeight],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const rect = containerRef.current?.getBoundingClientRect() ?? null
      buildOnDragEnd(
        layout,
        columns,
        rowHeight,
        rect,
        (id, x, y, cols) => {
          if (isControlled) {
            const updated = layout.map((w) =>
              w.id === id ? { ...w, x, y } : w,
            )
            notifyChange(updated)
          } else {
            internal.moveWidget(id, x, y, cols)
          }
        },
        setDropTarget,
      )(event)
    },
    [layout, columns, rowHeight, isControlled, notifyChange, internal],
  )

  const addWidget = useCallback(
    (type: string) => {
      if (isControlled) {
        // Controlled add is a no-op here; consumer should handle addWidget themselves
      } else {
        internal.addWidget(type, columns)
      }
    },
    [isControlled, internal, columns],
  )

  const moveWidget = useCallback(
    (id: string, x: number, y: number) => {
      if (isControlled) {
        const updated = layout.map((w) => (w.id === id ? { ...w, x, y } : w))
        notifyChange(updated)
      } else {
        internal.moveWidget(id, x, y, columns)
      }
    },
    [isControlled, layout, notifyChange, internal, columns],
  )

  const resizeWidget = useCallback(
    (id: string, w: number, h: number) => {
      if (isControlled) {
        const updated = layout.map((item) => (item.id === id ? { ...item, w, h } : item))
        notifyChange(updated)
      } else {
        internal.resizeWidget(id, w, h, columns)
      }
    },
    [isControlled, layout, notifyChange, internal, columns],
  )

  const removeWidget = useCallback(
    (id: string) => {
      if (isControlled) {
        const updated = layout.filter((w) => w.id !== id)
        notifyChange(updated)
      } else {
        internal.removeWidget(id)
      }
    },
    [isControlled, layout, notifyChange, internal],
  )

  const totalRows = layout.length
    ? Math.max(...layout.map((w) => w.y + w.h))
    : 4

  const contextValue = useMemo<LayoutContextValue>(
    () => ({
      layout,
      columns,
      rowHeight,
      addWidget,
      moveWidget,
      resizeWidget,
      removeWidget,
      dropTarget,
      setDropTarget,
    }),
    [layout, columns, rowHeight, addWidget, moveWidget, resizeWidget, removeWidget, dropTarget],
  )

  return (
    <LayoutContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            minHeight: `${(totalRows + 2) * rowHeight}px`,
          }}
        >
          <GridBackground totalRows={totalRows} />
          {layout.map((item) => (
            <WidgetWrapper key={item.id} item={item} isDragging={activeId === item.id} />
          ))}
          <DragPreview activeId={activeId} />
        </div>
      </DndContext>
    </LayoutContext.Provider>
  )
}
