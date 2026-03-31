// UC1-S1, UC1-S2, UC1-S6, UC2-S1, UC2-S2, UC2-S6, UC3-S1
// UC1-E4a1, UC1-E5a2, UC1-E5b, UC2-E4a2, UC2-E5b
import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import type { DraggableWidgetProps } from './types'

export const WIDGET_TYPE = 'WIDGET'

export interface DragItem {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export function DraggableWidget({
  id, x, y, w, h, cellSize, children,
}: DraggableWidgetProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag, dragPreview] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: WIDGET_TYPE,
    item: { id, x, y, w, h },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  // Suppress the browser's native drag image — we use a custom drag layer
  React.useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true })
  }, [dragPreview])

  drag(ref)

  return (
    <div
      ref={ref}
      data-testid={`draggable-widget-${id}`}
      style={{
        position: 'absolute',
        left: x * cellSize,
        top: y * cellSize,
        width: w * cellSize,
        height: h * cellSize,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  )
}
