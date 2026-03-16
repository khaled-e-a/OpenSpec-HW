import type { DashboardLayout, WidgetLayout } from '../types';
import { GRID_COLS } from '../constants';

/**
 * Returns true if two widget rectangles overlap (AABB test).
 * UC1-E3a2, UC2-E4a1
 */
function rectsOverlap(a: WidgetLayout, b: WidgetLayout): boolean {
  return !(
    a.col + a.w <= b.col ||
    b.col + b.w <= a.col ||
    a.row + a.h <= b.row ||
    b.row + b.h <= a.row
  );
}

/**
 * Checks whether `candidate` is a valid grid placement given the current layout.
 *
 * Enforces:
 * - Grid boundary checks (UC1-E6a1, UC2-E5a1): col >= 0, col + w <= GRID_COLS, row >= 0
 * - Minimum size (UC2-E4b1, UC2-E4b2): w >= 1, h >= 1
 * - No overlap with other widgets (UC1-E3a2, UC2-E4a1)
 *
 * @param layout   Current dashboard layout
 * @param candidate  Proposed position/size
 * @param excludeId  Widget id to exclude from collision check (the widget being moved)
 */
export function isValidPlacement(
  layout: DashboardLayout,
  candidate: WidgetLayout,
  excludeId?: string
): boolean {
  // Minimum size enforcement (UC2-E4b1, UC2-E4b2)
  if (candidate.w < 1 || candidate.h < 1) return false;

  // Grid boundary checks (UC1-E6a1, UC2-E5a1)
  if (candidate.col < 0) return false;
  if (candidate.row < 0) return false;
  if (candidate.col + candidate.w > GRID_COLS) return false;

  // Collision detection — O(n) AABB test (UC1-E3a2, UC2-E4a1)
  for (const entry of layout) {
    if (entry.id === excludeId) continue;
    if (rectsOverlap(candidate, entry)) return false;
  }

  return true;
}

/**
 * Scans grid in row-major order to find the first position where a widget
 * of size (w × h) can be placed without overlap or boundary violation.
 * Returns { col, row } on success, or null if no position is available.
 * UC1-S4, UC1-E4a2
 */
export function findFirstAvailablePosition(
  layout: DashboardLayout,
  id: string,
  w: number,
  h: number
): { col: number; row: number } | null {
  const MAX_ROW = 20; // generous upper bound — widgets must fit entirely within this limit
  for (let row = 0; row + h <= MAX_ROW; row++) {
    for (let col = 0; col <= GRID_COLS - w; col++) {
      const candidate: WidgetLayout = { id, col, row, w, h };
      if (isValidPlacement(layout, candidate)) {
        return { col, row };
      }
    }
  }
  return null;
}

/**
 * Caps a candidate size to the last valid non-overlapping span during resize.
 * Tries to find the largest w/h that passes isValidPlacement.
 * UC2-E4a1, UC2-E4a2
 */
export function clampToValidSize(
  layout: DashboardLayout,
  base: WidgetLayout,
  desiredW: number,
  desiredH: number
): { w: number; h: number } {
  // Try the full desired size first
  const candidate = { ...base, w: Math.max(1, desiredW), h: Math.max(1, desiredH) };
  if (isValidPlacement(layout, candidate, base.id)) {
    return { w: candidate.w, h: candidate.h };
  }

  // Binary search down from desiredW/desiredH to find the cap
  // Simple linear scan — fine for small grid sizes
  let bestW = base.w;
  let bestH = base.h;
  for (let w = Math.max(1, desiredW); w >= 1; w--) {
    for (let h = Math.max(1, desiredH); h >= 1; h--) {
      const trial = { ...base, w, h };
      if (isValidPlacement(layout, trial, base.id)) {
        if (w * h > bestW * bestH) {
          bestW = w;
          bestH = h;
        }
        break;
      }
    }
    if (bestW === Math.max(1, desiredW)) break;
  }
  return { w: bestW, h: bestH };
}
