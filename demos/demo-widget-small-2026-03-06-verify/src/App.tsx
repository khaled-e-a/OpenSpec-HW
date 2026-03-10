import { useState } from 'react'
import { DashboardGrid } from './components/DashboardGrid'
import type { WidgetLayout } from './types'

const initialWidgets: WidgetLayout[] = [
  { id: 'Widget A', col: 0, row: 0, colSpan: 2, rowSpan: 2 },
  { id: 'Widget B', col: 3, row: 0, colSpan: 1, rowSpan: 1 },
  { id: 'Widget C', col: 4, row: 0, colSpan: 2, rowSpan: 1 },
  { id: 'Widget D', col: 3, row: 1, colSpan: 3, rowSpan: 1 },
  { id: 'Widget E', col: 0, row: 3, colSpan: 1, rowSpan: 1 },
]

export function App() {
  const [widgets, setWidgets] = useState(initialWidgets)

  return (
    <div>
      <h1 style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Dashboard — drag widgets to rearrange
      </h1>
      <DashboardGrid
        widgets={widgets}
        cols={6}
        cellWidth={140}
        cellHeight={120}
        gap={8}
        onLayoutChange={setWidgets}
      />
    </div>
  )
}
