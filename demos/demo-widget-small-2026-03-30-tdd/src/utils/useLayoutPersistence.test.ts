import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutPersistence } from './useLayoutPersistence';
import type { WidgetLayout, WidgetDefinition } from './widgetTypes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'test-layout-v1';

const WIDGET_DEFS: WidgetDefinition[] = [
  { id: 'clock', w: 1, h: 1, defaultCol: 0, defaultRow: 0 },
  { id: 'calendar', w: 2, h: 1, defaultCol: 0, defaultRow: 1 },
];

const DEFAULT_LAYOUT: WidgetLayout[] = [
  { widgetId: 'clock', col: 0, row: 0, w: 1, h: 1 },
  { widgetId: 'calendar', col: 0, row: 1, w: 2, h: 1 },
];

function renderPersistence(overrides?: {
  storageKey?: string;
  defaultLayout?: WidgetLayout[];
  widgetDefs?: WidgetDefinition[];
  gridCols?: number;
  gridRows?: number;
}) {
  return renderHook(() =>
    useLayoutPersistence(
      overrides?.storageKey ?? STORAGE_KEY,
      overrides?.defaultLayout ?? DEFAULT_LAYOUT,
      overrides?.widgetDefs ?? WIDGET_DEFS,
      overrides?.gridCols ?? 6,
      overrides?.gridRows ?? 4
    )
  );
}

// ---------------------------------------------------------------------------
// UC2-S1, UC2-E1a: Read from localStorage on mount
// ---------------------------------------------------------------------------
describe('useLayoutPersistence – initial load', () => {
  beforeEach(() => localStorage.clear());

  it('UC2-E1a: uses defaultLayout when no stored layout exists', () => {
    const { result } = renderPersistence();
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
  });

  it('UC2-S1: loads stored layout from localStorage when present', () => {
    const stored: WidgetLayout[] = [
      { widgetId: 'clock', col: 2, row: 0, w: 1, h: 1 },
      { widgetId: 'calendar', col: 0, row: 2, w: 2, h: 1 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderPersistence();
    expect(result.current.layout).toEqual(stored);
  });

  it('UC2-S1: falls back to defaultLayout when stored JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{ INVALID JSON }}}');
    const { result } = renderPersistence();
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
  });
});

// ---------------------------------------------------------------------------
// UC2-S2, UC2-E2a: Validation — stale widget IDs discarded
// ---------------------------------------------------------------------------
describe('useLayoutPersistence – validation: stale IDs', () => {
  beforeEach(() => localStorage.clear());

  it('UC2-E2a: discards entries for widget IDs not in widgetDefs', () => {
    const stored: WidgetLayout[] = [
      { widgetId: 'clock', col: 1, row: 0, w: 1, h: 1 },
      { widgetId: 'DELETED_WIDGET', col: 3, row: 0, w: 1, h: 1 }, // stale
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderPersistence();

    const ids = result.current.layout.map((l) => l.widgetId);
    expect(ids).not.toContain('DELETED_WIDGET');
    expect(ids).toContain('clock');
  });

  it('UC2-E2a: saves the cleaned layout back to localStorage after removing stale IDs', () => {
    const stored: WidgetLayout[] = [
      { widgetId: 'clock', col: 0, row: 0, w: 1, h: 1 },
      { widgetId: 'GONE', col: 2, row: 0, w: 1, h: 1 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    renderPersistence();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.map((l: WidgetLayout) => l.widgetId)).not.toContain('GONE');
  });
});

// ---------------------------------------------------------------------------
// UC2-S2, UC2-E2b: Validation — out-of-bounds positions replaced with defaults
// ---------------------------------------------------------------------------
describe('useLayoutPersistence – validation: out-of-bounds positions', () => {
  beforeEach(() => localStorage.clear());

  it('UC2-E2b: replaces out-of-bounds position with default for that widget', () => {
    const stored: WidgetLayout[] = [
      { widgetId: 'clock', col: 99, row: 99, w: 1, h: 1 }, // out of bounds
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    // Grid is 6×4, so col=99 is out of bounds
    const { result } = renderPersistence({ gridCols: 6, gridRows: 4 });

    const clockEntry = result.current.layout.find((l) => l.widgetId === 'clock');
    expect(clockEntry?.col).toBe(0); // defaultCol from WIDGET_DEFS
    expect(clockEntry?.row).toBe(0); // defaultRow from WIDGET_DEFS
  });

  it('UC2-E2b: saves layout back after out-of-bounds correction', () => {
    const stored: WidgetLayout[] = [
      { widgetId: 'clock', col: 99, row: 99, w: 1, h: 1 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    renderPersistence({ gridCols: 6, gridRows: 4 });

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const clockEntry = saved.find((l: WidgetLayout) => l.widgetId === 'clock');
    expect(clockEntry.col).toBe(0);
    expect(clockEntry.row).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// UC1-S8: saveLayout writes layout to localStorage
// ---------------------------------------------------------------------------
describe('useLayoutPersistence – saveLayout', () => {
  beforeEach(() => localStorage.clear());

  it('UC1-S8: saveLayout persists the given layout to localStorage', () => {
    const { result } = renderPersistence();

    const newLayout: WidgetLayout[] = [
      { widgetId: 'clock', col: 3, row: 2, w: 1, h: 1 },
    ];

    act(() => {
      result.current.saveLayout(newLayout);
    });

    expect(result.current.layout).toEqual(newLayout);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual(newLayout);
  });

  it('UC1-S8: saveLayout does not throw when localStorage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const { result } = renderPersistence();
    expect(() =>
      act(() => result.current.saveLayout(DEFAULT_LAYOUT))
    ).not.toThrow();

    spy.mockRestore();
  });
});
