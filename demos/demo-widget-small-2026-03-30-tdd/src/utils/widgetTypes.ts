// widgetTypes.ts — shared type definitions for widget-drag-drop
// UC1-S8, UC2-S1, UC2-S2, UC2-E2a

/**
 * UC1-S8, UC2-S1: Serialisable record of one widget's position and size in the grid.
 * This is what gets stored in and read from localStorage.
 */
export interface WidgetLayout {
  widgetId: string;
  col: number;  // 0-indexed grid column
  row: number;  // 0-indexed grid row
  w: number;    // column span
  h: number;    // row span
}

/**
 * UC2-S2, UC2-E2a: Static metadata for a widget type, used to validate stored layouts
 * and provide default positions when stored layout is missing or stale.
 */
export interface WidgetDefinition {
  id: string;
  w: number;         // column span
  h: number;         // row span
  defaultCol: number; // fallback column
  defaultRow: number; // fallback row
}
