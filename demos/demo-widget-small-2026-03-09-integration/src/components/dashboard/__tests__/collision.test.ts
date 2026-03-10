import { describe, it, expect } from 'vitest';
import { getOccupiedCells, isValidDrop } from '../utils/collision';
import type { WidgetLayout } from '../types';

const layout: WidgetLayout[] = [
  { id: 'a', col: 0, row: 0, w: 2, h: 1 },
  { id: 'b', col: 2, row: 0, w: 1, h: 1 },
  { id: 'c', col: 0, row: 1, w: 1, h: 2 },
];

describe('getOccupiedCells', () => {
  it('returns cells for all widgets except the excluded one', () => {
    const occupied = getOccupiedCells(layout, 'a');
    // widget b: (2,0); widget c: (0,1),(0,2)
    expect(occupied.has('2,0')).toBe(true);
    expect(occupied.has('0,1')).toBe(true);
    expect(occupied.has('0,2')).toBe(true);
    // widget a excluded
    expect(occupied.has('0,0')).toBe(false);
    expect(occupied.has('1,0')).toBe(false);
  });
});

describe('isValidDrop', () => {
  const cols = 4;
  const rows = 3;

  it('returns true for a valid move to an empty cell', () => {
    expect(isValidDrop({ col: 1, row: 1, w: 1, h: 1 }, layout, cols, rows, 'a')).toBe(true);
  });

  it('returns false when drop collides with another widget', () => {
    // col 2, row 0 is occupied by widget b
    expect(isValidDrop({ col: 2, row: 0, w: 1, h: 1 }, layout, cols, rows, 'a')).toBe(false);
  });

  it('returns false when drop is out of bounds on the left', () => {
    expect(isValidDrop({ col: -1, row: 0, w: 1, h: 1 }, layout, cols, rows, 'a')).toBe(false);
  });

  it('returns false when drop is out of bounds on the right', () => {
    expect(isValidDrop({ col: 4, row: 0, w: 1, h: 1 }, layout, cols, rows, 'a')).toBe(false);
  });

  it('returns false when drop is out of bounds at the top', () => {
    expect(isValidDrop({ col: 0, row: -1, w: 1, h: 1 }, layout, cols, rows, 'a')).toBe(false);
  });

  it('returns false when drop is out of bounds at the bottom', () => {
    expect(isValidDrop({ col: 0, row: 3, w: 1, h: 1 }, layout, cols, rows, 'a')).toBe(false);
  });

  it('returns false for partial overlap out of bounds (right edge)', () => {
    // 2-wide widget at col 3 in a 4-col grid → col 3 + 2 = 5 > 4
    expect(isValidDrop({ col: 3, row: 0, w: 2, h: 1 }, layout, cols, rows, 'a')).toBe(false);
  });

  it('returns false for partial overlap out of bounds (bottom edge)', () => {
    // 2-tall widget at row 2 in a 3-row grid → row 2 + 2 = 4 > 3
    expect(isValidDrop({ col: 1, row: 2, w: 1, h: 2 }, layout, cols, rows, 'a')).toBe(false);
  });

  it('returns true when placing the widget at its own position (no self-collision)', () => {
    // widget 'a' is at col 0, row 0, w 2, h 1 — should be valid as it's excluded
    expect(isValidDrop({ col: 0, row: 0, w: 2, h: 1 }, layout, cols, rows, 'a')).toBe(true);
  });
});
