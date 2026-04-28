/**
 * Unit tests for widgetRegistry — covers:
 * UC2-S2: System displays available widget types with names and previews
 * UC2-S3: User selects a widget type (registry lookup)
 * UC4-S3: System parses layout and resolves widget components
 */
import { describe, it, expect } from 'vitest'
import {
  WIDGET_REGISTRY,
  getWidgetComponent,
  getRegistryEntry,
} from '@/registry/widgetRegistry'

// ── UC2-S2 ────────────────────────────────────────────────────────────────────

describe('WIDGET_REGISTRY', () => {
  it('UC2-S2: contains at least one widget type', () => {
    expect(WIDGET_REGISTRY.length).toBeGreaterThanOrEqual(1)
  })

  it('UC2-S2: every entry has required metadata fields', () => {
    for (const entry of WIDGET_REGISTRY) {
      expect(typeof entry.id).toBe('string')
      expect(entry.id.length).toBeGreaterThan(0)
      expect(typeof entry.displayName).toBe('string')
      expect(entry.displayName.length).toBeGreaterThan(0)
      expect(typeof entry.description).toBe('string')
      expect(typeof entry.defaultSize.w).toBe('number')
      expect(typeof entry.defaultSize.h).toBe('number')
      expect(entry.defaultSize.w).toBeGreaterThan(0)
      expect(entry.defaultSize.h).toBeGreaterThan(0)
      expect(entry.component).toBeDefined()
    }
  })

  it('UC2-S2: all entry IDs are unique', () => {
    const ids = WIDGET_REGISTRY.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('UC2-S2: contains the four starter widget types from the design', () => {
    const ids = WIDGET_REGISTRY.map((e) => e.id)
    expect(ids).toContain('stats-card')
    expect(ids).toContain('chart-widget')
    expect(ids).toContain('table-widget')
    expect(ids).toContain('task-list-widget')
  })
})

// ── UC2-S3 / UC4-S3 — getWidgetComponent ────────────────────────────────────

describe('getWidgetComponent', () => {
  it('UC4-S3: returns a React component for a known type ID', () => {
    const Comp = getWidgetComponent('stats-card')
    expect(typeof Comp).toBe('function')
  })

  it('UC2-S3: returns components for all registered types', () => {
    for (const entry of WIDGET_REGISTRY) {
      expect(getWidgetComponent(entry.id)).toBeDefined()
    }
  })

  it('UC4-S3: returns undefined for an unknown type ID', () => {
    expect(getWidgetComponent('does-not-exist')).toBeUndefined()
  })
})

// ── UC2-S3 — getRegistryEntry ────────────────────────────────────────────────

describe('getRegistryEntry', () => {
  it('UC2-S3: returns the full entry for a known type ID', () => {
    const entry = getRegistryEntry('chart-widget')
    expect(entry).toBeDefined()
    expect(entry!.id).toBe('chart-widget')
    expect(entry!.defaultSize).toBeDefined()
  })

  it('UC2-S3: returns undefined for an unknown type ID', () => {
    expect(getRegistryEntry('unknown-id')).toBeUndefined()
  })

  it('UC2-S3: entry defaultSize values are positive integers', () => {
    for (const entry of WIDGET_REGISTRY) {
      const e = getRegistryEntry(entry.id)!
      expect(Number.isInteger(e.defaultSize.w)).toBe(true)
      expect(Number.isInteger(e.defaultSize.h)).toBe(true)
      expect(e.defaultSize.w).toBeGreaterThan(0)
      expect(e.defaultSize.h).toBeGreaterThan(0)
    }
  })
})
