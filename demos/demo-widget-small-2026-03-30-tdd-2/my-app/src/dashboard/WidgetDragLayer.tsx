// UC1-S2, UC2-S2, UC3-S2, UC3-S5, UC3-E5a
import React, { useRef, useCallback } from 'react'
import { useDragLayer } from 'react-dnd'
import type { DragItem } from './DraggableWidget'

interface Props {
  cellSize: number
}

export function WidgetDragLayer({ cellSize }: Props) {
  const rafRef = useRef<number | null>(null)

  const { isDragging, item, currentOffset } = useDragLayer<{
    isDragging: boolean
    item: DragItem | null
    currentOffset: { x: number; y: number } | null
  }>((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem() as DragItem | null,
    currentOffset: monitor.getClientOffset(),
  }))

  if (!isDragging || !item || !currentOffset) return null

  const { x, y } = currentOffset
  const width = item.w * cellSize
  const height = item.h * cellSize

  return (
    <div
      data-testid="drag-layer"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: 0,
        top: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: x - width / 2,
          top: y - height / 2,
          width,
          height,
          opacity: 0.6,
          background: 'rgba(100,120,200,0.3)',
          border: '2px dashed rgba(100,120,200,0.7)',
          borderRadius: 4,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
