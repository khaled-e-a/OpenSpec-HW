import { describe, it, expect } from 'vitest';
import { pointerToCell, isPointerInsideGrid } from '../utils/gridCoords';

const gridRect = {
  left: 0,
  top: 0,
  right: 400,
  bottom: 360,
  width: 400,
  height: 360,
} as DOMRect;

const cellWidth = 100; // 400 / 4 cols
const cellHeight = 120; // rows

describe('pointerToCell', () => {
  it('maps mid-cell pointer to correct column and row', () => {
    // pointer at (150, 60) → col 1, row 0
    expect(pointerToCell(150, 60, gridRect, cellWidth, cellHeight, 1, 1, 4, 3)).toEqual({ col: 1, row: 0 });
  });

  it('clamps column to 0 when pointer is left of grid', () => {
    expect(pointerToCell(-10, 60, gridRect, cellWidth, cellHeight, 1, 1, 4, 3)).toEqual({ col: 0, row: 0 });
  });

  it('clamps column so widget stays within right boundary', () => {
    // 2-wide widget, totalCols=4 → max col is 2
    expect(pointerToCell(390, 60, gridRect, cellWidth, cellHeight, 2, 1, 4, 3)).toEqual({ col: 2, row: 0 });
  });

  it('clamps row to 0 when pointer is above grid', () => {
    expect(pointerToCell(50, -5, gridRect, cellWidth, cellHeight, 1, 1, 4, 3)).toEqual({ col: 0, row: 0 });
  });

  it('clamps row so widget stays within bottom boundary', () => {
    // 2-tall widget, totalRows=3 → max row is 1
    expect(pointerToCell(50, 350, gridRect, cellWidth, cellHeight, 1, 2, 4, 3)).toEqual({ col: 0, row: 1 });
  });

  it('handles exact cell boundaries', () => {
    // pointer at exactly (200, 120) → col 2, row 1
    expect(pointerToCell(200, 120, gridRect, cellWidth, cellHeight, 1, 1, 4, 3)).toEqual({ col: 2, row: 1 });
  });
});

describe('isPointerInsideGrid', () => {
  it('returns true for pointer inside grid', () => {
    expect(isPointerInsideGrid(200, 180, gridRect)).toBe(true);
  });

  it('returns false for pointer to the left', () => {
    expect(isPointerInsideGrid(-1, 180, gridRect)).toBe(false);
  });

  it('returns false for pointer to the right', () => {
    expect(isPointerInsideGrid(401, 180, gridRect)).toBe(false);
  });

  it('returns false for pointer above', () => {
    expect(isPointerInsideGrid(200, -1, gridRect)).toBe(false);
  });

  it('returns false for pointer below', () => {
    expect(isPointerInsideGrid(200, 361, gridRect)).toBe(false);
  });
});
