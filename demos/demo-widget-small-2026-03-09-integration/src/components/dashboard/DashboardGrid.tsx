import React, { useCallback, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { WidgetLayout } from './types';
import { GhostWidget } from './GhostWidget';
import { pointerToCell, isPointerInsideGrid } from './utils/gridCoords';
import { isValidDrop } from './utils/collision';

interface DashboardGridProps {
  /** Current widget layout */
  layout: WidgetLayout[];
  /** Total number of grid columns */
  cols: number;
  /** Total number of grid rows */
  rows: number;
  /** Height of each row in pixels */
  rowHeight?: number;
  /** Called with updated layout after a successful drop */
  onLayoutChange: (layout: WidgetLayout[]) => void;
  children: React.ReactNode;
}

interface GhostState {
  col: number;
  row: number;
  w: number;
  h: number;
  isValid: boolean;
  visible: boolean;
}

/**
 * Dashboard grid container that provides drag-and-drop via @dnd-kit/core.
 *
 * Implements: UC1-S1  — DndContext + sensors detect drag start
 * Implements: UC1-S2  — DragOverlay renders lifted clone
 * Implements: UC1-S3  — GhostWidget snapped to nearest grid cell
 * Implements: UC1-S4  — pointer movement drives ghost updates
 * Implements: UC1-S5  — ghost clamped within grid bounds
 * Implements: UC1-S6  — drag end triggers validation
 * Implements: UC1-S7  — isValidDrop checks collision + bounds
 * Implements: UC1-S8  — valid drop calls onLayoutChange
 * Implements: UC1-S9  — DragOverlay unmounts after drop/cancel
 * Implements: UC1-E1a — TouchSensor handles touch events
 * Implements: UC1-E3a — GhostWidget shows invalid state
 * Implements: UC1-E6a — outside-grid release cancels drag
 * Implements: UC1-E7a — collision → cancel, widget returns
 * Implements: UC1-E7b — out-of-bounds → cancel, widget returns
 * Implements: UC1-Ea  — KeyboardSensor fires onDragCancel on Escape
 */
export function DashboardGrid({
  layout,
  cols,
  rows,
  rowHeight = 120,
  onLayoutChange,
  children,
}: DashboardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<GhostState | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    // Require a 100ms hold before touch drag starts (avoids conflicting with scroll)
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const activeWidget = activeId ? layout.find((w) => w.id === activeId) : null;

  const updateGhost = useCallback(
    (pointerX: number, pointerY: number, dragged: WidgetLayout) => {
      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect) return;

      const inside = isPointerInsideGrid(pointerX, pointerY, gridRect);
      if (!inside) {
        setGhost((prev) => prev ? { ...prev, visible: false } : null);
        return;
      }

      const cellWidth = gridRect.width / cols;
      const cellHeight = rowHeight;

      const { col, row } = pointerToCell(
        pointerX,
        pointerY,
        gridRect,
        cellWidth,
        cellHeight,
        dragged.w,
        dragged.h,
        cols,
        rows,
      );

      const valid = isValidDrop(
        { col, row, w: dragged.w, h: dragged.h },
        layout,
        cols,
        rows,
        dragged.id,
      );

      setGhost({ col, row, w: dragged.w, h: dragged.h, isValid: valid, visible: true });
    },
    [cols, rows, rowHeight, layout],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const dragged = layout.find((w) => w.id === event.active.id);
      if (!dragged) return;
      const { x, y } = event.activatorEvent as PointerEvent | MouseEvent | TouchEvent & { clientX: number; clientY: number };
      // @dnd-kit's activatorEvent gives the initial coordinates; use delta for current position
      const pointer = event.activatorEvent as PointerEvent;
      const currentX = pointer.clientX + event.delta.x;
      const currentY = pointer.clientY + event.delta.y;
      updateGhost(currentX, currentY, dragged);
    },
    [layout, updateGhost],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const dragged = layout.find((w) => w.id === event.active.id);

      if (dragged && ghost?.visible && ghost.isValid) {
        // Valid drop — commit layout change
        const newLayout = layout.map((w) =>
          w.id === dragged.id ? { ...w, col: ghost.col, row: ghost.row } : w,
        );
        onLayoutChange(newLayout);
      }
      // Clear all drag state (covers UC1-S9, UC1-E6a, UC1-E7a, UC1-E7b)
      setActiveId(null);
      setGhost(null);
    },
    [layout, ghost, onLayoutChange],
  );

  const handleDragCancel = useCallback(() => {
    // UC1-Ea: Escape key or external cancel — widget returns to original position
    setActiveId(null);
    setGhost(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
          position: 'relative',
          width: '100%',
        }}
      >
        {ghost && (
          <GhostWidget
            col={ghost.col}
            row={ghost.row}
            w={ghost.w}
            h={ghost.h}
            isValid={ghost.isValid}
            visible={ghost.visible}
          />
        )}
        {children}
      </div>

      {/* UC1-S2: Drag overlay clone follows pointer */}
      <DragOverlay>
        {activeWidget ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.85,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              borderRadius: 8,
              cursor: 'grabbing',
              background: 'rgba(255,255,255,0.9)',
            }}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
