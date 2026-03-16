import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardLayout } from './useDashboardLayout';
import { DEFAULT_LAYOUT, LAYOUT_STORAGE_KEY, WIDGET_REGISTRY } from '../constants';

// UC3-S1, UC3-S2, UC3-S3, UC3-S4
// UC3-E1a1, UC3-E2a1, UC3-E2a2, UC3-E2b1, UC3-E2b2
// UC1-S8, UC2-S7

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  // Reset localStorage mock
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] ?? null);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
    mockStorage[key] = String(value);
  });
  // Clear any leftover keys
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── UC3-E1a1: Default layout when no saved layout ───────────────────────────
describe('useDashboardLayout — UC3-E1a1: no saved layout', () => {
  it('returns DEFAULT_LAYOUT when localStorage has no entry', () => {
    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
  });
});

// ─── UC3-S1/S2/S3/S4: Restore valid saved layout ─────────────────────────────
describe('useDashboardLayout — UC3-S1/S2/S3/S4: restores saved layout', () => {
  it('reads and returns saved layout from localStorage', () => {
    const saved = [{ id: 'widget-1', col: 2, row: 2, w: 3, h: 3 }];
    mockStorage[LAYOUT_STORAGE_KEY] = JSON.stringify(saved);

    const { result } = renderHook(() => useDashboardLayout());
    expect(result.current.layout).toEqual(saved);
  });

  it('returns only valid widgets from saved layout (UC3-S2)', () => {
    const knownId = WIDGET_REGISTRY[0].id;
    const saved = [
      { id: knownId, col: 0, row: 0, w: 2, h: 2 },
    ];
    mockStorage[LAYOUT_STORAGE_KEY] = JSON.stringify(saved);

    const { result } = renderHook(() => useDashboardLayout());
    const ids = result.current.layout.map((l) => l.id);
    expect(ids).toContain(knownId);
  });
});

// ─── UC3-E2a1/E2a2: Stale widget entries discarded ───────────────────────────
describe('useDashboardLayout — UC3-E2a1/E2a2: stale entries discarded', () => {
  it('discards entries whose id is not in the widget registry', () => {
    const saved = [
      { id: 'widget-1', col: 0, row: 0, w: 4, h: 2 },
      { id: 'obsolete-widget-99', col: 4, row: 0, w: 4, h: 2 }, // stale
    ];
    mockStorage[LAYOUT_STORAGE_KEY] = JSON.stringify(saved);

    const { result } = renderHook(() => useDashboardLayout());
    const ids = result.current.layout.map((l) => l.id);
    expect(ids).not.toContain('obsolete-widget-99');
    expect(ids).toContain('widget-1');
  });

  it('renders remaining widgets at their saved positions after discarding stale ones (UC3-E2a2)', () => {
    const saved = [
      { id: 'widget-1', col: 3, row: 1, w: 2, h: 2 },
      { id: 'gone-widget', col: 0, row: 0, w: 2, h: 2 },
    ];
    mockStorage[LAYOUT_STORAGE_KEY] = JSON.stringify(saved);

    const { result } = renderHook(() => useDashboardLayout());
    const widget1 = result.current.layout.find((l) => l.id === 'widget-1');
    expect(widget1).toEqual({ id: 'widget-1', col: 3, row: 1, w: 2, h: 2 });
  });
});

// ─── UC3-E2b1/E2b2: Corrupt layout data ──────────────────────────────────────
describe('useDashboardLayout — UC3-E2b1/E2b2: corrupt layout data', () => {
  it('warns and falls back to DEFAULT_LAYOUT when JSON is corrupt', () => {
    mockStorage[LAYOUT_STORAGE_KEY] = '{ not valid json %%%';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useDashboardLayout());

    expect(warnSpy).toHaveBeenCalled(); // UC3-E2b1
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT); // UC3-E2b2
  });

  it('falls back to DEFAULT_LAYOUT when saved data is not an array', () => {
    mockStorage[LAYOUT_STORAGE_KEY] = JSON.stringify({ wrong: 'shape' });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useDashboardLayout());

    expect(warnSpy).toHaveBeenCalled();
    expect(result.current.layout).toEqual(DEFAULT_LAYOUT);
  });
});

