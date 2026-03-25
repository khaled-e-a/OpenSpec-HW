import { describe, it, expect } from 'vitest';
import {
  snapToCell,
  buildOccupancySet,
  isValidPlacement,
  resolveLayout,
} from './gridGeometry';
import type { WidgetLayout } from './gridGeometry';

// ---------------------------------------------------------------------------
// snapToCell
// UC1-S4: System continuously snaps drag preview to nearest valid grid cell
// ---------------------------------------------------------------------------
describe('snapToCell', () => {
  it('UC1-S4: converts pointer offset to nearest grid cell', () => {
    // pointer at 150px, 220px; cellSize=100 → col=2 (round(1.5)), row=2 (round(2.2))
    expect(snapToCell(150, 220, 100)).toEqual({ col: 2, row: 2 });
  });

  it('UC1-S4: snaps to cell 0,0 at origin', () => {
    expect(snapToCell(0, 0, 100)).toEqual({ col: 0, row: 0 });
  });

  it('UC1-S4: rounds down when pointer is just below midpoint', () => {
    // 149px / 100 = 1.49 → rounds to 1
    expect(snapToCell(149, 149, 100)).toEqual({ col: 1, row: 1 });
  });

  it('UC1-S4: rounds up when pointer is at midpoint', () => {
    // 150px / 100 = 1.5 → rounds to 2
    expect(snapToCell(150, 150, 100)).toEqual({ col: 2, row: 2 });
  });

  it('UC1-S4: clamps to maximum cell when pointer exceeds grid (widget w=2, cols=6)', () => {
    // pointer at 700px in a 6-col grid with cellSize=100, widget w=2 → max col = 6-2 = 4
    expect(snapToCell(700, 0, 100, { w: 2, h: 1, cols: 6, rows: 4 })).toEqual({ col: 4, row: 0 });
  });

  it('UC1-S4: clamps negative pointer offset to 0', () => {
    expect(snapToCell(-50, -50, 100)).toEqual({ col: 0, row: 0 });
  });
});

// ---------------------------------------------------------------------------
// buildOccupancySet
// Derived helper — used by isValidPlacement (UC1-S6)
// ---------------------------------------------------------------------------
describe('buildOccupancySet', () => {
  it('returns a set of "col,row" strings for all occupied cells', () => {
    const layout: WidgetLayout[] = [
      { id: 'a', x: 0, y: 0, w: 2, h: 1 }, // occupies (0,0) and (1,0)
    ];
    const set = buildOccupancySet(layout);
    expect(set.has('0,0')).toBe(true);
    expect(set.has('1,0')).toBe(true);
    expect(set.has('2,0')).toBe(false);
  });

  it('excludes a specified widget id from the set', () => {
    const layout: WidgetLayout[] = [
      { id: 'a', x: 0, y: 0, w: 1, h: 1 },
      { id: 'b', x: 1, y: 0, w: 1, h: 1 },
    ];
    const set = buildOccupancySet(layout, 'a');
    expect(set.has('0,0')).toBe(false); // 'a' excluded
    expect(set.has('1,0')).toBe(true);  // 'b' still present
  });

  it('returns an empty set for an empty layout', () => {
    expect(buildOccupancySet([])).toEqual(new Set());
  });
});

