import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pointerToGridCoords, rafThrottle } from './snapGrid';
import { GRID_COLS, CELL_WIDTH_PX, CELL_HEIGHT_PX } from '../constants';

// UC1-S3, UC1-S5, UC2-S3

const makeGridRect = (left = 0, top = 0): DOMRect =>
  ({
    left,
    top,
    right: left + GRID_COLS * CELL_WIDTH_PX,
    bottom: top + 600,
    width: GRID_COLS * CELL_WIDTH_PX,
    height: 600,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect);

// ─── UC1-S3: pointer-to-grid coordinate conversion ───────────────────────────
describe('pointerToGridCoords — UC1-S3: snap coordinate computation', () => {
  it('converts pointer at grid origin to col=0, row=0', () => {
    const rect = makeGridRect(100, 50);
    // Pointer exactly at grid top-left
    const result = pointerToGridCoords(100, 50, rect, 1, 1);
    expect(result).toEqual({ col: 0, row: 0 });
  });

  it('converts pointer at cell centre to correct col/row', () => {
    const rect = makeGridRect(0, 0);
    // Pointer at the start of cell col=2: x = 2*80 = 160, y = 1*80 = 80
    // Math.round(160/80)=2, Math.round(80/80)=1
    const result = pointerToGridCoords(160, 80, rect, 1, 1);
    expect(result).toEqual({ col: 2, row: 1 });
  });

  it('snaps to nearest col with Math.round', () => {
    const rect = makeGridRect(0, 0);
    // Pointer just past midpoint between col 1 and col 2: x = 1*80 + 45 = 125
    const result = pointerToGridCoords(125, 0, rect, 1, 1);
    expect(result.col).toBe(2);
  });
});

// ─── UC1-S5: clamping within grid bounds ─────────────────────────────────────
describe('pointerToGridCoords — UC1-S5: clamping to grid bounds', () => {
  it('clamps col to 0 when pointer is left of grid', () => {
    const rect = makeGridRect(100, 0);
    const result = pointerToGridCoords(50, 0, rect, 1, 1); // pointerX 50 < rect.left 100
    expect(result.col).toBe(0);
  });

  it('clamps col so widget right-edge does not exceed GRID_COLS', () => {
    const rect = makeGridRect(0, 0);
    // Widget w=4, pointer far to the right: col would be 11 but col+4=15 > 12
    const result = pointerToGridCoords(900, 0, rect, 4, 1);
    expect(result.col).toBeLessThanOrEqual(GRID_COLS - 4);
    expect(result.col + 4).toBeLessThanOrEqual(GRID_COLS);
  });

  it('clamps row to 0 when pointer is above grid', () => {
    const rect = makeGridRect(0, 100);
    const result = pointerToGridCoords(0, 50, rect, 1, 1); // pointerY 50 < rect.top 100
    expect(result.row).toBe(0);
  });

  it('allows row to grow beyond initial visible area', () => {
    const rect = makeGridRect(0, 0);
    const result = pointerToGridCoords(0, 10 * CELL_HEIGHT_PX, rect, 1, 1);
    expect(result.row).toBe(10);
  });
});

// ─── UC1-S5, UC2-S3: rafThrottle ─────────────────────────────────────────────
describe('rafThrottle — UC1-S5/UC2-S3: throttle to one call per frame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    let rafId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafId++;
      Promise.resolve().then(() => cb(0));
      return rafId;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('calls the wrapped function exactly once per animation frame', async () => {
    const fn = vi.fn();
    const throttled = rafThrottle(fn);

    throttled();
    throttled();
    throttled();

    await Promise.resolve(); // flush rAF microtask

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
