import { detectOverlap, capResizeAtBoundary } from '../utils/collision';
import type { LayoutItem } from '../types';

const a: LayoutItem = { id: 'a', x: 0, y: 0, w: 2, h: 2 };
const b: LayoutItem = { id: 'b', x: 3, y: 0, w: 2, h: 2 };
const c: LayoutItem = { id: 'c', x: 1, y: 1, w: 2, h: 2 }; // overlaps a

describe('detectOverlap', () => {
  it('returns false when candidate does not overlap any item', () => {
    expect(detectOverlap({ id: 'x', x: 5, y: 5, w: 1, h: 1 }, [a, b], 'x')).toBe(false);
  });

  it('returns true when candidate overlaps another item', () => {
    expect(detectOverlap({ id: 'x', x: 1, y: 1, w: 2, h: 2 }, [a, b], 'x')).toBe(true);
  });

  it('excludes the item with excludeId from overlap check (self-exclusion)', () => {
    // a overlaps itself at its own position — should return false when excluded
    expect(detectOverlap(a, [a, b], 'a')).toBe(false);
  });

  it('detects exact adjacency as non-overlapping', () => {
    // b starts at x=3, a ends at x=2 — they are adjacent, not overlapping
    expect(detectOverlap(a, [b], 'x')).toBe(false);
  });

  it('detects partial overlap', () => {
    expect(detectOverlap(c, [a], 'c')).toBe(true);
  });
});

describe('capResizeAtBoundary', () => {
  it('returns original size when no overlap', () => {
    const candidate: LayoutItem = { id: 'x', x: 5, y: 0, w: 2, h: 2 };
    expect(capResizeAtBoundary(candidate, [a, b], 'x')).toEqual({ w: 2, h: 2 });
  });

  it('caps width when resize would overlap adjacent widget', () => {
    // candidate at x=1 with w=4 would overlap b at x=3
    const candidate: LayoutItem = { id: 'x', x: 1, y: 0, w: 4, h: 2 };
    const result = capResizeAtBoundary(candidate, [b], 'x');
    expect(result.w).toBeLessThan(4);
    expect(detectOverlap({ ...candidate, ...result }, [b], 'x')).toBe(false);
  });

  it('ensures minimum size of 1x1', () => {
    // Everything overlaps — should still return at least w=1, h=1
    const blocker: LayoutItem = { id: 'bl', x: 0, y: 0, w: 10, h: 10 };
    const candidate: LayoutItem = { id: 'x', x: 0, y: 0, w: 3, h: 3 };
    const result = capResizeAtBoundary(candidate, [blocker], 'x');
    expect(result.w).toBeGreaterThanOrEqual(1);
    expect(result.h).toBeGreaterThanOrEqual(1);
  });
});
