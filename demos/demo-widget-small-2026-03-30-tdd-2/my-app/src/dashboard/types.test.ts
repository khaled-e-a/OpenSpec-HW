// UC1-S7, UC2-S7: Layout state must be a serializable array of WidgetLayout
import { describe, it, expectTypeOf } from 'vitest'
import type { WidgetLayout, DashboardGridProps, DraggableWidgetProps } from './types'

describe('WidgetLayout', () => {
  it('has required integer fields id, x, y, w, h', () => {
    const layout: WidgetLayout = { id: 'w1', x: 0, y: 0, w: 2, h: 1 }
    expectTypeOf(layout).toMatchTypeOf<WidgetLayout>()
  })
})

describe('DashboardGridProps', () => {
  it('has optional layout, onLayoutChange, cellSize, colCount, rowCount', () => {
    const props: DashboardGridProps = {
      onLayoutChange: (_l: WidgetLayout[]) => {},
    }
    expectTypeOf(props).toMatchTypeOf<DashboardGridProps>()
  })
})

describe('DraggableWidgetProps', () => {
  it('has required id, x, y, w, h, cellSize and optional children', () => {
    const props: DraggableWidgetProps = {
      id: 'w1', x: 0, y: 0, w: 2, h: 1, cellSize: 100,
    }
    expectTypeOf(props).toMatchTypeOf<DraggableWidgetProps>()
  })
})
