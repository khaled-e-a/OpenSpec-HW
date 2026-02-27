import { computeTargetCell } from '../hooks/useDragDrop';

// Grid: 4 columns, 4 rows, 8px gap, 400x400 container.
// cellWidth  = (400 - 8*3) / 4 = (400-24)/4 = 94
// cellHeight = (400 - 8*3) / 4 = 94
// stride = cellWidth + gap = 102

function makeRect(left = 0, top = 0, width = 400, height = 400): DOMRect {
  return {
    left, top, right: left + width, bottom: top + height,
    width, height, x: left, y: top,
    toJSON: () => ({}),
  };
}

const RECT = makeRect();
const COLS = 4, ROWS = 4, GAP = 8;

describe('computeTargetCell', () => {
  it('maps pointer at center of cell (1,1) to col=1, row=1', () => {
    // Center of cell 1: 0 + 94/2 = 47
    const result = computeTargetCell(47, 47, RECT, COLS, ROWS, GAP, 1, 1);
    expect(result).toEqual({ col: 1, row: 1 });
  });

  it('maps pointer at center of cell (3,2) correctly', () => {
    // col 3 center: (2 * 102) + 47 = 204 + 47 = 251
    // row 2 center: (1 * 102) + 47 = 102 + 47 = 149
    const result = computeTargetCell(251, 149, RECT, COLS, ROWS, GAP, 1, 1);
    expect(result).toEqual({ col: 3, row: 2 });
  });

  it('clamps pointer beyond last column to max valid col for 1x1', () => {
    // Pointer at x=500 (beyond grid width 400) should clamp to col 4.
    const result = computeTargetCell(500, 47, RECT, COLS, ROWS, GAP, 1, 1);
    expect(result.col).toBe(4);
  });

  it('clamps col so a 2-wide widget does not go out of bounds', () => {
    // A colSpan=2 widget cannot start at col 4 in a 4-column grid.
    // Max valid col = 4 - 2 + 1 = 3.
    const result = computeTargetCell(390, 47, RECT, COLS, ROWS, GAP, 2, 1);
    expect(result.col).toBe(3);
  });

  it('clamps row so a 2-tall widget does not go out of bounds', () => {
    // Max valid row = 4 - 2 + 1 = 3.
    const result = computeTargetCell(47, 390, RECT, COLS, ROWS, GAP, 1, 2);
    expect(result.row).toBe(3);
  });

  it('clamps pointer at negative x to col=1', () => {
    const result = computeTargetCell(-50, 47, RECT, COLS, ROWS, GAP, 1, 1);
    expect(result.col).toBe(1);
  });
});
