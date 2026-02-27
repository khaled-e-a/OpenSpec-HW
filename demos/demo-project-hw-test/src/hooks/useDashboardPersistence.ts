import { useEffect } from 'react'
import type { WidgetLayout } from '../types/layout'

export function loadLayout(key: string): WidgetLayout[] | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as WidgetLayout[]
  } catch {
    return null
  }
}

export function saveLayout(key: string, layout: WidgetLayout[], retryCount = 0): void {
  try {
    localStorage.setItem(key, JSON.stringify(layout))
  } catch (error) {
    console.warn(`[DashboardGrid] Failed to persist layout to localStorage (attempt ${retryCount + 1})`)
    
    if (retryCount < 3) {
      setTimeout(() => saveLayout(key, layout, retryCount + 1), 1000 * Math.pow(2, retryCount))
    } else {
      console.error('[DashboardGrid] Permanent failure persisting layout after 3 retries', error)
    }
  }
}

/** Writes layout to localStorage whenever it changes. Call on mount to rehydrate. */
export function useDashboardPersistence(key: string, layout: WidgetLayout[]): void {
  useEffect(() => {
    saveLayout(key, layout)
  }, [key, layout])
}
