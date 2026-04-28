import type { ComponentType } from 'react'

export interface WidgetRegistryEntry {
  id: string
  displayName: string
  description: string
  defaultSize: { w: number; h: number }
  component: ComponentType
}

import StatsCard from '@/widgets/StatsCard'
import ChartWidget from '@/widgets/ChartWidget'
import TableWidget from '@/widgets/TableWidget'
import TaskListWidget from '@/widgets/TaskListWidget'

export const WIDGET_REGISTRY: WidgetRegistryEntry[] = [
  {
    id: 'stats-card',
    displayName: 'Stats Card',
    description: 'Displays a key metric with a trend indicator.',
    defaultSize: { w: 3, h: 3 },
    component: StatsCard,
  },
  {
    id: 'chart-widget',
    displayName: 'Bar Chart',
    description: 'Shows a simple bar chart for visualising data over time.',
    defaultSize: { w: 4, h: 4 },
    component: ChartWidget,
  },
  {
    id: 'table-widget',
    displayName: 'Data Table',
    description: 'Renders a compact data table with status badges.',
    defaultSize: { w: 5, h: 4 },
    component: TableWidget,
  },
  {
    id: 'task-list-widget',
    displayName: 'Task List',
    description: 'Shows a checklist of tasks with completion status.',
    defaultSize: { w: 3, h: 4 },
    component: TaskListWidget,
  },
]

/** Resolve a widget type ID to its React component (undefined if not found). */
export function getWidgetComponent(id: string): ComponentType | undefined {
  return WIDGET_REGISTRY.find((e) => e.id === id)?.component
}

/** Resolve a registry entry by ID. */
export function getRegistryEntry(id: string): WidgetRegistryEntry | undefined {
  return WIDGET_REGISTRY.find((e) => e.id === id)
}
