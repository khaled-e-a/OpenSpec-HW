/**
 * PBT Regression: UC1-S5 — snapAndClamp NaN input
 *
 * Counterexample discovered by fast-check: [Number.NaN, 0]
 * snapAndClamp(NaN, 0, 1, 1, 12, 8) previously returned NaN for col,
 * failing the invariant Math.abs(result.col - Math.round(NaN)) <= 1.
 *
 * Fix: treat NaN inputs as 0 (clamp to grid start).
 */
import { snapAndClamp } from './gridUtils';

it('pbt-regression-uc1-s5-1: snapAndClamp with NaN col returns valid integer within bounds', () => {
  const result = snapAndClamp(Number.NaN, 0, 1, 1, 12, 8);
  expect(Number.isInteger(result.col)).toBe(true);
  expect(Number.isInteger(result.row)).toBe(true);
  expect(result.col).toBeGreaterThanOrEqual(0);
  expect(result.row).toBeGreaterThanOrEqual(0);
  expect(result.col + 1).toBeLessThanOrEqual(12);
  expect(result.row + 1).toBeLessThanOrEqual(8);
});

it('pbt-regression-uc1-s5-1b: snapAndClamp with NaN row returns valid integer within bounds', () => {
  const result = snapAndClamp(5, Number.NaN, 2, 2, 12, 8);
  expect(Number.isInteger(result.col)).toBe(true);
  expect(Number.isInteger(result.row)).toBe(true);
  expect(result.col).toBeGreaterThanOrEqual(0);
  expect(result.row).toBeGreaterThanOrEqual(0);
  expect(result.col + 2).toBeLessThanOrEqual(12);
  expect(result.row + 2).toBeLessThanOrEqual(8);
});
