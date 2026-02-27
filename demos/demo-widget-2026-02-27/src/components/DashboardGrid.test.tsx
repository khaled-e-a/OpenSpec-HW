import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { DashboardGrid } from './DashboardGrid'
import { register, clear } from '../registry/WidgetRegistry'
import type { Layout, GridConfig } from '../types'

const config: GridConfig = { columns: 12, rowHeight: 100, gap: 8 }

const TestWidget = ({ widgetId }: { widgetId: string }) => (
  <div data-testid={`widget-${widgetId}`}>{widgetId}</div>
)

beforeEach(() => {
  clear()
  register('test', TestWidget)
  // jsdom returns 0 for all layout measurements — mock a 1200px container
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 1200, height: 800, x: 0, y: 0, top: 0, left: 0, right: 1200, bottom: 800,
    toJSON: () => {},
  } as DOMRect)
})

describe('DashboardGrid', () => {
  it('renders an empty-state placeholder when layout is empty', () => {
    render(<DashboardGrid config={config} initialLayout={[]} />)
    expect(screen.getByText(/no widgets/i)).toBeInTheDocument()
  })

  it('renders a widget at the correct position', () => {
    const layout: Layout = [{ id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1 }]
    render(
      <div style={{ width: '1200px' }}>
        <DashboardGrid config={config} initialLayout={layout} />
      </div>
    )
    expect(screen.getByTestId('widget-w1')).toBeInTheDocument()
  })

  it('auto-corrects an overlapping initial layout', () => {
    const layout: Layout = [
      { id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 2 },
      { id: 'w2', type: 'test', x: 0, y: 0, w: 2, h: 1 },
    ]
    render(
      <div style={{ width: '1200px' }}>
        <DashboardGrid config={config} initialLayout={layout} />
      </div>
    )
    expect(screen.getByTestId('widget-w1')).toBeInTheDocument()
    expect(screen.getByTestId('widget-w2')).toBeInTheDocument()
  })
})
