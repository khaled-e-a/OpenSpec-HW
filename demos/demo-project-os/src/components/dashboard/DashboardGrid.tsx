import React, { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { useGridLayout } from '../../hooks/useGridLayout';
import { useDragDrop } from '../../hooks/useDragDrop';
import type { GridLayout, WidgetLayout } from './types';

// ─── Context ────────────────────────────────────────────────────────────────

interface DashboardGridContextValue {
  layout: GridLayout;
  dragState: {
    draggingId: string;
    targetCol: number;
    targetRow: number;
    colSpan: number;
    rowSpan: number;
  } | null;
  handleWidgetPointerDown: (id: string, e: React.PointerEvent) => void;
}

const DashboardGridContext = createContext<DashboardGridContextValue | null>(null);

export function useDashboardGridContext(): DashboardGridContextValue {
  const ctx = useContext(DashboardGridContext);
  if (!ctx) {
    throw new Error('Widget must be used inside DashboardGrid');
  }
  return ctx;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface DashboardGridProps {
  columns?: number;
  rows?: number;
  gap?: number;
  initialLayout: GridLayout;
  onLayoutChange?: (layout: GridLayout) => void;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardGrid({
  columns = 12,
  rows = 8,
  gap = 8,
  initialLayout,
  onLayoutChange,
  children,
  style,
  className,
}: DashboardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  const { layout, moveWidget, isOccupied, isValidWidget } = useGridLayout({
    initialLayout,
    columns,
    rows,
    onLayoutChange,
  });

  const { dragState, handleWidgetPointerDown } = useDragDrop({
    gridRef,
    layout,
    columns,
    rows,
    gap,
    isOccupied,
    onDrop: moveWidget,
  });

  // Filter out widgets that exceed grid bounds.
  const validLayout = layout.filter(isValidWidget);

  const ghostWidget: WidgetLayout | null =
    dragState
      ? {
          id: '__ghost__',
          col: dragState.targetCol,
          row: dragState.targetRow,
          colSpan: dragState.colSpan,
          rowSpan: dragState.rowSpan,
        }
      : null;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gap: `${gap}px`,
    position: 'relative',
    ...style,
  };

  return (
    <DashboardGridContext.Provider
      value={{ layout: validLayout, dragState, handleWidgetPointerDown }}
    >
      <div ref={gridRef} style={gridStyle} className={className}>
        {children}

        {/* Ghost placeholder */}
        {ghostWidget && (
          <div
            aria-hidden="true"
            style={{
              gridColumn: `${ghostWidget.col} / span ${ghostWidget.colSpan}`,
              gridRow: `${ghostWidget.row} / span ${ghostWidget.rowSpan}`,
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              border: '2px dashed rgba(99, 102, 241, 0.6)',
              borderRadius: 6,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </DashboardGridContext.Provider>
  );
}
