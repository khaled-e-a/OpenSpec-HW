import React, { useState } from 'react';
import { DashboardGrid, DraggableWidget } from './components/dashboard';
import type { WidgetLayout } from './components/dashboard';

const initialLayout: WidgetLayout[] = [
  { id: 'widget-a', col: 0, row: 0, w: 2, h: 1 },
  { id: 'widget-b', col: 2, row: 0, w: 1, h: 1 },
  { id: 'widget-c', col: 0, row: 1, w: 1, h: 2 },
  { id: 'widget-d', col: 1, row: 1, w: 2, h: 1 },
];

const WIDGET_LABELS: Record<string, string> = {
  'widget-a': 'Revenue Chart',
  'widget-b': 'KPI Card',
  'widget-c': 'Activity Feed',
  'widget-d': 'User Stats',
};

export default function App() {
  const [layout, setLayout] = useState<WidgetLayout[]>(initialLayout);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
      <DashboardGrid
        layout={layout}
        cols={4}
        rows={3}
        rowHeight={140}
        onLayoutChange={setLayout}
      >
        {layout.map((item) => (
          <DraggableWidget key={item.id} {...item}>
            <div
              style={{
                height: '100%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 500,
                color: '#334155',
              }}
            >
              {WIDGET_LABELS[item.id] ?? item.id}
            </div>
          </DraggableWidget>
        ))}
      </DashboardGrid>
    </div>
  );
}
