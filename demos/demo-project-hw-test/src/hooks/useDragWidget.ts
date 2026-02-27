import type { DragEndEvent, DragMoveEvent } from '@dnd-kit/core'
import { hasCollision } from './layoutUtils'
import type { WidgetLayout } from '../types/layout'

interface SnapOptions {
  columns: number
  rowHeight: number
  containerRect: DOMRect | null
}

export function snapToGrid(
  pointerX: number,
  pointerY: number,
  w: number,
  _h: number,
  opts: SnapOptions,
): { col: number; row: number } {
  if (!opts.containerRect) return { col: 0, row: 0 }
  const cellWidth = opts.containerRect.width / opts.columns
  const relX = pointerX - opts.containerRect.left
  const relY = pointerY - opts.containerRect.top

  const col = Math.max(0, Math.min(opts.columns - w, Math.round(relX / cellWidth)))
  const row = Math.max(0, Math.round(relY / opts.rowHeight))
  return { col, row }
}

export function buildOnDragMove(
  layout: WidgetLayout[],
  columns: number,
  rowHeight: number,
  containerRect: DOMRect | null,
  setDropTarget: (t: { x: number; y: number; w: number; h: number } | null) => void,
) {
  return (event: DragMoveEvent) => {
    const id = event.active.id as string
    const item = layout.find((w) => w.id === id)
    if (!item || !containerRect) return

    const pointer = event.activatorEvent as PointerEvent
    const currentX = pointer.clientX + (event.delta?.x ?? 0)
    const currentY = pointer.clientY + (event.delta?.y ?? 0)

    const { col, row } = snapToGrid(currentX, currentY, item.w, item.h, {
      columns,
      rowHeight,
      containerRect,
    })
    setDropTarget({ x: col, y: row, w: item.w, h: item.h })
  }
}

export function buildOnDragEnd(
  layout: WidgetLayout[],
  columns: number,
  rowHeight: number,
  containerRect: DOMRect | null,
  moveWidget: (id: string, x: number, y: number, columns: number) => void,
  setDropTarget: (t: null) => void,
) {
  return (event: DragEndEvent) => {
    setDropTarget(null)
    const id = event.active.id as string
    const item = layout.find((w) => w.id === id)
    if (!item || !containerRect) return

    const pointer = event.activatorEvent as PointerEvent
    const finalX = pointer.clientX + (event.delta?.x ?? 0)
    const finalY = pointer.clientY + (event.delta?.y ?? 0)

    const { col, row } = snapToGrid(finalX, finalY, item.w, item.h, {
      columns,
      rowHeight,
      containerRect,
    })

    const candidate = { x: col, y: row, w: item.w, h: item.h }
    if (!hasCollision(layout, candidate, id) && col >= 0 && row >= 0) {
      moveWidget(id, col, row, columns)
    }
  }
}
