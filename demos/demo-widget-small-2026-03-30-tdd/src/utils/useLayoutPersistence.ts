// useLayoutPersistence.ts
// UC2-S1: Read layout from localStorage on mount
// UC2-S2: Validate stored layout (IDs, positions)
// UC2-S3/S4: Provide validated layout for rendering
// UC2-E1a: Fall back to defaultLayout when nothing stored
// UC2-E2a: Discard stale widget IDs
// UC2-E2b: Replace out-of-bounds positions with defaults
// UC1-S8: saveLayout writes layout to localStorage

import { useState, useEffect, useCallback } from 'react';
import type { WidgetLayout, WidgetDefinition } from './widgetTypes';

function isOutOfBounds(entry: WidgetLayout, gridCols: number, gridRows: number): boolean {
  return (
    entry.col < 0 ||
    entry.row < 0 ||
    entry.col + entry.w > gridCols ||
    entry.row + entry.h > gridRows
  );
}

function validateLayout(
  stored: WidgetLayout[],
  widgetDefs: WidgetDefinition[],
  gridCols: number,
  gridRows: number
): { layout: WidgetLayout[]; modified: boolean } {
  const defMap = new Map(widgetDefs.map((d) => [d.id, d]));
  let modified = false;
  const result: WidgetLayout[] = [];

  for (const entry of stored) {
    const def = defMap.get(entry.widgetId);

    // UC2-E2a: unknown widget ID — discard
    if (!def) {
      modified = true;
      continue;
    }

    // UC2-E2b: out-of-bounds — replace with default position
    if (isOutOfBounds(entry, gridCols, gridRows)) {
      modified = true;
      result.push({ ...entry, col: def.defaultCol, row: def.defaultRow });
      continue;
    }

    result.push(entry);
  }

  return { layout: result, modified };
}

function readFromStorage(storageKey: string): WidgetLayout[] | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw) as WidgetLayout[];
  } catch {
    return null;
  }
}

function writeToStorage(storageKey: string, layout: WidgetLayout[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch (err) {
    console.warn('[useLayoutPersistence] Failed to write layout to localStorage:', err);
  }
}

export function useLayoutPersistence(
  storageKey: string,
  defaultLayout: WidgetLayout[],
  widgetDefs: WidgetDefinition[],
  gridCols: number,
  gridRows: number
): {
  layout: WidgetLayout[];
  saveLayout: (layout: WidgetLayout[]) => void;
} {
  const [layout, setLayout] = useState<WidgetLayout[]>(() => {
    // UC2-S1: read on mount
    const stored = readFromStorage(storageKey);

    // UC2-E1a: no stored layout — use default
    if (!stored) return defaultLayout;

    // UC2-S2: validate
    const { layout: validated, modified } = validateLayout(stored, widgetDefs, gridCols, gridRows);

    // UC2-E2a/E2b: save cleaned layout back if modified
    if (modified) {
      writeToStorage(storageKey, validated);
    }

    return validated;
  });

  // UC1-S8: saveLayout — update state + persist
  const saveLayout = useCallback(
    (newLayout: WidgetLayout[]) => {
      setLayout(newLayout);
      writeToStorage(storageKey, newLayout);
    },
    [storageKey]
  );

  return { layout, saveLayout };
}
