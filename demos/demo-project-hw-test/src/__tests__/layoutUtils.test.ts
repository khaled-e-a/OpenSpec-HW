import { describe, it, expect } from 'vitest'
import type { WidgetLayout } from '../types/layout'
import { hasCollision, findFirstAvailable } from '../hooks/layoutUtils'

const w = (id: string, x: number, y: number, w: number, h: number): WidgetLayout => ({
  id,
  type: 'test',
  x,
  y,
  w,
  h,
})

describe('hasCollision', () => {
  const layout = [w('a', 0, 0, 2, 2), w('b', 4, 0, 2, 2)]

  it('returns false when no overlap', () => {
    expect(hasCollision(layout, { x: 2, y: 0, w: 2, h: 2 })).toBe(false)
  })

  it('returns true when candidate overlaps an item', () => {
    expect(hasCollision(layout, { x: 1, y: 1, w: 2, h: 2 })).toBe(true)
  })

  it('ignores the excluded id', () => {
    expect(hasCollision(layout, { x: 0, y: 0, w: 2, h: 2 }, 'a')).toBe(false)
  })

  it('returns false for empty layout', () => {
    expect(hasCollision([], { x: 0, y: 0, w: 4, h: 4 })).toBe(false)
  })
})

describe('findFirstAvailable', () => {
  it('returns origin for empty layout', () => {
    expect(findFirstAvailable([], 2, 2, 12)).toEqual({ x: 0, y: 0 })
  })

  it('finds first gap after existing widgets', () => {
    const layout = [w('a', 0, 0, 4, 2)]
    expect(findFirstAvailable(layout, 2, 2, 12)).toEqual({ x: 4, y: 0 })
  })

  it('wraps to next row when no gap on current row', () => {
    const layout = [w('a', 0, 0, 12, 2)]
    expect(findFirstAvailable(layout, 2, 2, 12)).toEqual({ x: 0, y: 2 })
  })

  it('appends beyond last row when no gap exists', () => {
    // Fill columns 0-9 on row 0; widget of width 4 won't fit on row 0
    const layout = [w('a', 0, 0, 10, 1), w('b', 0, 1, 12, 1)]
    const pos = findFirstAvailable(layout, 4, 1, 12)
    expect(pos.y).toBeGreaterThanOrEqual(2)
  })
})
