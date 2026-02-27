export interface WidgetLayout {
  id: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

export type GridLayout = WidgetLayout[];

export const WIDGET_SIZES = {
  SMALL: { colSpan: 1, rowSpan: 1 },
  WIDE:  { colSpan: 2, rowSpan: 1 },
  TALL:  { colSpan: 1, rowSpan: 2 },
  LARGE: { colSpan: 2, rowSpan: 2 },
} as const;
