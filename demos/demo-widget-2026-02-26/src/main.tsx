import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DashboardGrid, WidgetRegistry, useDashboardLayout } from './dashboard';
import type { WidgetProps } from './dashboard';

function ChartWidget(_props: WidgetProps) {
  return (
    <div style={{ padding: 16, background: '#e8f0fe', height: '100%', borderRadius: 4 }}>
      📊 Chart
    </div>
  );
}

function TableWidget(_props: WidgetProps) {
  return (
    <div style={{ padding: 16, background: '#e6f4ea', height: '100%', borderRadius: 4 }}>
      📋 Table
    </div>
  );
}

function MetricWidget(_props: WidgetProps) {
  return (
    <div style={{ padding: 16, background: '#fff3e0', height: '100%', borderRadius: 4 }}>
      📈 Metric
    </div>
  );
}

WidgetRegistry.register('chart', {
  component: ChartWidget,
  displayName: 'Chart',
  defaultSize: { w: 4, h: 2 },
});

WidgetRegistry.register('table', {
  component: TableWidget,
  displayName: 'Table',
  defaultSize: { w: 6, h: 3 },
});

WidgetRegistry.register('metric', {
  component: MetricWidget,
  displayName: 'Metric',
  defaultSize: { w: 2, h: 2 },
});

function App() {
  const { layout, onLayoutChange } = useDashboardLayout([
    { id: 'w1', type: 'chart', x: 0, y: 0, w: 4, h: 2 },
    { id: 'w2', type: 'metric', x: 4, y: 0, w: 2, h: 2 },
    { id: 'w3', type: 'table', x: 0, y: 2, w: 6, h: 3 },
  ]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16, fontSize: 20, fontWeight: 600 }}>Dashboard</h1>
      <DashboardGrid layout={layout} columns={12} rowHeight={80} onLayoutChange={onLayoutChange} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
