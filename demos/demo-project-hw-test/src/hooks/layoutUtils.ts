import type { WidgetLayout } from '../types/layout'

/** Returns true if candidate rect overlaps any item in layout (ignoring excludeId). */
export function hasCollision(
  layout: WidgetLayout[],
  candidate: { x: number; y: number; w: number; h: number },
  excludeId?: string,
): boolean {
  return layout.some((item) => {
    if (item.id === excludeId) return false
    return (
      candidate.x < item.x + item.w &&
      candidate.x + candidate.w > item.x &&
      candidate.y < item.y + item.h &&
      candidate.y + candidate.h > item.y
    )
  })
}

/**
 * Finds the first unoccupied top-left cell that fits {w, h} scanning
 * left-to-right, top-to-bottom. Appends new rows if no gap found.
 */
export function findFirstAvailable(
  layout: WidgetLayout[],
  w: number,
  h: number,
  columns: number,
): { x: number; y: number } {
  if (layout.length === 0) return { x: 0, y: 0 }

  const maxY = Math.max(...layout.map((item) => item.y + item.h))

  for (let row = 0; row <= maxY; row++) {
    for (let col = 0; col <= columns - w; col++) {
      const candidate = { x: col, y: row, w, h }
      if (!hasCollision(layout, candidate)) {
        return { x: col, y: row }
      }
    }
  }

  // No gap found — append after last row
  return { x: 0, y: maxY }
}
