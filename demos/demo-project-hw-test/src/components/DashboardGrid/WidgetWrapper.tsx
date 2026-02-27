import { useState, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { WidgetLayout } from '../../types/layout'
import { useLayoutContext } from './LayoutContext'
import { Widget } from '../Widget/Widget'
import { useResizeWidget } from '../../hooks/useResizeWidget'

interface WidgetWrapperProps {
  item: WidgetLayout
  isDragging: boolean
}

export function WidgetWrapper({ item, isDragging }: WidgetWrapperProps) {
  const { columns, rowHeight } = useLayoutContext()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Trigger entrance animation on next tick
    const timer = setTimeout(() => setIsMounted(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { item },
  })

  const { resizeHandleProps, previewStyle } = useResizeWidget(item, isDragging)

  // Compute absolute pixel position
  // containerWidth is 100% — we use percentage for x, pixels for y
  const xPercent = (item.x / columns) * 100
  const widthPercent = (item.w / columns) * 100
  const top = item.y * rowHeight
  const height = item.h * rowHeight

  // During drag, @dnd-kit tracks movement via transform; we keep the widget in place
  // and show a ghost via DragPreview instead.
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${xPercent}%`,
    top,
    width: `${widthPercent}%`,
    height,
    transition: isDragging ? 'none' : 'left 0.15s, top 0.15s, opacity 0.3s ease-out, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxSizing: 'border-box',
    padding: 4,
    opacity: isMounted ? 1 : 0,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : isMounted ? undefined : 'scale(0.8)',
    zIndex: isDragging ? 50 : 1,
  }

  const dragHandleProps = { ...listeners, ...attributes }

  return (
    <div ref={setNodeRef} style={style}>
      <Widget item={item} dragHandleProps={dragHandleProps} isDragging={isDragging} />

      {/* Resize preview overlay */}
      {previewStyle && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px dashed rgba(99,102,241,0.8)',
            borderRadius: 8,
            pointerEvents: 'none',
            ...previewStyle,
          }}
        />
      )}

      {/* Resize handle */}
      {!isDragging && (
        <div
          {...resizeHandleProps}
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            width: 44,
            height: 44,
            cursor: 'se-resize',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: 6,
            zIndex: 10,
          }}
          aria-label="Resize widget"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 9L9 1M5 9L9 5M9 9V9" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  )
}
