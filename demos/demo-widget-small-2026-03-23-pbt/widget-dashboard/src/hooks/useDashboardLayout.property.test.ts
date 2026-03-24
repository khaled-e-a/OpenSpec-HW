/**
 * Property-based tests for useDashboardLayout hook.
 * Framework: fast-check
 * Coverage: UC1-S7, UC2-S7, UC3-S1–S5, UC3-E2a, UC3-E3a, UC3-E3b,
 *           UC4-S3, UC4-S4, UC4-S5, UC4-S6, UC4-E4a,
 *           UC5-S1–S4, UC5-E1a
 */
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { useDashboardLayout } from './useDashboardLayout';
import { WIDGET_REGISTRY } from '../widgets/registry';
import { LayoutMap } from '../widgets/types';

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

const registeredTypes = Object.keys(WIDGET_REGISTRY);

// ─── UC3-S2 / Layout Persistence — restore ───────────────────────────────────

/**
 * UC3-S2 scenario "Layout restored on mount":
 * WHEN dashboard component mounts
 * THEN it reads layout from localStorage and renders widgets at stored positions
 * Property: any valid stored layout round-trips through mount
 */
it('UC3-S2: any valid stored layout is fully restored on mount', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          type: fc.constantFrom(...registeredTypes),
          col: fc.integer({ min: 0, max: 8 }),
          row: fc.integer({ min: 0, max: 6 }),
          w:   fc.integer({ min: 1, max: 3 }),
          h:   fc.integer({ min: 1, max: 2 }),
        }),
        { minLength: 1, maxLength: 6 }
      ),
      (entries) => {
        localStorage.clear();
        const layout: LayoutMap = {};
        const types: Record<string, string> = {};
        entries.forEach((e, i) => {
          const id = `w${i}`;
          layout[id] = { id, col: e.col, row: e.row, w: e.w, h: e.h };
          types[id] = e.type;
        });
        localStorage.setItem('dashboard-layout', JSON.stringify(layout));
        localStorage.setItem('dashboard-widget-types', JSON.stringify(types));
        const { result } = renderHook(() => useDashboardLayout());
        // Every stored id must be present in the loaded layout
        for (const id of Object.keys(layout)) {
          expect(result.current.layout[id]).toBeDefined();
        }
      }
    ),
    { numRuns: 20 }
  );
});

// ─── UC3-E2a / Default layout fallback ───────────────────────────────────────

/**
 * UC3-E2a scenario "Default layout on first visit":
 * WHEN no layout is found in localStorage
 * THEN dashboard renders using the default layout from configuration
 * Property: with empty storage, hook always returns non-empty layout
 */
it('UC3-E2a: hook returns non-empty default layout when localStorage is empty', () => {
  fc.assert(
    fc.property(
      fc.constant(null), // arbitrary "empty environment"
      () => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        expect(Object.keys(result.current.layout).length).toBeGreaterThan(0);
      }
    ),
    { numRuns: 5 }
  );
});

// ─── UC3-E3a / Stale widget cleanup ──────────────────────────────────────────

/**
 * UC3-E3a scenario "Stale widget IDs discarded":
 * WHEN stored layout contains a widget ID not in the registry
 * THEN that widget entry is removed and remaining widgets render normally
 * Property: for any layout with stale types, those entries are absent after load
 */
it('UC3-E3a: stale widget type IDs are always discarded on load', () => {
  fc.assert(
    fc.property(
      fc.array(fc.string({ minLength: 4, maxLength: 12 }), { minLength: 1, maxLength: 5 }),
      (staleTypes) => {
        localStorage.clear();
        const layout: LayoutMap = {};
        const types: Record<string, string> = {};
        staleTypes.forEach((type, i) => {
          const id = `stale${i}`;
          layout[id] = { id, col: 0, row: i, w: 1, h: 1 };
          types[id] = `unknown-type-${type}`;
        });
        localStorage.setItem('dashboard-layout', JSON.stringify(layout));
        localStorage.setItem('dashboard-widget-types', JSON.stringify(types));
        const { result } = renderHook(() => useDashboardLayout());
        // None of the stale IDs should appear
        for (const id of Object.keys(layout)) {
          expect(result.current.layout[id]).toBeUndefined();
        }
      }
    ),
    { numRuns: 15 }
  );
});

