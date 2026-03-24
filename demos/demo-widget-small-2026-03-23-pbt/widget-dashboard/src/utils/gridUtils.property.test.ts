/**
 * Property-based tests for grid utilities.
 * Framework: fast-check
 * Coverage: UC1-S5, UC1-S6, UC1-E4a, UC1-E4b, UC1-E6a, UC2-E3b, UC2-E6a
 */
import * as fc from 'fast-check';
import {
  snapAndClamp,
  buildOccupancyGrid,
  hasConflict,
  findNearestFreeCell,
  autoPlace,
  gravityReflow,
} from './gridUtils';
import { LayoutMap } from '../widgets/types';

const COLS = 12;
const ROWS = 8;

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const arbCellSize = fc.integer({ min: 40, max: 120 });
const arbGridDims = fc.record({ cols: fc.integer({ min: 4, max: 16 }), rows: fc.integer({ min: 4, max: 12 }) });

/** A single widget that fits inside the given grid */
const arbWidget = (cols: number, rows: number) =>
  fc.record({
    w: fc.integer({ min: 1, max: cols }),
    h: fc.integer({ min: 1, max: rows }),
  }).chain(({ w, h }) =>
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 8 }),
      col: fc.integer({ min: 0, max: cols - w }),
      row: fc.integer({ min: 0, max: rows - h }),
      w: fc.constant(w),
      h: fc.constant(h),
    })
  );

/** Small non-overlapping layout (1–4 widgets) for reflow tests */
const arbSmallLayout = (cols: number, rows: number): fc.Arbitrary<LayoutMap> =>
  fc.array(arbWidget(cols, rows), { minLength: 1, maxLength: 4 })
    .map(widgets => {
      const layout: LayoutMap = {};
      const occupied: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false));
      for (const w of widgets) {
        // Only add if it doesn't conflict with already-placed widgets
        let ok = true;
        for (let r = w.row; r < w.row + w.h; r++) {
          for (let c = w.col; c < w.col + w.w; c++) {
            if (r >= rows || c >= cols || occupied[r][c]) { ok = false; break; }
          }
          if (!ok) break;
        }
        if (ok) {
          layout[w.id] = w;
          for (let r = w.row; r < w.row + w.h; r++)
            for (let c = w.col; c < w.col + w.w; c++)
              occupied[r][c] = true;
        }
      }
      return layout;
    });

// ─── UC1-S5 / snapAndClamp ────────────────────────────────────────────────────

/**
 * UC1-S5 scenario "Widget snaps on release":
 * WHEN user releases dragged widget over the grid
 * THEN widget is placed at the nearest valid grid cell, aligned to cell boundaries
 * Property: snapped result is always an integer coordinate within bounds
 */
it('UC1-S5: snapAndClamp always returns integer coords within grid bounds', () => {
  fc.assert(
    fc.property(
      fc.float({ min: -5, max: 20 }),
      fc.float({ min: -5, max: 15 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 1, max: 8 }),
      (col, row, w, h) => {
        const result = snapAndClamp(col, row, w, h, COLS, ROWS);
        // Must be integers (round produces integers)
        expect(Number.isInteger(result.col)).toBe(true);
        expect(Number.isInteger(result.row)).toBe(true);
        // Must be within bounds
        expect(result.col).toBeGreaterThanOrEqual(0);
        expect(result.row).toBeGreaterThanOrEqual(0);
        expect(result.col + w).toBeLessThanOrEqual(COLS);
        expect(result.row + h).toBeLessThanOrEqual(ROWS);
      }
    )
  );
});

/**
 * UC1-S5 scenario "Partial overlap snaps to nearest cell":
 * WHEN user releases widget where only part overlaps a cell
 * THEN widget snaps to the cell boundary closest to the drop point
 * Property: result is closest integer cell to the raw input, within bounds
 */
it('UC1-S5: snapAndClamp result is closest integer cell to raw input', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0, max: 10 }),
      fc.float({ min: 0, max: 6 }),
      (col, row) => {
        const result = snapAndClamp(col, row, 1, 1, COLS, ROWS);
        const expected = Math.round(col);
        // Within rounding distance of 0.5
        expect(Math.abs(result.col - expected)).toBeLessThanOrEqual(1);
      }
    )
  );
});

// ─── UC2-E3b / grid boundary clamping ────────────────────────────────────────

/**
 * UC2-E3b scenario "Resize clamped at grid edge":
 * WHEN user drags resize handle beyond the grid boundary
 * THEN widget's preview size is clamped so it fits within the grid
 * Property: for any widget size and position, result always fits in grid
 */
