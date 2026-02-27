import React, { useRef } from 'react'
import type { WidgetDescriptor, PixelRect, GridConfig } from '../types'
import './ResizeHandle.css'

interface ResizeHandleProps {
  disabled: boolean
  descriptor: WidgetDescriptor
  rect: PixelRect
  onResizeStart: () => void
  onResizeMove: (newW: number, newH: number) => void
  onResizeEnd: () => void
  onResizeCancel: () => void
}

export function ResizeHandle({
  disabled,
  descriptor,
  rect,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onResizeCancel,
}: ResizeHandleProps) {
  const startRef = useRef({ clientX: 0, clientY: 0, w: 0, h: 0 })

  // Keep latest callback versions so window-level listeners always call
  // the most-recent prop, not a stale closure captured at pointerdown time.
  const onResizeMoveRef = useRef(onResizeMove)
  const onResizeEndRef = useRef(onResizeEnd)
  const onResizeCancelRef = useRef(onResizeCancel)
  onResizeMoveRef.current = onResizeMove
  onResizeEndRef.current = onResizeEnd
  onResizeCancelRef.current = onResizeCancel

  if (disabled) return null

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    startRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      w: descriptor.w,
      h: descriptor.h,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    onResizeStart()

    const cellW = rect.width / descriptor.w
    const cellH = rect.height / descriptor.h

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startRef.current.clientX
      const dy = ev.clientY - startRef.current.clientY
      const newW = Math.max(1, Math.round(startRef.current.w + dx / cellW))
      const newH = Math.max(1, Math.round(startRef.current.h + dy / cellH))
      onResizeMoveRef.current(newW, newH)
    }
    const handleUp = () => {
      onResizeEndRef.current()
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    const handleKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        onResizeCancelRef.current()
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('keydown', handleKey)
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('keydown', handleKey)
  }

  return (
    <div
      className="resize-handle"
      onPointerDown={handlePointerDown}
      role="button"
      aria-label="Resize widget"
    />
  )
}