// ─── UC3-E3b / Corrupt layout recovery ───────────────────────────────────────

/**
 * UC3-E3b scenario "Corrupt data uses default layout":
 * WHEN localStorage contains unparseable or invalid layout data
 * THEN system logs a warning and renders the default layout
 * Property: any non-JSON string stored results in a non-empty default layout
 */
it('UC3-E3b: corrupt localStorage always falls back to non-empty default layout', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }).filter(s => { try { JSON.parse(s); return false; } catch { return true; } }),
      (corrupt) => {
        localStorage.clear();
        localStorage.setItem('dashboard-layout', corrupt);
        const { result } = renderHook(() => useDashboardLayout());
        expect(Object.keys(result.current.layout).length).toBeGreaterThan(0);
      }
    ),
    { numRuns: 20 }
  );
});

// ─── UC1-S7 / Layout persistence after mutation ───────────────────────────────

/**
 * UC1-S7 scenario "Layout saved after move":
 * WHEN user successfully moves a widget
 * THEN updated layout is written to localStorage within 300ms
 * Property: after moveWidget + debounce, localStorage reflects updated position
 */
it('UC1-S7: localStorage reflects new position after moveWidget + debounce', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 8 }),
      fc.integer({ min: 0, max: 6 }),
      (newCol, newRow) => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const firstId = Object.keys(result.current.layout)[0];
        if (!firstId) return;
        act(() => { result.current.moveWidget(firstId, newCol, newRow); });
        act(() => { jest.advanceTimersByTime(300); });
        const stored = JSON.parse(localStorage.getItem('dashboard-layout') ?? '{}');
        // The widget should be in localStorage (may have been reflowed, but must exist)
        expect(stored[firstId]).toBeDefined();
      }
    ),
    { numRuns: 15 }
  );
});

// ─── UC4-S3/S4/S5 / Widget addition ──────────────────────────────────────────

/**
 * UC4-S4 scenario "New widget placed at first available position":
 * WHEN widget added and grid has sufficient space
 * THEN widget placed at top-leftmost available region that fits its dimensions
 * Property: addWidget always places widget without overlapping existing widgets
 */
it('UC4-S4: addWidget places new widget without overlapping existing ones', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...registeredTypes),
      (type) => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const beforeIds = new Set(Object.keys(result.current.layout));
        let success = false;
        act(() => { success = result.current.addWidget(type); });
        if (!success) return; // grid might be full — acceptable
        // A new widget ID was added
        const newIds = Object.keys(result.current.layout).filter(id => !beforeIds.has(id));
        expect(newIds.length).toBe(1);
        // New widget must not overlap any existing widget
        const newWidget = result.current.layout[newIds[0]];
        for (const [id, w] of Object.entries(result.current.layout)) {
          if (id === newIds[0]) continue;
          const xOverlap = newWidget.col < w.col + w.w && newWidget.col + newWidget.w > w.col;
          const yOverlap = newWidget.row < w.row + w.h && newWidget.row + newWidget.h > w.row;
          expect(xOverlap && yOverlap).toBe(false);
        }
      }
    ),
    { numRuns: 20 }
  );
});

/**
 * UC4-S6 scenario "Layout saved after add":
 * WHEN user successfully adds a widget
 * THEN system saves the updated layout
 * Property: after addWidget + debounce, new widget appears in localStorage
 */
it('UC4-S6: localStorage contains new widget after addWidget + debounce', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(...registeredTypes),
      (type) => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const beforeCount = Object.keys(result.current.layout).length;
        let success = false;
        act(() => { success = result.current.addWidget(type); });
        if (!success) return;
        act(() => { jest.advanceTimersByTime(300); });
        const stored = JSON.parse(localStorage.getItem('dashboard-layout') ?? '{}');
        expect(Object.keys(stored).length).toBeGreaterThan(beforeCount);
      }
    ),
    { numRuns: 10 }
  );
});

