import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DashboardGrid } from '../components/DashboardGrid/DashboardGrid'
import { registerWidget } from '../registry/registerWidget'
import { registry } from '../registry/widgetRegistry'
import React from 'react'

const MockComponent = () => <div>Mock Widget</div>

describe('DashboardGrid - UC-05 Remove Widget from Dashboard', () => {
  const layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 }]
  
  beforeEach(() => {
    registry.clear()
    registerWidget({
      id: 'test',
      component: MockComponent,
      defaultW: 2,
      defaultH: 2,
      minW: 1,
      minH: 1
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('UC-05-S1: shows an undo toast when remove is triggered', () => {
    render(<DashboardGrid layout={layout} />)
    
    const removeBtn = screen.getByLabelText('Remove widget')
    fireEvent.click(removeBtn)
    
    expect(screen.getByText(/Removing widget/i)).toBeInTheDocument()
    expect(screen.getByText(/Undo/i)).toBeInTheDocument()
  })

  it('UC-05-S2: removes the widget only after timeout', () => {
    const onLayoutChange = vi.fn()
    render(<DashboardGrid layout={layout} onLayoutChange={onLayoutChange} />)
    
    fireEvent.click(screen.getByLabelText('Remove widget'))
    
    // Should still be in document immediately
    expect(screen.getByText('Mock Widget')).toBeInTheDocument()
    
    // Advance 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    
    expect(onLayoutChange).toHaveBeenCalledWith([])
  })

  it('UC-05-A1: restores the widget (cancels removal) when Undo is clicked', () => {
    const onLayoutChange = vi.fn()
    render(<DashboardGrid layout={layout} onLayoutChange={onLayoutChange} />)
    
    fireEvent.click(screen.getByLabelText('Remove widget'))
    fireEvent.click(screen.getByText(/Undo/i))
    
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    
    expect(onLayoutChange).not.toHaveBeenCalled()
    expect(screen.queryByText(/Removing widget/i)).not.toBeInTheDocument()
  })
})
