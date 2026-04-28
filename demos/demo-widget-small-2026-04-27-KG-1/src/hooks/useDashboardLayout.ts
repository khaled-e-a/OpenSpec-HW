import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Layout } from 'react-grid-layout'
import type { DashboardLayout, WidgetInstance } from '@/types/layout'
import { loadLayout, saveLayout, CURRENT_LAYOUT_VERSION } from '@/persistence/layoutStorage'
import { getRegistryEntry } from '@/registry/widgetRegistry'
import { findFirstFreeCell, isGridFull } from '@/utils/gridUtils'
import toast from 'react-hot-toast'

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(() => loadLayout())

  /** Called by ReactGridLayout's onLayoutChange — syncs drag/drop position changes */
  const moveWidget = useCallback((rglLayout: Layout) => {
    setLayout((prev) => {
      const updated: DashboardLayout = {
        ...prev,
        widgets: prev.widgets.map((w) => {
          const rglItem = rglLayout.find((r) => r.i === w.instanceId)
          if (!rglItem) return w
          return { ...w, x: rglItem.x, y: rglItem.y, w: rglItem.w, h: rglItem.h }
        }),
      }
      saveLayout(updated)
      return updated
    })
  }, [])

  /** Add a widget by typeId. Returns false if grid is full. */
  const addWidget = useCallback((typeId: string): boolean => {
    const entry = getRegistryEntry(typeId)
    if (!entry) return false

    let added = false
    setLayout((prev) => {
      if (isGridFull(prev, entry.defaultSize)) {
        toast.error("Dashboard is full — remove a widget to add a new one")
        return prev
      }
      const pos = findFirstFreeCell(prev, entry.defaultSize)
      const newWidget: WidgetInstance = {
        instanceId: uuidv4(),
        typeId,
        x: pos.x,
        y: pos.y,
        w: entry.defaultSize.w,
        h: entry.defaultSize.h,
      }
      const updated: DashboardLayout = {
        layoutVersion: CURRENT_LAYOUT_VERSION,
        widgets: [...prev.widgets, newWidget],
      }
      saveLayout(updated)
      added = true
      return updated
    })
    return added
  }, [])

  /** Remove a widget by instanceId */
  const removeWidget = useCallback((instanceId: string) => {
    setLayout((prev) => {
      const updated: DashboardLayout = {
        ...prev,
        widgets: prev.widgets.filter((w) => w.instanceId !== instanceId),
      }
      saveLayout(updated)
      return updated
    })
  }, [])

  return { layout, moveWidget, addWidget, removeWidget }
}
