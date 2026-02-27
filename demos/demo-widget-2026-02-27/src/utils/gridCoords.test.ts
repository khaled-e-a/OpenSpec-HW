import { describe, it, expect } from 'vitest'
import { toPixelRect, clampPosition, clampSpan } from './gridCoords'
import type { GridConfig } from '../types'

const config: GridConfig = { columns: 12, rowHeight: 100, gap: 8 }
const CW = 90 // simplified cellWidth for predictable integer math

describe('toPixelRect', () => {
  // R1-UC3-S1: Widget position matches grid coordinate (x=2, y=1, w=3, h=2)
  it('computes correct left/top/width/height for x=2 y=1 w=3 h=2', () => {
    const result = toPixelRect(2, 1, 3, 2, config, CW)
    // left = 2 * (90 + 8) = 196
    expect(result.left).toBe(196)
    // top = 1 * (100 + 8) = 108
    expect(result.top).toBe(108)
    // width = 3 * 90 + (3-1) * 8 = 270 + 16 = 286
    expect(result.width).toBe(286)
    // height = 2 * 100 + (2-1) * 8 = 200 + 8 = 208
    expect(result.height).toBe(208)
  })

  // R1-UC3-S2: Widget at origin renders at left=0, top=0
  it('returns left=0 and top=0 for x=0 y=0', () => {
    const result = toPixelRect(0, 0, 1, 1, config, CW)
    expect(result.left).toBe(0)
    expect(result.top).toBe(0)
  })

  it('width spans multiple cells plus inter-cell gaps', () => {
    // w=4: 4 cells + 3 gaps between them
    const result = toPixelRect(0, 0, 4, 1, config, 100)
    expect(result.width).toBe(4 * 100 + 3 * 8) // 424
  })

  it('height spans multiple rows plus inter-row gaps', () => {
    // h=3: 3 rows + 2 gaps between them
    const result = toPixelRect(0, 0, 1, 3, config, 100)
    expect(result.height).toBe(3 * 100 + 2 * 8) // 316
  })
})

describe('clampPosition', () => {
  // R2-UC3-S1: Drag near right edge clamps to last valid column
  it('clamps x so the widget w-span fits within total columns', () => {
    // x=10, w=3, columns=12 → max x = 12 - 3 = 9
    const result = clampPosition(10, 0, 3, 1, 12)
    expect(result.x).toBe(9)
  })

  // R2-UC3-S2: Drag beyond top edge clamps to row 0
  it('clamps y to a minimum of 0', () => {
    const result = clampPosition(0, -5, 1, 1, 12)
    expect(result.y).toBe(0)
  })

  it('does not alter a position already within bounds', () => {
    const result = clampPosition(2, 3, 2, 1, 12)
    expect(result.x).toBe(2)
    expect(result.y).toBe(3)
  })
})

describe('clampSpan', () => {
  // R4-UC4-S1: Resize below minimum is clamped to 1×1
  it('returns w=1 and h=1 when the requested span is zero or negative', () => {
    const result = clampSpan(0, 0, 0, 12)
    expect(result.w).toBe(1)
    expect(result.h).toBe(1)
  })

  // R4-UC4-S2: Resize beyond grid boundary is clamped
  it('clamps w so that column + w does not exceed the column count', () => {
    // col=10, newW=5 → max w = 12 - 10 = 2
    const result = clampSpan(10, 5, 3, 12)
    expect(result.w).toBe(2)
    expect(result.h).toBe(3)
  })

  it('does not alter a span already within bounds', () => {
    const result = clampSpan(2, 3, 4, 12)
    expect(result.w).toBe(3)
    expect(result.h).toBe(4)
  })
})
