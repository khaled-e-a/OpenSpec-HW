import React, { useState } from 'react';
import { DashboardGrid, DraggableWidget } from './components/dashboard';
import type { WidgetLayout } from './components/dashboard';
import { findFirstOpenCell } from './components/dashboard/utils/findFirstOpenCell';

const COLS = 4;
const ROWS = 3;

const initialLayout: WidgetLayout[] = [
  { id: 'widget-a', col: 0, row: 0, w: 2, h: 1, type: 'clock' },
  { id: 'widget-b', col: 2, row: 0, w: 1, h: 1, type: 'clock' },
  { id: 'widget-c', col: 0, row: 1, w: 1, h: 2, type: 'clock' },
  { id: 'widget-d', col: 1, row: 1, w: 2, h: 1, type: 'clock' },
];

const WIDGET_LABELS: Record<string, string> = {
  'widget-a': 'Revenue Chart',
  'widget-b': 'KPI Card',
  'widget-c': 'Activity Feed',
  'widget-d': 'User Stats',
};

export default function App() {
  const [layout, setLayout] = useState<WidgetLayout[]>(initialLayout);

  // UC1-S2 / UC1-E1a: find first open cell; null means grid is full
  const nextCell = findFirstOpenCell(layout, COLS, ROWS);

  // UC1-S3/S4: add a new 1×1 widget at the found cell
  function handleAddWidget() {
    if (!nextCell) return;
    const id = `widget-${Date.now()}`;
    setLayout((prev) => [...prev, { id, col: nextCell.col, row: nextCell.row, w: 1, h: 1, type: 'clock' }]);
  }

  // UC3-S2/S3/S4: remove widget by id
  function handleRemove(id: string) {
    setLayout((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        {/* UC1-S1 / UC1-E1a: Add Widget button, disabled when grid is full */}
        <button
          onClick={handleAddWidget}
          disabled={!nextCell}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: nextCell ? '#f1f5f9' : '#e2e8f0',
            cursor: nextCell ? 'pointer' : 'not-allowed',
            fontSize: 13,
            color: nextCell ? '#0f172a' : '#94a3b8',
          }}
        >
          + Add Widget
        </button>
      </div>
      <DashboardGrid
        layout={layout}
        cols={COLS}
        rows={ROWS}
        rowHeight={140}
        onLayoutChange={setLayout}
      >
        {layout.map((item) => (
          <DraggableWidget
            key={item.id}
            {...item}
            onRemove={() => handleRemove(item.id)}
            onConfigChange={(updates) => {
              setLayout((prev) =>
                prev.map((w) => (w.id === item.id ? { ...w, ...updates } : w))
              );
            }}
          >
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
