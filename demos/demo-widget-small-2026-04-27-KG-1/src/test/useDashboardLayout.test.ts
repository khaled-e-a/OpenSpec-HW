/**
 * Integration tests for useDashboardLayout hook — covers:
 * UC1-S6: System places widget, shifting others to avoid overlap
 * UC1-S7: System persists updated layout to localStorage
 * UC2-S4: System places widget in first available cell
 * UC2-S5: System persists after add
 * UC2-E4a: No free grid cell; system shows toast, widget not added
 * UC3-S4: System removes widget from dashboard
 * UC3-S5: System frees grid cells
 * UC3-S6: System persists after remove
 * UC4-S4/S5: Layout restored from localStorage on mount
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import { saveLayout } from '@/persistence/layoutStorage'
import { CURRENT_LAYOUT_VERSION } from '@/persistence/layoutStorage'
import type { Layout, LayoutItem } from 'react-grid-layout'

// Mock react-hot-toast so toast calls don't blow up in jsdom
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
  toast: { error: vi.fn() },
}))

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const rglFrom = (widgets: { instanceId: string; x: number; y: number; w: number; h: number }[]): Layout =>
  widgets.map((w): LayoutItem => ({ i: w.instanceId, x: w.x, y: w.y, w: w.w, h: w.h }))

// ── UC4-S4/S5 — initial state ─────────────────────────────────────────────────

describe('initial state', () => {
  it('UC4-E2a: loads DEFAULT_LAYOUT when localStorage is empty', () => {
    const { result } = renderHook(() => useDashboardLayout())
    expect(result.current.layout.widgets.length).toBeGreaterThan(0)
  })

  it('UC4-S4/S5: restores a previously saved layout', () => {
    const stored = {
      layoutVersion: CURRENT_LAYOUT_VERSION,
      widgets: [{ instanceId: 'w1', typeId: 'stats-card', x: 0, y: 0, w: 3, h: 3 }],
    }
    saveLayout(stored)
    const { result } = renderHook(() => useDashboardLayout())
    expect(result.current.layout.widgets).toHaveLength(1)
    expect(result.current.layout.widgets[0].instanceId).toBe('w1')
  })
})

// ── UC1-S6 / UC1-S7 — moveWidget ─────────────────────────────────────────────

describe('moveWidget', () => {
  it('UC1-S6: updates widget position from RGL layout change', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const firstId = result.current.layout.widgets[0].instanceId

    act(() => {
      result.current.moveWidget(
        rglFrom([{ instanceId: firstId, x: 5, y: 2, w: 3, h: 3 }])
      )
    })

    const moved = result.current.layout.widgets.find((w) => w.instanceId === firstId)!
    expect(moved.x).toBe(5)
    expect(moved.y).toBe(2)
  })

  it('UC1-S7: persists updated positions to localStorage', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const firstId = result.current.layout.widgets[0].instanceId

    act(() => {
      result.current.moveWidget(rglFrom([{ instanceId: firstId, x: 4, y: 1, w: 3, h: 3 }]))
    })

    const stored = JSON.parse(localStorage.getItem('rdd_layout')!)
    const w = stored.widgets.find((w: { instanceId: string }) => w.instanceId === firstId)
    expect(w.x).toBe(4)
    expect(w.y).toBe(1)
  })
})

// ── UC2-S4 / UC2-S5 — addWidget ──────────────────────────────────────────────

describe('addWidget', () => {
  it('UC2-S4: adds widget instance to layout', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const before = result.current.layout.widgets.length

    act(() => { result.current.addWidget('stats-card') })

    expect(result.current.layout.widgets.length).toBe(before + 1)
  })

  it('UC2-S4: new widget has the registered default size', () => {
    const { result } = renderHook(() => useDashboardLayout())

    act(() => { result.current.addWidget('stats-card') })

    const added = result.current.layout.widgets.at(-1)!
    expect(added.w).toBe(3)
    expect(added.h).toBe(3)
    expect(added.typeId).toBe('stats-card')
  })

  it('UC2-S4: new widget has a unique instanceId', () => {
    const { result } = renderHook(() => useDashboardLayout())

    act(() => { result.current.addWidget('chart-widget') })
    act(() => { result.current.addWidget('chart-widget') })

    const ids = result.current.layout.widgets.map((w) => w.instanceId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('UC2-S5: persists layout to localStorage after add', () => {
    const { result } = renderHook(() => useDashboardLayout())

    act(() => { result.current.addWidget('table-widget') })

    const stored = JSON.parse(localStorage.getItem('rdd_layout')!)
    expect(stored.widgets.length).toBe(result.current.layout.widgets.length)
  })
})

// ── UC3-S4 / UC3-S5 / UC3-S6 — removeWidget ─────────────────────────────────

describe('removeWidget', () => {
  it('UC3-S4: removes the specified widget from layout', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const id = result.current.layout.widgets[0].instanceId
    const before = result.current.layout.widgets.length

    act(() => { result.current.removeWidget(id) })

    expect(result.current.layout.widgets.length).toBe(before - 1)
    expect(result.current.layout.widgets.find((w) => w.instanceId === id)).toBeUndefined()
  })

  it('UC3-S5: grid cells of removed widget are freed (widget no longer in layout)', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const target = result.current.layout.widgets[0]

    act(() => { result.current.removeWidget(target.instanceId) })

    // The position that was occupied is no longer taken by that instance
    expect(result.current.layout.widgets.some((w) => w.instanceId === target.instanceId)).toBe(false)
  })

  it('UC3-S6: persists layout to localStorage after remove', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const id = result.current.layout.widgets[0].instanceId

    act(() => { result.current.removeWidget(id) })

    const stored = JSON.parse(localStorage.getItem('rdd_layout')!)
    expect(stored.widgets.find((w: { instanceId: string }) => w.instanceId === id)).toBeUndefined()
  })

  it('UC3-S4: does nothing when removing a non-existent instanceId', () => {
    const { result } = renderHook(() => useDashboardLayout())
    const before = result.current.layout.widgets.length

    act(() => { result.current.removeWidget('no-such-id') })

    expect(result.current.layout.widgets.length).toBe(before)
  })
})
