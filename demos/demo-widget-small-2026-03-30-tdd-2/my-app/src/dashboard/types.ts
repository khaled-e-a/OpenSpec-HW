import type { ReactNode } from 'react'

/** A single widget's position and size on the grid. */
export interface WidgetLayout {
  id: string
  x: number   // column index (0-based)
  y: number   // row index (0-based)
  w: number   // column span
  h: number   // row span
}

export interface DashboardGridProps {
  /** Controlled layout — if provided, component renders from this prop */
  layout?: WidgetLayout[]
  /** Called whenever layout changes */
  onLayoutChange: (layout: WidgetLayout[]) => void
  /** Pixels per grid cell (default: 100) */
  cellSize?: number
  /** Number of columns (default: computed from container width) */
  colCount?: number
  /** Number of rows (default: 8) */
  rowCount?: number
  children?: ReactNode
}

export interface DraggableWidgetProps {
  id: string
  x: number
  y: number
  w: number
  h: number
  cellSize: number
  children?: ReactNode
}