// ─── UC1-S8 / UC2-S7: commitLayout persists to localStorage ──────────────────
describe('useDashboardLayout — UC1-S8/UC2-S7: commitLayout persists layout', () => {
  it('writes the new layout to localStorage after a commit', () => {
    const { result } = renderHook(() => useDashboardLayout());

    const newLayout = [{ id: 'widget-1', col: 5, row: 3, w: 2, h: 2 }];

    act(() => {
      result.current.commitLayout(newLayout);
    });

    expect(mockStorage[LAYOUT_STORAGE_KEY]).toBe(JSON.stringify(newLayout));
  });

  it('updates the in-memory layout state after a commit', () => {
    const { result } = renderHook(() => useDashboardLayout());

    const newLayout = [{ id: 'widget-1', col: 1, row: 1, w: 3, h: 3 }];

    act(() => {
      result.current.commitLayout(newLayout);
    });

    expect(result.current.layout).toEqual(newLayout);
  });

  it('does NOT write to localStorage when no commit is called (UC1-E6a2)', () => {
    renderHook(() => useDashboardLayout());
    // No commitLayout call — setItem should only have been called if a previous layout exists
    // Since storage starts empty, no setItem on initial load
    const setItemCalls = (Storage.prototype.setItem as ReturnType<typeof vi.fn>).mock.calls;
    expect(setItemCalls.length).toBe(0);
  });
});

describe('addWidget', () => {
  it('adds a widget at the first available position and saves to localStorage', () => {
    // mockStorage is cleared in beforeEach — start fresh
    const { result } = renderHook(() => useDashboardLayout());
    // Remove widget-1 first so we can add it back
    act(() => { result.current.removeWidget('widget-1'); });
    act(() => { const ok = result.current.addWidget('widget-1'); expect(ok).toBe(true); });
    expect(result.current.layout.some((l) => l.id === 'widget-1')).toBe(true);
    const saved = JSON.parse(mockStorage[LAYOUT_STORAGE_KEY]);
    expect(saved.some((l: { id: string }) => l.id === 'widget-1')).toBe(true);
  });

  it('returns false and does not mutate layout when grid is full', () => {
    // Pre-fill mockStorage with a layout that has no space
    const fullLayout = [{ id: 'widget-1', col: 0, row: 0, w: 12, h: 20 }];
    mockStorage[LAYOUT_STORAGE_KEY] = JSON.stringify(fullLayout);
    const { result } = renderHook(() => useDashboardLayout());
    let ok: boolean = true;
    act(() => { ok = result.current.addWidget('widget-2'); });
    expect(ok).toBe(false);
    expect(result.current.layout).toEqual(fullLayout);
  });
});

describe('removeWidget', () => {
  it('removes the specified widget and persists the result', () => {
    // mockStorage is cleared in beforeEach
    const { result } = renderHook(() => useDashboardLayout());
    const initialCount = result.current.layout.length;
    act(() => { result.current.removeWidget('widget-1'); });
    expect(result.current.layout.length).toBe(initialCount - 1);
    expect(result.current.layout.some((l) => l.id === 'widget-1')).toBe(false);
    const saved = JSON.parse(mockStorage[LAYOUT_STORAGE_KEY]);
    expect(saved.some((l: { id: string }) => l.id === 'widget-1')).toBe(false);
  });

  it('preserves other widgets positions after removal', () => {
    // mockStorage is cleared in beforeEach
    const { result } = renderHook(() => useDashboardLayout());
    const before = result.current.layout.filter((l) => l.id !== 'widget-1');
    act(() => { result.current.removeWidget('widget-1'); });
    const after = result.current.layout;
    before.forEach((entry) => {
      const match = after.find((l) => l.id === entry.id);
      expect(match).toEqual(entry);
    });
  });

  it('saves empty array when last widget is removed', () => {
    const singleLayout = [{ id: 'widget-1', col: 0, row: 0, w: 4, h: 2 }];
    mockStorage[LAYOUT_STORAGE_KEY] = JSON.stringify(singleLayout);
    const { result } = renderHook(() => useDashboardLayout());
    act(() => { result.current.removeWidget('widget-1'); });
    expect(result.current.layout).toEqual([]);
    const saved = JSON.parse(mockStorage[LAYOUT_STORAGE_KEY]);
    expect(saved).toEqual([]);
  });
});
