import type { LayoutItem } from '../types';
import { overlaps } from './collision';

/**
 * Finds the first unoccupied grid position for a widget of the given size,
 * scanning left-to-right, top-to-bottom. Returns null if the widget is wider
 * than the grid.
 */
export function findFirstAvailablePosition(
  layout: LayoutItem[],
  size: { w: number; h: number },
  columns: number,
): { x: number; y: number } | null {
  if (size.w > columns) return null;

  const maxRow =
    layout.length > 0
      ? Math.max(...layout.map((item) => item.y + item.h))
      : 0;

  for (let y = 0; y <= maxRow + 1; y++) {
    for (let x = 0; x <= columns - size.w; x++) {
      const candidate: LayoutItem = {
        id: '__probe',
        type: '',
        x,
        y,
        w: size.w,
        h: size.h,
      };
      if (!layout.some((item) => overlaps(candidate, item))) {
        return { x, y };
      }
    }
  }

  // Grid always has space below existing widgets, so this is unreachable in
  // practice. Kept for type completeness.
  return null;
}

/**
 * Pushes widgets displaced by resizedItem downward by the minimum needed offset.
 * Recurses to cascade-push any newly displaced items (max depth = 10).
 * Returns the updated layout, or null if the recursion depth is exceeded.
 */
export function pushDown(
  layout: LayoutItem[],
  resizedItem: LayoutItem,
  maxDepth = 10,
): LayoutItem[] | null {
  return _push(layout, resizedItem, maxDepth, 0);
}

function _push(
  layout: LayoutItem[],
  anchor: LayoutItem,
  maxDepth: number,
  depth: number,
): LayoutItem[] | null {
  if (depth > maxDepth) return null;

  let result = [...layout];

  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    if (item.id === anchor.id) continue;
    if (!overlaps(anchor, item)) continue;

    const requiredOffset = anchor.y + anchor.h - item.y;
    if (requiredOffset <= 0) continue;

    const pushed: LayoutItem = { ...item, y: item.y + requiredOffset };
    result[i] = pushed;

    const next = _push(result, pushed, maxDepth, depth + 1);
    if (next === null) return null;
    result = next;
  }

  return result;
}
