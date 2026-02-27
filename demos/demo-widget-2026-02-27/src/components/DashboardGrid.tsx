import React, { useRef, useEffect, useState } from 'react'
import type { GridConfig, Layout, DragState, ResizeState } from '../types'
import { useDashboard, isAreaFree } from '../hooks/useDashboard'
import { GridLines } from './GridLines'
import { Widget } from './Widget'
import { GhostWidget } from './GhostWidget'
import { cellWidth, toPixelRect } from '../utils/gridCoords'
import './DashboardGrid.css'

interface DashboardGridProps {
  config: GridConfig
  initialLayout: Layout
  onLayoutChange?: (layout: Layout) => void
}

export function DashboardGrid({ config, initialLayout, onLayoutChange }: DashboardGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const { layout, setLayout, occupancyMap, updateWidgetPosition, updateWidgetSpan } =
    useDashboard(initialLayout, config)

  const [dragState, setDragState] = useState<DragState | null>(null)
  const [resizeState, setResizeState] = useState<ResizeState | null>(null)

  useEffect(() => {
    onLayoutChange?.(layout)
  }, [layout])

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width)
    })
    obs.observe(containerRef.current)
    setContainerWidth(containerRef.current.getBoundingClientRect().width)
    return () => obs.disconnect()
  }, [])

  const cw = containerWidth > 0 ? cellWidth(config, containerWidth) : 0

  const maxRow = layout.reduce((max, w) => Math.max(max, w.y + w.h), 4)
  const containerHeight = maxRow * (config.rowHeight + config.gap)

  return (
    <div
      ref={containerRef}
      className="dashboard-grid"
      style={{ position: 'relative', height: containerHeight }}
    >
      <GridLines config={config} rows={maxRow} />

      {layout.length === 0 && (
        <div className="dashboard-grid__empty">
          No widgets. Add a widget to get started.
        </div>
      )}

      {containerWidth > 0 &&
        layout.map((descriptor) => {
          const rect = toPixelRect(descriptor.x, descriptor.y, descriptor.w, descriptor.h, config, cw)
          const isDragging = dragState?.widgetId === descriptor.id
          const isResizing = resizeState?.widgetId === descriptor.id
          return (
            <Widget
              key={descriptor.id}
              descriptor={descriptor}
              rect={rect}
              isDragging={isDragging}
              isResizing={isResizing}
              dragDisabled={!!resizeState}
              resizeDisabled={!!dragState}
              onDragStart={(offsetX, offsetY, pointerId) => {
                if (resizeState) return
                setDragState({
                  widgetId: descriptor.id,
                  ghostX: descriptor.x,
                  ghostY: descriptor.y,
                  valid: true,
                  shake: false,
                })
              }}
              onDragMove={(px, py) => {
                if (!dragState || dragState.widgetId !== descriptor.id) return
                const col = Math.max(0, Math.min(
                  Math.round(px / (cw + config.gap)),
                  config.columns - descriptor.w
                ))
                const row = Math.max(0, Math.round(py / (config.rowHeight + config.gap)))
                const free = isAreaFree(occupancyMap, col, row, descriptor.w, descriptor.h, descriptor.id)
                setDragState((s) => s ? { ...s, ghostX: col, ghostY: row, valid: free, shake: false } : s)
              }}
              onDragEnd={() => {
                if (!dragState || dragState.widgetId !== descriptor.id) return
                if (dragState.valid) {
                  updateWidgetPosition(descriptor.id, dragState.ghostX, dragState.ghostY)
                  setDragState(null)
                } else {
                  setDragState((s) => s ? { ...s, shake: true } : s)
                  setTimeout(() => setDragState(null), 400)
                }
              }}
              onDragCancel={() => {
                setDragState(null)
              }}
              onResizeStart={() => {
                if (dragState) return
                setResizeState({
                  widgetId: descriptor.id,
                  ghostW: descriptor.w,
                  ghostH: descriptor.h,
                  valid: true,
                  shake: false,
                })
              }}
              onResizeMove={(dw, dh) => {
                if (!resizeState || resizeState.widgetId !== descriptor.id) return
                const newW = Math.max(1, Math.min(dw, config.columns - descriptor.x))
                const newH = Math.max(1, dh)
                const free = isAreaFree(occupancyMap, descriptor.x, descriptor.y, newW, newH, descriptor.id)
                setResizeState((s) => s ? { ...s, ghostW: newW, ghostH: newH, valid: free, shake: false } : s)
              }}
              onResizeEnd={() => {
                if (!resizeState || resizeState.widgetId !== descriptor.id) return
                if (resizeState.valid) {
                  updateWidgetSpan(descriptor.id, resizeState.ghostW, resizeState.ghostH)
                  setResizeState(null)
                } else {
                  setResizeState((s) => s ? { ...s, shake: true } : s)
                  setTimeout(() => setResizeState(null), 400)
                }
              }}
              onResizeCancel={() => {
                setResizeState(null)
              }}
            />
          )
        })}

      {containerWidth > 0 && dragState && (() => {
        const descriptor = layout.find((w) => w.id === dragState.widgetId)
        if (!descriptor) return null
        const rect = toPixelRect(dragState.ghostX, dragState.ghostY, descriptor.w, descriptor.h, config, cw)
        return (
          <GhostWidget
            rect={rect}
            mode="drag"
            valid={dragState.valid}
            shake={dragState.shake}
          />
        )
      })()}

      {containerWidth > 0 && resizeState && (() => {
        const descriptor = layout.find((w) => w.id === resizeState.widgetId)
        if (!descriptor) return null
        const rect = toPixelRect(descriptor.x, descriptor.y, resizeState.ghostW, resizeState.ghostH, config, cw)
        return (
          <GhostWidget
            rect={rect}
            mode="resize"
            valid={resizeState.valid}
            shake={resizeState.shake}
          />
        )
      })()}
    </div>
  )
}
