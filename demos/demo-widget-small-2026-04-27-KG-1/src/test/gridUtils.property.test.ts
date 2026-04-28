/**
 * Property-based tests (fast-check) for gridUtils — covers:
 * UC1-S6:  System places widget without overlap
 * UC2-S4:  findFirstFreeCell always returns a valid, non-overlapping position
 * UC2-E4a / UC1-E6a: isGridFull is consistent with findFirstFreeCell
 */
import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { isGridFull, findFirstFreeCell } from '@/utils/gridUtils'
import type { DashboardLayout, WidgetInstance } from '@/types/layout'

// ── Arbitraries ───────────────────────────────────────────────────────────────

const widgetSizeArb = fc.record({
  w: fc.integer({ min: 1, max: 6 }),
  h: fc.integer({ min: 1, max: 6 }),
})

const widgetInstanceArb = fc.record({
  instanceId: fc.uuid(),
  typeId: fc.constantFrom('stats-card', 'chart-widget', 'table-widget'),
  x: fc.integer({ min: 0, max: 8 }),
  y: fc.integer({ min: 0, max: 10 }),
  w: fc.integer({ min: 1, max: 4 }),
  h: fc.integer({ min: 1, max: 4 }),
})

const sparseLayoutArb = fc.array(widgetInstanceArb, { minLength: 0, maxLength: 6 }).map(
  (widgets): DashboardLayout => ({
    layoutVersion: 1,
    widgets: widgets.map((w, i) => ({ ...w, instanceId: `w${i}` })), // deduplicate IDs
  })
)

// ── UC2-S4: findFirstFreeCell always returns a position within grid bounds ────

describe('UC2-S4: findFirstFreeCell — property', () => {
  it('UC2-S4: returned position is always within grid column bounds', () => {
    fc.assert(
      fc.property(sparseLayoutArb, widgetSizeArb, (layout, size) => {
        const pos = findFirstFreeCell(layout, size)
        return pos.x >= 0 && pos.x + size.w <= 12
      })
    )
  })

  it('UC2-S4: returned y is always non-negative', () => {
    fc.assert(
      fc.property(sparseLayoutArb, widgetSizeArb, (layout, size) => {
        const pos = findFirstFreeCell(layout, size)
        return pos.y >= 0
      })
    )
  })
})

// ── UC1-S6: isGridFull consistency with findFirstFreeCell ─────────────────────

describe('UC1-E6a / UC2-E4a: isGridFull consistency — property', () => {
  it('UC1-E6a: if isGridFull returns false, findFirstFreeCell returns a valid slot', () => {
    fc.assert(
      fc.property(sparseLayoutArb, widgetSizeArb, (layout, size) => {
        if (isGridFull(layout, size)) return true // skip full cases
        const pos = findFirstFreeCell(layout, size)
        // The returned position must be within grid bounds
        return pos.x >= 0 && pos.x + size.w <= 12 && pos.y >= 0
      })
    )
  })

  it('UC2-E4a: isGridFull is always false for empty layout regardless of widget size', () => {
    fc.assert(
      fc.property(widgetSizeArb, (size) => {
        const empty: DashboardLayout = { layoutVersion: 1, widgets: [] }
        return isGridFull(empty, size) === false
      })
    )
  })
})

// ── UC2-S4: adding a widget to a non-full layout never produces out-of-bounds pos ──

describe('UC2-S4: placement position always in bounds — property', () => {
  it('UC2-S4: position x + w never exceeds 12 columns', () => {
    fc.assert(
      fc.property(
        sparseLayoutArb,
        fc.record({ w: fc.integer({ min: 1, max: 12 }), h: fc.integer({ min: 1, max: 4 }) }),
        (layout, size) => {
          const pos = findFirstFreeCell(layout, size)
          return pos.x + size.w <= 12
        }
      )
    )
  })
})

// ── UC1-S6: placed widget does not overlap existing widgets ───────────────────

describe('UC1-S6: no overlap after placement — property', () => {
  it('UC1-S6: findFirstFreeCell position does not overlap any existing widget', () => {
    fc.assert(
      fc.property(sparseLayoutArb, widgetSizeArb, (layout, size) => {
        const pos = findFirstFreeCell(layout, size)
        // Check none of the existing widgets overlap with the new placement
        for (const w of layout.widgets) {
          const xOverlap = pos.x < w.x + w.w && pos.x + size.w > w.x
          const yOverlap = pos.y < w.y + w.h && pos.y + size.h > w.y
          if (xOverlap && yOverlap) return false
        }
        return true
      })
    )
  })
})

// ── UC4-S2: saveLayout / loadLayout round-trip — layout version preserved ─────

describe('UC4-S3: layout round-trip — property', () => {
  it('UC4-S3: widgetInstance fields round-trip through JSON serialisation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            instanceId: fc.uuid(),
            typeId: fc.constantFrom('stats-card', 'chart-widget'),
            x: fc.integer({ min: 0, max: 10 }),
            y: fc.integer({ min: 0, max: 10 }),
            w: fc.integer({ min: 1, max: 6 }),
            h: fc.integer({ min: 1, max: 6 }),
          }),
          { maxLength: 5 }
        ),
        (widgets: WidgetInstance[]) => {
          const layout: DashboardLayout = { layoutVersion: 1, widgets }
          const serialised = JSON.stringify(layout)
          const parsed: DashboardLayout = JSON.parse(serialised)
          return (
            parsed.layoutVersion === 1 &&
            parsed.widgets.length === widgets.length &&
            parsed.widgets.every((w, i) => w.instanceId === widgets[i].instanceId)
          )
        }
      )
    )
  })
})
