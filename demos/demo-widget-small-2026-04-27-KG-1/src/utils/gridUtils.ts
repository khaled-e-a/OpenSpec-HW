import type { DashboardLayout } from '@/types/layout'

const COLS = 12
const MAX_ROWS = 50 // effectively unlimited

interface Size { w: number; h: number }
interface Pos  { x: number; y: number }

/** Build an occupancy grid: occupied[y][x] = true if that cell is taken. */
function buildOccupancy(layout: DashboardLayout): boolean[][] {
  const grid: boolean[][] = Array.from({ length: MAX_ROWS }, () => new Array(COLS).fill(false))
  for (const w of layout.widgets) {
    for (let row = w.y; row < w.y + w.h; row++) {
      for (let col = w.x; col < w.x + w.w; col++) {
        if (row < MAX_ROWS && col < COLS) {
          grid[row][col] = true
        }
      }
    }
  }
  return grid
}

/**
 * Find the first free (x, y) position that can fit a widget of the given size.
 * Scans row-by-row, left-to-right (top-left first).
 */
export function findFirstFreeCell(layout: DashboardLayout, size: Size): Pos {
  const grid = buildOccupancy(layout)
  for (let row = 0; row < MAX_ROWS - size.h + 1; row++) {
    for (let col = 0; col <= COLS - size.w; col++) {
      // Check if the (w × h) block starting at (col, row) is fully free
      let fits = true
      outer: for (let dr = 0; dr < size.h; dr++) {
        for (let dc = 0; dc < size.w; dc++) {
          if (grid[row + dr]?.[col + dc]) {
            fits = false
            break outer
          }
        }
      }
      if (fits) return { x: col, y: row }
    }
  }
  // Fallback: append below all existing widgets
  const maxY = layout.widgets.reduce((m, w) => Math.max(m, w.y + w.h), 0)
  return { x: 0, y: maxY }
}

/**
 * Returns true if there is no free cell block on the grid
 * that can fit a widget of the given size.
 * We cap the check at MAX_ROWS to avoid infinite loops.
 */
export function isGridFull(layout: DashboardLayout, size: Size): boolean {
  const grid = buildOccupancy(layout)
  for (let row = 0; row < MAX_ROWS - size.h + 1; row++) {
    for (let col = 0; col <= COLS - size.w; col++) {
      let fits = true
      outer: for (let dr = 0; dr < size.h; dr++) {
        for (let dc = 0; dc < size.w; dc++) {
          if (grid[row + dr]?.[col + dc]) {
            fits = false
            break outer
          }
        }
      }
      if (fits) return false
    }
  }
  return true
}
