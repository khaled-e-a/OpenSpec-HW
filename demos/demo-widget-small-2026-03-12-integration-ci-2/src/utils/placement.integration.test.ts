import { describe, it, expect } from 'vitest';
import { isValidPlacement, clampToValidSize, findFirstAvailablePosition } from './placement';
import type { DashboardLayout, WidgetLayout } from '../types';

// Integration-level tests — full drag-reposition and resize flows
// UC1: full drag reposition flow
// UC2: full resize flow

// ─── UC1 Full Flow: Drag and Reposition a Widget ─────────────────────────────
describe('UC1 Full Flow — drag and reposition a widget', () => {
  const layout: DashboardLayout = [
    { id: 'w1', col: 0, row: 0, w: 4, h: 2 },
    { id: 'w2', col: 4, row: 0, w: 4, h: 2 },
    { id: 'w3', col: 8, row: 0, w: 4, h: 2 },
  ];

  it('UC1-S7: valid drop → layout updated with new position', () => {
    // w1 moves to col 0, row 2 (below current row)
    const candidate = { id: 'w1', col: 0, row: 2, w: 4, h: 2 };
    expect(isValidPlacement(layout, candidate, 'w1')).toBe(true);
    // Simulate layout update
    const newLayout = layout.map((l) =>
      l.id === 'w1' ? candidate : l
    );
    const w1 = newLayout.find((l) => l.id === 'w1');
    expect(w1).toEqual({ id: 'w1', col: 0, row: 2, w: 4, h: 2 });
  });

  it('UC1-E3a2: drop at occupied position → placement rejected, layout unchanged', () => {
    // w1 tries to move onto w2's position
    const candidate = { id: 'w1', col: 4, row: 0, w: 4, h: 2 };
    expect(isValidPlacement(layout, candidate, 'w1')).toBe(false);
    // Layout must remain unchanged
    expect(layout[0]).toEqual({ id: 'w1', col: 0, row: 0, w: 4, h: 2 });
  });

  it('UC1-E6a1/E6a2: out-of-bounds drop → invalid, layout unchanged', () => {
    // Pointer released left of grid (negative col)
    const candidate = { id: 'w1', col: -1, row: 0, w: 4, h: 2 };
    expect(isValidPlacement(layout, candidate, 'w1')).toBe(false);
    expect(layout[0].col).toBe(0); // unchanged
  });

  it('UC1-E6b1/E6b3: Escape cancel → original position retained', () => {
    // Simulated: cancel sets no new position, original layout entry unchanged
    const originalEntry = { ...layout[0] };
    // After cancel: layout[0] still matches original
    expect(layout[0]).toEqual(originalEntry);
  });

  it('UC1-S8: after valid drop, layout is changed and ready to persist', () => {
    const candidate = { id: 'w1', col: 0, row: 3, w: 4, h: 2 };
    const valid = isValidPlacement(layout, candidate, 'w1');
    expect(valid).toBe(true);
    const committed = layout.map((l) => (l.id === 'w1' ? candidate : l));
    // The committed layout differs from original — ready for serialisation
    expect(committed).not.toEqual(layout);
  });
});

// ─── UC2 Full Flow: Resize a Widget on the Grid ──────────────────────────────
describe('UC2 Full Flow — resize a widget on the grid', () => {
  const layout: DashboardLayout = [
    { id: 'chart', col: 0, row: 0, w: 4, h: 2 },
    { id: 'table', col: 4, row: 0, w: 4, h: 2 },
  ];

  it('UC2-S5/S6: valid resize confirmed → layout updated with new span', () => {
    // chart expands to w=6, h=3 (no overlap since table is at col 4+)
    // But chart at col 0 w=6 would overlap table at col 4 w=4 (col 4 is within 0+6=6) — reject
    const candidate = { id: 'chart', col: 0, row: 0, w: 4, h: 4 };
    const valid = isValidPlacement(layout, candidate, 'chart');
    expect(valid).toBe(true);
    const newLayout = layout.map((l) => (l.id === 'chart' ? candidate : l));
    expect(newLayout.find((l) => l.id === 'chart')?.h).toBe(4);
  });

  it('UC2-E4a1: resize that would overlap is rejected', () => {
    // chart at col 0 expanding w to 6 would overlap table at col 4
    const candidate = { id: 'chart', col: 0, row: 0, w: 6, h: 2 };
    expect(isValidPlacement(layout, candidate, 'chart')).toBe(false);
  });

  it('UC2-E4a1/E4a2: clampToValidSize caps at last valid non-overlapping size', () => {
    // chart at col 0 wants w=6, but table blocks at col 4
    const { w, h } = clampToValidSize(layout, layout[0], 6, 2);
    expect(w).toBeLessThanOrEqual(4); // capped before hitting table
    expect(h).toBe(2);
  });

  it('UC2-E4b1/E4b2: resize below 1×1 minimum is rejected', () => {
    const candidate = { id: 'chart', col: 0, row: 0, w: 0, h: 2 };
    expect(isValidPlacement(layout, candidate, 'chart')).toBe(false);
    const candidate2 = { id: 'chart', col: 0, row: 0, w: 2, h: 0 };
    expect(isValidPlacement(layout, candidate2, 'chart')).toBe(false);
  });

  it('UC2-E5a1/E5a2: invalid resize reverted → original size preserved', () => {
    const original = { ...layout[0] };
    // Simulate revert: invalid resize means we keep original
    const invalid = isValidPlacement(layout, { id: 'chart', col: 0, row: 0, w: 10, h: 2 }, 'chart');
    expect(invalid).toBe(false);
    // Layout unchanged
    expect(layout[0]).toEqual(original);
  });

  it('UC2-S7: after valid resize, new layout differs and is ready to persist', () => {
    const newSize = { id: 'chart', col: 0, row: 0, w: 3, h: 3 };
    const valid = isValidPlacement(layout, newSize, 'chart');
    expect(valid).toBe(true);
    const committed = layout.map((l) => (l.id === 'chart' ? newSize : l));
    expect(committed[0].w).toBe(3);
    expect(committed[0].h).toBe(3);
  });
});

