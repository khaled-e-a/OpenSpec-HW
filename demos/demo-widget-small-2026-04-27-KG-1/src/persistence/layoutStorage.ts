import type { DashboardLayout } from '@/types/layout'
import { DEFAULT_LAYOUT } from '@/registry/defaultLayout'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'rdd_layout'
export const CURRENT_LAYOUT_VERSION = 1

export function loadLayout(): DashboardLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_LAYOUT, widgets: [...DEFAULT_LAYOUT.widgets] }

    const parsed: DashboardLayout = JSON.parse(raw)

    // Version mismatch — discard stored layout
    if (parsed.layoutVersion !== CURRENT_LAYOUT_VERSION) {
      console.warn(
        `[rdd] Layout version mismatch (stored=${parsed.layoutVersion}, current=${CURRENT_LAYOUT_VERSION}). Resetting to default.`
      )
      localStorage.removeItem(STORAGE_KEY)
      // Toast is shown async after mount via a flag we signal through sessionStorage
      sessionStorage.setItem('rdd_layout_reset', 'version_mismatch')
      return { ...DEFAULT_LAYOUT, widgets: [...DEFAULT_LAYOUT.widgets] }
    }

    return parsed
  } catch (err) {
    console.warn('[rdd] Failed to parse stored layout. Resetting to default.', err)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.setItem('rdd_layout_reset', 'corrupt')
    return { ...DEFAULT_LAYOUT, widgets: [...DEFAULT_LAYOUT.widgets] }
  }
}

export function saveLayout(layout: DashboardLayout): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  } catch (err) {
    console.warn('[rdd] Failed to persist layout.', err)
  }
}

/** Call once after the app mounts to show any pending reset toast. */
export function notifyLayoutResetIfNeeded(): void {
  const reason = sessionStorage.getItem('rdd_layout_reset')
  if (!reason) return
  sessionStorage.removeItem('rdd_layout_reset')
  toast('Dashboard layout was reset to default.', { icon: '⚠️', duration: 4000 })
}
