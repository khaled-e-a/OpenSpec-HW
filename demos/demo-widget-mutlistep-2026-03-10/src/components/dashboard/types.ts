/**
 * Supported widget content types.
 */
export type WidgetType = 'clock' | 'image' | 'file' | 'webpage';

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
  /** Widget content type */
  type: WidgetType;
  /** Base64 data URL for image type */
  imageDataUrl?: string;
  /** Plain text content for file type */
  fileText?: string;
  /** Display filename for file type */
  fileLabel?: string;
  /** URL for webpage type */
  webpageUrl?: string;
};
