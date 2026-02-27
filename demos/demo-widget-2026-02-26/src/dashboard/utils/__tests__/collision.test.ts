import { describe, it, expect } from 'vitest';
import { overlaps, hasAnyOverlap } from '../collision';
import type { LayoutItem } from '../../types';

function item(x: number, y: number, w: number, h: number, id = 'x'): LayoutItem {
  return { id, type: 't', x, y, w, h };
}

describe('overlaps', () => {
  it('returns true when items overlap', () => {
    expect(overlaps(item(0, 0, 2, 2), item(1, 1, 2, 2))).toBe(true);
  });

  it('returns false for horizontally adjacent items', () => {
    expect(overlaps(item(0, 0, 2, 2), item(2, 0, 2, 2))).toBe(false);
  });

  it('returns false for vertically adjacent items', () => {
    expect(overlaps(item(0, 0, 2, 2), item(0, 2, 2, 2))).toBe(false);
  });

  it('returns true when one item is fully contained in another', () => {
    expect(overlaps(item(0, 0, 4, 4), item(1, 1, 2, 2))).toBe(true);
  });
});

describe('hasAnyOverlap', () => {
  it('returns true when candidate overlaps any other', () => {
    const others = [item(3, 0, 2, 2, 'a'), item(1, 1, 2, 2, 'b')];
    expect(hasAnyOverlap(item(0, 0, 2, 2, 'c'), others)).toBe(true);
  });

  it('returns false when no overlap', () => {
    const others = [item(3, 0, 2, 2, 'a'), item(0, 4, 2, 2, 'b')];
    expect(hasAnyOverlap(item(0, 0, 2, 2, 'c'), others)).toBe(false);
  });

  it('excludes dragged item when caller filters it out', () => {
    const dragged = item(0, 0, 2, 2, 'drag');
    // caller excludes the dragged item — others should not include it
    const others = [item(0, 0, 2, 2, 'other')];
    expect(hasAnyOverlap(dragged, others)).toBe(true); // other is at same pos
    expect(hasAnyOverlap(dragged, [])).toBe(false);    // no others → no overlap
  });
});
