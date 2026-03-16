import { useState, useCallback } from 'react';
import type { DashboardLayout, WidgetLayout } from '../types';
import {
  DEFAULT_LAYOUT,
  LAYOUT_STORAGE_KEY,
  WIDGET_REGISTRY,
} from '../constants';
import { findFirstAvailablePosition } from '../utils/placement';

/**
 * Reads and validates the saved layout from localStorage.
 * UC3-S1: reads saved layout on mount
 * UC3-S2: validates against current widget registry
 * UC3-E1a1: falls back to DEFAULT_LAYOUT when nothing saved
 * UC3-E2a1/UC3-E2a2: discards stale entries
 * UC3-E2b1/UC3-E2b2: warns and falls back on corrupt data
 */
function loadLayout(): DashboardLayout {
  const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);

  // UC3-E1a1: no saved layout
  if (raw === null) {
    return DEFAULT_LAYOUT;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // UC3-E2b1: corrupt / unparseable data
    console.warn(
      '[useDashboardLayout] Saved layout is not valid JSON — falling back to default layout.',
      { raw }
    );
    return DEFAULT_LAYOUT; // UC3-E2b2
  }

  if (!Array.isArray(parsed)) {
    console.warn(
      '[useDashboardLayout] Saved layout is not an array — falling back to default layout.'
    );
    return DEFAULT_LAYOUT;
  }

  const validIds = new Set(WIDGET_REGISTRY.map((w) => w.id));

  // UC3-E2a1: discard stale entries; UC3-E2a2: keep valid ones
  const filtered = (parsed as WidgetLayout[]).filter(
    (entry) => entry && typeof entry.id === 'string' && validIds.has(entry.id)
  );

  // If nothing survived, fall back to default
  return filtered.length > 0 ? filtered : DEFAULT_LAYOUT;
}

/**
 * Persists layout to localStorage.
 * UC1-S8, UC2-S7: persist after every committed change
 */
function saveLayout(layout: DashboardLayout): void {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}

/**
 * Hook that owns the dashboard layout state and exposes
 * a `commitLayout` function for committing drop/resize changes.
 */
export function useDashboardLayout() {
  // UC3-S1–S4: initialise from localStorage on first render
  const [layout, setLayout] = useState<DashboardLayout>(() => loadLayout());

  /**
   * Commits a new layout after a valid drag-drop or resize.
   * UC1-S7/UC1-S8, UC2-S5/UC2-S6/UC2-S7
   */
  const commitLayout = useCallback((newLayout: DashboardLayout) => {
    setLayout(newLayout);
    saveLayout(newLayout); // UC1-S8, UC2-S7
  }, []);

  /**
   * Adds a new widget to the grid at the first available position.
   * Returns true on success, false if no space is found.
   * UC1-S4, UC1-S5, UC1-S7, UC1-E4a2
   */
  const addWidget = useCallback((widgetId: string): boolean => {
    const DEFAULT_W = 4;
    const DEFAULT_H = 2;
    const position = findFirstAvailablePosition(layout, widgetId, DEFAULT_W, DEFAULT_H);
    if (!position) return false;
    const newEntry: WidgetLayout = { id: widgetId, col: position.col, row: position.row, w: DEFAULT_W, h: DEFAULT_H };
    const newLayout = [...layout, newEntry];
    setLayout(newLayout);
    saveLayout(newLayout);
    return true;
  }, [layout]);

  /**
   * Removes a widget from the grid by id.
   * Remaining widgets keep their positions.
   * UC2-S3, UC2-S4, UC2-S5, UC2-E3a1, UC2-E3a2
   */
  const removeWidget = useCallback((widgetId: string): void => {
    const newLayout = layout.filter((entry) => entry.id !== widgetId);
    setLayout(newLayout);
    saveLayout(newLayout);
  }, [layout]);

  return { layout, commitLayout, addWidget, removeWidget };
}
