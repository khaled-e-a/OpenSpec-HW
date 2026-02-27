import { buildOccupancyMap } from '../hooks/useGridLayout';
import type { GridLayout } from '../components/dashboard/types';

// ─── buildOccupancyMap ───────────────────────────────────────────────────────

describe('buildOccupancyMap', () => {
  const layout: GridLayout = [
    { id: 'a', col: 1, row: 1, colSpan: 1, rowSpan: 1 },
    { id: 'b', col: 2, row: 1, colSpan: 2, rowSpan: 2 },
  ];

  it('marks all cells for a 1x1 widget', () => {
    const map = buildOccupancyMap([layout[0]]);
    expect(map.has('1,1')).toBe(true);
    expect(map.size).toBe(1);
  });

  it('marks all cells for a 2x2 widget', () => {
    const map = buildOccupancyMap([layout[1]]);
    expect(map.has('2,1')).toBe(true);
    expect(map.has('3,1')).toBe(true);
    expect(map.has('2,2')).toBe(true);
    expect(map.has('3,2')).toBe(true);
    expect(map.size).toBe(4);
  });

  it('combines cells from multiple widgets', () => {
    const map = buildOccupancyMap(layout);
    expect(map.size).toBe(5);
  });

  it('excludes a widget by id', () => {
    const map = buildOccupancyMap(layout, 'b');
    expect(map.has('2,1')).toBe(false);
    expect(map.has('1,1')).toBe(true);
    expect(map.size).toBe(1);
  });

  it('returns empty set for empty layout', () => {
    expect(buildOccupancyMap([]).size).toBe(0);
  });
});

// ─── isOccupied (via hook) ───────────────────────────────────────────────────

import { renderHook } from '@testing-library/react';
import { useGridLayout } from '../hooks/useGridLayout';

describe('isOccupied', () => {
  const layout: GridLayout = [
    { id: 'a', col: 1, row: 1, colSpan: 2, rowSpan: 2 },
    { id: 'b', col: 4, row: 4, colSpan: 1, rowSpan: 1 },
  ];

  function setup() {
    return renderHook(() =>
      useGridLayout({ initialLayout: layout, columns: 6, rows: 6 })
    );
  }

  it('returns true when a cell is occupied', () => {
    const { result } = setup();
    expect(result.current.isOccupied(1, 1, 1, 1)).toBe(true);
    expect(result.current.isOccupied(2, 2, 1, 1)).toBe(true);
  });

  it('returns false when a cell is empty', () => {
    const { result } = setup();
    expect(result.current.isOccupied(3, 3, 1, 1)).toBe(false);
  });

  it('excludes the widget itself when excludeId is provided', () => {
    const { result } = setup();
    // Widget 'a' occupies (1,1)-(2,2). Excluding 'a' means that region is free.
    expect(result.current.isOccupied(1, 1, 2, 2, 'a')).toBe(false);
  });

  it('returns true if multi-cell drop partially overlaps another widget', () => {
    const { result } = setup();
    // Trying to place a 2x1 at col=2,row=2 would overlap widget 'a' at (2,2).
    expect(result.current.isOccupied(2, 2, 2, 1)).toBe(true);
  });
});
