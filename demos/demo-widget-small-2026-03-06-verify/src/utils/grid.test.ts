import { describe, it, expect } from 'vitest'
import { pointerToCell, clampPosition, hasCollision } from './grid'
import type { WidgetLayout } from '../types'

// UC2-S2, UC1-S6
describe('pointerToCell', () => {
  it('maps pointer at origin to cell (0,0)', () => {
    expect(pointerToCell(0, 0, 100, 100, 10)).toEqual({ col: 0, row: 0 })
  })

  it('maps pointer inside first cell to (0,0)', () => {
    expect(pointerToCell(99, 99, 100, 100, 10)).toEqual({ col: 0, row: 0 })
  })

  it('maps pointer into second column', () => {
    // cellWidth=100, gap=10 → second cell starts at x=110
    expect(pointerToCell(110, 0, 100, 100, 10)).toEqual({ col: 1, row: 0 })
  })

  it('maps pointer into second row', () => {
    expect(pointerToCell(0, 110, 100, 100, 10)).toEqual({ col: 0, row: 1 })
  })

  it('maps pointer to correct cell in a 3-column grid', () => {
    // col 2 starts at 220
    expect(pointerToCell(250, 55, 100, 100, 10)).toEqual({ col: 2, row: 0 })
  })
})

// UC2-E2a
describe('clampPosition', () => {
  it('returns position unchanged when within bounds', () => {
    expect(clampPosition(1, 1, 2, 2, 6, 6)).toEqual({ col: 1, row: 1 })
  })

  it('clamps col to 0 when negative', () => {
    expect(clampPosition(-1, 0, 2, 1, 6, 6)).toEqual({ col: 0, row: 0 })
  })

  it('clamps row to 0 when negative', () => {
    expect(clampPosition(0, -2, 1, 2, 6, 6)).toEqual({ col: 0, row: 0 })
  })

  it('clamps col so widget does not exceed right boundary', () => {
    // colSpan=3, totalCols=6 → max col = 3
    expect(clampPosition(5, 0, 3, 1, 6, 6)).toEqual({ col: 3, row: 0 })
  })

  it('clamps row so widget does not exceed bottom boundary', () => {
    // rowSpan=2, totalRows=4 → max row = 2
    expect(clampPosition(0, 5, 1, 2, 6, 4)).toEqual({ col: 0, row: 2 })
  })

  it('handles single-cell widget at max position', () => {
    expect(clampPosition(5, 5, 1, 1, 6, 6)).toEqual({ col: 5, row: 5 })
  })
})

// UC1-E4a, UC1-E5b
describe('hasCollision', () => {
  const layout: WidgetLayout[] = [
    { id: 'a', col: 0, row: 0, colSpan: 2, rowSpan: 2 },
    { id: 'b', col: 3, row: 3, colSpan: 1, rowSpan: 1 },
  ]

  it('returns false when no other widgets in layout', () => {
    expect(hasCollision([{ id: 'a', col: 0, row: 0, colSpan: 1, rowSpan: 1 }], 'a', 2, 2, 1, 1)).toBe(false)
  })

  it('returns false when widget placed in empty area', () => {
    expect(hasCollision(layout, 'moving', 4, 0, 1, 1)).toBe(false)
  })

  it('returns true when widget overlaps widget-a', () => {
    expect(hasCollision(layout, 'moving', 1, 1, 1, 1)).toBe(true)
  })

  it('returns true when widget overlaps widget-b', () => {
    expect(hasCollision(layout, 'moving', 3, 3, 1, 1)).toBe(true)
  })

  it('excludes self from collision check', () => {
    // Moving widget-a to (4, 0) — only other widget is b at (3,3), no overlap
    expect(hasCollision(layout, 'a', 4, 0, 2, 2)).toBe(false)
  })

  it('returns true for partial overlap', () => {
    // widget-a occupies cols 0-1, rows 0-1. Place at col 1, row 1 → overlap
    expect(hasCollision(layout, 'moving', 1, 1, 2, 2)).toBe(true)
  })
})
