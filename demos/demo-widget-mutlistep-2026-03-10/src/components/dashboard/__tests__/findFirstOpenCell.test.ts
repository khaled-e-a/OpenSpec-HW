import { describe, it, expect } from 'vitest';
import { findFirstOpenCell } from '../utils/findFirstOpenCell';
import type { WidgetLayout } from '../types';

/**
 * UC1-S2 — System finds the first available grid cell (left-to-right, top-to-bottom)
 * UC1-E1a — No unoccupied cell exists — returns null
 */
describe('findFirstOpenCell', () => {
  it('returns {col:0,row:0} for an empty layout', () => {
    expect(findFirstOpenCell([], 4, 3)).toEqual({ col: 0, row: 0 });
  });

  it('scans left-to-right within a row first', () => {
    // col 0 row 0 occupied; expect col 1 row 0
    const layout: WidgetLayout[] = [{ id: 'a', col: 0, row: 0, w: 1, h: 1, type: 'clock' }];
    expect(findFirstOpenCell(layout, 4, 3)).toEqual({ col: 1, row: 0 });
  });

  it('moves to the next row when the current row is full', () => {
    // First row fully occupied by a 4-wide widget
    const layout: WidgetLayout[] = [{ id: 'a', col: 0, row: 0, w: 4, h: 1, type: 'clock' }];
    expect(findFirstOpenCell(layout, 4, 3)).toEqual({ col: 0, row: 1 });
  });

  it('returns null when the grid is completely full', () => {
    const layout: WidgetLayout[] = [{ id: 'a', col: 0, row: 0, w: 4, h: 3, type: 'clock' }];
    expect(findFirstOpenCell(layout, 4, 3)).toBeNull();
  });

  it('accounts for multi-cell widget spans when finding a gap', () => {
    // Widget spans cols 0-1 rows 0-1; first open cell is col 2 row 0
    const layout: WidgetLayout[] = [{ id: 'a', col: 0, row: 0, w: 2, h: 2, type: 'clock' }];
    expect(findFirstOpenCell(layout, 4, 3)).toEqual({ col: 2, row: 0 });
  });

  it('handles a partially filled grid with scattered widgets', () => {
    const layout: WidgetLayout[] = [
      { id: 'a', col: 0, row: 0, w: 2, h: 1, type: 'clock' },
      { id: 'b', col: 2, row: 0, w: 1, h: 1, type: 'clock' },
    ];
    // col 3 row 0 is the first open cell
    expect(findFirstOpenCell(layout, 4, 3)).toEqual({ col: 3, row: 0 });
  });
});
