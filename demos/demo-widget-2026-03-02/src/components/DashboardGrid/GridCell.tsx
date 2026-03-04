import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface GridCellProps {
  x: number;
  y: number;
  isOccupied: boolean;
}

export const GridCell: React.FC<GridCellProps> = ({ x, y, isOccupied }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${x}-${y}`,
    data: { x, y },
  });

  const cellClass = `grid-cell ${
    isOver ? 'grid-cell--hover' : ''
  } ${
    isOccupied ? 'grid-cell--occupied' : ''
  }`;

  return (
    <div
      ref={setNodeRef}
      className={cellClass}
      style={{
        gridColumn: `${x + 1}`,
        gridRow: `${y + 1}`,
      }}
    />
  );
};