// gridGeometry.ts — pure grid geometry and layout utilities
// UC1-S4, UC1-S6, UC2-E3a, UC2-E3b

// ---------------------------------------------------------------------------
// Widget type system (widget-types change)
// UC1-S2, UC2-S1, UC3-S1, UC4-S1, UC5-S5
// ---------------------------------------------------------------------------

export type WidgetType = 'clock' | 'image' | 'file' | 'webpage';

/** Runtime-accessible list of all valid widget types. */
export const WIDGET_TYPES: WidgetType[] = ['clock', 'image', 'file', 'webpage'];

export interface WidgetConfig {
  /** blob: object URL for image widget (UC2-S5) */
  imageUrl?: string;
  /** Text content for file widget (UC3-S5) */
  fileText?: string;
  /** Display name for file widget header (UC3-S6) */
  fileName?: string;
  /** URL for webpage widget iframe (UC4-S6) */
  webpageUrl?: string;
}

export interface WidgetLayout {
  id: string;
  x: number; // grid column (0-indexed)
  y: number; // grid row (0-indexed)
  w: number; // column span
  h: number; // row span
  /** Content type — defaults to 'clock' when absent (UC1-S2) */
  type?: WidgetType;
  /** Per-type configuration payload (UC5-S5) */
  config?: WidgetConfig;
}

interface SnapConstraints {
  w?: number;
  h?: number;
  cols?: number;
  rows?: number;
}

/**
 * UC1-S4: Convert a pointer offset (relative to grid origin) to the nearest
 * snapped grid cell, clamped within grid bounds.
 */
export function snapToCell(
  pointerX: number,
  pointerY: number,
  cellSize: number,
  constraints: SnapConstraints = {}
): { col: number; row: number } {
  const { w = 1, h = 1, cols = Infinity, rows = Infinity } = constraints;

  const rawCol = Math.round(pointerX / cellSize);
  const rawRow = Math.round(pointerY / cellSize);

  const col = Math.max(0, Math.min(rawCol, cols - w));
  const row = Math.max(0, Math.min(rawRow, rows - h));

  return { col, row };
}

/** Iterate every (col, row) cell covered by a widget, calling cb for each. */
function forEachCell(widget: WidgetLayout, cb: (c: number, r: number) => void): void {
  for (let c = widget.x; c < widget.x + widget.w; c++) {
    for (let r = widget.y; r < widget.y + widget.h; r++) {
      cb(c, r);
    }
  }
}

/**
 * Build a Set of "col,row" strings representing all occupied cells.
 * Optionally excludes one widget by id (used when validating a drag).
 */
export function buildOccupancySet(
  layout: WidgetLayout[],
  excludeId?: string
): Set<string> {
  const set = new Set<string>();
  for (const widget of layout) {
    if (widget.id === excludeId) continue;
    forEachCell(widget, (c, r) => set.add(`${c},${r}`));
  }
  return set;
}

/**
 * UC1-S6: Returns true only if the candidate widget placement is fully
 * within grid bounds and does not overlap any existing widget (excluding itself).
 */
export function isValidPlacement(
  layout: WidgetLayout[],
  candidate: WidgetLayout,
  gridCols: number,
  gridRows: number
): boolean {
  // Bounds check
  if (candidate.x < 0 || candidate.y < 0) return false;
  if (candidate.x + candidate.w > gridCols) return false;
  if (candidate.y + candidate.h > gridRows) return false;

  // Collision check (exclude the widget being moved)
  const occupied = buildOccupancySet(layout, candidate.id);
  for (let c = candidate.x; c < candidate.x + candidate.w; c++) {
    for (let r = candidate.y; r < candidate.y + candidate.h; r++) {
      if (occupied.has(`${c},${r}`)) return false;
    }
  }
  return true;
}

/**
 * UC2-E3a / UC2-E3b: Resolve an initial layout array by:
 * 1. Clamping any widget that extends outside grid bounds.
 * 2. Moving any widget that overlaps a previously-placed widget to the
 *    nearest free top-left position (scanning left→right, top→bottom).
 *
 * The first widget in the array always wins on conflict.
 */
export function resolveLayout(
  layout: WidgetLayout[],
  gridCols: number,
  gridRows: number
): WidgetLayout[] {
  const resolved: WidgetLayout[] = [];
  const occupied = new Set<string>();

  for (const widget of layout) {
    // Step 1: clamp to grid bounds
    const clampedX = Math.min(widget.x, gridCols - widget.w);
    const clampedY = Math.min(widget.y, gridRows - widget.h);
    let x = Math.max(0, clampedX);
    let y = Math.max(0, clampedY);

    // Step 2: check for overlap at clamped position; if so, find nearest free spot
    if (!fitsAt(x, y, widget.w, widget.h, occupied, gridCols, gridRows)) {
      const found = findFreePosition(widget.w, widget.h, occupied, gridCols, gridRows);
      if (found) {
        x = found.x;
        y = found.y;
      }
      // If no free position exists (grid full), keep clamped position anyway
    }

    // Mark cells as occupied
    forEachCell({ ...widget, x, y }, (c, r) => occupied.add(`${c},${r}`));

    resolved.push({ ...widget, x, y });
  }

  return resolved;
}

function fitsAt(
  x: number,
  y: number,
  w: number,
  h: number,
  occupied: Set<string>,
  gridCols: number,
  gridRows: number
): boolean {
  if (x + w > gridCols || y + h > gridRows) return false;
  for (let c = x; c < x + w; c++) {
    for (let r = y; r < y + h; r++) {
      if (occupied.has(`${c},${r}`)) return false;
    }
  }
  return true;
}

function findFreePosition(
  w: number,
  h: number,
  occupied: Set<string>,
  gridCols: number,
  gridRows: number
): { x: number; y: number } | null {
  for (let r = 0; r <= gridRows - h; r++) {
    for (let c = 0; c <= gridCols - w; c++) {
      if (fitsAt(c, r, w, h, occupied, gridCols, gridRows)) {
        return { x: c, y: r };
      }
    }
  }
  return null;
}
