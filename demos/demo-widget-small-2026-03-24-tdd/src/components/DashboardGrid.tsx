// DashboardGrid.tsx
// UC2-S1: Accepts initialLayout prop and initialises layout state.
// UC2-S2: Renders CSS grid canvas divided into equal-sized cells.
// UC2-S3/S4: Renders each DraggableWidget at correct span/position.
// UC2-E3a: Resolves overlapping initial widgets, warns on conflict.
// UC2-E3b: Clamps out-of-bounds initial widgets to grid boundary.
// UC1-S1..S8, UC1-E*: Drag, snap, validation and drop handled via DndContext.

import { useState, useRef, useCallback, type CSSProperties } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { DraggableWidget } from './DraggableWidget';
import {
  resolveLayout,
  snapToCell,
  isValidPlacement,
  type WidgetLayout,
} from '../utils/gridGeometry';

export interface DashboardGridProps {
  cols: number;
  rows: number;
  cellSize?: number;
  initialLayout?: WidgetLayout[];
  /** Controlled mode */
  layout?: WidgetLayout[];
  onLayoutChange?: (layout: WidgetLayout[]) => void;
}

export function DashboardGrid({
  cols,
  rows,
  cellSize = 100,
  initialLayout = [],
  layout: controlledLayout,
  onLayoutChange,
}: DashboardGridProps) {
  // --- Layout state ---
  const isControlled = controlledLayout !== undefined;

  const [internalLayout, setInternalLayout] = useState<WidgetLayout[]>(() => {
    const hasConflict = detectConflict(initialLayout, cols, rows);
    if (hasConflict) {
      console.warn(
        '[DashboardGrid] Initial layout contains overlapping or out-of-bounds widgets. ' +
          'Conflicts have been resolved automatically.'
      );
    }
    return resolveLayout(initialLayout, cols, rows);
  });

  const layout = isControlled ? controlledLayout : internalLayout;

  const setLayout = useCallback(
    (next: WidgetLayout[]) => {
      if (isControlled) {
        onLayoutChange?.(next);
      } else {
        setInternalLayout(next);
      }
    },
    [isControlled, onLayoutChange]
  );

  // --- Drag state ---
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dropPreview, setDropPreview] = useState<{ col: number; row: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const activeWidget = activeDragId ? layout.find((w) => w.id === activeDragId) : null;

  // --- Snap computation ---
  const computeSnap = useCallback(
    (clientX: number, clientY: number, widget: WidgetLayout) => {
      if (!gridRef.current) return null;
      const rect = gridRef.current.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;
      return snapToCell(relX, relY, cellSize, {
        w: widget.w,
        h: widget.h,
        cols,
        rows,
      });
    },
    [cellSize, cols, rows]
  );

  // --- DnD handlers ---
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveDragId(active.id as string);
    setDropPreview(null);
  };

  const rafId = useRef<number | null>(null);

  const handleDragMove = ({ active, activatorEvent, delta }: DragMoveEvent) => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const widget = layout.find((w) => w.id === (active.id as string));
      if (!widget || !gridRef.current) return;

      const pointerEvent = activatorEvent as PointerEvent;
      const clientX = pointerEvent.clientX + delta.x;
      const clientY = pointerEvent.clientY + delta.y;
      const snapped = computeSnap(clientX, clientY, widget);
      setDropPreview(snapped);
    });
  };

  const handleDragEnd = ({ active, activatorEvent, delta }: DragEndEvent) => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    const widget = layout.find((w) => w.id === (active.id as string));
    if (widget) {
      const pointerEvent = activatorEvent as PointerEvent;
      const clientX = pointerEvent.clientX + delta.x;
      const clientY = pointerEvent.clientY + delta.y;
      const snapped = gridRef.current ? computeSnap(clientX, clientY, widget) : null;

      if (snapped) {
        const candidate: WidgetLayout = { ...widget, x: snapped.col, y: snapped.row };
        if (isValidPlacement(layout, candidate, cols, rows)) {
          setLayout(layout.map((w) => (w.id === widget.id ? candidate : w)));
        }
        // else: invalid drop — layout unchanged
      }
      // else: dropped outside grid — layout unchanged
    }
    setActiveDragId(null);
    setDropPreview(null);
  };

  // --- Drop preview highlight ---
  const previewIsValid =
    activeWidget && dropPreview
      ? isValidPlacement(
          layout,
          { ...activeWidget, x: dropPreview.col, y: dropPreview.row },
          cols,
          rows
        )
      : null;

  // --- Grid container styles ---
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    position: 'relative',
    outline: activeDragId ? '2px solid #6366f1' : undefined,
  };

  // CSS variable approach for consumers who want to style via CSS
  const cssVars = {
    '--cols': String(cols),
    '--rows': String(rows),
    '--cell-size': `${cellSize}px`,
  } as React.CSSProperties;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div ref={gridRef} style={{ ...gridStyle, ...cssVars }} data-testid="dashboard-grid">
        {/* Background grid lines */}
        <GridLines cols={cols} rows={rows} cellSize={cellSize} />

        {/* Drop preview highlight */}
        {activeWidget && dropPreview && (
          <div
            data-testid="drop-preview"
            style={{
              gridColumn: `${dropPreview.col + 1} / span ${activeWidget.w}`,
              gridRow: `${dropPreview.row + 1} / span ${activeWidget.h}`,
              background: previewIsValid ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        {/* Widgets */}
        {layout.map((w) => (
          <DraggableWidget
            key={w.id}
            id={w.id} x={w.x} y={w.y} w={w.w} h={w.h}
            type={w.type}
            config={w.config}
            onConfigChange={(newConfig) => {
              setLayout(layout.map((item) =>
                item.id === w.id ? { ...item, config: { ...item.config, ...newConfig } } : item
              ));
            }}
          />
        ))}
      </div>

      {/* Floating drag overlay */}
      <DragOverlay
        style={{ transition: activeDragId ? undefined : 'transform 200ms ease' }}
      >
        {activeWidget ? (
          <div
            style={{
              width: activeWidget.w * cellSize,
              height: activeWidget.h * cellSize,
              background: 'rgba(99,102,241,0.8)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {activeWidget.id}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// GridLines — purely visual background grid
// ---------------------------------------------------------------------------
function GridLines({ cols, rows, cellSize }: { cols: number; rows: number; cellSize: number }) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: cols * cellSize,
        height: rows * cellSize,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      data-testid="grid-lines"
    >
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={rows * cellSize}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={i * cellSize}
          x2={cols * cellSize}
          y2={i * cellSize}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function detectConflict(layout: WidgetLayout[], cols: number, rows: number): boolean {
  const occupied = new Set<string>();
  for (const w of layout) {
    if (w.x < 0 || w.y < 0 || w.x + w.w > cols || w.y + w.h > rows) return true;
    for (let c = w.x; c < w.x + w.w; c++) {
      for (let r = w.y; r < w.y + w.h; r++) {
        const key = `${c},${r}`;
        if (occupied.has(key)) return true;
        occupied.add(key);
      }
    }
  }
  return false;
}
