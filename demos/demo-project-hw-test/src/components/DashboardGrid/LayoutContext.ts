import { createContext, useContext } from 'react'
import type { WidgetLayout } from '../../types/layout'

export interface LayoutContextValue {
  layout: WidgetLayout[]
  columns: number
  rowHeight: number
  addWidget: (type: string) => void
  moveWidget: (id: string, x: number, y: number) => void
  resizeWidget: (id: string, w: number, h: number) => void
  removeWidget: (id: string) => void
  /** The snapped drop target during an active drag (null when not dragging). */
  dropTarget: { x: number; y: number; w: number; h: number } | null
  setDropTarget: (target: { x: number; y: number; w: number; h: number } | null) => void
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)

export function useLayoutContext(): LayoutContextValue {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayoutContext must be used inside <DashboardGrid>')
  return ctx
}
