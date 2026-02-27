import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register, resolve, clear } from './WidgetRegistry'

const FakeComponent = () => null

beforeEach(() => {
  clear()
})

describe('register', () => {
  it('stores a valid component and can be resolved', () => {
    register('chart', FakeComponent)
    expect(resolve('chart')).toBe(FakeComponent)
  })

  it('throws when type key is an empty string', () => {
    expect(() => register('', FakeComponent)).toThrow(
      /typeKey must be a non-empty string/
    )
  })

  it('throws when type key is not a string', () => {
    expect(() => register(42 as any, FakeComponent)).toThrow(
      /typeKey must be a non-empty string/
    )
  })

  it('throws when Component is not a function', () => {
    expect(() => register('chart', 'not-a-component' as any)).toThrow(
      /Component must be a React component/
    )
  })

  it('overwrites duplicate key and emits a console warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const NewComponent = () => null
    register('chart', FakeComponent)
    register('chart', NewComponent)
    expect(resolve('chart')).toBe(NewComponent)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('"chart"'))
    warnSpy.mockRestore()
  })
})

describe('resolve', () => {
  it('returns the registered component for a known key', () => {
    register('metric', FakeComponent)
    expect(resolve('metric')).toBe(FakeComponent)
  })

  it('returns undefined for an unknown key', () => {
    expect(resolve('unknown-widget')).toBeUndefined()
  })
})

describe('registry persistence', () => {
  // R3-UC1-S2: Registry persists across component mounts (module-level singleton)
  it('resolve returns the component registered before a React render cycle without re-registration', () => {
    // Register once outside any React lifecycle
    register('durable', FakeComponent)
    // Simulate React unmount by explicitly NOT clearing and NOT re-registering
    // The module Map should still hold the entry
    expect(resolve('durable')).toBe(FakeComponent)
    // Register a second type to confirm the map grows, not resets
    const Other = () => null
    register('other', Other)
    // Original entry is still present alongside the new one
    expect(resolve('durable')).toBe(FakeComponent)
    expect(resolve('other')).toBe(Other)
  })
})
