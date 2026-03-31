// UC1-S5, UC1-S6, UC2-S5, UC2-S6, UC1-E5a, UC2-E5a, UC2-E4a, UC3-S6
import { describe, it, expect } from 'vitest'
import {
  pixelToCell,
  clampToGrid,
  detectCollision,
  isValidDrop,
} from './grid-utils'
import type { WidgetLayout } from './types'

// ── pixelToCell ────────────────────────────────────────────────────────────────
describe('pixelToCell', () => {
  it('converts pointer at origin to cell (0, 0)', () => {
    expect(pixelToCell(0, 0, 100)).toEqual({ x: 0, y: 0 })
  })

  it('converts pointer inside first cell to (0, 0)', () => {
    expect(pixelToCell(50, 75, 100)).toEqual({ x: 0, y: 0 })
  })

  it('converts pointer at exact cell boundary to next cell', () => {
    expect(pixelToCell(100, 100, 100)).toEqual({ x: 1, y: 1 })
  })

  it('converts pointer far into grid correctly', () => {
    expect(pixelToCell(350, 200, 100)).toEqual({ x: 3, y: 2 })
  })

  it('works with different cell sizes', () => {
    expect(pixelToCell(160, 80, 80)).toEqual({ x: 2, y: 1 })
  })
})

// ── clampToGrid ────────────────────────────────────────────────────────────────
describe('clampToGrid', () => {
  it('returns position unchanged when fully inside bounds', () => {
    expect(clampToGrid(1, 1, 2, 2, 6, 6)).toEqual({ x: 1, y: 1 })
  })

  it('clamps x to 0 when negative', () => {
    expect(clampToGrid(-1, 0, 1, 1, 6, 6)).toEqual({ x: 0, y: 0 })
  })

  it('clamps y to 0 when negative', () => {
    expect(clampToGrid(0, -2, 1, 1, 6, 6)).toEqual({ x: 0, y: 0 })
  })

  it('clamps x so widget does not overflow right edge', () => {
    // w=2, colCount=6 → max x = 4
    expect(clampToGrid(5, 0, 2, 1, 6, 6)).toEqual({ x: 4, y: 0 })
  })

  it('clamps y so widget does not overflow bottom edge', () => {
    // h=3, rowCount=6 → max y = 3
    expect(clampToGrid(0, 5, 1, 3, 6, 6)).toEqual({ x: 0, y: 3 })
  })
})

// ── detectCollision ────────────────────────────────────────────────────────────
describe('detectCollision', () => {
  const existing: WidgetLayout[] = [
    { id: 'a', x: 2, y: 2, w: 2, h: 2 }, // occupies cols 2-3, rows 2-3
  ]

  it('returns false when candidate does not overlap', () => {
    const candidate: WidgetLayout = { id: 'b', x: 0, y: 0, w: 1, h: 1 }
    expect(detectCollision(candidate, existing)).toBe(false)
  })

  it('returns true on full overlap', () => {
    const candidate: WidgetLayout = { id: 'b', x: 2, y: 2, w: 2, h: 2 }
    expect(detectCollision(candidate, existing)).toBe(true)
  })

  it('returns true on partial overlap (top-left corner)', () => {
    const candidate: WidgetLayout = { id: 'b', x: 1, y: 1, w: 2, h: 2 }
    expect(detectCollision(candidate, existing)).toBe(true)
  })

  it('returns true on partial overlap (right edge only)', () => {
    const candidate: WidgetLayout = { id: 'b', x: 3, y: 2, w: 2, h: 2 }
    expect(detectCollision(candidate, existing)).toBe(true)
  })

  it('returns false when touching at exact edge (no overlap)', () => {
    // candidate ends at x=2, existing starts at x=2 — touching, not overlapping
    const candidate: WidgetLayout = { id: 'b', x: 0, y: 0, w: 2, h: 2 }
    // candidate covers cols 0-1, rows 0-1; existing covers cols 2-3, rows 2-3 → no overlap
    expect(detectCollision(candidate, existing)).toBe(false)
  })

  it('excludes the widget with the given id from collision check (self-move)', () => {
    const candidate: WidgetLayout = { id: 'a', x: 2, y: 2, w: 2, h: 2 }
    expect(detectCollision(candidate, existing, 'a')).toBe(false)
  })

  it('handles empty layout (no existing widgets)', () => {
    const candidate: WidgetLayout = { id: 'b', x: 0, y: 0, w: 3, h: 3 }
    expect(detectCollision(candidate, [])).toBe(false)
  })
})

// ── isValidDrop ────────────────────────────────────────────────────────────────
describe('isValidDrop', () => {
  const layout: WidgetLayout[] = [
    { id: 'a', x: 3, y: 0, w: 2, h: 2 },
  ]
  const colCount = 6
  const rowCount = 6

  it('returns true for a valid unoccupied in-bounds position', () => {
    const candidate: WidgetLayout = { id: 'b', x: 0, y: 0, w: 2, h: 2 }
    expect(isValidDrop(candidate, layout, colCount, rowCount)).toBe(true)
  })

  it('returns false when candidate collides with existing widget', () => {
    const candidate: WidgetLayout = { id: 'b', x: 3, y: 0, w: 1, h: 1 }
    expect(isValidDrop(candidate, layout, colCount, rowCount)).toBe(false)
  })

  it('returns false when candidate goes out of bounds right', () => {
    const candidate: WidgetLayout = { id: 'b', x: 5, y: 0, w: 2, h: 1 }
    expect(isValidDrop(candidate, layout, colCount, rowCount)).toBe(false)
  })

  it('returns false when candidate goes out of bounds bottom', () => {
    const candidate: WidgetLayout = { id: 'b', x: 0, y: 5, w: 1, h: 2 }
    expect(isValidDrop(candidate, layout, colCount, rowCount)).toBe(false)
  })

  it('returns false when x is negative', () => {
    const candidate: WidgetLayout = { id: 'b', x: -1, y: 0, w: 1, h: 1 }
    expect(isValidDrop(candidate, layout, colCount, rowCount)).toBe(false)
  })

  it('allows self-move by excluding own id from collision check', () => {
    // widget 'a' moving to same spot — valid (no collision with itself)
    const candidate: WidgetLayout = { id: 'a', x: 3, y: 0, w: 2, h: 2 }
    expect(isValidDrop(candidate, layout, colCount, rowCount, 'a')).toBe(true)
  })
})
