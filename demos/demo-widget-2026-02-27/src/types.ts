export interface WidgetDescriptor {
  id: string
  type: string
  x: number
  y: number
  w: number
  h: number
  resizable?: boolean
  config?: unknown
}

export type Layout = WidgetDescriptor[]

export interface GridConfig {
  columns: number
  rowHeight: number
  gap: number
}

export interface PixelRect {
  left: number
  top: number
  width: number
  height: number
}

export interface DragState {
  widgetId: string
  ghostX: number
  ghostY: number
  valid: boolean
  shake: boolean
}

export interface ResizeState {
  widgetId: string
  ghostW: number
  ghostH: number
  valid: boolean
  shake: boolean
}
