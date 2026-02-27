import type { LayoutItem } from '../types';

/** Returns true if two layout items' grid rectangles intersect. */
export function overlaps(a: LayoutItem, b: LayoutItem): boolean {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}

/** Returns true if candidate overlaps any item in others. */
export function hasAnyOverlap(
  candidate: LayoutItem,
  others: LayoutItem[],
): boolean {
  return others.some((other) => overlaps(candidate, other));
}