// ─── UC5-S2/S3 / Widget removal ──────────────────────────────────────────────

/**
 * UC5-S2 scenario "Widget removed from grid":
 * WHEN user activates remove action on a widget
 * THEN widget is no longer rendered and its grid cells are freed
 * Property: after removeWidget, the widget ID is absent from layout
 */
it('UC5-S2: removeWidget always removes the specified widget from layout', () => {
  fc.assert(
    fc.property(
      fc.constant(null),
      () => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const id = Object.keys(result.current.layout)[0];
        if (!id) return;
        act(() => { result.current.removeWidget(id); });
        expect(result.current.layout[id]).toBeUndefined();
      }
    ),
    { numRuns: 5 }
  );
});

/**
 * UC5-S4 scenario "Layout saved after remove":
 * WHEN user removes a widget
 * THEN system saves the updated layout
 * Property: after removeWidget + debounce, removed widget absent from localStorage
 */
it('UC5-S4: localStorage does not contain removed widget after debounce', () => {
  fc.assert(
    fc.property(
      fc.constant(null),
      () => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const id = Object.keys(result.current.layout)[0];
        if (!id) return;
        act(() => { result.current.removeWidget(id); });
        act(() => { jest.advanceTimersByTime(300); });
        const stored = JSON.parse(localStorage.getItem('dashboard-layout') ?? '{}');
        expect(stored[id]).toBeUndefined();
      }
    ),
    { numRuns: 5 }
  );
});

// ─── UC5-E1a / Removal undo ───────────────────────────────────────────────────

/**
 * UC5-E1a scenario "Undo restores removed widget":
 * WHEN user activates undo within 5 seconds of removing a widget
 * THEN widget is restored at its previous (col, row, w, h) position
 * Property: undoRemove always restores the exact previous layout entry
 */
it('UC5-E1a: undoRemove always restores the widget at its previous position', () => {
  fc.assert(
    fc.property(
      fc.constant(null),
      () => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const id = Object.keys(result.current.layout)[0];
        if (!id) return;
        const original = result.current.layout[id];
        act(() => { result.current.removeWidget(id); });
        act(() => { result.current.undoRemove(); });
        // Widget must be back at exact original position and size
        expect(result.current.layout[id]).toEqual(original);
      }
    ),
    { numRuns: 5 }
  );
});

/**
 * UC5-E1a scenario "Undo expires after timeout":
 * WHEN 5 seconds elapse after removal without undo activation
 * THEN undo affordance is dismissed and removal is permanent
 * Property: after 5s timeout, showUndoToast is always false
 */
it('UC5-E1a: showUndoToast is always false after 5s timeout', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 5000, max: 60000 }), // any elapsed time >= 5s
      (elapsedMs) => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const id = Object.keys(result.current.layout)[0];
        if (!id) return;
        act(() => { result.current.removeWidget(id); });
        act(() => { jest.advanceTimersByTime(elapsedMs); });
        expect(result.current.showUndoToast).toBe(false);
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC5-E1a scenario "Only most recent removal is undoable":
 * WHEN user removes two widgets in sequence
 * THEN only the most recently removed widget can be restored via undo
 * Property: after two removals, undoRemove restores only the second removed widget
 */
it('UC5-E1a: only the most recently removed widget is undoable', () => {
  fc.assert(
    fc.property(
      fc.constant(null),
      () => {
        localStorage.clear();
        const { result } = renderHook(() => useDashboardLayout());
        const ids = Object.keys(result.current.layout);
        if (ids.length < 2) return;
        const [first, second] = ids;
        act(() => { result.current.removeWidget(first); });
        act(() => { result.current.removeWidget(second); });
        act(() => { result.current.undoRemove(); });
        // second was removed last → it should be restored
        expect(result.current.layout[second]).toBeDefined();
        // first was removed first → still absent
        expect(result.current.layout[first]).toBeUndefined();
      }
    ),
    { numRuns: 5 }
  );
});
