// Core layout types

export interface WidgetLayout {
  id: string;
  col: number;   // 0-based column index
  row: number;   // 0-based row index
  w: number;     // width in grid units
  h: number;     // height in grid units
}

export type LayoutMap = Record<string, WidgetLayout>;

// Task 1.2 — WidgetSettings discriminated union
export type WidgetSettings =
  | { type: 'clock' }
  | { type: 'image-viewer'; source: 'url'; url: string }
  | { type: 'image-viewer'; source: 'file' }
  | { type: 'file-viewer'; fileName: string }
  | { type: 'webpage-viewer'; url: string };

// Task 1.1 — WidgetContentProps with optional settings
export interface WidgetContentProps {
  id: string;
  settings?: WidgetSettings;
  onSettingsChange?: (settings: WidgetSettings) => void;
}

export interface WidgetDefinition {
  type: string;
  displayName: string;
  defaultSize: { w: number; h: number };
  component: React.ComponentType<WidgetContentProps>;
}
