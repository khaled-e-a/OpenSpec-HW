import type { WidgetComponentProps } from '../types/layout'
import { registerWidget } from '../registry/registerWidget'

function MetricCard({ w, h }: WidgetComponentProps) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 4, padding: 8 }}>
      <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Total Revenue
      </span>
      <span style={{ fontSize: w >= 2 && h >= 2 ? 28 : 20, fontWeight: 700, color: '#f1f5f9' }}>
        $48,295
      </span>
      <span style={{ fontSize: 11, color: '#22c55e' }}>▲ 12.4% vs last month</span>
    </div>
  )
}

function BarChart({ w }: WidgetComponentProps) {
  const bars = [65, 80, 45, 90, 55, 70, 85]
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Weekly Sales
      </span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        {bars.slice(0, w >= 4 ? 7 : 4).map((val, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${val}%`,
              background: 'rgba(99,102,241,0.7)',
              borderRadius: '3px 3px 0 0',
              minWidth: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function DataTable() {
  const rows = [
    { name: 'Alice', role: 'Engineer', status: 'Active' },
    { name: 'Bob', role: 'Designer', status: 'Active' },
    { name: 'Carol', role: 'PM', status: 'Away' },
    { name: 'Dave', role: 'Analyst', status: 'Inactive' },
  ]
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Name', 'Role', 'Status'].map((h) => (
              <th
                key={h}
                style={{ textAlign: 'left', padding: '4px 8px', color: '#64748b', borderBottom: '1px solid #334155' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td style={{ padding: '4px 8px', color: '#f1f5f9' }}>{r.name}</td>
              <td style={{ padding: '4px 8px', color: '#94a3b8' }}>{r.role}</td>
              <td style={{ padding: '4px 8px', color: r.status === 'Active' ? '#22c55e' : '#64748b' }}>
                {r.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Register all sample widget types
registerWidget({ id: 'metric-card', component: MetricCard, defaultW: 2, defaultH: 2, minW: 1, minH: 1 })
registerWidget({ id: 'bar-chart', component: BarChart, defaultW: 4, defaultH: 3, minW: 2, minH: 2 })
registerWidget({ id: 'data-table', component: DataTable, defaultW: 6, defaultH: 4, minW: 3, minH: 2 })

export const WIDGET_TYPES = ['metric-card', 'bar-chart', 'data-table'] as const
