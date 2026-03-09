import { useDraggable } from '@dnd-kit/core'
import type { WidgetLayout } from '../types'

interface GridWidgetProps {
  layout: WidgetLayout
  isDragging: boolean
  children?: React.ReactNode
}

/**
 * A widget rendered inside the grid, draggable via @dnd-kit.
 * Tasks 4.1, 4.2, 4.3 (UC1-S1, UC2-S5, UC1-S2)
 */
export function GridWidget({ layout, isDragging, children }: GridWidgetProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: layout.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        gridColumn: `${layout.col + 1} / span ${layout.colSpan}`,
        gridRow: `${layout.row + 1} / span ${layout.rowSpan}`,
        opacity: isDragging ? 0.35 : 1,
        cursor: 'grab',
        zIndex: 1,
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      {children ?? (
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
          {layout.id}
        </div>
      )}
    </div>
  )
}
