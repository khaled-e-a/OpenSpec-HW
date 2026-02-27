import { useState, useMemo, useEffect } from 'react'
import type { Layout, GridConfig, WidgetDescriptor } from '../types'

export function buildOccupancyMap(layout: Layout): Map<string, string> {
  const map = new Map<string, string>()
  for (const widget of layout) {
    for (let row = widget.y; row < widget.y + widget.h; row++) {
      for (let col = widget.x; col < widget.x + widget.w; col++) {
        map.set(`${col},${row}`, widget.id)
      }
    }
  }
  return map
}

export function isAreaFree(
  occupancyMap: Map<string, string>,
  x: number,
  y: number,
  w: number,
  h: number,
  excludeId?: string
): boolean {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      const occupant = occupancyMap.get(`${col},${row}`)
      if (occupant !== undefined && occupant !== excludeId) {
        return false
      }
    }
  }
  return true
}

export function resolveConflicts(layout: Layout): Layout {
  const resolved: Layout = []
  const placed = new Map<string, string>()

  for (const widget of layout) {
    let y = widget.y
    while (true) {
      let fits = true
      for (let row = y; row < y + widget.h; row++) {
        for (let col = widget.x; col < widget.x + widget.w; col++) {
          if (placed.has(`${col},${row}`)) {
            fits = false
            break
          }
        }
        if (!fits) break
      }

      if (fits) {
        const placed_widget: WidgetDescriptor = { ...widget, y }
        resolved.push(placed_widget)
        for (let row = y; row < y + widget.h; row++) {
          for (let col = widget.x; col < widget.x + widget.w; col++) {
            placed.set(`${col},${row}`, widget.id)
          }
        }
        break
      }
      y++
    }
  }
  return resolved
}

export function useDashboard(initialLayout: Layout, config: GridConfig) {
  const [layout, setLayout] = useState<Layout>(() =>
    resolveConflicts(initialLayout)
  )

  const occupancyMap = useMemo(() => buildOccupancyMap(layout), [layout])

  function updateWidgetPosition(id: string, x: number, y: number) {
    setLayout((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    )
  }

  function updateWidgetSpan(id: string, w: number, h: number) {
    setLayout((prev) =>
      prev.map((widget) =>
        widget.id === id ? { ...widget, w, h } : widget
      )
    )
  }

  return { layout, setLayout, occupancyMap, updateWidgetPosition, updateWidgetSpan, config }
}