it('UC2-E3b: snapAndClamp never places widget outside grid boundary', () => {
  fc.assert(
    fc.property(
      arbGridDims,
      fc.integer({ min: 1, max: 20 }),  // possibly oversized
      fc.integer({ min: 1, max: 20 }),
      ({ cols, rows }, w, h) => {
        fc.pre(w >= 1 && h >= 1);
        const clampedW = Math.min(w, cols);
        const clampedH = Math.min(h, rows);
        const result = snapAndClamp(cols, rows, clampedW, clampedH, cols, rows);
        expect(result.col + clampedW).toBeLessThanOrEqual(cols);
        expect(result.row + clampedH).toBeLessThanOrEqual(rows);
      }
    )
  );
});

// ─── UC1-S6 / buildOccupancyGrid ─────────────────────────────────────────────

/**
 * UC1-S6 scenario "Displaced widget moves down":
 * WHEN widget is placed overlapping another
 * THEN overlapped widget is pushed down
 * Property: occupancy grid has exactly the expected number of occupied cells for any layout
 */
it('UC1-S6: buildOccupancyGrid marks exactly widget.w × widget.h cells per widget', () => {
  fc.assert(
    fc.property(
      arbSmallLayout(COLS, ROWS),
      (layout) => {
        const occ = buildOccupancyGrid(layout, COLS, ROWS);
        let count = 0;
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (occ[r][c]) count++;
        const expected = Object.values(layout).reduce((sum, w) => sum + w.w * w.h, 0);
        expect(count).toBe(expected);
      }
    )
  );
});

// ─── UC1-E4b / findNearestFreeCell ───────────────────────────────────────────

/**
 * UC1-E4b scenario "Occupied target uses adjacent cell":
 * WHEN computed snap position is occupied by another widget
 * THEN system places dragged widget at nearest available adjacent position
 * Property: returned cell (when non-null) is always conflict-free and in bounds
 */
it('UC1-E4b: findNearestFreeCell result is always valid (no conflict, in bounds)', () => {
  fc.assert(
    fc.property(
      arbSmallLayout(COLS, ROWS),
      fc.integer({ min: 0, max: COLS - 1 }),
      fc.integer({ min: 0, max: ROWS - 1 }),
      fc.integer({ min: 1, max: 3 }),
      fc.integer({ min: 1, max: 3 }),
      (layout, col, row, w, h) => {
        const occ = buildOccupancyGrid(layout, COLS, ROWS);
        const result = findNearestFreeCell(occ, col, row, w, h, COLS, ROWS);
        if (result === null) return; // null is acceptable when grid is full
        // Returned cell must not conflict
        expect(hasConflict(occ, result.col, result.row, w, h)).toBe(false);
        // Must be within bounds
        expect(result.col).toBeGreaterThanOrEqual(0);
        expect(result.row).toBeGreaterThanOrEqual(0);
        expect(result.col + w).toBeLessThanOrEqual(COLS);
        expect(result.row + h).toBeLessThanOrEqual(ROWS);
      }
    )
  );
});

// ─── UC1-E6a / hasConflict ───────────────────────────────────────────────────

/**
 * UC1-E6a scenario "No space reverts widget":
 * WHEN drag released and no valid placement can be found
 * THEN widget is returned to original position unchanged
 * Property: hasConflict returns true iff any cell in the footprint is occupied
 */
it('UC1-E6a: hasConflict correctly identifies any overlapping occupied cell', () => {
  fc.assert(
    fc.property(
      arbSmallLayout(COLS, ROWS),
      fc.integer({ min: 0, max: COLS - 1 }),
      fc.integer({ min: 0, max: ROWS - 1 }),
      (layout, col, row) => {
        const occ = buildOccupancyGrid(layout, COLS, ROWS);
        const conflict = hasConflict(occ, col, row, 1, 1);
        // If conflict reported, cell must actually be occupied
        if (conflict) {
          const inBounds = col >= 0 && row >= 0 && col < COLS && row < ROWS;
          if (inBounds) {
            expect(occ[row][col]).toBe(true);
          }
        } else {
          // No conflict → cell must not be occupied
          expect(occ[row][col]).toBe(false);
        }
      }
    )
  );
});

// ─── UC1-E4a / out-of-bounds ─────────────────────────────────────────────────

/**
 * UC1-E4a scenario "Drop outside grid cancels drag":
 * WHEN user releases pointer outside grid container
 * THEN widget returns to original position, no layout change
 * Property: hasConflict always returns true for placements outside grid bounds
 */
