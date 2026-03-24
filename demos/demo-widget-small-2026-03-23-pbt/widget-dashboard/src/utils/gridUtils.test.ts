import {
  pixelToCell,
  snapAndClamp,
  buildOccupancyGrid,
  hasConflict,
  findNearestFreeCell,
  autoPlace,
  gravityReflow,
} from './gridUtils';
import { LayoutMap } from '../widgets/types';

// ─── pixelToCell ─────────────────────────────────────────────────────────────
describe('pixelToCell', () => {
  it('converts pixel coords to cell coords', () => {
    expect(pixelToCell(160, 80, 80, 80)).toEqual({ col: 2, row: 1 });
  });
  it('returns 0,0 for origin', () => {
    expect(pixelToCell(0, 0, 80, 80)).toEqual({ col: 0, row: 0 });
  });
});

// ─── snapAndClamp ─────────────────────────────────────────────────────────────
describe('snapAndClamp', () => {
  it('rounds to nearest cell', () => {
    expect(snapAndClamp(2.4, 1.6, 1, 1, 12, 8)).toEqual({ col: 2, row: 2 });
  });
  it('clamps to 0 minimum', () => {
    expect(snapAndClamp(-1, -1, 1, 1, 12, 8)).toEqual({ col: 0, row: 0 });
  });
  it('clamps widget within right/bottom boundary', () => {
    // Widget 2 wide in 12-col grid → max col = 10
    expect(snapAndClamp(11, 8, 2, 1, 12, 8)).toEqual({ col: 10, row: 7 });
  });
});

// ─── buildOccupancyGrid ───────────────────────────────────────────────────────
describe('buildOccupancyGrid', () => {
  const layout: LayoutMap = {
    a: { id: 'a', col: 0, row: 0, w: 2, h: 1 },
    b: { id: 'b', col: 3, row: 2, w: 1, h: 1 },
  };
  it('marks occupied cells', () => {
    const occ = buildOccupancyGrid(layout, 6, 4);
    expect(occ[0][0]).toBe(true);
    expect(occ[0][1]).toBe(true);
    expect(occ[0][2]).toBe(false);
    expect(occ[2][3]).toBe(true);
  });
  it('excludes specified id', () => {
    const occ = buildOccupancyGrid(layout, 6, 4, 'a');
    expect(occ[0][0]).toBe(false);
    expect(occ[2][3]).toBe(true);
  });
});

// ─── hasConflict ──────────────────────────────────────────────────────────────
describe('hasConflict', () => {
  const occupancy = buildOccupancyGrid(
    { a: { id: 'a', col: 2, row: 2, w: 2, h: 2 } },
    6, 6
  );
  it('detects overlap with occupied cell', () => {
    expect(hasConflict(occupancy, 2, 2, 1, 1)).toBe(true);
  });
  it('returns false for empty region', () => {
    expect(hasConflict(occupancy, 0, 0, 2, 2)).toBe(false);
  });
  it('returns true for out-of-bounds placement', () => {
    expect(hasConflict(occupancy, 5, 5, 2, 2)).toBe(true);
  });
});

// ─── findNearestFreeCell ──────────────────────────────────────────────────────
describe('findNearestFreeCell', () => {
  const layout: LayoutMap = {
    a: { id: 'a', col: 1, row: 0, w: 1, h: 1 },
  };
  const occ = buildOccupancyGrid(layout, 4, 4);

  it('returns target if free', () => {
    expect(findNearestFreeCell(occ, 0, 0, 1, 1, 4, 4)).toEqual({ col: 0, row: 0 });
  });
  it('finds neighbour when target is occupied', () => {
    const result = findNearestFreeCell(occ, 1, 0, 1, 1, 4, 4);
    expect(result).not.toBeNull();
    expect(result).not.toEqual({ col: 1, row: 0 });
  });
  it('returns null when grid is full', () => {
    const full: LayoutMap = {
      a: { id: 'a', col: 0, row: 0, w: 2, h: 2 },
    };
    const fullOcc = buildOccupancyGrid(full, 2, 2);
    expect(findNearestFreeCell(fullOcc, 0, 0, 1, 1, 2, 2)).toBeNull();
  });
});

// ─── autoPlace ────────────────────────────────────────────────────────────────
describe('autoPlace', () => {
  it('places at 0,0 when grid is empty', () => {
    const occ = buildOccupancyGrid({}, 12, 8);
    expect(autoPlace(occ, 2, 1, 12, 8)).toEqual({ col: 0, row: 0 });
  });
  it('skips occupied region and finds next slot', () => {
    const layout: LayoutMap = { a: { id: 'a', col: 0, row: 0, w: 12, h: 1 } };
    const occ = buildOccupancyGrid(layout, 12, 8);
    expect(autoPlace(occ, 2, 1, 12, 8)).toEqual({ col: 0, row: 1 });
  });
  it('returns null when no space exists', () => {
    const layout: LayoutMap = { a: { id: 'a', col: 0, row: 0, w: 12, h: 8 } };
    const occ = buildOccupancyGrid(layout, 12, 8);
    expect(autoPlace(occ, 1, 1, 12, 8)).toBeNull();
  });
});

// ─── gravityReflow ────────────────────────────────────────────────────────────
describe('gravityReflow', () => {
  it('leaves layout unchanged when no conflicts', () => {
    const layout: LayoutMap = {
      a: { id: 'a', col: 0, row: 0, w: 2, h: 1 },
      b: { id: 'b', col: 0, row: 1, w: 2, h: 1 },
    };
    const result = gravityReflow(layout, 'a', 12, 8);
    expect(result).not.toBeNull();
    expect(result!['a']).toEqual(layout['a']);
    expect(result!['b']).toEqual(layout['b']);
  });

  it('pushes displaced widget down', () => {
    // Move 'a' to row 1 (where 'b' currently is)
    const layout: LayoutMap = {
      a: { id: 'a', col: 0, row: 1, w: 2, h: 1 }, // moved here
      b: { id: 'b', col: 0, row: 1, w: 2, h: 1 }, // will be displaced
    };
    const result = gravityReflow(layout, 'a', 12, 8);
    expect(result).not.toBeNull();
    expect(result!['a'].row).toBe(1);
    expect(result!['b'].row).toBeGreaterThan(1);
  });

  it('returns null when reflow is impossible', () => {
    // Full grid: a occupies all of row 0, b occupies all of row 1–7; no room to push
    const layout: LayoutMap = {
      a: { id: 'a', col: 0, row: 0, w: 12, h: 1 },
      b: { id: 'b', col: 0, row: 0, w: 12, h: 8 }, // conflicts; no room to push
    };
    const result = gravityReflow(layout, 'a', 12, 8);
    expect(result).toBeNull();
  });
});
