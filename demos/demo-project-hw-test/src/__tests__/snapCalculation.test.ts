import { describe, it, expect } from 'vitest'
import { snapToGrid } from '../hooks/useDragWidget'

const rect = { left: 0, top: 0, width: 1200, right: 1200, bottom: 800, height: 800 } as DOMRect

describe('snapToGrid', () => {
  it('snaps to column 0 at the left edge', () => {
    expect(snapToGrid(0, 0, 2, 2, { columns: 12, rowHeight: 80, containerRect: rect })).toEqual({
      col: 0,
      row: 0,
    })
  })

  it('snaps to correct column for mid-grid pointer', () => {
    // cellWidth = 100; pointer at 350 → round(350/100) = 4; widget w=2 → col=4
    const result = snapToGrid(350, 80, 2, 2, { columns: 12, rowHeight: 80, containerRect: rect })
    expect(result.col).toBe(4)
    expect(result.row).toBe(1)
  })

  it('clamps column to not exceed columns - w', () => {
    // pointer at 1190 → would be col 12 but w=2 so clamp to 10
    const result = snapToGrid(1190, 0, 2, 2, { columns: 12, rowHeight: 80, containerRect: rect })
    expect(result.col).toBe(10)
  })

  it('clamps row to 0 when pointer is above grid', () => {
    const result = snapToGrid(0, -50, 2, 2, { columns: 12, rowHeight: 80, containerRect: rect })
    expect(result.row).toBe(0)
  })

  it('returns 0,0 when containerRect is null', () => {
    expect(snapToGrid(500, 200, 2, 2, { columns: 12, rowHeight: 80, containerRect: null })).toEqual({
      col: 0,
      row: 0,
    })
  })
})
