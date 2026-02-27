import { describe, it, expect } from 'vitest';
import { snapToGrid, snapToSize } from '../snap';

const item = { w: 2, h: 2 };

describe('snapToGrid', () => {
  it('rounds to nearest column', () => {
    // px=155 / colWidth=100 = 1.55 → rounds to 2
    expect(snapToGrid(155, 95, 100, 80, item, 12)).toEqual({ x: 2, y: 1 });
  });

  it('rounds down when below 0.5', () => {
    expect(snapToGrid(40, 30, 100, 80, item, 12)).toEqual({ x: 0, y: 0 });
  });

  it('clamps x to left boundary (0)', () => {
    expect(snapToGrid(-50, 0, 100, 80, item, 12)).toEqual({ x: 0, y: 0 });
  });

  it('clamps x to right boundary (columns - w)', () => {
    // px=1200 / colWidth=100 = 12; max x = 12 - 2 = 10
    expect(snapToGrid(1200, 0, 100, 80, item, 12)).toEqual({ x: 10, y: 0 });
  });

  it('clamps y to 0 (never negative)', () => {
    expect(snapToGrid(0, -200, 100, 80, item, 12)).toEqual({ x: 0, y: 0 });
  });
});

// WRS-R2-S1, WRS-R3-S1/S2/S3
describe('snapToSize', () => {
  const baseItem = { x: 0, y: 0, minW: 2, minH: 2, maxW: 6, maxH: 4 };

  it('rounds offset to nearest column for width (WRS-R2-S1)', () => {
    // offsetX = 260px / colWidth=100 → 2.6 → rounds to 3
    const { w } = snapToSize(260, 200, 100, 80, baseItem, 12);
    expect(w).toBe(3);
  });

  it('clamps w to minW when candidate is below minimum (WRS-R3-S1)', () => {
    // offsetX = 50 / 100 = 0.5 → rounds to 1, but minW=2 → clamp to 2
    const { w } = snapToSize(50, 200, 100, 80, baseItem, 12);
    expect(w).toBe(2);
  });

  it('clamps h to maxH when candidate exceeds maximum (WRS-R3-S2)', () => {
    // offsetY = 1000 / 80 = 12.5 → rounds to 13, but maxH=4 → clamp to 4
    const { h } = snapToSize(200, 1000, 100, 80, baseItem, 12);
    expect(h).toBe(4);
  });

  it('clamps w to grid boundary when pointer exits grid (WRS-R3-S3)', () => {
    // item at x=0, columns=12 → maxW = min(6, 12-0) = 6
    // offsetX = 900 / 100 = 9 → exceeds maxW=6 → clamp to 6
    const { w } = snapToSize(900, 200, 100, 80, baseItem, 12);
    expect(w).toBe(6);
  });
});
