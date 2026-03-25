// Demo page — exercises all interaction paths
// UC1-S1, UC2-S1, UC2-S2, UC2-S3, UC2-S4

import { useState } from 'react';
import { DashboardGrid } from './components/DashboardGrid';
import type { WidgetLayout } from './utils/gridGeometry';

const INITIAL_LAYOUT: WidgetLayout[] = [
  { id: 'analytics', x: 0, y: 0, w: 2, h: 2, type: 'clock' },
  { id: 'status',    x: 2, y: 0, w: 1, h: 1, type: 'image' },
  { id: 'chart',     x: 3, y: 0, w: 3, h: 2, type: 'file' },
  { id: 'activity',  x: 2, y: 1, w: 2, h: 1, type: 'webpage' },
  { id: 'metrics',   x: 0, y: 2, w: 3, h: 1, type: 'clock' },
];

const WIDGET_COLORS: Record<string, string> = {
  analytics: '#6366f1',
  status:    '#f59e0b',
  chart:     '#10b981',
  activity:  '#ec4899',
  metrics:   '#3b82f6',
};

export default function App() {
  const [layout, setLayout] = useState<WidgetLayout[]>(INITIAL_LAYOUT);

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 8 }}>Widget Drag-and-Drop Dashboard</h1>
      <p style={{ marginBottom: 24, color: '#6b7280' }}>
        Drag widgets to rearrange. They snap to the grid and won't overlap.
      </p>

      <DashboardGrid
        cols={6}
        rows={4}
        cellSize={120}
        initialLayout={[]}
        layout={layout}
        onLayoutChange={setLayout}
      >
        {layout.map((w) => (
          <div
            key={w.id}
            style={{
              background: WIDGET_COLORS[w.id] ?? '#94a3b8',
              borderRadius: 8,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              userSelect: 'none',
              padding: 8,
            }}
            aria-label={`${w.id} widget`}
          >
            {w.id}
          </div>
        ))}
      </DashboardGrid>

      <pre style={{ marginTop: 24, background: '#f3f4f6', padding: 16, borderRadius: 8, fontSize: 12 }}>
        {JSON.stringify(layout, null, 2)}
      </pre>
    </div>
  );
}
