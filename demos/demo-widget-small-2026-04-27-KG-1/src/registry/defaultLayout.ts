import type { DashboardLayout } from '@/types/layout'

export const DEFAULT_LAYOUT: DashboardLayout = {
  layoutVersion: 1,
  widgets: [
    { instanceId: 'default-stats-1', typeId: 'stats-card',        x: 0,  y: 0, w: 3, h: 3 },
    { instanceId: 'default-stats-2', typeId: 'stats-card',        x: 3,  y: 0, w: 3, h: 3 },
    { instanceId: 'default-stats-3', typeId: 'stats-card',        x: 6,  y: 0, w: 3, h: 3 },
    { instanceId: 'default-chart-1', typeId: 'chart-widget',      x: 0,  y: 3, w: 6, h: 4 },
    { instanceId: 'default-table-1', typeId: 'table-widget',      x: 6,  y: 3, w: 6, h: 4 },
    { instanceId: 'default-tasks-1', typeId: 'task-list-widget',  x: 9,  y: 0, w: 3, h: 3 },
  ],
}
