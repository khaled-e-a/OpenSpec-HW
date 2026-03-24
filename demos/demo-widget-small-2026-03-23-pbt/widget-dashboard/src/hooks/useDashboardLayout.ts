import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutMap, WidgetLayout, WidgetSettings } from '../widgets/types';
import {
  DEFAULT_LAYOUT,
  DEFAULT_TYPE_MAP,
  WIDGET_REGISTRY,
  WidgetTypeMap,
} from '../widgets/registry';
import {
  buildOccupancyGrid,
  autoPlace,
  gravityReflow,
} from '../utils/gridUtils';

const STORAGE_KEY = 'dashboard-layout';
const STORAGE_TYPE_KEY = 'dashboard-widget-types';
const STORAGE_SETTINGS_KEY = 'dashboard-widget-settings';
const GRID_COLS = 12;
const GRID_ROWS = 8;
const DEBOUNCE_MS = 300;

export interface DashboardLayoutState {
  layout: LayoutMap;
  widgetTypes: WidgetTypeMap;
  widgetSettings: Record<string, WidgetSettings>;
  moveWidget: (id: string, col: number, row: number) => void;
  resizeWidget: (id: string, w: number, h: number) => void;
  addWidget: (type: string) => boolean;
  removeWidget: (id: string) => void;
  undoRemove: () => void;
  updateWidgetSettings: (id: string, settings: WidgetSettings) => void;
  lastRemovedRef: React.MutableRefObject<{ layout: WidgetLayout; type: string } | null>;
  showUndoToast: boolean;
}

function loadLayout(): { layout: LayoutMap; widgetTypes: WidgetTypeMap } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const rawTypes = localStorage.getItem(STORAGE_TYPE_KEY);

    if (!raw) return { layout: { ...DEFAULT_LAYOUT }, widgetTypes: { ...DEFAULT_TYPE_MAP } };

    const parsed = JSON.parse(raw) as LayoutMap;
    const parsedTypes = rawTypes ? (JSON.parse(rawTypes) as WidgetTypeMap) : { ...DEFAULT_TYPE_MAP };

    // Task 2.3 / UC6-S3, UC6-E3a1 — drop stale widget IDs not in registry
    const validTypes: WidgetTypeMap = {};
    const validLayout: LayoutMap = {};
    for (const [id, entry] of Object.entries(parsed)) {
      const type = parsedTypes[id];
      if (type && WIDGET_REGISTRY[type]) {
        validLayout[id] = entry;
        validTypes[id] = type;
      }
    }
    return { layout: validLayout, widgetTypes: validTypes };
  } catch (e) {
    console.warn('[DashboardGrid] Failed to load layout from localStorage. Using default.', e);
    return { layout: { ...DEFAULT_LAYOUT }, widgetTypes: { ...DEFAULT_TYPE_MAP } };
  }
}

// Task 2.2 — load widget settings from localStorage (UC6-S2, UC6-E2a1, UC6-E2b1)
export function loadSettings(): Record<string, WidgetSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, WidgetSettings>;
  } catch (e) {
    console.warn('[DashboardGrid] Failed to load widget settings from localStorage.', e);
    return {};
  }
}

export function useDashboardLayout(): DashboardLayoutState {
  const [layout, setLayout] = useState<LayoutMap>(() => loadLayout().layout);
  const [widgetTypes, setWidgetTypes] = useState<WidgetTypeMap>(() => loadLayout().widgetTypes);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Task 2.1 — widget settings state (UC6-S2, UC6-S3)
  const [widgetSettings, setWidgetSettings] = useState<Record<string, WidgetSettings>>(() => {
    const raw = loadSettings();
    // Task 2.3 — prune settings for widget IDs no longer in layout
    const initialLayout = loadLayout().layout;
    const pruned: Record<string, WidgetSettings> = {};
    for (const [id, s] of Object.entries(raw)) {
      if (initialLayout[id]) pruned[id] = s;
    }
    return pruned;
  });

  const lastRemovedRef = useRef<{ layout: WidgetLayout; type: string } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced persist for layout + types
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
        localStorage.setItem(STORAGE_TYPE_KEY, JSON.stringify(widgetTypes));
      } catch (e) {
        console.warn('[DashboardGrid] Could not persist layout.', e);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [layout, widgetTypes]);

  // Task 2.5 — debounced persist for widget settings (UC6-S1, UC6-S8)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(widgetSettings));
      } catch (e) {
        console.warn('[DashboardGrid] Could not persist widget settings.', e);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [widgetSettings]);

  const clearUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    lastRemovedRef.current = null;
    setShowUndoToast(false);
  }, []);

  const moveWidget = useCallback((id: string, col: number, row: number) => {
    setLayout(prev => {
      const widget = prev[id];
      if (!widget) return prev;
      const updated = { ...prev, [id]: { ...widget, col, row } };
      const reflowed = gravityReflow(updated, id, GRID_COLS, GRID_ROWS);
      return reflowed ?? prev;
    });
    clearUndo();
  }, [clearUndo]);

  const resizeWidget = useCallback((id: string, w: number, h: number) => {
    setLayout(prev => {
      const widget = prev[id];
      if (!widget) return prev;
      const updated = { ...prev, [id]: { ...widget, w, h } };
      const reflowed = gravityReflow(updated, id, GRID_COLS, GRID_ROWS);
      return reflowed ?? prev;
    });
    clearUndo();
  }, [clearUndo]);

  const addWidget = useCallback((type: string): boolean => {
    const def = WIDGET_REGISTRY[type];
    if (!def) return false;
    let placed = false;
    setLayout(prev => {
      const occupancy = buildOccupancyGrid(prev, GRID_COLS, GRID_ROWS);
      const pos = autoPlace(occupancy, def.defaultSize.w, def.defaultSize.h, GRID_COLS, GRID_ROWS);
      if (!pos) return prev;
      const id = `${type}-${Date.now()}`;
      placed = true;
      setWidgetTypes(t => ({ ...t, [id]: type }));
      return { ...prev, [id]: { id, col: pos.col, row: pos.row, w: def.defaultSize.w, h: def.defaultSize.h } };
    });
    clearUndo();
    return placed;
  }, [clearUndo]);

  const removeWidget = useCallback((id: string) => {
    setLayout(prev => {
      const widget = prev[id];
      if (!widget) return prev;
      lastRemovedRef.current = { layout: widget, type: widgetTypes[id] ?? '' };
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setWidgetTypes(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Also remove settings for the removed widget
    setWidgetSettings(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setShowUndoToast(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      lastRemovedRef.current = null;
      setShowUndoToast(false);
    }, 5000);
  }, [widgetTypes]);

  const undoRemove = useCallback(() => {
    const entry = lastRemovedRef.current;
    if (!entry) return;
    setLayout(prev => ({ ...prev, [entry.layout.id]: entry.layout }));
    setWidgetTypes(prev => ({ ...prev, [entry.layout.id]: entry.type }));
    clearUndo();
  }, [clearUndo]);

  // Task 2.4 — update widget settings (UC5-S5, UC2-S7, UC3-S8, UC4-S7)
  const updateWidgetSettings = useCallback((id: string, settings: WidgetSettings) => {
    setWidgetSettings(prev => ({ ...prev, [id]: settings }));
  }, []);

  // Task 2.6 — expose widgetSettings and updateWidgetSettings
  return {
    layout,
    widgetTypes,
    widgetSettings,
    moveWidget,
    resizeWidget,
    addWidget,
    removeWidget,
    undoRemove,
    updateWidgetSettings,
    lastRemovedRef,
    showUndoToast,
  };
}
