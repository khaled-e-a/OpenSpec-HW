/**
 * Property-based tests (fast-check) for widgetRegistry — covers:
 * UC2-S2: All registry entries always expose required metadata
 * UC2-S3: getRegistryEntry / getWidgetComponent always agree
 * UC4-S3: getWidgetComponent returns undefined for any unknown ID
 */
import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import {
  WIDGET_REGISTRY,
  getWidgetComponent,
  getRegistryEntry,
} from '@/registry/widgetRegistry'

const knownId = fc.constantFrom(...WIDGET_REGISTRY.map((e) => e.id))

// ── UC2-S2: metadata invariants for all known IDs ─────────────────────────────

describe('UC2-S2: registry metadata invariants — property', () => {
  it('UC2-S2: every known entry always has a non-empty displayName and description', () => {
    fc.assert(
      fc.property(knownId, (id) => {
        const entry = getRegistryEntry(id)!
        return entry.displayName.length > 0 && entry.description.length > 0
      })
    )
  })

  it('UC2-S2: every known entry always has positive defaultSize dimensions', () => {
    fc.assert(
      fc.property(knownId, (id) => {
        const entry = getRegistryEntry(id)!
        return entry.defaultSize.w > 0 && entry.defaultSize.h > 0
      })
    )
  })
})

// ── UC2-S3: getWidgetComponent and getRegistryEntry always agree ──────────────

describe('UC2-S3: component lookup consistency — property', () => {
  it('UC2-S3: getWidgetComponent returns defined iff getRegistryEntry returns defined', () => {
    fc.assert(
      fc.property(knownId, (id) => {
        const comp = getWidgetComponent(id)
        const entry = getRegistryEntry(id)
        return (comp !== undefined) === (entry !== undefined)
      })
    )
  })
})

// ── UC4-S3: unknown IDs never return a component ─────────────────────────────

describe('UC4-S3: unknown ID always returns undefined — property', () => {
  it('UC4-S3: getWidgetComponent returns undefined for any UUID not in registry', () => {
    fc.assert(
      fc.property(fc.uuid(), (randomId) => {
        const known = WIDGET_REGISTRY.some((e) => e.id === randomId)
        if (known) return true // skip the rare collision
        return getWidgetComponent(randomId) === undefined
      })
    )
  })
})
