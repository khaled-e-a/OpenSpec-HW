import type { DashboardLayout, WidgetDefinition } from './types';

// Grid configuration constants (UC1-S3, UC1-S7)
export const GRID_COLS = 12;
export const CELL_WIDTH_PX = 80;
export const CELL_HEIGHT_PX = 80;

// localStorage key for layout persistence (UC1-S8)
export const LAYOUT_STORAGE_KEY = 'dashboard-layout-v1';

// Default widget registry
export const WIDGET_REGISTRY: WidgetDefinition[] = [
  { id: 'widget-1', title: 'Analytics', content: 'Views: 1,204' },
  { id: 'widget-2', title: 'Revenue', content: '$48,320' },
  { id: 'widget-3', title: 'Active Users', content: '342 online' },
  { id: 'widget-4', title: 'Performance', content: 'p99: 120ms' },
  { id: 'widget-5', title: 'Alerts', content: '2 warnings' },
];

// Default layout (UC3-E1a1) — initial positions when no saved layout exists
export const DEFAULT_LAYOUT: DashboardLayout = [
  { id: 'widget-1', col: 0, row: 0, w: 4, h: 2 },
  { id: 'widget-2', col: 4, row: 0, w: 4, h: 2 },
  { id: 'widget-3', col: 8, row: 0, w: 4, h: 2 },
  { id: 'widget-4', col: 0, row: 2, w: 6, h: 2 },
  { id: 'widget-5', col: 6, row: 2, w: 6, h: 2 },
];
