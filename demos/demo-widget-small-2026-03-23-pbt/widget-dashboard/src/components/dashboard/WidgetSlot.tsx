import React from 'react';

interface WidgetSlotProps {
  col: number;
  row: number;
  w: number;
  h: number;
  children: React.ReactNode;
}

// Task 6.1 — CSS grid positioning
const WidgetSlot: React.FC<WidgetSlotProps> = ({ col, row, w, h, children }) => (
  <div
    className="widget-slot"
    style={{
      gridColumn: `${col + 1} / span ${w}`,
      gridRow: `${row + 1} / span ${h}`,
    }}
  >
    {children}
  </div>
);

export default WidgetSlot;
