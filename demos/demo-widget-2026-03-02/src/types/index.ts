export interface GridPosition {
  x: number;
  y: number;
}

export interface GridSize {
  width: number;
  height: number;
}

export interface GridConfig {
  columns: number;
  rows: number;
  gap: number;
  margin: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: GridPosition;
  size: GridSize;
  config?: Record<string, any>;
  locked?: boolean;
}

export interface DashboardState {
  widgets: DashboardWidget[];
  config: GridConfig;
  isEditMode: boolean;
}