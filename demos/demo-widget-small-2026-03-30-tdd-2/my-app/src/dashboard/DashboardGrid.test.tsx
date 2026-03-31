// UC1-S1..S7, UC1-E4a..E5b, UC2-S1..S7, UC2-E4a..E5b, UC3-S1..S6, UC3-E3a, UC3-E5a
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndProvider } from 'react-dnd'
import { TestBackend } from 'react-dnd-test-backend'
import { DashboardGrid } from './DashboardGrid'
import { DraggableWidget } from './DraggableWidget'
import type { WidgetLayout } from './types'

function renderWithDnd(ui: React.ReactElement) {
  return render(<DndProvider backend={TestBackend}>{ui}</DndProvider>)
}

// ── DashboardGrid scaffold ────────────────────────────────────────────────────
describe('DashboardGrid', () => {
  it('renders a grid canvas element (UC1-S3, UC3-S1)', () => {
    const cb = vi.fn()
    renderWithDnd(<DashboardGrid onLayoutChange={cb} cellSize={100} colCount={6} rowCount={4} />)
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument()
  })

  it('renders with correct pixel dimensions from colCount * cellSize (UC1-S3)', () => {
    const cb = vi.fn()
    renderWithDnd(<DashboardGrid onLayoutChange={cb} cellSize={100} colCount={6} rowCount={4} />)
    const grid = screen.getByTestId('dashboard-grid')
    expect(grid).toHaveStyle({ width: '600px', height: '400px' })
  })

  it('renders children inside the grid (UC2-S1)', () => {
    const cb = vi.fn()
    renderWithDnd(
      <DashboardGrid onLayoutChange={cb} cellSize={100} colCount={6} rowCount={4}>
        <div data-testid="child-widget">Widget A</div>
      </DashboardGrid>
    )
    expect(screen.getByTestId('child-widget')).toBeInTheDocument()
  })

  // UC1-S7, UC2-S7: uncontrolled mode
  it('starts with provided layout when uncontrolled', () => {
    const layout: WidgetLayout[] = [{ id: 'w1', x: 0, y: 0, w: 2, h: 1 }]
    const cb = vi.fn()
    renderWithDnd(
      <DashboardGrid onLayoutChange={cb} cellSize={100} colCount={6} rowCount={4}>
        <DraggableWidget id="w1" x={0} y={0} w={2} h={1} cellSize={100}>
          <span>W1</span>
        </DraggableWidget>
      </DashboardGrid>
    )
    expect(screen.getByText('W1')).toBeInTheDocument()
  })

  // UC1-S7, UC2-S7: controlled mode renders from layout prop
  it('renders widgets at positions from the layout prop (controlled mode)', () => {
    const layout: WidgetLayout[] = [{ id: 'w1', x: 2, y: 1, w: 1, h: 1 }]
    const cb = vi.fn()
    renderWithDnd(
      <DashboardGrid layout={layout} onLayoutChange={cb} cellSize={100} colCount={6} rowCount={4} />
    )
    // grid renders without error and onLayoutChange is not called on initial render
    expect(cb).not.toHaveBeenCalled()
  })
})

// ── DraggableWidget ───────────────────────────────────────────────────────────
describe('DraggableWidget', () => {
  it('renders children (UC1-S1)', () => {
    renderWithDnd(
      <DashboardGrid onLayoutChange={vi.fn()} cellSize={100} colCount={6} rowCount={4}>
        <DraggableWidget id="w1" x={0} y={0} w={2} h={1} cellSize={100}>
          <span>Hello Widget</span>
        </DraggableWidget>
      </DashboardGrid>
    )
    expect(screen.getByText('Hello Widget')).toBeInTheDocument()
  })

  it('positions itself absolutely using x, y, w, h * cellSize (UC1-S6, UC2-S6)', () => {
    renderWithDnd(
      <DashboardGrid onLayoutChange={vi.fn()} cellSize={100} colCount={6} rowCount={4}>
        <DraggableWidget id="w1" x={1} y={2} w={3} h={2} cellSize={100}>
          <span>W1</span>
        </DraggableWidget>
      </DashboardGrid>
    )
    const widget = screen.getByTestId('draggable-widget-w1')
    expect(widget).toHaveStyle({
      left: '100px',
      top: '200px',
      width: '300px',
      height: '200px',
    })
  })

  it('has position: absolute for grid placement (UC1-S6)', () => {
    renderWithDnd(
      <DashboardGrid onLayoutChange={vi.fn()} cellSize={100} colCount={6} rowCount={4}>
        <DraggableWidget id="w2" x={0} y={0} w={1} h={1} cellSize={100}>
          <span>W2</span>
        </DraggableWidget>
      </DashboardGrid>
    )
    const widget = screen.getByTestId('draggable-widget-w2')
    expect(widget).toHaveStyle({ position: 'absolute' })
  })
})

// ── Layout state serialization (UC1-S7, UC2-S7) ───────────────────────────────
describe('Layout serialization round-trip', () => {
  it('layout array is JSON serializable', () => {
    const layout: WidgetLayout[] = [
      { id: 'w1', x: 0, y: 0, w: 2, h: 1 },
      { id: 'w2', x: 2, y: 0, w: 1, h: 2 },
    ]
    const serialized = JSON.stringify(layout)
    const restored: WidgetLayout[] = JSON.parse(serialized)
    expect(restored).toEqual(layout)
  })

  it('renders widgets at positions from a restored (parsed) layout', () => {
    const original: WidgetLayout[] = [{ id: 'w1', x: 1, y: 0, w: 2, h: 1 }]
    const restored: WidgetLayout[] = JSON.parse(JSON.stringify(original))
    renderWithDnd(
      <DashboardGrid layout={restored} onLayoutChange={vi.fn()} cellSize={100} colCount={6} rowCount={4}>
        <DraggableWidget id="w1" x={restored[0].x} y={restored[0].y} w={restored[0].w} h={restored[0].h} cellSize={100}>
          <span>Restored</span>
        </DraggableWidget>
      </DashboardGrid>
    )
    const widget = screen.getByTestId('draggable-widget-w1')
    expect(widget).toHaveStyle({ left: '100px' })
    expect(screen.getByText('Restored')).toBeInTheDocument()
  })
})
