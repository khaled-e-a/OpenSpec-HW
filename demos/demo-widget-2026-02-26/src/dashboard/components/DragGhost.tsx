import { DragOverlay, useDndContext } from '@dnd-kit/core';
import type { LayoutItem } from '../types';
import { snapToGrid } from '../utils/snap';
import { hasAnyOverlap } from '../utils/collision';
import { itemToPixelRect } from '../utils/geometry';
import { useGridContext } from './GridContext';

interface DragGhostProps {
  layout: LayoutItem[];
  activeItem: LayoutItem | null;
  colWidth: number;
}

export function DragGhost({ layout, activeItem, colWidth }: DragGhostProps) {
  const { rowHeight, columns } = useGridContext();
  const { active } = useDndContext();

  if (!activeItem || !active || colWidth === 0) return <DragOverlay />;

  const delta = active.rect?.current?.translated;

  const snapped = delta
    ? snapToGrid(delta.left, delta.top, colWidth, rowHeight, activeItem, columns)
    : { x: activeItem.x, y: activeItem.y };

  const ghostItem: LayoutItem = { ...activeItem, ...snapped };
  const others = layout.filter((it) => it.id !== activeItem.id);
  const valid = !hasAnyOverlap(ghostItem, others);

  const rect = itemToPixelRect(ghostItem, colWidth, rowHeight);

  return (
    <DragOverlay>
      <div
        style={{
          width: rect.width,
          height: rect.height,
          background: valid ? 'rgba(0,200,0,0.15)' : 'rgba(200,0,0,0.15)',
          border: `2px solid ${valid ? 'green' : 'red'}`,
          borderRadius: 4,
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
        data-testid="drag-ghost"
        data-valid={valid}
      />
    </DragOverlay>
  );
}
