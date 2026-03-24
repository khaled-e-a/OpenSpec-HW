import { LayoutMap, WidgetLayout } from '../widgets/types';

// Task 2.1 — pixel to cell conversion
export function pixelToCell(
  pixelX: number,
  pixelY: number,
  cellW: number,
  cellH: number
): { col: number; row: number } {
  return {
    col: Math.floor(pixelX / cellW),
    row: Math.floor(pixelY / cellH),
  };
}

// Task 2.2 — snap and clamp within grid bounds
export function snapAndClamp(
  col: number,
  row: number,
  widgetW: number,
  widgetH: number,
  gridCols: number,
  gridRows: number
): { col: number; row: number } {
  // Guard against NaN / Infinity inputs — treat as 0 (clamp to grid start)
  const safeCol = Number.isFinite(col) ? col : 0;
  const safeRow = Number.isFinite(row) ? row : 0;
  return {
    col: Math.max(0, Math.min(Math.round(safeCol), gridCols - widgetW)),
    row: Math.max(0, Math.min(Math.round(safeRow), gridRows - widgetH)),
  };
}

// Task 2.3 — build occupancy grid (excludes a specific id for self-placement checks)
export function buildOccupancyGrid(
  layout: LayoutMap,
  gridCols: number,
  gridRows: number,
  excludeId?: string
): boolean[][] {
  const grid: boolean[][] = Array.from({ length: gridRows }, () =>
    new Array(gridCols).fill(false)
  );
  for (const widget of Object.values(layout)) {
    if (widget.id === excludeId) continue;
    for (let r = widget.row; r < widget.row + widget.h; r++) {
      for (let c = widget.col; c < widget.col + widget.w; c++) {
        if (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
          grid[r][c] = true;
        }
      }
    }
  }
  return grid;
}

// Task 2.4 — check if a placement conflicts with occupied cells or grid bounds
export function hasConflict(
  occupancy: boolean[][],
  col: number,
  row: number,
  w: number,
  h: number
): boolean {
  const gridRows = occupancy.length;
  const gridCols = occupancy[0]?.length ?? 0;
  if (col < 0 || row < 0 || col + w > gridCols || row + h > gridRows) return true;
  for (let r = row; r < row + h; r++) {
    for (let c = col; c < col + w; c++) {
      if (occupancy[r][c]) return true;
    }
  }
  return false;
}

// Task 2.5 — BFS to find the nearest free cell from target
export function findNearestFreeCell(
  occupancy: boolean[][],
  col: number,
  row: number,
  w: number,
  h: number,
  gridCols: number,
  gridRows: number
): { col: number; row: number } | null {
  // First try exact target
  if (!hasConflict(occupancy, col, row, w, h)) return { col, row };

  const visited = new Set<string>();
  const queue: Array<{ col: number; row: number }> = [{ col, row }];
  visited.add(`${col},${row}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = [
      { col: current.col + 1, row: current.row },
      { col: current.col - 1, row: current.row },
      { col: current.col,     row: current.row + 1 },
      { col: current.col,     row: current.row - 1 },
    ];
    for (const n of neighbors) {
      const key = `${n.col},${n.row}`;
      if (visited.has(key)) continue;
      if (n.col < 0 || n.row < 0 || n.col + w > gridCols || n.row + h > gridRows) continue;
      visited.add(key);
      if (!hasConflict(occupancy, n.col, n.row, w, h)) return { col: n.col, row: n.row };
      queue.push(n);
    }
  }
  return null;
}

// Task 2.6 — first-fit top-left scan for widget auto-placement
export function autoPlace(
  occupancy: boolean[][],
  w: number,
  h: number,
  gridCols: number,
  gridRows: number
): { col: number; row: number } | null {
  for (let r = 0; r <= gridRows - h; r++) {
    for (let c = 0; c <= gridCols - w; c++) {
      if (!hasConflict(occupancy, c, r, w, h)) return { col: c, row: r };
    }
  }
  return null;
}

// Task 2.7 — gravity-down reflow after placing/resizing movedId at its current position
export function gravityReflow(
  layout: LayoutMap,
  movedId: string,
  gridCols: number,
  gridRows: number
): LayoutMap | null {
  const result: LayoutMap = { ...layout };

  // Build occupancy excluding all widgets so we can place them one-by-one
  // Sort: movedId first (its position is authoritative), then others by row then col
  const ids = Object.keys(result).sort((a, b) => {
    if (a === movedId) return -1;
    if (b === movedId) return 1;
    const wa = result[a], wb = result[b];
    return wa.row !== wb.row ? wa.row - wb.row : wa.col - wb.col;
  });

  const occupied: boolean[][] = Array.from({ length: gridRows }, () =>
    new Array(gridCols).fill(false)
  );

  for (const id of ids) {
    const widget = result[id];
    if (id === movedId) {
      // Authoritative position — just stamp it
      if (hasConflict(occupied, widget.col, widget.row, widget.w, widget.h)) return null;
      stampOccupied(occupied, widget);
      continue;
    }
    // Try current position first
    if (!hasConflict(occupied, widget.col, widget.row, widget.w, widget.h)) {
      stampOccupied(occupied, widget);
      continue;
    }
    // Push down to next available row
    let placed = false;
    for (let r = widget.row; r <= gridRows - widget.h; r++) {
      if (!hasConflict(occupied, widget.col, r, widget.w, widget.h)) {
        result[id] = { ...widget, row: r };
        stampOccupied(occupied, result[id]);
        placed = true;
        break;
      }
    }
    if (!placed) return null;
  }
  return result;
}

function stampOccupied(occupied: boolean[][], widget: WidgetLayout): void {
  for (let r = widget.row; r < widget.row + widget.h; r++) {
    for (let c = widget.col; c < widget.col + widget.w; c++) {
      occupied[r][c] = true;
    }
  }
}
