import { describe, it, expect } from 'vitest';
import { isValidPlacement, findFirstAvailablePosition } from './placement';
import type { DashboardLayout, WidgetLayout } from '../types';

// UC1-E3a1, UC1-E3a2, UC2-E4a1, UC2-E4b1

const baseLayout: DashboardLayout = [
  { id: 'a', col: 0, row: 0, w: 4, h: 2 },
  { id: 'b', col: 4, row: 0, w: 4, h: 2 },
];

describe('isValidPlacement — valid placement', () => {
  it('accepts a non-overlapping position within bounds', () => {
    expect(
      isValidPlacement(baseLayout, { id: 'c', col: 8, row: 0, w: 4, h: 2 })
    ).toBe(true);
  });

  it('accepts placement when excluding the moving widget itself', () => {
    // widget 'a' moving to col 0 row 2 — no collision with itself or b
    expect(
      isValidPlacement(baseLayout, { id: 'a', col: 0, row: 2, w: 4, h: 2 }, 'a')
    ).toBe(true);
  });
});

describe('isValidPlacement — collision detection (UC1-E3a2, UC2-E4a1)', () => {
  it('rejects a position that overlaps an existing widget', () => {
    expect(
      isValidPlacement(baseLayout, { id: 'c', col: 2, row: 0, w: 4, h: 2 })
    ).toBe(false);
  });

  it('rejects a position that partially overlaps (right edge)', () => {
    expect(
      isValidPlacement(baseLayout, { id: 'c', col: 3, row: 0, w: 4, h: 2 })
    ).toBe(false);
  });

  it('accepts adjacent (touching, non-overlapping) position', () => {
    // col 4 starts exactly where 'a' ends — should not overlap
    expect(
      isValidPlacement([{ id: 'a', col: 0, row: 0, w: 4, h: 2 }], {
        id: 'c',
        col: 4,
        row: 0,
        w: 4,
        h: 2,
      })
    ).toBe(true);
  });
});

describe('isValidPlacement — boundary violations (UC1-E6a1, UC2-E5a1)', () => {
  it('rejects negative column', () => {
    expect(
      isValidPlacement([], { id: 'c', col: -1, row: 0, w: 2, h: 2 })
    ).toBe(false);
  });

  it('rejects negative row', () => {
    expect(
      isValidPlacement([], { id: 'c', col: 0, row: -1, w: 2, h: 2 })
    ).toBe(false);
  });

  it('rejects widget that exceeds GRID_COLS (12)', () => {
    expect(
      isValidPlacement([], { id: 'c', col: 10, row: 0, w: 4, h: 2 }) // col 10 + w 4 = 14 > 12
    ).toBe(false);
  });

  it('accepts widget that exactly fits at the right edge', () => {
    expect(
      isValidPlacement([], { id: 'c', col: 8, row: 0, w: 4, h: 2 }) // col 8 + w 4 = 12 ✓
    ).toBe(true);
  });
});

describe('isValidPlacement — minimum size (UC2-E4b1, UC2-E4b2)', () => {
  it('rejects w = 0', () => {
    expect(isValidPlacement([], { id: 'c', col: 0, row: 0, w: 0, h: 2 })).toBe(false);
  });

  it('rejects h = 0', () => {
    expect(isValidPlacement([], { id: 'c', col: 0, row: 0, w: 2, h: 0 })).toBe(false);
  });

  it('accepts minimum size 1x1', () => {
    expect(isValidPlacement([], { id: 'c', col: 0, row: 0, w: 1, h: 1 })).toBe(true);
  });
});

// ─── findFirstAvailablePosition ──────────────────────────────────────────────
describe('findFirstAvailablePosition', () => {
  it('returns col=0, row=0 for an empty layout', () => {
    const pos = findFirstAvailablePosition([], 'new', 4, 2);
    expect(pos).toEqual({ col: 0, row: 0 });
  });

  it('returns a non-overlapping position when col=0 row=0 is occupied', () => {
    const layout: WidgetLayout[] = [{ id: 'a', col: 0, row: 0, w: 12, h: 1 }];
    const pos = findFirstAvailablePosition(layout, 'new', 4, 2);
    expect(pos).not.toBeNull();
    expect(pos!.row).toBeGreaterThanOrEqual(1);
  });

  it('returns null when the grid is completely full', () => {
    // Fill the entire grid with a 12×20 widget
    const layout: WidgetLayout[] = [{ id: 'full', col: 0, row: 0, w: 12, h: 20 }];
    const pos = findFirstAvailablePosition(layout, 'new', 4, 2);
    expect(pos).toBeNull();
  });

  it('finds a gap between two widgets', () => {
    // widget at col 0-3, widget at col 8-11 — gap at col 4-7
    const layout: WidgetLayout[] = [
      { id: 'a', col: 0, row: 0, w: 4, h: 2 },
      { id: 'b', col: 8, row: 0, w: 4, h: 2 },
    ];
    const pos = findFirstAvailablePosition(layout, 'new', 4, 2);
    expect(pos).toEqual({ col: 4, row: 0 });
  });
});
