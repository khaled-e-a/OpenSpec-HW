import { useState } from 'react'
import { DashboardGrid } from '../components/DashboardGrid/DashboardGrid'
import { useLayout } from '../hooks/useLayout'
import { WIDGET_TYPES } from './widgets'
// Side-effect: registers all widget types
import './widgets'

const COLUMNS = 12

export function DashboardDemo() {
  const { layout, addWidget, moveWidget, resizeWidget, removeWidget } = useLayout([
    { id: '1', type: 'metric-card', x: 0, y: 0, w: 2, h: 2 },
    { id: '2', type: 'bar-chart', x: 2, y: 0, w: 4, h: 3 },
    { id: '3', type: 'data-table', x: 6, y: 0, w: 6, h: 4 },
  ])

  const [activeTab, setActiveTab] = useState<'grid' | 'layout'>('grid')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f1f5f9',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>
          Dashboard Grid
        </h1>
        <p style={{ margin: '4px 0 16px', color: '#64748b', fontSize: 13 }}>
          Drag widgets to reposition · Drag bottom-right handle to resize · Click × to remove
        </p>

        {/* Widget picker */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {WIDGET_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => addWidget(type, COLUMNS)}
              style={{
                padding: '6px 14px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              + {type}
            </button>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['grid', 'layout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '4px 12px',
                background: activeTab === tab ? '#3b82f6' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === tab ? '#3b82f6' : '#334155',
                borderRadius: 4,
                color: activeTab === tab ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {tab === 'grid' ? 'Grid View' : 'Layout JSON'}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'grid' ? (
        <DashboardGrid
          columns={COLUMNS}
          rowHeight={80}
          layout={layout}
          onLayoutChange={(updated) => {
            // Sync controlled layout changes back through useLayout's setLayout
            updated.forEach((item) => {
              const existing = layout.find((w) => w.id === item.id)
              if (!existing) return
              if (existing.x !== item.x || existing.y !== item.y)
                moveWidget(item.id, item.x, item.y, COLUMNS)
              if (existing.w !== item.w || existing.h !== item.h)
                resizeWidget(item.id, item.w, item.h, COLUMNS)
            })
            layout.forEach((w) => {
              if (!updated.find((u) => u.id === w.id)) removeWidget(w.id)
            })
          }}
        />
      ) : (
        <pre
          style={{
            background: '#1e293b',
            padding: 16,
            borderRadius: 8,
            fontSize: 12,
            color: '#94a3b8',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(layout, null, 2)}
        </pre>
      )}
    </div>
  )
}
