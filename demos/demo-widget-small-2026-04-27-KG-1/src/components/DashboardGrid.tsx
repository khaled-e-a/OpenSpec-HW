import ReactGridLayout, { type Layout, type LayoutItem } from 'react-grid-layout'
import type { DashboardLayout } from '@/types/layout'
import { getWidgetComponent } from '@/registry/widgetRegistry'
import WidgetCard from './WidgetCard'
import { isGridFull } from '@/utils/gridUtils'
import { useState, useCallback } from 'react'

interface Props {
  layout: DashboardLayout
  onLayoutChange: (rglLayout: Layout) => void
  onRemoveWidget: (instanceId: string) => void
}

const GRID_CONFIG = {
  cols: 12,
  rowHeight: 60,
  margin: [12, 12] as [number, number],
  containerPadding: [0, 0] as [number, number],
  maxRows: Infinity,
}

const DRAG_CONFIG = {
  enabled: true,
  bounded: false,
  handle: '.widget-drag-handle',
  threshold: 3,
}

export default function DashboardGrid({ layout, onLayoutChange, onRemoveWidget }: Props) {
  const [isDragging, setIsDragging] = useState(false)

  // Determine if we should show the "grid full" invalid state for the placeholder
  // We check with a minimal 1x1 widget; if even that doesn't fit, the grid is truly full.
  const gridFull = isGridFull(layout, { w: 1, h: 1 })

  const rglItems: LayoutItem[] = layout.widgets.map((w) => ({
    i: w.instanceId,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
  }))

  const handleDragStart = useCallback(() => setIsDragging(true), [])
  const handleDragStop = useCallback(() => setIsDragging(false), [])

  return (
    <div
      className={`dashboard-grid-container${isDragging && gridFull ? ' rgl-grid-full' : ''}`}
    >
      <ReactGridLayout
        className="layout"
        layout={rglItems}
        width={1200}
        gridConfig={GRID_CONFIG}
        dragConfig={DRAG_CONFIG}
        onLayoutChange={onLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
      >
        {layout.widgets.map((widget) => {
          const Component = getWidgetComponent(widget.typeId)
          return (
            <div key={widget.instanceId}>
              <WidgetCard
                instanceId={widget.instanceId}
                title={widget.typeId
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                onRemove={onRemoveWidget}
              >
                {Component ? <Component /> : <div className="widget-unknown">Unknown widget</div>}
              </WidgetCard>
            </div>
          )
        })}
      </ReactGridLayout>
    </div>
  )
}
