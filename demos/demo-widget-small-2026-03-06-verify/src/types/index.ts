export interface WidgetLayout {
  id: string
  col: number
  row: number
  colSpan: number
  rowSpan: number
}

export interface DashboardGridProps {
  widgets: WidgetLayout[]
  cols: number
  cellWidth: number
  cellHeight: number
  gap: number
  onLayoutChange: (updated: WidgetLayout[]) => void
}

export interface GridWidgetProps {
  layout: WidgetLayout
  isDragging: boolean
  children?: React.ReactNode
}
