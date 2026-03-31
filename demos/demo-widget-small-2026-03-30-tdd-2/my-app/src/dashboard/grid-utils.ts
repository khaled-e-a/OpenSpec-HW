import type { WidgetLayout } from './types'

/** Convert pointer pixel coordinates to integer grid cell (x, y). */
export function pixelToCell(
  pointerX: number,
  pointerY: number,
  cellSize: number
): { x: number; y: number } {
  return {
    x: Math.floor(pointerX / cellSize),
    y: Math.floor(pointerY / cellSize),
  }
}

/** Clamp a candidate position so the widget stays fully within grid bounds. */
export function clampToGrid(
  x: number,
  y: number,
  w: number,
  h: number,
  colCount: number,
  rowCount: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(x, colCount - w)),
    y: Math.max(0, Math.min(y, rowCount - h)),
  }
}

/**
 * AABB collision check — returns true if `candidate` overlaps any widget in `layout`.
 * Pass `excludeId` to skip the widget being dragged (self-move scenario).
 */
export function detectCollision(
  candidate: WidgetLayout,
  layout: WidgetLayout[],
  excludeId?: string
): boolean {
  for (const item of layout) {
    if (item.id === excludeId) continue
    const xOverlap =
      candidate.x < item.x + item.w && candidate.x + candidate.w > item.x
    const yOverlap =
      candidate.y < item.y + item.h && candidate.y + candidate.h > item.y
    if (xOverlap && yOverlap) return true
  }
  return false
}

/**
 * Returns true if the candidate position is within bounds AND does not
 * collide with any existing widget.
 */
export function isValidDrop(
  candidate: WidgetLayout,
  layout: WidgetLayout[],
  colCount: number,
  rowCount: number,
  excludeId?: string
): boolean {
  // Bounds check
  if (candidate.x < 0 || candidate.y < 0) return false
  if (candidate.x + candidate.w > colCount) return false
  if (candidate.y + candidate.h > rowCount) return false
  // Collision check
  return !detectCollision(candidate, layout, excludeId)
}
