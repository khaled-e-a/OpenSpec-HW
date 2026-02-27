import { describe, it, expect } from 'vitest'
import { buildOccupancyMap, isAreaFree, resolveConflicts } from './useDashboard'
import type { Layout } from '../types'

const w = (id: string, x: number, y: number, w: number, h: number) => ({
  id, type: 'test', x, y, w, h,
})

describe('buildOccupancyMap', () => {
  it('maps all cells of a single widget', () => {
    const map = buildOccupancyMap([w('a', 0, 0, 2, 2)])
    expect(map.get('0,0')).toBe('a')
    expect(map.get('1,0')).toBe('a')
    expect(map.get('0,1')).toBe('a')
    expect(map.get('1,1')).toBe('a')
    expect(map.size).toBe(4)
  })

  it('maps multiple non-overlapping widgets', () => {
    const map = buildOccupancyMap([w('a', 0, 0, 1, 1), w('b', 2, 0, 1, 1)])
    expect(map.get('0,0')).toBe('a')
    expect(map.get('2,0')).toBe('b')
    expect(map.size).toBe(2)
  })

  it('returns an empty map for an empty layout', () => {
    expect(buildOccupancyMap([]).size).toBe(0)
  })
})

describe('isAreaFree', () => {
  const layout: Layout = [w('a', 0, 0, 2, 2)]
  const map = buildOccupancyMap(layout)

  it('returns true for a free area', () => {
    expect(isAreaFree(map, 3, 0, 1, 1)).toBe(true)
  })

  it('returns false for an occupied area', () => {
    expect(isAreaFree(map, 0, 0, 1, 1)).toBe(false)
  })

  it('returns true for the excluded widget own cells', () => {
    expect(isAreaFree(map, 0, 0, 2, 2, 'a')).toBe(true)
  })

  it('returns false when partially overlapping another widget', () => {
    expect(isAreaFree(map, 1, 1, 2, 2)).toBe(false)
  })
})

describe('resolveConflicts', () => {
  it('leaves a non-overlapping layout unchanged', () => {
    const layout = [w('a', 0, 0, 2, 1), w('b', 0, 1, 2, 1)]
    const result = resolveConflicts(layout)
    expect(result[0]).toMatchObject({ id: 'a', y: 0 })
    expect(result[1]).toMatchObject({ id: 'b', y: 1 })
  })

  it('shifts the second widget down when two widgets overlap', () => {
    const layout = [w('a', 0, 0, 2, 2), w('b', 0, 0, 2, 1)]
    const result = resolveConflicts(layout)
    expect(result[0]).toMatchObject({ id: 'a', y: 0 })
    expect(result[1].y).toBeGreaterThanOrEqual(2)
  })

  it('returns an empty layout unchanged', () => {
    expect(resolveConflicts([])).toEqual([])
  })
})
