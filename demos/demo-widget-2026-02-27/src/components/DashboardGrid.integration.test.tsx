import React, { useState } from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardGrid } from './DashboardGrid'
import { register, clear } from '../registry/WidgetRegistry'
import type { Layout, GridConfig } from '../types'

const config: GridConfig = { columns: 12, rowHeight: 100, gap: 8 }

const TestWidget = ({ widgetId }: { widgetId: string }) => (
  <div data-testid={`widget-content-${widgetId}`}>{widgetId}</div>
)

function Wrapper({ initial }: { initial: Layout }) {
  const [layout, setLayout] = useState<Layout>(initial)
  return (
    <div style={{ width: '1200px' }} data-testid="container">
      <DashboardGrid
        config={config}
        initialLayout={layout}
        onLayoutChange={setLayout}
      />
    </div>
  )
}

beforeEach(() => {
  clear()
  register('test', TestWidget)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 1200, height: 800, x: 0, y: 0, top: 0, left: 0, right: 1200, bottom: 800,
    toJSON: () => {},
  } as DOMRect)
})

describe('DashboardGrid integration', () => {
  it('mounts with two widgets and renders both', () => {
    const layout: Layout = [
      { id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 },
      { id: 'w2', type: 'test', x: 2, y: 0, w: 2, h: 1 },
    ]
    render(<Wrapper initial={layout} />)
    expect(screen.getByTestId('widget-content-w1')).toBeInTheDocument()
    expect(screen.getByTestId('widget-content-w2')).toBeInTheDocument()
  })

  it('does not render a ghost when no interaction is active', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    render(<Wrapper initial={layout} />)
    expect(document.querySelector('.ghost-widget')).toBeNull()
  })
})
