import { DragOverlay } from '@dnd-kit/core'
import { useLayoutContext } from './LayoutContext'

interface DragPreviewProps {
  activeId: string | null
}

export function DragPreview({ activeId }: DragPreviewProps) {
  const { layout, columns, rowHeight } = useLayoutContext()

  if (!activeId) return <DragOverlay>{null}</DragOverlay>

  const item = layout.find((w) => w.id === activeId)
  if (!item) return <DragOverlay>{null}</DragOverlay>

  // Compute pixel dimensions for the ghost (container width not known here, use % of viewport)
  const cellWidthVw = 100 / columns
  const widthPx = `${item.w * cellWidthVw}vw`
  const heightPx = `${item.h * rowHeight}px`

  return (
    <DragOverlay>
      <div
        style={{
          width: widthPx,
          height: heightPx,
          background: 'rgba(99, 102, 241, 0.35)',
          border: '2px dashed rgba(99, 102, 241, 0.8)',
          borderRadius: 8,
          backdropFilter: 'blur(2px)',
          cursor: 'grabbing',
        }}
      />
    </DragOverlay>
  )
}
