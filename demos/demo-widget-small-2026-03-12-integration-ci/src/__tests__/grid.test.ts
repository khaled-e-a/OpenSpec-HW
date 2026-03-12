import { pixelToCell, cellToPixel, clampToGrid } from '../utils/grid';

// Task 8.1 — pixelToCell / cellToPixel round-trip (UC1-S3, UC1-S6)
describe('pixelToCell', () => {
  it('converts pixel offset to cell coordinates', () => {
    expect(pixelToCell(160, 80, 80)).toEqual({ x: 2, y: 1 });
  });

  it('rounds to nearest cell', () => {
    expect(pixelToCell(120, 40, 80)).toEqual({ x: 2, y: 1 }); // 120/80=1.5 → 2, 40/80=0.5 → 1 (round half to even in some engines; Math.round(0.5)=1)
  });
});

describe('cellToPixel', () => {
  it('converts cell coordinates to pixel offset', () => {
    expect(cellToPixel(2, 1, 80)).toEqual({ px: 160, py: 80 });
  });
});

describe('pixelToCell / cellToPixel round-trip', () => {
  it('round-trips integer cell positions losslessly', () => {
    const cellSize = 80;
    for (const [cx, cy] of [[0, 0], [3, 5], [11, 11]]) {
      const { px, py } = cellToPixel(cx, cy, cellSize);
      expect(pixelToCell(px, py, cellSize)).toEqual({ x: cx, y: cy });
    }
  });
});

// Task 8.2 — clampToGrid boundary cases (UC2-E4b)
describe('clampToGrid', () => {
  const cols = 12;
  const rows = 12;

  it('does not alter a widget fully within bounds', () => {
    const r = clampToGrid(2, 2, 3, 3, cols, rows);
    expect(r).toMatchObject({ x: 2, y: 2, w: 3, h: 3 });
  });

  it('clamps x so widget does not exceed right edge', () => {
    const r = clampToGrid(11, 0, 3, 1, cols, rows);
    expect(r.x + r.w).toBeLessThanOrEqual(cols);
  });

  it('clamps y so widget does not exceed bottom edge', () => {
    const r = clampToGrid(0, 11, 1, 3, cols, rows);
    expect(r.y + r.h).toBeLessThanOrEqual(rows);
  });

  it('clamps oversized width to fit within cols', () => {
    const r = clampToGrid(0, 0, 20, 1, cols, rows);
    expect(r.w).toBeLessThanOrEqual(cols);
  });

  it('clamps oversized height to fit within rows', () => {
    const r = clampToGrid(0, 0, 1, 20, cols, rows);
    expect(r.h).toBeLessThanOrEqual(rows);
  });

  it('enforces minimum size of 1x1', () => {
    const r = clampToGrid(0, 0, 0, 0, cols, rows);
    expect(r.w).toBeGreaterThanOrEqual(1);
    expect(r.h).toBeGreaterThanOrEqual(1);
  });
});
