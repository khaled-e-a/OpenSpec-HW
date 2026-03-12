import type { LayoutItem } from '../types';

/** Returns true if two LayoutItems overlap (AABB test) */
function overlaps(a: LayoutItem, b: LayoutItem): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Task 3.1 — Detect if a candidate item overlaps any item in the layout,
 * excluding the item with excludeId (i.e. the item being moved/resized).
 * (Addresses: UC1-E5a, UC2-S6)
 */
export function detectOverlap(
  candidate: LayoutItem,
  layout: LayoutItem[],
  excludeId: string,
): boolean {
  return layout.some((item) => item.id !== excludeId && overlaps(candidate, item));
}

/**
 * Task 3.2 — Find the largest valid (w, h) for a resize operation that does
 * not overlap any other widget. Tries reducing width first, then height.
 * (Addresses: UC2-E4a)
 */
export function capResizeAtBoundary(
  candidate: LayoutItem,
  layout: LayoutItem[],
  excludeId: string,
): { w: number; h: number } {
  let { w, h } = candidate;

  // Binary-search style: try reducing w until no overlap
  while (w > 1 && detectOverlap({ ...candidate, w, h }, layout, excludeId)) {
    w -= 1;
  }
  // If still overlapping after minimising w, reduce h
  while (h > 1 && detectOverlap({ ...candidate, w, h }, layout, excludeId)) {
    h -= 1;
  }

  return { w, h };
}