// ---------------------------------------------------------------------------
// isValidPlacement
// UC1-S6: System validates target cells are unoccupied and within grid bounds
// UC1-E6a: Occupied cells → invalid
// UC1-E6b: Out-of-bounds → invalid
// ---------------------------------------------------------------------------
describe('isValidPlacement', () => {
  const layout: WidgetLayout[] = [
    { id: 'a', x: 2, y: 0, w: 2, h: 2 }, // occupies cols 2-3, rows 0-1
  ];

  it('UC1-S6: returns true for a free in-bounds position', () => {
    const candidate: WidgetLayout = { id: 'b', x: 0, y: 0, w: 2, h: 2 };
    expect(isValidPlacement(layout, candidate, 6, 4)).toBe(true);
  });

  it('UC1-E6a: returns false when target cells are occupied by another widget', () => {
    const candidate: WidgetLayout = { id: 'b', x: 2, y: 0, w: 1, h: 1 };
    expect(isValidPlacement(layout, candidate, 6, 4)).toBe(false);
  });

  it('UC1-E6b: returns false when widget would extend beyond right grid boundary', () => {
    const candidate: WidgetLayout = { id: 'b', x: 5, y: 0, w: 2, h: 1 }; // 5+2=7 > 6
    expect(isValidPlacement(layout, candidate, 6, 4)).toBe(false);
  });

  it('UC1-E6b: returns false when widget would extend beyond bottom grid boundary', () => {
    const candidate: WidgetLayout = { id: 'b', x: 0, y: 3, w: 1, h: 2 }; // 3+2=5 > 4
    expect(isValidPlacement(layout, candidate, 6, 4)).toBe(false);
  });

  it('UC1-E6b: returns false when x is negative', () => {
    const candidate: WidgetLayout = { id: 'b', x: -1, y: 0, w: 1, h: 1 };
    expect(isValidPlacement(layout, candidate, 6, 4)).toBe(false);
  });

  it('UC1-E6b: returns false when y is negative', () => {
    const candidate: WidgetLayout = { id: 'b', x: 0, y: -1, w: 1, h: 1 };
    expect(isValidPlacement(layout, candidate, 6, 4)).toBe(false);
  });

  it('UC1-S6: widget being moved is excluded from occupancy (can drop back to its own cells)', () => {
    // 'a' tries to move to same position — should be valid since we exclude 'a' itself
    const candidate: WidgetLayout = { id: 'a', x: 2, y: 0, w: 2, h: 2 };
    expect(isValidPlacement(layout, candidate, 6, 4)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resolveLayout
// UC2-E3a: Overlapping initial config — first wins, second moved to nearest free
// UC2-E3b: Out-of-bounds initial config — widget clamped to grid
// ---------------------------------------------------------------------------
describe('resolveLayout', () => {
  it('UC2-E3b: clamps a widget that extends beyond right/bottom boundary', () => {
    const layout: WidgetLayout[] = [
      { id: 'a', x: 5, y: 3, w: 2, h: 2 }, // 5+2=7 > 6 cols, 3+2=5 > 4 rows
    ];
    const resolved = resolveLayout(layout, 6, 4);
    const a = resolved.find((w) => w.id === 'a')!;
    expect(a.x + a.w).toBeLessThanOrEqual(6);
    expect(a.y + a.h).toBeLessThanOrEqual(4);
  });

  it('UC2-E3a: first widget keeps declared position when two widgets overlap', () => {
    const layout: WidgetLayout[] = [
      { id: 'first', x: 0, y: 0, w: 2, h: 2 },
      { id: 'second', x: 0, y: 0, w: 2, h: 2 }, // overlaps first
    ];
    const resolved = resolveLayout(layout, 6, 4);
    const first = resolved.find((w) => w.id === 'first')!;
    expect(first.x).toBe(0);
    expect(first.y).toBe(0);
  });

  it('UC2-E3a: second widget is moved to a non-overlapping position', () => {
    const layout: WidgetLayout[] = [
      { id: 'first', x: 0, y: 0, w: 2, h: 2 },
      { id: 'second', x: 0, y: 0, w: 2, h: 2 },
    ];
    const resolved = resolveLayout(layout, 6, 4);
    const first = resolved.find((w) => w.id === 'first')!;
    const second = resolved.find((w) => w.id === 'second')!;
    // They must not share any cell
    const firstCells = new Set<string>();
    for (let c = first.x; c < first.x + first.w; c++)
      for (let r = first.y; r < first.y + first.h; r++)
        firstCells.add(`${c},${r}`);
    for (let c = second.x; c < second.x + second.w; c++)
      for (let r = second.y; r < second.y + second.h; r++)
        expect(firstCells.has(`${c},${r}`)).toBe(false);
  });

  it('returns layout unchanged when there are no conflicts', () => {
    const layout: WidgetLayout[] = [
      { id: 'a', x: 0, y: 0, w: 1, h: 1 },
      { id: 'b', x: 2, y: 0, w: 1, h: 1 },
    ];
    const resolved = resolveLayout(layout, 6, 4);
    expect(resolved.find((w) => w.id === 'a')).toEqual({ id: 'a', x: 0, y: 0, w: 1, h: 1 });
    expect(resolved.find((w) => w.id === 'b')).toEqual({ id: 'b', x: 2, y: 0, w: 1, h: 1 });
  });
});
