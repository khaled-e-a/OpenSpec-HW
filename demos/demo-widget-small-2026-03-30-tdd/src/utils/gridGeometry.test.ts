import { describe, it, expect } from 'vitest';
import { isValidPlacement, pointerToCell } from './gridGeometry';
import type { WidgetLayout } from './widgetTypes';

// ---------------------------------------------------------------------------
// pointerToCell — Tasks 3.4 + 3.5
// UC1-S4: System snaps ghost preview to nearest valid grid cell in real time
// UC1-E3a: Preview stays at last valid position when pointer exits grid
// ---------------------------------------------------------------------------
describe('pointerToCell', () => {
  const gridRect = { left: 0, top: 0 } as DOMRect;

  it('UC1-S4: converts pointer position to grid cell using floor division', () => {
    // pointer at (150, 220), cellSize=100 → col=1, row=2
    expect(pointerToCell(150, 220, gridRect, 100, 1, 1, 6, 4)).toEqual({ col: 1, row: 2 });
  });

  it('UC1-S4: maps origin pointer to cell (0, 0)', () => {
    expect(pointerToCell(0, 0, gridRect, 100, 1, 1, 6, 4)).toEqual({ col: 0, row: 0 });
  });

  it('UC1-S4: accounts for grid left/top offset', () => {
    const offsetRect = { left: 50, top: 50 } as DOMRect;
    // pointer at (160, 160), grid starts at (50,50) → relative (110,110), cellSize=100 → (1,1)
    expect(pointerToCell(160, 160, offsetRect, 100, 1, 1, 6, 4)).toEqual({ col: 1, row: 1 });
  });

  it('UC1-E3a: clamps to max valid col when pointer exceeds grid width (widget w=2, cols=6)', () => {
    // pointer at x=700, cellSize=100, max col for w=2 in cols=6 → 4
    expect(pointerToCell(700, 0, gridRect, 100, 2, 1, 6, 4)).toEqual({ col: 4, row: 0 });
  });

  it('UC1-E3a: clamps to max valid row when pointer exceeds grid height (widget h=2, rows=4)', () => {
    // pointer at y=500, cellSize=100, max row for h=2 in rows=4 → 2
    expect(pointerToCell(0, 500, gridRect, 100, 1, 2, 6, 4)).toEqual({ col: 0, row: 2 });
  });

  it('UC1-E3a: clamps negative pointer offset to 0', () => {
    expect(pointerToCell(-50, -50, gridRect, 100, 1, 1, 6, 4)).toEqual({ col: 0, row: 0 });
  });
});

// ---------------------------------------------------------------------------
// isValidPlacement — Tasks 3.1–3.3
// UC1-S6: System validates target position is within bounds and unoccupied
// UC1-E6a: Occupied cell → invalid
// UC1-E6b: Out-of-bounds → invalid
// ---------------------------------------------------------------------------
describe('isValidPlacement', () => {
  const emptyLayout: WidgetLayout[] = [];

  it('UC1-S6: returns true for a valid unoccupied in-bounds position', () => {
    expect(isValidPlacement(emptyLayout, 'a', 0, 0, 1, 1, 6, 4)).toBe(true);
  });

  it('UC1-E6b: returns false when widget extends beyond right edge', () => {
    // col=5, w=2 → 5+2=7 > 6
    expect(isValidPlacement(emptyLayout, 'a', 5, 0, 2, 1, 6, 4)).toBe(false);
  });

  it('UC1-E6b: returns false when widget extends below bottom edge', () => {
    // row=3, h=2 → 3+2=5 > 4
    expect(isValidPlacement(emptyLayout, 'a', 0, 3, 1, 2, 6, 4)).toBe(false);
  });

  it('UC1-E6b: returns false for negative col', () => {
    expect(isValidPlacement(emptyLayout, 'a', -1, 0, 1, 1, 6, 4)).toBe(false);
  });

  it('UC1-E6b: returns false for negative row', () => {
    expect(isValidPlacement(emptyLayout, 'a', 0, -1, 1, 1, 6, 4)).toBe(false);
  });

  it('UC1-E6a: returns false when target cell is occupied by another widget', () => {
    const layout: WidgetLayout[] = [{ widgetId: 'b', col: 2, row: 1, w: 2, h: 2 }];
    // widget 'a' tries to occupy (2,1) which overlaps 'b'
    expect(isValidPlacement(layout, 'a', 2, 1, 1, 1, 6, 4)).toBe(false);
  });

  it('UC1-E6a: returns false when any cell of multi-cell widget overlaps another widget', () => {
    const layout: WidgetLayout[] = [{ widgetId: 'b', col: 3, row: 0, w: 1, h: 1 }];
    // widget 'a' (w=2) at col=2 occupies (2,0) and (3,0) — (3,0) is taken by 'b'
    expect(isValidPlacement(layout, 'a', 2, 0, 2, 1, 6, 4)).toBe(false);
  });

  it('UC1-S6: allows widget to be placed in its own current position (self-drop)', () => {
    // widget 'a' is at (1,1) in layout; dropping back to same position should be valid
    const layout: WidgetLayout[] = [{ widgetId: 'a', col: 1, row: 1, w: 1, h: 1 }];
    expect(isValidPlacement(layout, 'a', 1, 1, 1, 1, 6, 4)).toBe(true);
  });

  it('UC1-S6: returns true for a 2x2 widget placed in empty bottom-right corner', () => {
    expect(isValidPlacement(emptyLayout, 'a', 4, 2, 2, 2, 6, 4)).toBe(true);
  });
});