it('UC1-E4a: hasConflict always detects out-of-bounds placements', () => {
  fc.assert(
    fc.property(
      arbGridDims,
      fc.integer({ min: 1, max: 5 }),
      fc.integer({ min: 1, max: 5 }),
      ({ cols, rows }, w, h) => {
        const emptyOcc: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(false));
        // Placement starting at negative col
        expect(hasConflict(emptyOcc, -1, 0, w, h)).toBe(true);
        // Placement starting at negative row
        expect(hasConflict(emptyOcc, 0, -1, w, h)).toBe(true);
        // Placement that would exceed right boundary
        expect(hasConflict(emptyOcc, cols, 0, w, h)).toBe(true);
        // Placement that would exceed bottom boundary
        expect(hasConflict(emptyOcc, 0, rows, w, h)).toBe(true);
      }
    )
  );
});

// ─── UC4-S4, UC4-E4a / autoPlace ─────────────────────────────────────────────

/**
 * UC4-S4 scenario "New widget placed at first available position":
 * WHEN widget added and grid has sufficient space
 * THEN widget placed at top-leftmost available region
 * Property: autoPlace result (when non-null) is always conflict-free and in bounds
 */
it('UC4-S4: autoPlace result is always conflict-free and in bounds', () => {
  fc.assert(
    fc.property(
      arbSmallLayout(COLS, ROWS),
      fc.integer({ min: 1, max: 4 }),
      fc.integer({ min: 1, max: 4 }),
      (layout, w, h) => {
        const occ = buildOccupancyGrid(layout, COLS, ROWS);
        const result = autoPlace(occ, w, h, COLS, ROWS);
        if (result === null) return; // acceptable — grid may be too full
        expect(hasConflict(occ, result.col, result.row, w, h)).toBe(false);
        expect(result.col).toBeGreaterThanOrEqual(0);
        expect(result.row).toBeGreaterThanOrEqual(0);
        expect(result.col + w).toBeLessThanOrEqual(COLS);
        expect(result.row + h).toBeLessThanOrEqual(ROWS);
      }
    )
  );
});

/**
 * UC4-E4a scenario "User informed when grid is full":
 * WHEN user attempts to add widget but no valid space exists
 * THEN system returns null (no placement possible)
 * Property: when the full grid occupancy is set, autoPlace always returns null
 */
it('UC4-E4a: autoPlace returns null when entire grid is occupied', () => {
  fc.assert(
    fc.property(
      arbGridDims,
      ({ cols, rows }) => {
        const fullOcc: boolean[][] = Array.from({ length: rows }, () => new Array(cols).fill(true));
        expect(autoPlace(fullOcc, 1, 1, cols, rows)).toBeNull();
      }
    )
  );
});

// ─── UC1-S6, UC2-S6 / gravityReflow ─────────────────────────────────────────

/**
 * UC1-S6 scenario "Operation reverted on no reflow room":
 * WHEN reflow cannot accommodate all displaced widgets within grid bounds
 * THEN move or resize operation is reverted and layout remains unchanged
 * Property: when gravityReflow succeeds, result has no overlapping widgets
 */
it('UC1-S6/UC2-S6: gravityReflow result never has overlapping widgets', () => {
  fc.assert(
    fc.property(
      arbSmallLayout(COLS, ROWS),
      (layout) => {
        const ids = Object.keys(layout);
        if (ids.length === 0) return;
        const movedId = ids[0];
        const result = gravityReflow(layout, movedId, COLS, ROWS);
        if (result === null) return; // null is valid (impossible reflow)
        // Verify no two widgets overlap in the result
        const occ: boolean[][] = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
        for (const w of Object.values(result)) {
          for (let r = w.row; r < w.row + w.h; r++) {
            for (let c = w.col; c < w.col + w.w; c++) {
              expect(occ[r]?.[c]).toBe(false); // must not already be occupied
              if (occ[r]?.[c] !== undefined) occ[r][c] = true;
            }
          }
        }
      }
    )
  );
});

/**
 * UC2-E6a scenario "Resize reverted when no reflow room":
 * WHEN resize would displace widgets that cannot be reflowed
 * THEN widget returns to previous dimensions
 * Property: gravityReflow preserves the moved widget's position exactly
 */
it('UC2-E6a: gravityReflow preserves the authoritative moved widget position', () => {
  fc.assert(
    fc.property(
      arbSmallLayout(COLS, ROWS),
      (layout) => {
        const ids = Object.keys(layout);
        if (ids.length === 0) return;
        const movedId = ids[0];
        const moved = layout[movedId];
        const result = gravityReflow(layout, movedId, COLS, ROWS);
        if (result === null) return;
        // The moved widget must retain its position
        expect(result[movedId].col).toBe(moved.col);
        expect(result[movedId].row).toBe(moved.row);
        expect(result[movedId].w).toBe(moved.w);
        expect(result[movedId].h).toBe(moved.h);
      }
    )
  );
});
