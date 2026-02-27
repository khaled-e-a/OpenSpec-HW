import React, { useState } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { DashboardGrid } from './DashboardGrid'
import { register, clear } from '../registry/WidgetRegistry'
import type { Layout, GridConfig } from '../types'

const config: GridConfig = { columns: 12, rowHeight: 100, gap: 8 }

// With containerWidth=1200: cw = (1200 - 11*8) / 12 ≈ 92.67
// Widget at x=0, y=0, w=2, h=1:
//   rect.width  = 2 * 92.67 + 1 * 8 ≈ 193.33  → cellW per column ≈ 96.67
//   rect.height = 1 * 100 + 0 * 8  = 100       → cellH per row = 100
const CELL_W = (1200 - 11 * 8) / 12 // ≈ 92.67

const TestWidget = ({ widgetId }: { widgetId: string }) => (
  <div data-testid={`widget-content-${widgetId}`}>{widgetId}</div>
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

function resizeHandle() {
  return screen.getByRole('button', { name: /resize widget/i })
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

describe('Resize handle visibility', () => {
  // R4-UC1-S1: Resize handle is visible on resizable widget
  it('resize handle element is rendered for a widget with resizable: true', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    render(<Wrapper initial={layout} />)
    expect(screen.getByRole('button', { name: /resize widget/i })).toBeInTheDocument()
  })

  // R4-UC1-S2: Resize handle is absent during active drag
  it('resize handle is null/disabled while a drag is in progress on another widget', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    render(<Wrapper initial={layout} />)

    act(() => {
      fireEvent.pointerDown(dragHandle('w1'), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    // resizeDisabled={!!dragState} → disabled=true → ResizeHandle returns null
    expect(screen.queryByRole('button', { name: /resize widget/i })).toBeNull()
  })
})

describe('Resize initiation', () => {
  // R4-UC2-S1: Resize starts on handle pointer-down
  it('pointer-down on the resize handle initiates a resize interaction', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    act(() => {
      fireEvent.pointerDown(resizeHandle(), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    expect(container.querySelector('.ghost-widget')).not.toBeNull()
  })

  // R4-UC2-S2: Resize does not start on widget body or drag handle
  it('pointer-down on the widget body does not initiate resize', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    const content = container.querySelector('.widget__content')!
    act(() => {
      fireEvent.pointerDown(content, { clientX: 50, clientY: 50, pointerId: 1 })
    })

    expect(container.querySelector('.ghost-widget')).toBeNull()
  })
})

describe('Resize ghost overlay', () => {
  // R4-UC3-S1: Ghost overlay appears at resize start
  it('ghost widget element is rendered after resize handle pointer-down', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    act(() => {
      fireEvent.pointerDown(resizeHandle(), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    const ghost = container.querySelector('.ghost-widget')
    expect(ghost).not.toBeNull()
    expect(ghost!.classList.contains('ghost-widget--resize')).toBe(true)
  })

  // R4-UC3-S2: Ghost updates to snapped span on pointer move
  it('ghost size reflects new snapped span as pointer moves', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    const { container } = render(<Wrapper initial={layout} />)

    act(() => {
      fireEvent.pointerDown(resizeHandle(), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    const ghostBefore = container.querySelector('.ghost-widget') as HTMLElement
    const widthBefore = ghostBefore.style.width

    // cellW for w=2 widget: rect.width / descriptor.w = (2*CELL_W + 8) / 2 ≈ 96.67
    // dx ≈ 2 * 96.67 ≈ 193 → newW = round(2 + 2) = 4 → ghost widens
    const cellW = (2 * CELL_W + 8) / 2
    const dx = Math.round(2 * cellW)

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: dx, clientY: 0, bubbles: true }))
    })

    const ghostAfter = container.querySelector('.ghost-widget') as HTMLElement
    expect(ghostAfter.style.width).not.toBe(widthBefore)
  })
})

describe('Resize commit and reject', () => {
  // R4-UC5-S1: Valid resize updates widget span
  it('releasing resize handle over free cells updates the widget w and h in layout state', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    let lastLayout: Layout = layout
    render(<Wrapper initial={layout} onLayout={(l) => { lastLayout = l }} />)

    // Start resize
    act(() => {
      fireEvent.pointerDown(resizeHandle(), { clientX: 0, clientY: 0, pointerId: 1 })
    })

    // Move pointer right by ~2 cell widths → newW=4 (cols 0-3 are free since only w1 occupies 0-1)
    const cellW = (2 * CELL_W + 8) / 2 // ≈ 96.67
    const dx = Math.round(2 * cellW)    // ≈ 193 → newW=4

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: dx, clientY: 0, bubbles: true }))
    })

    // Drop
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    })

    const w1 = lastLayout.find((w) => w.id === 'w1')!
    expect(w1.w).toBeGreaterThan(2)
  })

  // R4-UC5-S2: Resize into occupied cells is rejected
  it('releasing resize handle over cells occupied by another widget does not update layout state', () => {
    vi.useFakeTimers()
    const layout: Layout = [
      { id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 },
      { id: 'w2', type: 'test', x: 3, y: 0, w: 2, h: 1 },
    ]
    let callCount = 0
    const { container } = render(<Wrapper initial={layout} onLayout={() => { callCount++ }} />)
    const countAfterMount = callCount

    // Start resize on w1 — two widgets means two handles, use querySelector for specificity
    const w1Handle = container.querySelector('.resize-handle') as HTMLElement
    act(() => {
      fireEvent.pointerDown(w1Handle, { clientX: 0, clientY: 0, pointerId: 1 })
    })

    // Move to overlap with w2 at x=3 (newW=4 → occupies x=0..3, clashing with w2 at x=3)
    const cellW = (2 * CELL_W + 8) / 2 // ≈ 96.67
    const dx = Math.round(2 * cellW)    // ≈ 193 → newW=4 (columns 0,1,2,3 → overlaps w2 at col 3)

    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: dx, clientY: 0, bubbles: true }))
    })

    // Drop on occupied area — layout must not change
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
    })

    expect(callCount).toBe(countAfterMount)
    vi.useRealTimers()
  })
})

describe('Escape cancels resize', () => {
  // R4-UC6-S1 + R4-UC6-S2: Escape cancels resize, removes ghost, layout unchanged
  it('pressing Escape during resize cancels the resize, removes the ghost, and leaves layout unchanged', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    let callCount = 0
    const { container } = render(
      <Wrapper initial={layout} onLayout={() => { callCount++ }} />
    )
    const countAfterMount = callCount

    // Start resize
    act(() => {
      fireEvent.pointerDown(resizeHandle(), { clientX: 0, clientY: 0, pointerId: 1 })
    })
    expect(container.querySelector('.ghost-widget')).not.toBeNull()

    // Press Escape — ResizeHandle listens on window keydown
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    })

    expect(container.querySelector('.ghost-widget')).toBeNull()
    expect(callCount).toBe(countAfterMount)
  })
})
