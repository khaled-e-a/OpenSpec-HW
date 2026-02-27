import { useLayoutContext } from './LayoutContext'
import { hasCollision } from '../../hooks/layoutUtils'

interface GridBackgroundProps {
  totalRows: number
}

export function GridBackground({ totalRows }: GridBackgroundProps) {
  const { columns, rowHeight, layout, dropTarget } = useLayoutContext()

  const rows = totalRows + 2 // render a couple of extra rows below content

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {Array.from({ length: rows * columns }).map((_, i) => {
        const col = i % columns
        const row = Math.floor(i / columns)

        let background = 'transparent'
        if (dropTarget) {
          const cellIsTarget =
            col >= dropTarget.x &&
            col < dropTarget.x + dropTarget.w &&
            row >= dropTarget.y &&
            row < dropTarget.y + dropTarget.h

          if (cellIsTarget) {
            const isOccupied = hasCollision(layout, dropTarget)
            background = isOccupied
              ? 'rgba(239, 68, 68, 0.25)' // red — invalid
              : 'rgba(34, 197, 94, 0.25)'  // green — valid
          }
        }

        return (
          <div
            key={i}
            style={{
              border: '1px solid rgba(148, 163, 184, 0.15)',
              background,
            }}
          />
        )
      })}
    </div>
  )
}
