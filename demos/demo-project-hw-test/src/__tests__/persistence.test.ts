import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import type { WidgetLayout } from '../types/layout'
import { loadLayout, saveLayout } from '../hooks/useDashboardPersistence'

const sample: WidgetLayout[] = [{ id: '1', type: 'metric-card', x: 0, y: 0, w: 2, h: 2 }]

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('saveLayout / loadLayout', () => {
  it('round-trips layout through localStorage', () => {
    saveLayout('test-key', sample)
    expect(loadLayout('test-key')).toEqual(sample)
  })

  it('returns null when key does not exist', () => {
    expect(loadLayout('missing-key')).toBeNull()
  })

  it('returns null on malformed JSON', () => {
    localStorage.setItem('bad', 'not-json')
    expect(loadLayout('bad')).toBeNull()
  })

  it('UC-05-E1: logs a warning and retries when localStorage.setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useFakeTimers()

    saveLayout('test-key', sample)

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 1'))
    
    // Advance time to trigger retry
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('attempt 2'))

    warnSpy.mockRestore()
    spy.mockRestore()
    vi.useRealTimers()
  })
})
