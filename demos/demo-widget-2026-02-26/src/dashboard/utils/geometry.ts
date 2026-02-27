import type { LayoutItem } from '../types';

export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Computes grid container height to fit all widgets, minimum one row. */
export function computeContainerHeight(
  layout: LayoutItem[],
  rowHeight: number,
): number {
  if (layout.length === 0) return rowHeight;
  const maxRow = Math.max(...layout.map((item) => item.y + item.h));
  return maxRow * rowHeight;
}

/** Converts a LayoutItem's grid coordinates to absolute pixel rect. */
export function itemToPixelRect(
  item: LayoutItem,
  colWidth: number,
  rowHeight: number,
): PixelRect {
  return {
    left: item.x * colWidth,
    top: item.y * rowHeight,
    width: item.w * colWidth,
    height: item.h * rowHeight,
  };
}
