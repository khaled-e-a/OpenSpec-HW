export { DashboardGrid } from './components/DashboardGrid';
export { DashboardProvider, useDashboard } from './context/DashboardContext';
export { WidgetRegistryProvider, useWidgetRegistry } from './context/WidgetRegistry';
export { Widget } from './components/Widget';
export type { DashboardWidget, GridPosition, GridSize, GridConfig } from './types';
export type { WidgetConfig, WidgetMetadata } from './types/widget';
export { DndContext, DragOverlay } from '@dnd-kit/core';