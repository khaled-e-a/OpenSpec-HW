/**
 * Unit tests for layoutStorage — covers:
 * UC4-S2: System reads stored layout from localStorage
 * UC4-S3: System parses layout and reconstructs widget positions and types
 * UC4-E2a: No layout in localStorage; system renders default layout
 * UC4-E2b: Layout data corrupt/incompatible; system falls back to default
 * UC1-S7 / UC2-S5 / UC3-S6: saveLayout persists on every mutation
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadLayout, saveLayout, CURRENT_LAYOUT_VERSION } from '@/persistence/layoutStorage'
import { DEFAULT_LAYOUT } from '@/registry/defaultLayout'

const STORAGE_KEY = 'rdd_layout'

// ── Helpers ───────────────────────────────────────────────────────────────────

const validLayout = {
  layoutVersion: CURRENT_LAYOUT_VERSION,
  widgets: [
    { instanceId: 'abc', typeId: 'stats-card', x: 0, y: 0, w: 3, h: 3 },
  ],
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
})

// ── UC4-E2a ───────────────────────────────────────────────────────────────────

describe('loadLayout — no stored data', () => {
  it('UC4-E2a: returns DEFAULT_LAYOUT when localStorage is empty', () => {
    const result = loadLayout()
    expect(result.layoutVersion).toBe(DEFAULT_LAYOUT.layoutVersion)
    expect(result.widgets.length).toBe(DEFAULT_LAYOUT.widgets.length)
  })

  it('UC4-E2a: returned default layout is a fresh copy (not the same reference)', () => {
    const r1 = loadLayout()
    const r2 = loadLayout()
    expect(r1).not.toBe(r2)
    expect(r1.widgets).not.toBe(r2.widgets)
  })
})

// ── UC4-S2 / UC4-S3 ──────────────────────────────────────────────────────────

describe('loadLayout — valid stored data', () => {
  it('UC4-S2 / UC4-S3: reads and parses stored layout correctly', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validLayout))
    const result = loadLayout()
    expect(result.layoutVersion).toBe(CURRENT_LAYOUT_VERSION)
    expect(result.widgets).toHaveLength(1)
    expect(result.widgets[0].instanceId).toBe('abc')
  })

  it('UC4-S3: reconstructs widget positions from stored data', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validLayout))
    const result = loadLayout()
    const w = result.widgets[0]
    expect(w).toMatchObject({ x: 0, y: 0, w: 3, h: 3 })
  })

  it('UC4-S3: reconstructs widget typeId from stored data', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validLayout))
    const result = loadLayout()
    expect(result.widgets[0].typeId).toBe('stats-card')
  })
})

// ── UC4-E2b — corrupt data ────────────────────────────────────────────────────

describe('loadLayout — corrupt data', () => {
  it('UC4-E2b: falls back to DEFAULT_LAYOUT on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{')
    const result = loadLayout()
    expect(result.widgets.length).toBe(DEFAULT_LAYOUT.widgets.length)
  })

  it('UC4-E2b: clears corrupt entry from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, '{bad json')
    loadLayout()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('UC4-E2b: sets sessionStorage reset flag on corrupt data', () => {
    localStorage.setItem(STORAGE_KEY, 'bad')
    loadLayout()
    expect(sessionStorage.getItem('rdd_layout_reset')).toBe('corrupt')
  })
})

// ── UC4-E2b — version mismatch ────────────────────────────────────────────────

describe('loadLayout — version mismatch', () => {
  it('UC4-E2b: falls back to DEFAULT_LAYOUT when layoutVersion does not match', () => {
    const old = { ...validLayout, layoutVersion: 999 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old))
    const result = loadLayout()
    expect(result.widgets.length).toBe(DEFAULT_LAYOUT.widgets.length)
  })

  it('UC4-E2b: clears stored layout on version mismatch', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...validLayout, layoutVersion: 0 }))
    loadLayout()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('UC4-E2b: sets sessionStorage reset flag on version mismatch', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...validLayout, layoutVersion: 0 }))
    loadLayout()
    expect(sessionStorage.getItem('rdd_layout_reset')).toBe('version_mismatch')
  })
})

// ── UC1-S7 / UC2-S5 / UC3-S6 — saveLayout ────────────────────────────────────

describe('saveLayout', () => {
  it('UC1-S7: persists layout to localStorage under rdd_layout key', () => {
    saveLayout(validLayout)
    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!).widgets[0].instanceId).toBe('abc')
  })

  it('UC2-S5: persisted layout includes newly added widget', () => {
    const withNew = {
      ...validLayout,
      widgets: [
        ...validLayout.widgets,
        { instanceId: 'new-1', typeId: 'chart-widget', x: 3, y: 0, w: 4, h: 4 },
      ],
    }
    saveLayout(withNew)
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(parsed.widgets).toHaveLength(2)
  })

  it('UC3-S6: persisted layout excludes removed widget', () => {
    const withRemoved = { ...validLayout, widgets: [] }
    saveLayout(withRemoved)
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(parsed.widgets).toHaveLength(0)
  })

  it('UC1-S7: serialised layout round-trips through loadLayout', () => {
    saveLayout(validLayout)
    const loaded = loadLayout()
    expect(loaded.widgets[0]).toMatchObject(validLayout.widgets[0])
  })
})
