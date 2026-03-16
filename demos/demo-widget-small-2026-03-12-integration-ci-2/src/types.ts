// Layout types (UC1-S7, UC2-S6)
export interface WidgetLayout {
  id: string;   // matches widget id
  col: number;  // 0-indexed column (left edge)
  row: number;  // 0-indexed row (top edge)
  w: number;    // width in grid units (min 1)
  h: number;    // height in grid units (min 1)
}

export type DashboardLayout = WidgetLayout[];

export interface WidgetDefinition {
  id: string;
  title: string;
  content?: string;
}
