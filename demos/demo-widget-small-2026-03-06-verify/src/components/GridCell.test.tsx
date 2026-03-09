import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { GridCell } from './GridCell'

// GridCell must be wrapped in DndContext because it uses useDroppable
function renderCell(props: { col: number; row: number; isHighlighted: boolean; isBlocked: boolean }) {
  return render(
    <DndContext>
      <GridCell {...props} />
    </DndContext>,
  )
}

// UC1-S4, UC2-S3: valid drop target highlighting
describe('GridCell — highlight styles', () => {
  it('renders with transparent border when neither highlighted nor blocked', () => {
    const { container } = renderCell({ col: 0, row: 0, isHighlighted: false, isBlocked: false })
    const cell = container.querySelector('div') as HTMLElement
    expect(cell.style.border).toContain('transparent')
  })

  it('renders highlight border when isHighlighted=true (valid drop target)', () => {
    // UC1-S4: System highlights the nearest valid grid cell(s) as a drop target
    // UC2-S3: System highlights the target cell(s) to show the snap preview
    const { container } = renderCell({ col: 1, row: 2, isHighlighted: true, isBlocked: false })
    const cell = container.querySelector('div') as HTMLElement
    // jsdom normalises hex colours to rgb()
    expect(cell.style.border).toContain('rgb(79, 144, 240)')
  })

  it('renders blocked indicator when isBlocked=true (occupied cell)', () => {
    // UC1-E4a: Pointer moves over an occupied cell — system indicates cell is unavailable
    const { container } = renderCell({ col: 0, row: 0, isHighlighted: false, isBlocked: true })
    const cell = container.querySelector('div') as HTMLElement
    expect(cell.style.border).toContain('rgb(224, 82, 82)')
  })

  it('highlight takes precedence over blocked when both true (defensive)', () => {
    const { container } = renderCell({ col: 0, row: 0, isHighlighted: true, isBlocked: true })
    const cell = container.querySelector('div') as HTMLElement
    expect(cell.style.border).toContain('rgb(79, 144, 240)')
  })

  it('renders with correct grid position', () => {
    // UC2-S3: each cell placed at correct grid column/row
    const { container } = renderCell({ col: 2, row: 3, isHighlighted: false, isBlocked: false })
    const cell = container.querySelector('div') as HTMLElement
    expect(cell.style.gridColumn).toBe('3')
    expect(cell.style.gridRow).toBe('4')
  })
})
