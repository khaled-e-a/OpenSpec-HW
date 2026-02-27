import { describe, it, expect, beforeEach } from 'vitest'
import type { WidgetComponentProps, WidgetDefinition } from '../types/layout'
import { registry, getWidget, getAllWidgets } from '../registry/widgetRegistry'
import { registerWidget } from '../registry/registerWidget'

const MockComponent = (_props: WidgetComponentProps) => null

function makeDef(id: string, overrides: Partial<WidgetDefinition> = {}): WidgetDefinition {
  return { id, component: MockComponent, defaultW: 2, defaultH: 2, minW: 1, minH: 1, ...overrides }
}

beforeEach(() => {
  registry.clear()
})

describe('registerWidget', () => {
  it('adds a new widget type to the registry', () => {
    registerWidget(makeDef('metric-card'))
    expect(getWidget('metric-card')).toBeDefined()
  })

  it('overwrites a duplicate registration', () => {
    registerWidget(makeDef('metric-card', { defaultW: 2 }))
    registerWidget(makeDef('metric-card', { defaultW: 4 }))
    expect(getWidget('metric-card')?.defaultW).toBe(4)
  })

  it('stores the exact definition', () => {
    const def = makeDef('bar-chart', { minW: 2, maxW: 8 })
    registerWidget(def)
    expect(getWidget('bar-chart')).toEqual(def)
  })
})

describe('getWidget', () => {
  it('returns undefined for unregistered type', () => {
    expect(getWidget('ghost')).toBeUndefined()
  })

  it('returns registered definition by id', () => {
    registerWidget(makeDef('table'))
    expect(getWidget('table')?.id).toBe('table')
  })
})

describe('getAllWidgets', () => {
  it('returns all registered definitions', () => {
    registerWidget(makeDef('a'))
    registerWidget(makeDef('b'))
    expect(getAllWidgets()).toHaveLength(2)
  })

  it('returns empty array when registry is empty', () => {
    expect(getAllWidgets()).toHaveLength(0)
  })
})
