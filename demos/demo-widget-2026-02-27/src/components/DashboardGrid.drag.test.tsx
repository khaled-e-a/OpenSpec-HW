import React, { useState } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DashboardGrid } from './DashboardGrid'
import { register, clear } from '../registry/WidgetRegistry'
import type { Layout, GridConfig } from '../types'

const config: GridConfig = { columns: 12, rowHeight: 100, gap: 8 }

// With containerWidth=1200: cw = (1200 - 11*8) / 12 = 1112/12 ≈ 92.67
// Cell stride (cw + gap) ≈ 100.67
// Column n starts at n * 100.67 px
const STRIDE = (1200 - 11 * 8) / 12 + 8 // ≈ 100.67

const TestWidget = ({ widgetId }: { widgetId: string }) => (
  <div data-testid={`widget-${widgetId}`}>{widgetId}</div>
)

interface WrapperProps {
  initial: Layout
  onLayout?: (l: Layout) => void
}
function Wrapper({ initial, onLayout }: WrapperProps) {
  const [layout, setLayout] = useState<Layout>(initial)
  return (
    <div style={{ width: '1200px' }}>
      <DashboardGrid
        config={config}
        initialLayout={layout}
        onLayoutChange={(l) => { setLayout(l); onLayout?.(l) }}
      />
    </div>
  )
}

function dragHandle(id: string) {
  return screen.getByRole('button', { name: new RegExp(`drag widget ${id}`, 'i') })
}

beforeEach(() => {
  clear()
  register('test', TestWidget)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 1200, height: 800, x: 0, y: 0, top: 0, left: 0, right: 1200, bottom: 800,
    toJSON: () => {},
  } as DOMRect)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Drag interactions', () => {
  // R2-UC1-S1: Drag starts on handle pointer-down — widget opacity is reduced
  it('dragging a widget reduces its opacity to 0.4', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    act(() => {
      fireEvent.pointerDown(dragHandle('w1'), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    const widgetEl = container.querySelector('.widget') as HTMLElement
    expect(widgetEl.style.opacity).toBe('0.4')
  })

  // R2-UC1-S2: Drag does not start on widget body
  it('pointer-down on widget body does not initiate drag', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    const content = container.querySelector('.widget__content')!
    act(() => {
      fireEvent.pointerDown(content, { clientX: 50, clientY: 50, pointerId: 1 })
    })

    expect(container.querySelector('.ghost-widget')).toBeNull()
    const widgetEl = container.querySelector('.widget') as HTMLElement
    expect(widgetEl.style.opacity).not.toBe('0.4')
  })

  // R2-UC2-S1: Ghost appears at drag start
  it('ghost widget element is rendered after drag handle pointer-down', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    act(() => {
      fireEvent.pointerDown(dragHandle('w1'), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    expect(container.querySelector('.ghost-widget')).not.toBeNull()
  })

  // R2-UC2-S2: Ghost follows pointer and snaps to nearest cell
  it('ghost position updates to a new snapped grid cell on pointer move', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    act(() => {
      fireEvent.pointerDown(dragHandle('w1'), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    const ghostBefore = container.querySelector('.ghost-widget') as HTMLElement
    const leftBefore = ghostBefore.style.left

    // Move pointer to column ~4 (clientX ≈ 4 * STRIDE)
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: Math.round(4 * STRIDE), clientY: 0, bubbles: true }))
    })

    const ghostAfter = container.querySelector('.ghost-widget') as HTMLElement
    expect(ghostAfter.style.left).not.toBe(leftBefore)
  })

  // R2-UC4-S1: Valid drop updates widget position
  it('dropping on a free cell updates the widget position in layout state', () => {
    const layout: Layout = [
      { id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 },
      { id: 'w2', type: 'test', x: 2, y: 0, w: 2, h: 1 },
    ]
    let lastLayout: Layout = layout
    render(<Wrapper initial={layout} onLayout={(l) => { lastLayout = l }} />)

    // Start drag on w1
    act(() => {
      fireEvent.pointerDown(dragHandle('w1'), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    // Move to column 6 (free — w2 occupies cols 2-3)
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: Math.round(6 * STRIDE), clientY: 0, bubbles: true }))
    })

    // Drop
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    })

    const w1 = lastLayout.find((w) => w.id === 'w1')!
    expect(w1.x).toBeGreaterThan(0)
  })

  // R2-UC4-S2: Drop on occupied cells is rejected
  it('dropping on a cell occupied by another widget does not update layout state', () => {
    vi.useFakeTimers()
    const layout: Layout = [
      { id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 },
      { id: 'w2', type: 'test', x: 4, y: 0, w: 2, h: 1 },
    ]
    let callCount = 0
    render(<Wrapper initial={layout} onLayout={() => { callCount++ }} />)
    const countAfterMount = callCount

    // Start drag on w1
    act(() => {
      fireEvent.pointerDown(dragHandle('w1'), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    // Move to column 4 (occupied by w2)
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: Math.round(4 * STRIDE), clientY: 0, bubbles: true }))
    })

    // Drop on w2
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    })

    // layout state must not have changed
    expect(callCount).toBe(countAfterMount)

    vi.useRealTimers()
  })

  // R2-UC5-S1 + R2-UC5-S2: Escape cancels drag, removes ghost, layout unchanged
  it('pressing Escape during drag cancels it, removes the ghost, and leaves layout unchanged', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    let callCount = 0
    const { container } = render(
      <Wrapper initial={layout} onLayout={() => { callCount++ }} />
    )
    const countAfterMount = callCount

    // Start drag
    act(() => {
      fireEvent.pointerDown(dragHandle('w1'), { clientX: 0, clientY: 0, pointerId: 1 })
    })
    expect(container.querySelector('.ghost-widget')).not.toBeNull()

    // Press Escape
    const widgetEl = container.querySelector('.widget')!
    act(() => {
      fireEvent.keyDown(widgetEl, { key: 'Escape', bubbles: true })
    })

    expect(container.querySelector('.ghost-widget')).toBeNull()
    expect(callCount).toBe(countAfterMount)
  })
})
