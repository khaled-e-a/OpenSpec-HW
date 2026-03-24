import React from 'react';
import { hasConflict } from '../../utils/gridUtils';

interface DropCellGridProps {
  columns: number;
  rows: number;
  cellSize: number;
  hoverCol: number;
  hoverRow: number;
  widgetW: number;
  widgetH: number;
  occupancy: boolean[][];
  conflictFlash: boolean;  // task 5.3
}

// Tasks 5.1–5.4
const DropCellGrid: React.FC<DropCellGridProps> = ({
  columns, rows, cellSize, hoverCol, hoverRow, widgetW, widgetH, occupancy, conflictFlash,
}) => {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      // Determine if this cell is under the dragged widget footprint
      const inFootprint =
        c >= hoverCol && c < hoverCol + widgetW &&
        r >= hoverRow && r < hoverRow + widgetH;

      let bg = 'transparent';
      if (inFootprint) {
        const isInvalid = hasConflict(occupancy, hoverCol, hoverRow, widgetW, widgetH);
        if (conflictFlash) {
          bg = 'rgba(239,68,68,0.35)'; // red flash
        } else {
          bg = isInvalid ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)';
        }
      }

      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            gridColumn: `${c + 1}`,
            gridRow: `${r + 1}`,
            background: bg,
            transition: conflictFlash ? 'none' : 'background 80ms',
            pointerEvents: 'none',
            borderRadius: '3px',
          }}
        />
      );
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {cells}
    </div>
  );
};

export default DropCellGrid;
