// DashboardGrid.tsx
// UC1-S1..S8, UC1-E1a, UC1-E3a, UC1-E6a, UC1-E6b: Full drag-and-drop lifecycle
// UC2-S1..S4, UC2-E1a, UC2-E2a, UC2-E2b: Layout persistence and restoration

import { useState, useRef, useCallback, type CSSProperties, type ReactNode } from 'react';
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
import { GridDropZone } from './GridDropZone';
import { useLayoutPersistence } from '../utils/useLayoutPersistence';
import { isValidPlacement, pointerToCell } from '../utils/gridGeometry';
import type { WidgetLayout, WidgetDefinition } from '../utils/widgetTypes';

export interface DashboardGridProps {
  widgets: WidgetDefinition[];
  defaultLayout: WidgetLayout[];
  cols: number;
  rows: number;
  cellSize?: number;
  storageKey: string;
  renderWidget: (def: WidgetDefinition) => ReactNode;
}

export function DashboardGrid({
  widgets,
  defaultLayout,
  cols,
  rows,
  cellSize = 100,
  storageKey,
  renderWidget,
}: DashboardGridProps) {
  // UC2-S1..S4, UC2-E1a/E2a/E2b: layout state backed by localStorage
  const { layout, saveLayout } = useLayoutPersistence(
    storageKey,
    defaultLayout,
    widgets,
    cols,
    rows
  );

  // UC1-S2, UC1-S7: track which widget is being dragged
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  // UC1-S4, UC1-E3a: snap target cell during drag
  const [snapTarget, setSnapTarget] = useState<{ col: number; row: number } | null>(null);
  // UC1-E6a, UC1-E6b: whether current snap target is invalid
  const [isConflict, setIsConflict] = useState(false);

  // UC5-S3: ref for reading grid bounding rect in snap calculations
  const gridRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // UC1-S1: drag initiated
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
    setSnapTarget(null);
    setIsConflict(false);
  }, []);

  // UC1-S3, UC1-S4, UC1-E3a, UC1-E6a, UC1-E6b: update snap target on move
  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (!gridRef.current || !activeDragId) return;

      const activeWidget = layout.find((w) => w.widgetId === activeDragId);
      if (!activeWidget) return;

      const gridRect = gridRef.current.getBoundingClientRect();
      const pointerX = event.activatorEvent instanceof PointerEvent
        ? event.activatorEvent.clientX + event.delta.x
        : 0;
      const pointerY = event.activatorEvent instanceof PointerEvent
        ? event.activatorEvent.clientY + event.delta.y
        : 0;

      // UC1-S4: snap to nearest cell, UC1-E3a: clamped within bounds
      const snapped = pointerToCell(
        pointerX,
        pointerY,
        gridRect,
        cellSize,
        activeWidget.w,
        activeWidget.h,
        cols,
        rows
      );

      setSnapTarget(snapped);

      // UC1-E6a, UC1-E6b: check if target is valid
      const valid = isValidPlacement(
        layout,
        activeDragId,
        snapped.col,
        snapped.row,
        activeWidget.w,
        activeWidget.h,
        cols,
        rows
      );
      setIsConflict(!valid);
    },
    [activeDragId, layout, cellSize, cols, rows]
  );

  // UC1-S5, UC1-S6, UC1-S7, UC1-S8, UC1-E6a, UC1-E6b: commit or discard drop
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const draggedId = String(event.active.id);
      const activeWidget = layout.find((w) => w.widgetId === draggedId);

      if (activeWidget && snapTarget) {
        const valid = isValidPlacement(
          layout,
          draggedId,
          snapTarget.col,
          snapTarget.row,
          activeWidget.w,
          activeWidget.h,
          cols,
          rows
        );

        if (valid) {
          // UC1-S7: place widget at new position
          const newLayout = layout.map((w) =>
            w.widgetId === draggedId
              ? { ...w, col: snapTarget.col, row: snapTarget.row }
              : w
          );
          // UC1-S8: persist to localStorage
          saveLayout(newLayout);
        }
        // UC1-E6a/E6b: invalid drop — widget stays at original position (no state change)
      }

      // Clean up drag state
      setActiveDragId(null);
      setSnapTarget(null);
      setIsConflict(false);
    },
    [layout, snapTarget, cols, rows, saveLayout]
  );

  // UC1-E1a: cancel drag — no state change to layout
  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    setSnapTarget(null);
    setIsConflict(false);
  }, []);

  const activeWidget = activeDragId
    ? layout.find((w) => w.widgetId === activeDragId)
    : null;
  const activeDef = activeDragId
    ? widgets.find((d) => d.id === activeDragId)
    : null;

  // UC1-S2, UC1-E6a: overlay style — elevated + conflict tint
  const overlayStyle: CSSProperties = {
    opacity: 0.9,
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    transform: 'scale(1.04)',
    width: activeWidget ? activeWidget.w * cellSize : cellSize,
    height: activeWidget ? activeWidget.h * cellSize : cellSize,
    // UC7.2: red tint on conflict
    background: isConflict ? 'rgba(220,50,50,0.25)' : undefined,
    border: isConflict ? '2px solid rgba(220,50,50,0.7)' : undefined,
    borderRadius: 4,
    pointerEvents: 'none',
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <GridDropZone cols={cols} rows={rows} cellSize={cellSize} containerRef={gridRef}>
        {layout.map((entry) => {
          const def = widgets.find((d) => d.id === entry.widgetId);
          if (!def) return null;
          return (
            <DraggableWidget key={entry.widgetId} layout={entry}>
              {renderWidget(def)}
            </DraggableWidget>
          );
        })}
      </GridDropZone>

      {/* UC1-S2, UC1-S7, UC1-E6a: DragOverlay renders clone above all content */}
      <DragOverlay>
        {activeDef ? (
          <div style={overlayStyle}>{renderWidget(activeDef)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
