/**
 * Property-based tests (fast-check) for layoutStorage — covers:
 * UC4-S2: System reads stored layout
 * UC4-S3: System parses layout and reconstructs widget positions
 * UC4-E2b: Corrupt data → fallback
 * UC1-S7 / UC2-S5 / UC3-S6: saveLayout persists correctly for any valid layout
 */
import { describe, it, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { loadLayout, saveLayout, CURRENT_LAYOUT_VERSION } from '@/persistence/layoutStorage'
import type { DashboardLayout, WidgetInstance } from '@/types/layout'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

// ── Arbitraries ───────────────────────────────────────────────────────────────

const widgetArb = fc.record<WidgetInstance>({
  instanceId: fc.uuid(),
  typeId: fc.constantFrom('stats-card', 'chart-widget', 'table-widget'),
  x: fc.integer({ min: 0, max: 10 }),
  y: fc.integer({ min: 0, max: 10 }),
  w: fc.integer({ min: 1, max: 6 }),
  h: fc.integer({ min: 1, max: 6 }),
})

const validLayoutArb = fc.array(widgetArb, { maxLength: 8 }).map(
  (widgets): DashboardLayout => ({ layoutVersion: CURRENT_LAYOUT_VERSION, widgets })
)

// ── UC1-S7 / UC2-S5 / UC3-S6: saveLayout + loadLayout round-trip ─────────────

describe('UC1-S7/UC2-S5/UC3-S6: save then load round-trip — property', () => {
  it('UC1-S7: loadLayout returns the same widgets that were saved', () => {
    fc.assert(
      fc.property(validLayoutArb, (layout) => {
        localStorage.clear()
        saveLayout(layout)
        const loaded = loadLayout()
        return (
          loaded.widgets.length === layout.widgets.length &&
          loaded.widgets.every((w, i) => {
            const orig = layout.widgets[i]
            return (
              w.instanceId === orig.instanceId &&
              w.typeId === orig.typeId &&
              w.x === orig.x &&
              w.y === orig.y &&
              w.w === orig.w &&
              w.h === orig.h
            )
          })
        )
      })
    )
  })

  it('UC4-S3: layoutVersion is preserved through save/load', () => {
    fc.assert(
      fc.property(validLayoutArb, (layout) => {
        localStorage.clear()
        saveLayout(layout)
        const loaded = loadLayout()
        return loaded.layoutVersion === CURRENT_LAYOUT_VERSION
      })
    )
  })
})

// ── UC4-E2b: any non-JSON string in localStorage → falls back to DEFAULT ──────

describe('UC4-E2b: corrupt data always triggers fallback — property', () => {
  it('UC4-E2b: non-JSON string always falls back to default layout', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => {
          try { JSON.parse(s); return false } catch { return true }
        }),
        (corruptStr) => {
          localStorage.setItem('rdd_layout', corruptStr)
          const result = loadLayout()
          // Must return some widgets (default layout)
          return Array.isArray(result.widgets) && result.widgets.length > 0
        }
      )
    )
  })
})