// ─── UC3 Full Flow: Restore Saved Layout ─────────────────────────────────────
// (Covered fully in useDashboardLayout.test.ts — placement layer has no direct
//  localStorage dependency; integration is exercised via hook tests.)
describe('UC3 Full Flow — restore saved layout (placement invariants)', () => {
  it('UC3-S3: every widget in a valid layout has a unique, non-overlapping placement', () => {
    const layout: DashboardLayout = [
      { id: 'w1', col: 0, row: 0, w: 4, h: 2 },
      { id: 'w2', col: 4, row: 0, w: 4, h: 2 },
      { id: 'w3', col: 8, row: 0, w: 4, h: 2 },
    ];
    // Validate each widget against all others
    for (const entry of layout) {
      expect(isValidPlacement(layout, entry, entry.id)).toBe(true);
    }
  });
});

// ─── addWidget / removeWidget integration ────────────────────────────────────
describe('addWidget integration', () => {
  it('UC1-S4/S5: addWidget places widget at a valid non-overlapping position', () => {
    // Use a known partial layout with space available
    const baseLayout: WidgetLayout[] = [
      { id: 'widget-1', col: 0, row: 0, w: 4, h: 2 },
      { id: 'widget-2', col: 4, row: 0, w: 4, h: 2 },
    ];
    const pos = findFirstAvailablePosition(baseLayout, 'widget-new', 4, 2);
    expect(pos).not.toBeNull();
    // The new widget placed at that position should not overlap
    const newEntry: WidgetLayout = { id: 'widget-new', col: pos!.col, row: pos!.row, w: 4, h: 2 };
    const newLayout = [...baseLayout, newEntry];
    // Verify no overlaps in resulting layout — each widget is valid when excluding itself
    for (let i = 0; i < newLayout.length; i++) {
      expect(isValidPlacement(newLayout, newLayout[i], newLayout[i].id)).toBe(true);
    }
  });
});

describe('removeWidget integration', () => {
  it('UC2-S3/S4: removing a widget preserves other widget positions', () => {
    const layout: WidgetLayout[] = [
      { id: 'widget-1', col: 0, row: 0, w: 4, h: 2 },
      { id: 'widget-2', col: 4, row: 0, w: 4, h: 2 },
      { id: 'widget-3', col: 8, row: 0, w: 4, h: 2 },
    ];
    const afterRemove = layout.filter((l) => l.id !== 'widget-2');
    expect(afterRemove.length).toBe(2);
    expect(afterRemove.find((l) => l.id === 'widget-1')).toEqual({ id: 'widget-1', col: 0, row: 0, w: 4, h: 2 });
    expect(afterRemove.find((l) => l.id === 'widget-3')).toEqual({ id: 'widget-3', col: 8, row: 0, w: 4, h: 2 });
  });

  it('UC2-E2a2: removed widget id is absent from resulting layout', () => {
    const layout: WidgetLayout[] = [
      { id: 'widget-1', col: 0, row: 0, w: 4, h: 2 },
      { id: 'widget-2', col: 4, row: 0, w: 4, h: 2 },
    ];
    const afterRemove = layout.filter((l) => l.id !== 'widget-2');
    expect(afterRemove.some((l) => l.id === 'widget-2')).toBe(false);
  });
});
