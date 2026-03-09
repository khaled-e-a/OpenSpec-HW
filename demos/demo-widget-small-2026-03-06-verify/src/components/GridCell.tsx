import { useDroppable } from '@dnd-kit/core'

interface GridCellProps {
  col: number
  row: number
  isHighlighted: boolean
  isBlocked: boolean
}

/**
 * A single grid cell registered as a drop target.
 * Tasks 5.1, 5.2, 5.3 (UC1-S4, UC2-S3, UC1-E4a)
 */
export function GridCell({ col, row, isHighlighted, isBlocked }: GridCellProps) {
  const id = `cell-${col}-${row}`
  const { setNodeRef } = useDroppable({ id })

  let borderColor = 'transparent'
  let background = 'transparent'
  if (isHighlighted) {
    borderColor = '#4f90f0'
    background = 'rgba(79, 144, 240, 0.12)'
  } else if (isBlocked) {
    borderColor = '#e05252'
    background = 'rgba(224, 82, 82, 0.10)'
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        gridColumn: col + 1,
        gridRow: row + 1,
        border: `2px solid ${borderColor}`,
        background,
        borderRadius: 4,
        pointerEvents: 'none',
      }}
    />
  )
}
