import { useState, useCallback, useRef } from 'react'
import type { WidgetLayout } from '../types/layout'
import { getWidget } from '../registry/widgetRegistry'
import { hasCollision } from './layoutUtils'
import { useLayoutContext } from '../components/DashboardGrid/LayoutContext'

interface ResizeState {
  startW: number
  startH: number
  startPointerX: number
  startPointerY: number
  previewW: number
  previewH: number
}

export function useResizeWidget(item: WidgetLayout, isDragging: boolean) {
  const { layout, columns, rowHeight, resizeWidget } = useLayoutContext()
  const [resizeState, setResizeState] = useState<ResizeState | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  const def = getWidget(item.type)
  const minW = def?.minW ?? 1
  const minH = def?.minH ?? 1
  const maxW = def?.maxW ?? columns

  // Compute cell width from container
  const getCellWidth = useCallback(() => {
    const gridEl = containerRef.current?.closest('[data-grid-container]') as HTMLElement | null
    if (!gridEl) return 100 // fallback
    return gridEl.getBoundingClientRect().width / columns
  }, [columns])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging) return
      e.stopPropagation()
      ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
      setResizeState({
        startW: item.w,
        startH: item.h,
        startPointerX: e.clientX,
        startPointerY: e.clientY,
        previewW: item.w,
        previewH: item.h,
      })
    },
    [isDragging, item.w, item.h],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeState) return
      const cellWidth = getCellWidth()
      const dx = e.clientX - resizeState.startPointerX
      const dy = e.clientY - resizeState.startPointerY

      const rawW = resizeState.startW + Math.round(dx / cellWidth)
      const rawH = resizeState.startH + Math.round(dy / rowHeight)

      // Apply constraints
      let newW = Math.max(minW, Math.min(maxW, rawW))
      let newH = Math.max(minH, rawH)

      // Cap at grid right boundary
      if (item.x + newW > columns) newW = columns - item.x

      // Cap at nearest occupied right/bottom neighbour
      for (const other of layout) {
        if (other.id === item.id) continue
        // Check right-side neighbour (same rows)
        if (
          other.x >= item.x + item.w &&
          other.y < item.y + newH &&
          other.y + other.h > item.y
        ) {
          const maxAllowed = other.x - item.x
          if (maxAllowed > 0) newW = Math.min(newW, maxAllowed)
        }
        // Check bottom neighbour (same columns)
        if (
          other.y >= item.y + item.h &&
          other.x < item.x + newW &&
          other.x + other.w > item.x
        ) {
          const maxAllowed = other.y - item.y
          if (maxAllowed > 0) newH = Math.min(newH, maxAllowed)
        }
      }

      setResizeState((prev) => prev ? { ...prev, previewW: newW, previewH: newH } : null)
    },
    [resizeState, getCellWidth, rowHeight, minW, minH, maxW, item, columns, layout],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeState) return
      ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)

      const { previewW, previewH } = resizeState
      const candidate = { x: item.x, y: item.y, w: previewW, h: previewH }
      if (!hasCollision(layout, candidate, item.id)) {
        resizeWidget(item.id, previewW, previewH)
      }
      setResizeState(null)
    },
    [resizeState, item, layout, resizeWidget],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && resizeState) {
        setResizeState(null)
      }
    },
    [resizeState],
  )

  const setRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
  }, [])

  const previewStyle: React.CSSProperties | null = resizeState
    ? {
        width: `${(resizeState.previewW / item.w) * 100}%`,
        height: `${resizeState.previewH * rowHeight}px`,
        pointerEvents: 'none',
      }
    : null

  return {
    resizeHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onKeyDown,
      ref: setRef,
    },
    previewStyle,
    isResizing: !!resizeState,
  }
}
