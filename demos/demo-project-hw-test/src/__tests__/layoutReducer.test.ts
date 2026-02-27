/**
 * Tests for layout reducer actions (useLayout) covering use-case paths not
 * exercised by the existing utility-level tests.
 *
 * UC-01  Drag Widget to a New Position
 * UC-03  Resize Widget (happy path — layout update committed)
 * UC-04  Add Widget — exception: unknown type rejected
 * UC-05  Remove Widget from Dashboard
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { WidgetComponentProps, WidgetDefinition } from '../types/layout'
import { registry } from '../registry/widgetRegistry'
import { registerWidget } from '../registry/registerWidget'
import { useLayout } from '../hooks/useLayout'

const MockComponent = (_props: WidgetComponentProps) => null

function makeDef(id: string, overrides: Partial<WidgetDefinition> = {}): WidgetDefinition {
  return { id, component: MockComponent, defaultW: 2, defaultH: 2, minW: 1, minH: 1, ...overrides }
}

beforeEach(() => {
  registry.clear()
})

// ---------------------------------------------------------------------------
// UC-01: Drag Widget to a New Position
// ---------------------------------------------------------------------------

describe('UC-01 Happy — move widget to valid cell', () => {
  it('updates widget position when target cell is unoccupied', () => {
    const initial = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 }]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.moveWidget('w1', 4, 0, 12))

    const moved = result.current.layout.find((w) => w.id === 'w1')
    expect(moved?.x).toBe(4)
    expect(moved?.y).toBe(0)
  })
})

describe('UC-01 Alt A2 — drop on occupied cell rejected', () => {
  it('keeps widget at original position when target overlaps another widget', () => {
    const initial = [
      { id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 },
      { id: 'w2', type: 'test', x: 4, y: 0, w: 2, h: 2 },
    ]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.moveWidget('w1', 4, 0, 12)) // collides with w2

    const w1 = result.current.layout.find((w) => w.id === 'w1')
    expect(w1?.x).toBe(0)
    expect(w1?.y).toBe(0)
  })
})

describe('UC-01 Alt A3 — drop outside grid boundary rejected', () => {
  it('keeps widget at original position when x + w would exceed columns', () => {
    const initial = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 }]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.moveWidget('w1', 11, 0, 12)) // 11 + 2 = 13 > 12

    expect(result.current.layout.find((w) => w.id === 'w1')?.x).toBe(0)
  })

  it('keeps widget at original position when x is negative', () => {
    const initial = [{ id: 'w1', type: 'test', x: 2, y: 0, w: 2, h: 2 }]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.moveWidget('w1', -1, 0, 12))

    expect(result.current.layout.find((w) => w.id === 'w1')?.x).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// UC-03: Resize Widget — Happy Path (layout update committed)
// ---------------------------------------------------------------------------

describe('UC-03 Happy — resize committed to valid dimensions', () => {
  it('updates widget w and h when resize is within constraints', () => {
    registerWidget(makeDef('test-widget', { minW: 1, minH: 1 }))
    const initial = [{ id: 'w1', type: 'test-widget', x: 0, y: 0, w: 2, h: 2 }]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.resizeWidget('w1', 4, 3, 12))

    const w1 = result.current.layout.find((w) => w.id === 'w1')
    expect(w1?.w).toBe(4)
    expect(w1?.h).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// UC-04: Add Widget — Exception E1: unknown widget type rejected
// ---------------------------------------------------------------------------

describe('UC-04 Exc E1 — addWidget with unregistered type is a no-op', () => {
  it('does not add any widget when type is not in registry', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useLayout([]))

    act(() => result.current.addWidget('ghost-type', 12))

    expect(result.current.layout).toHaveLength(0)
    spy.mockRestore()
  })

  it('logs a console error when type is not registered', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useLayout([]))

    act(() => result.current.addWidget('ghost-type', 12))

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('ghost-type'))
    spy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// UC-05: Remove Widget from Dashboard — Happy Path
// ---------------------------------------------------------------------------

describe('UC-05 Happy — removeWidget frees widget cells', () => {
  it('removes the widget from the layout', () => {
    const initial = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 }]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.removeWidget('w1'))

    expect(result.current.layout).toHaveLength(0)
  })

  it('leaves other widgets untouched when one is removed', () => {
    const initial = [
      { id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 },
      { id: 'w2', type: 'test', x: 4, y: 0, w: 2, h: 2 },
    ]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.removeWidget('w1'))

    expect(result.current.layout).toHaveLength(1)
    expect(result.current.layout[0].id).toBe('w2')
  })

  it('is a no-op when the ID does not exist in layout', () => {
    const initial = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 }]
    const { result } = renderHook(() => useLayout(initial))

    act(() => result.current.removeWidget('nonexistent'))

    expect(result.current.layout).toHaveLength(1)
  })
})
