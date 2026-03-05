export interface Widget {
  id: string;
  type: string;
  title: string;
  size: WidgetSize;
  position: GridPosition;
  draggable?: boolean;
  content?: React.ReactNode;
}

export interface WidgetSize {
  width: number; // in grid units
  height: number; // in grid units
}

export interface GridPosition {
  x: number; // column position
  y: number; // row position
}

export interface DashboardLayout {
  widgets: Record<string, Widget>;
  isDirty: boolean;
  lastSaved?: Date;
}

export interface DragItem {
  id: string;
  type: string;
  position: GridPosition;
  size: WidgetSize;
}