import { renderHook, act } from '@testing-library/react';
import { useDashboardLayout, loadSettings } from './useDashboardLayout';
import { DEFAULT_LAYOUT } from '../widgets/registry';

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

// Task 10.2 — updated to use new widget type keys (clock, image-viewer, file-viewer, webpage-viewer)

// Initial load from localStorage
test('loads layout from localStorage on mount', () => {
  const stored = { 'w1': { id: 'w1', col: 2, row: 2, w: 2, h: 1 } };
  localStorage.setItem('dashboard-layout', JSON.stringify(stored));
  localStorage.setItem('dashboard-widget-types', JSON.stringify({ 'w1': 'clock' }));
  const { result } = renderHook(() => useDashboardLayout());
  expect(result.current.layout['w1']).toEqual(stored['w1']);
});

// Default layout when nothing stored
test('uses default layout when localStorage is empty', () => {
  const { result } = renderHook(() => useDashboardLayout());
  expect(Object.keys(result.current.layout)).toEqual(Object.keys(DEFAULT_LAYOUT));
});

// Corrupt data falls back to default
test('falls back to default layout on corrupt localStorage data', () => {
  localStorage.setItem('dashboard-layout', 'NOT_JSON{{{{');
  const { result } = renderHook(() => useDashboardLayout());
  expect(Object.keys(result.current.layout)).toEqual(Object.keys(DEFAULT_LAYOUT));
});

// Task 2.3 / UC6-S3, UC6-E3a1 — stale widget IDs are dropped
test('drops stale widget IDs not in registry', () => {
  const stored = {
    'w1': { id: 'w1', col: 0, row: 0, w: 2, h: 1 }, // stale type
  };
  localStorage.setItem('dashboard-layout', JSON.stringify(stored));
  localStorage.setItem('dashboard-widget-types', JSON.stringify({ 'w1': 'non-existent-type' }));
  const { result } = renderHook(() => useDashboardLayout());
  expect(result.current.layout['w1']).toBeUndefined();
});

// Debounced persistence
test('persists layout to localStorage after mutation (debounced)', () => {
  const { result } = renderHook(() => useDashboardLayout());
  act(() => { result.current.moveWidget('default-clock', 5, 5); });
  // Before debounce fires
  expect(JSON.parse(localStorage.getItem('dashboard-layout') ?? '{}')).not.toMatchObject({ 'default-clock': { col: 5, row: 5 } });
  act(() => { jest.advanceTimersByTime(300); });
  expect(JSON.parse(localStorage.getItem('dashboard-layout') ?? '{}')).toMatchObject({ 'default-clock': { col: 5, row: 5 } });
});

// addWidget — auto-places new widget
test('addWidget places widget at first available position', () => {
  const { result } = renderHook(() => useDashboardLayout());
  let success: boolean;
  act(() => { success = result.current.addWidget('clock'); });
  expect(success!).toBe(true);
  const ids = Object.keys(result.current.layout);
  expect(ids.some(id => id.startsWith('clock'))).toBe(true);
});

// removeWidget — widget is removed
test('removeWidget removes widget from layout', () => {
  const { result } = renderHook(() => useDashboardLayout());
  act(() => { result.current.removeWidget('default-clock'); });
  expect(result.current.layout['default-clock']).toBeUndefined();
});

// undoRemove — restores widget
test('undoRemove restores last removed widget', () => {
  const { result } = renderHook(() => useDashboardLayout());
  act(() => { result.current.removeWidget('default-clock'); });
  expect(result.current.layout['default-clock']).toBeUndefined();
  act(() => { result.current.undoRemove(); });
  expect(result.current.layout['default-clock']).toBeDefined();
});

// Undo toast dismisses after 5 seconds
test('undo toast dismisses after 5 seconds', () => {
  const { result } = renderHook(() => useDashboardLayout());
  act(() => { result.current.removeWidget('default-clock'); });
  expect(result.current.showUndoToast).toBe(true);
  act(() => { jest.advanceTimersByTime(5000); });
  expect(result.current.showUndoToast).toBe(false);
});

// Task 7.4 / UC6-E2a1 — loadSettings returns {} when key absent
test('loadSettings returns empty object when localStorage key absent', () => {
  const settings = loadSettings();
  expect(settings).toEqual({});
});

// Task 7.5 / UC6-E2b1 — loadSettings returns {} and logs warning on corrupt JSON
test('loadSettings returns empty object and logs warning on corrupt JSON', () => {
  localStorage.setItem('dashboard-widget-settings', 'INVALID{{JSON');
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const settings = loadSettings();
  expect(settings).toEqual({});
  expect(warnSpy).toHaveBeenCalledWith(
    expect.stringContaining('Failed to load widget settings'),
    expect.anything()
  );
  warnSpy.mockRestore();
});

// Task 7.6 / UC6-E3a1 — stale widget ID in settings is pruned after load
test('prunes settings entries for widget IDs not in layout', () => {
  // Pre-seed settings for a widget that won't be in the default layout
  const staleSettings = { 'stale-widget-id': { type: 'clock' as const } };
  localStorage.setItem('dashboard-widget-settings', JSON.stringify(staleSettings));
  const { result } = renderHook(() => useDashboardLayout());
  expect(result.current.widgetSettings['stale-widget-id']).toBeUndefined();
});

// Task 7.7 / UC5-S5, UC6-S8 — updateWidgetSettings updates state and triggers debounced write
test('updateWidgetSettings updates state and triggers debounced localStorage write', () => {
  const { result } = renderHook(() => useDashboardLayout());
  act(() => {
    result.current.updateWidgetSettings('default-clock', { type: 'clock' });
  });
  // Immediately in state
  expect(result.current.widgetSettings['default-clock']).toEqual({ type: 'clock' });
  // Before debounce fires, localStorage should not have it yet
  expect(localStorage.getItem('dashboard-widget-settings')).toBeNull();
  // After debounce
  act(() => { jest.advanceTimersByTime(300); });
  const stored = JSON.parse(localStorage.getItem('dashboard-widget-settings') ?? '{}');
  expect(stored['default-clock']).toEqual({ type: 'clock' });
});
