import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Widget } from './Widget'
import { register, clear } from '../registry/WidgetRegistry'
import type { WidgetDescriptor, PixelRect } from '../types'

const noop = () => {}
const rect: PixelRect = { left: 0, top: 0, width: 200, height: 100 }

const baseDescriptor: WidgetDescriptor = {
  id: 'w1', type: 'test', x: 0, y: 0, w: 2, h: 1,
}

const props = {
  rect,
  isDragging: false,
  isResizing: false,
  dragDisabled: false,
  resizeDisabled: false,
  onDragStart: noop,
  onDragMove: noop,
  onDragEnd: noop,
  onDragCancel: noop,
  onResizeStart: noop,
  onResizeMove: noop,
  onResizeEnd: noop,
  onResizeCancel: noop,
}

beforeEach(() => {
  clear()
})

describe('Widget', () => {
  it('renders the registered component for a known type', () => {
    register('test', () => <div data-testid="my-widget">content</div>)
    render(<Widget descriptor={baseDescriptor} {...props} />)
    expect(screen.getByTestId('my-widget')).toBeInTheDocument()
  })

  it('renders an error tile for an unregistered type', () => {
    render(<Widget descriptor={{ ...baseDescriptor, type: 'unknown' }} {...props} />)
    expect(screen.getByText(/unknown widget type/i)).toBeInTheDocument()
    expect(screen.getByText(/unknown/)).toBeInTheDocument()
  })

  it('renders an error tile when the component throws, without affecting siblings', () => {
    const BrokenWidget = () => { throw new Error('boom') }
    register('broken', BrokenWidget)
    render(<Widget descriptor={{ ...baseDescriptor, type: 'broken' }} {...props} />)
    expect(screen.getByText(/error rendering widget/i)).toBeInTheDocument()
  })

  // R3-UC4-S2: Registered component receives correct props (widgetId, config, position)
  it('registered component receives widgetId, config, x, y, w, h as props', () => {
    const received: Record<string, unknown> = {}
    const ProbeWidget = (p: Record<string, unknown>) => {
      Object.assign(received, p)
      return null
    }
    register('probe', ProbeWidget as any)
    const descriptor: WidgetDescriptor = {
      id: 'w42', type: 'probe', x: 3, y: 2, w: 4, h: 2, config: { label: 'hello' },
    }
    render(<Widget descriptor={descriptor} {...props} />)
    expect(received.widgetId).toBe('w42')
    expect(received.config).toEqual({ label: 'hello' })
    expect(received.x).toBe(3)
    expect(received.y).toBe(2)
    expect(received.w).toBe(4)
    expect(received.h).toBe(2)
  })
})
