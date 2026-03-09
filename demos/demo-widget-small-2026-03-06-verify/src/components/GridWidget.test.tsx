import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { GridWidget } from './GridWidget'
import type { WidgetLayout } from '../types'

const layout: WidgetLayout = { id: 'test-w', col: 1, row: 2, colSpan: 2, rowSpan: 1 }

function renderWidget(isDragging: boolean, children?: React.ReactNode) {
  return render(
    <DndContext>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 100px)', gridTemplateRows: 'repeat(4, 100px)', gap: 8 }}>
        <GridWidget layout={layout} isDragging={isDragging}>
          {children}
        </GridWidget>
      </div>
    </DndContext>,
  )
}

// UC1-S1: widget is draggable
describe('GridWidget — drag initiation', () => {
  it('renders with a drag cursor indicating it is draggable', () => {
    // UC1-S1: User initiates a drag gesture on a widget
    const { container } = renderWidget(false)
    const widget = container.querySelector('[style*="grab"]') as HTMLElement
    expect(widget).toBeTruthy()
  })

  it('exposes drag attributes for accessibility', () => {
    // UC1-S1: @dnd-kit applies role and aria attributes via useDraggable
    const { container } = renderWidget(false)
    // useDraggable spreads attributes onto the element
    const widget = container.querySelector('[role="button"]') as HTMLElement
    expect(widget).toBeTruthy()
  })
})

// UC1-S2: drag preview / dimmed slot
describe('GridWidget — visual drag state', () => {
  it('renders at full opacity when not dragging', () => {
    // UC1-S2: original slot visible (not dimmed) when no drag
    const { container } = renderWidget(false)
    const widget = container.querySelector('[style*="opacity"]') as HTMLElement
    expect(widget.style.opacity).toBe('1')
  })

  it('renders at reduced opacity when isDragging=true', () => {
    // UC1-S2: System displays the original widget slot in a dimmed state
    const { container } = renderWidget(true)
    const widget = container.querySelector('[style*="opacity"]') as HTMLElement
    expect(parseFloat(widget.style.opacity)).toBeLessThan(1)
  })
})

// UC2-S5: CSS grid placement
describe('GridWidget — grid placement', () => {
  it('applies gridColumn and gridRow from layout props', () => {
    // UC2-S5: widget is placed at the correct snapped grid cell
    const { container } = renderWidget(false)
    // The wrapper div > GridWidget div; use getAttribute to read the style string
    // container > grid-wrapper > GridWidget-div
    const widget = container.firstChild?.firstChild as HTMLElement
    const styleAttr = widget.getAttribute('style') ?? ''
    expect(styleAttr).toContain('grid-column')
    expect(styleAttr).toContain('2')   // col+1
    expect(styleAttr).toContain('3')   // row+1
  })

  it('spans multiple columns when colSpan > 1', () => {
    // UC2-S5: multi-cell widget spans correct number of columns
    const { container } = renderWidget(false)
    const widget = container.firstChild?.firstChild as HTMLElement
    const styleAttr = widget.getAttribute('style') ?? ''
    expect(styleAttr).toContain('span 2')
  })
})
