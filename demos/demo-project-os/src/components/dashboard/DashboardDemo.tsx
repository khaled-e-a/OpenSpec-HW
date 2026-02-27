import React, { useState } from 'react';
import { DashboardGrid } from './DashboardGrid';
import { Widget } from './Widget';
import { WIDGET_SIZES } from './types';
import type { GridLayout } from './types';

const INITIAL_LAYOUT: GridLayout = [
  { id: 'small-1',  col: 1, row: 1, ...WIDGET_SIZES.SMALL },
  { id: 'wide-1',   col: 2, row: 1, ...WIDGET_SIZES.WIDE  },
  { id: 'tall-1',   col: 1, row: 2, ...WIDGET_SIZES.TALL  },
  { id: 'large-1',  col: 4, row: 1, ...WIDGET_SIZES.LARGE },
];

const WIDGET_STYLES: Record<string, React.CSSProperties> = {
  'small-1': { backgroundColor: '#6366f1', color: '#fff' },
  'wide-1':  { backgroundColor: '#06b6d4', color: '#fff' },
  'tall-1':  { backgroundColor: '#f59e0b', color: '#fff' },
  'large-1': { backgroundColor: '#10b981', color: '#fff' },
};

const WIDGET_LABELS: Record<string, string> = {
  'small-1': 'Small (1×1)',
  'wide-1':  'Wide (2×1)',
  'tall-1':  'Tall (1×2)',
  'large-1': 'Large (2×2)',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  fontFamily: 'sans-serif',
  fontWeight: 600,
  fontSize: 14,
  borderRadius: 8,
};

export function DashboardDemo() {
  const [layout, setLayout] = useState<GridLayout>(INITIAL_LAYOUT);

  const handleLayoutChange = (updated: GridLayout) => {
    console.log('[DashboardDemo] Layout changed:', updated);
    setLayout(updated);
  };

  return (
    <div style={{ padding: 24, height: '100vh', boxSizing: 'border-box' }}>
      <h2 style={{ fontFamily: 'sans-serif', marginBottom: 16 }}>
        Dashboard Grid — drag widgets to rearrange
      </h2>
      <DashboardGrid
        columns={6}
        rows={4}
        gap={12}
        initialLayout={layout}
        onLayoutChange={handleLayoutChange}
        style={{ height: 'calc(100vh - 80px)', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}
      >
        {INITIAL_LAYOUT.map(({ id, colSpan, rowSpan }) => (
          <Widget key={id} id={id} colSpan={colSpan} rowSpan={rowSpan}>
            <div style={{ ...labelStyle, ...WIDGET_STYLES[id] }}>
              {WIDGET_LABELS[id]}
            </div>
          </Widget>
        ))}
      </DashboardGrid>
    </div>
  );
}
