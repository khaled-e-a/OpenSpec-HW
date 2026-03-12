import type { LayoutItem } from '../types';

/** Task 2.1 — Convert pixel offset to integer grid cell coordinates (UC1-S3, UC1-S6) */
export function pixelToCell(px: number, py: number, cellSize: number): { x: number; y: number } {
  return {
    x: Math.round(px / cellSize),
    y: Math.round(py / cellSize),
  };
}

/** Task 2.2 — Convert grid cell coordinates to pixel offset (UC1-S3) */
export function cellToPixel(x: number, y: number, cellSize: number): { px: number; py: number } {
  return {
    px: x * cellSize,
    py: y * cellSize,
  };
}

/** Task 2.3 — Clamp a widget's position and size to fit within the grid (UC2-E4b) */
export function clampToGrid(
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
): LayoutItem & { id: string } {
  const clampedW = Math.max(1, Math.min(w, cols));
  const clampedH = Math.max(1, Math.min(h, rows));
  const clampedX = Math.max(0, Math.min(x, cols - clampedW));
  const clampedY = Math.max(0, Math.min(y, rows - clampedH));
  return { id: '', x: clampedX, y: clampedY, w: clampedW, h: clampedH };
}
