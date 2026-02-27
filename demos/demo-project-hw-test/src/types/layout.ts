import type { ComponentType } from 'react'

/** Position and size of a widget on the grid (all values in grid units). */
export interface WidgetLayout {
  id: string
  type: string
  x: number // column index, 0-based
  y: number // row index, 0-based
  w: number // column span
  h: number // row span
}

/** Props every registered widget component receives. */
export interface WidgetComponentProps {
  id: string
  x: number
  y: number
  w: number
  h: number
}

/** Registration contract for a widget type. */
export interface WidgetDefinition {
  id: string
  component: ComponentType<WidgetComponentProps>
  defaultW: number
  defaultH: number
  minW: number
  minH: number
  maxW?: number
  maxH?: number
}

/** Configuration for the DashboardGrid container. */
export interface GridConfig {
  columns: number
  rowHeight: number // pixels per row
}
