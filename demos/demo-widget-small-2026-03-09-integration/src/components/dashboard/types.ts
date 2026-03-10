/**
 * Describes a widget's position and size on the dashboard grid.
 * Positions are 0-based grid coordinates (column, row).
 * Sizes are in grid units (w = columns spanned, h = rows spanned).
 */
export type WidgetLayout = {
  /** Unique identifier for the widget */
  id: string;
  /** 0-based left column */
  col: number;
  /** 0-based top row */
  row: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
};
