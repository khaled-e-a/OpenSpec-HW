import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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

// ---------------------------------------------------------------------------
// Context — lets DraggableWidget call startResize without prop-drilling
// ---------------------------------------------------------------------------

interface DashboardContextValue {
  /** Called by the resize handle inside DraggableWidget. UC2-S1 */
  startResize: (widgetId: string, pointerId: number, startX: number, startY: number) => void;
}

export const DashboardContext = createContext<DashboardContextValue>({
  startResize: () => {},
});

export function useDashboardContext() {
  return useContext(DashboardContext);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DashboardGridProps {
  /** Current widget layout */
  layout: WidgetLayout[];
  /** Total number of grid columns */
  cols: number;
  /** Total number of grid rows */
  rows: number;
  /** Height of each row in pixels */
  rowHeight?: number;
  /** Called with updated layout after a successful drop or resize */
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

interface ResizeState {
  widgetId: string;
  originCol: number;
  originRow: number;
  originW: number;
  originH: number;
  startX: number;
  startY: number;
}

/**
 * Dashboard grid container that provides drag-and-drop via @dnd-kit/core
 * and pointer-event–based resize.
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
 * Implements: UC2-S1  — startResize provided via DashboardContext
 * Implements: UC2-S2  — resizeState + ghost initialised on resize start
 * Implements: UC2-S3  — pointermove updates candidate w/h
 * Implements: UC2-S4  — ghost snapped to whole cells
 * Implements: UC2-S5  — isValidDrop validates candidate on every move
 * Implements: UC2-S6  — ghost isValid prop drives visual feedback
 * Implements: UC2-S7  — pointerup triggers final validation
 * Implements: UC2-S8  — final isValidDrop check on pointerup
 * Implements: UC2-S9  — valid resize calls onLayoutChange with new w/h
 * Implements: UC2-S10 — resizeState + ghost cleared after commit
 * Implements: UC2-E3a — w/h clamped to minimum 1
 * Implements: UC2-E5a — invalid ghost shown on collision/bounds fail
 * Implements: UC2-E7a — invalid pointerup clears state without commit
 * Implements: UC2-E7b — Escape clears resize state without commit
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
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const activeWidget = activeId ? layout.find((w) => w.id === activeId) : null;

  // -------------------------------------------------------------------------
  // Drag ghost helpers (existing logic)
  // -------------------------------------------------------------------------

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
        const newLayout = layout.map((w) =>
          w.id === dragged.id ? { ...w, col: ghost.col, row: ghost.row } : w,
        );
        onLayoutChange(newLayout);
      }
      setActiveId(null);
      setGhost(null);
    },
    [layout, ghost, onLayoutChange],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setGhost(null);
  }, []);

  // -------------------------------------------------------------------------
  // Resize logic — UC2
  // -------------------------------------------------------------------------

  // UC2-S1 / UC2-S2: enter resize mode (provided to children via context)
  const startResize = useCallback(
    (widgetId: string, _pointerId: number, startX: number, startY: number) => {
      // UC2-S1 guard: do not start resize if drag is already active
      if (activeId !== null) return;

      const widget = layout.find((w) => w.id === widgetId);
      if (!widget) return;

      setResizeState({
        widgetId,
        originCol: widget.col,
        originRow: widget.row,
        originW: widget.w,
        originH: widget.h,
        startX,
        startY,
      });

      // UC2-S2: show ghost at current size
      setGhost({
        col: widget.col,
        row: widget.row,
        w: widget.w,
        h: widget.h,
        isValid: true,
        visible: true,
      });
    },
    [activeId, layout],
  );

  // UC2-S3/S4/S5/S6/E3a/E5a: pointermove updates candidate size
  useEffect(() => {
    if (!resizeState) return;

    const gridRect = gridRef.current?.getBoundingClientRect();

    function onPointerMove(e: PointerEvent) {
      if (!resizeState || !gridRect) return;

      const cellWidth = gridRect.width / cols;
      const cellHeight = rowHeight;

      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;

      // Snap delta to whole grid cells
      const deltaCol = Math.round(deltaX / cellWidth);
      const deltaRow = Math.round(deltaY / cellHeight);

      // UC2-E3a: clamp to minimum 1×1
      const candidateW = Math.max(1, resizeState.originW + deltaCol);
      const candidateH = Math.max(1, resizeState.originH + deltaRow);

      // UC2-S5: validate bounds + collision
      const valid = isValidDrop(
        { col: resizeState.originCol, row: resizeState.originRow, w: candidateW, h: candidateH },
        layout,
        cols,
        rows,
        resizeState.widgetId,
      );

      // UC2-S6: update ghost with validity
      setGhost({
        col: resizeState.originCol,
        row: resizeState.originRow,
        w: candidateW,
        h: candidateH,
        isValid: valid,
        visible: true,
      });
    }

    // UC2-S7/S8/S9/S10/E7a: pointerup commits or cancels
    function onPointerUp() {
      setResizeState(null);
      setGhost((prev) => {
        if (prev && prev.isValid) {
          // UC2-S9: commit — update layout via onLayoutChange
          onLayoutChange(
            layout.map((w) =>
              w.id === resizeState!.widgetId ? { ...w, w: prev.w, h: prev.h } : w,
            ),
          );
        }
        // UC2-S10 / UC2-E7a: clear ghost regardless
        return null;
      });
    }

    // UC2-E7b: Escape cancels resize
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setResizeState(null);
        setGhost(null);
      }
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [resizeState, layout, cols, rows, rowHeight, onLayoutChange]);

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------

  const contextValue: DashboardContextValue = { startResize };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <DashboardContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={gridRef}
          data-testid="dashboard-grid"
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
    </DashboardContext.Provider>
  );
}
