import React from 'react';
import type { ReactNode } from 'react';
import { useDashboardGridContext } from './DashboardGrid';

interface WidgetProps {
  id: string;
  colSpan?: number;
  rowSpan?: number;
  draggable?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Widget({
  id,
  colSpan: colSpanProp = 1,
  rowSpan: rowSpanProp = 1,
  draggable = true,
  children,
  style,
  className,
}: WidgetProps) {
  // Validate and sanitize colSpan/rowSpan.
  let colSpan = colSpanProp;
  let rowSpan = rowSpanProp;
  if (!Number.isInteger(colSpan) || colSpan < 1) {
    console.warn(`[Widget] "${id}" has invalid colSpan=${colSpanProp}. Defaulting to 1.`);
    colSpan = 1;
  }
  if (!Number.isInteger(rowSpan) || rowSpan < 1) {
    console.warn(`[Widget] "${id}" has invalid rowSpan=${rowSpanProp}. Defaulting to 1.`);
    rowSpan = 1;
  }

  const { layout, dragState, handleWidgetPointerDown } = useDashboardGridContext();

  const layoutEntry = layout.find((w) => w.id === id);
  if (!layoutEntry) return null;

  const isDragging = dragState?.draggingId === id;

  const widgetStyle: React.CSSProperties = {
    gridColumn: `${layoutEntry.col} / span ${colSpan}`,
    gridRow: `${layoutEntry.row} / span ${rowSpan}`,
    opacity: isDragging ? 0.5 : 1,
    cursor: draggable ? 'grab' : 'default',
    userSelect: 'none',
    touchAction: 'none',
    ...style,
  };

  return (
    <div
      style={widgetStyle}
      className={className}
      onPointerDown={
        draggable
          ? (e) => handleWidgetPointerDown(id, e)
          : undefined
      }
    >
      {children}
    </div>
  );
}
