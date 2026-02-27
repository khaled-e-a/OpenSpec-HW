import React, { Component, useRef } from 'react'
import type { WidgetDescriptor, PixelRect } from '../types'
import { resolve } from '../registry/WidgetRegistry'
import { ResizeHandle } from './ResizeHandle'
import './Widget.css'

interface WidgetErrorBoundaryState { hasError: boolean; type: string }

class WidgetErrorBoundary extends Component<
  { type: string; children: React.ReactNode },
  WidgetErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, type: props.type }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="widget__error-tile">
          Error rendering widget "{this.state.type}"
        </div>
      )
    }
    return this.props.children
  }
}

interface WidgetProps {
  descriptor: WidgetDescriptor
  rect: PixelRect
  isDragging: boolean
  isResizing: boolean
  dragDisabled: boolean
  resizeDisabled: boolean
  onDragStart: (offsetX: number, offsetY: number, pointerId: number) => void
  onDragMove: (px: number, py: number) => void
  onDragEnd: () => void
  onDragCancel: () => void
  onResizeStart: () => void
  onResizeMove: (newW: number, newH: number) => void
  onResizeEnd: () => void
  onResizeCancel: () => void
}

export function Widget({
  descriptor,
  rect,
  isDragging,
  isResizing,
  dragDisabled,
  resizeDisabled,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onResizeCancel,
}: WidgetProps) {
  const { id, type, config, x, y, w, h, resizable } = descriptor
  const handleRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep latest callback versions so window-level listeners (registered at
  // pointerdown time) always call the most-recent prop, not a stale closure.
  const onDragMoveRef = useRef(onDragMove)
  const onDragEndRef = useRef(onDragEnd)
  onDragMoveRef.current = onDragMove
  onDragEndRef.current = onDragEnd

  const ResolvedComponent = resolve(type)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (dragDisabled) return
    e.preventDefault()
    const gridEl = containerRef.current?.parentElement
    if (!gridEl) return
    const gridRect = gridEl.getBoundingClientRect()
    const widgetRect = containerRef.current!.getBoundingClientRect()
    dragOffsetRef.current = {
      x: e.clientX - widgetRect.left,
      y: e.clientY - widgetRect.top,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    onDragStart(dragOffsetRef.current.x, dragOffsetRef.current.y, e.pointerId)

    const handleMove = (ev: PointerEvent) => {
      const px = ev.clientX - gridRect.left - dragOffsetRef.current.x
      const py = ev.clientY - gridRect.top - dragOffsetRef.current.y
      onDragMoveRef.current(px, py)
    }
    const handleUp = () => {
      onDragEndRef.current()
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <div
      ref={containerRef}
      className={`widget${isDragging ? ' widget--dragging' : ''}`}
      style={{
        position: 'absolute',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : 1,
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          if (isDragging) onDragCancel()
          if (isResizing) onResizeCancel()
        }
      }}
    >
      <div
        ref={handleRef}
        className="widget__drag-handle"
        onPointerDown={handlePointerDown}
        role="button"
        aria-label={`Drag widget ${id}`}
        tabIndex={0}
      >
        ⠿
      </div>

      <div className="widget__content">
        {ResolvedComponent ? (
          <WidgetErrorBoundary type={type}>
            <ResolvedComponent widgetId={id} config={config} x={x} y={y} w={w} h={h} />
          </WidgetErrorBoundary>
        ) : (
          <div className="widget__error-tile">
            Unknown widget type: "{type}"
          </div>
        )}
      </div>

      {resizable !== false && (
        <ResizeHandle
          disabled={resizeDisabled || dragDisabled}
          descriptor={descriptor}
          rect={rect}
          onResizeStart={onResizeStart}
          onResizeMove={onResizeMove}
          onResizeEnd={onResizeEnd}
          onResizeCancel={onResizeCancel}
        />
      )}
    </div>
  )
}
