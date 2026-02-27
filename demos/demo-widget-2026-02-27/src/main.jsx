import React from 'react'
import { createRoot } from 'react-dom/client'
import { DashboardGrid } from './components/DashboardGrid'
import { register } from './registry/WidgetRegistry'

register('metric', ({ widgetId, config }) => (
  <div style={{ padding: 8 }}>
    <h3 style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>{config?.label || 'Metric'}</h3>
    <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700 }}>{config?.value ?? '—'}</p>
  </div>
))

register('chart', ({ widgetId }) => (
  <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
    Chart placeholder ({widgetId})
  </div>
))

const initialLayout = [
  { id: 'w1', type: 'metric', x: 0, y: 0, w: 3, h: 1, resizable: true, config: { label: 'Revenue', value: '$12,400' } },
  { id: 'w2', type: 'metric', x: 3, y: 0, w: 3, h: 1, resizable: true, config: { label: 'Users', value: '1,284' } },
  { id: 'w3', type: 'chart',  x: 0, y: 1, w: 6, h: 2, resizable: true },
  { id: 'w4', type: 'metric', x: 6, y: 0, w: 3, h: 1, resizable: true, config: { label: 'Uptime', value: '99.9%' } },
]

const gridConfig = { columns: 12, rowHeight: 120, gap: 8 }

function App() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: '0 0 16px', fontSize: 18 }}>Dashboard</h1>
      <DashboardGrid config={gridConfig} initialLayout={initialLayout} />
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
