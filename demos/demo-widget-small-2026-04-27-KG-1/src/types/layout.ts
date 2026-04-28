export interface WidgetInstance {
  instanceId: string
  typeId: string
  x: number
  y: number
  w: number
  h: number
}

export interface DashboardLayout {
  layoutVersion: number
  widgets: WidgetInstance[]
}
