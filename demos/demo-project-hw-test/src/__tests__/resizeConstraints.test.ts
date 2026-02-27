import { describe, it, expect } from 'vitest'
import type { WidgetLayout } from '../types/layout'
import { hasCollision } from '../hooks/layoutUtils'

// Simulates the clamping logic from useResizeWidget
function clampResize(
  item: WidgetLayout,
  rawW: number,
  rawH: number,
  layout: WidgetLayout[],
  columns: number,
  minW: number,
  minH: number,
  maxW: number,
): { w: number; h: number } {
  let w = Math.max(minW, Math.min(maxW, rawW))
  let h = Math.max(minH, rawH)
  if (item.x + w > columns) w = columns - item.x

  for (const other of layout) {
    if (other.id === item.id) continue
    if (other.x >= item.x + item.w && other.y < item.y + h && other.y + other.h > item.y) {
      const max = other.x - item.x
      if (max > 0) w = Math.min(w, max)
    }
    if (other.y >= item.y + item.h && other.x < item.x + w && other.x + other.w > item.x) {
      const max = other.y - item.y
      if (max > 0) h = Math.min(h, max)
    }
  }
  return { w, h }
}

const base: WidgetLayout = { id: 'a', type: 'test', x: 0, y: 0, w: 2, h: 2 }

describe('resize constraints', () => {
  it('enforces minimum width', () => {
    const { w } = clampResize(base, 0, 2, [], 12, 1, 1, 12)
    expect(w).toBe(1)
  })

  it('enforces minimum height', () => {
    const { h } = clampResize(base, 2, 0, [], 12, 1, 1, 12)
    expect(h).toBe(1)
  })

  it('enforces declared maxW', () => {
    const { w } = clampResize(base, 10, 2, [], 12, 1, 1, 4)
    expect(w).toBe(4)
  })

  it('clamps at right grid boundary', () => {
    const wide: WidgetLayout = { ...base, x: 10 }
    const { w } = clampResize(wide, 5, 2, [], 12, 1, 1, 12)
    expect(wide.x + w).toBeLessThanOrEqual(12)
  })

  it('caps width at neighbour boundary (right)', () => {
    const neighbour: WidgetLayout = { id: 'b', type: 'test', x: 4, y: 0, w: 2, h: 2 }
    const { w } = clampResize(base, 8, 2, [base, neighbour], 12, 1, 1, 12)
    // base.x=0, neighbour.x=4 → max allowed = 4
    expect(w).toBeLessThanOrEqual(4)
  })

  it('caps height at neighbour boundary (bottom)', () => {
    const below: WidgetLayout = { id: 'b', type: 'test', x: 0, y: 4, w: 2, h: 2 }
    const { h } = clampResize(base, 2, 8, [base, below], 12, 1, 1, 12)
    expect(h).toBeLessThanOrEqual(4)
  })

  it('passes hasCollision check after clamping', () => {
    const neighbour: WidgetLayout = { id: 'b', type: 'test', x: 4, y: 0, w: 2, h: 2 }
    const layout = [base, neighbour]
    const { w, h } = clampResize(base, 8, 2, layout, 12, 1, 1, 12)
    expect(hasCollision(layout, { x: base.x, y: base.y, w, h }, base.id)).toBe(false)
  })
})
