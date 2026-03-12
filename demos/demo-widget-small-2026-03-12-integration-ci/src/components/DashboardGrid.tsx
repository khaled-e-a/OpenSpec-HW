import React, { useState, useCallback, useRef } from 'react';
import { DndContext, DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core';
import type { LayoutItem } from '../types';
import { pixelToCell, cellToPixel, clampToGrid } from '../utils/grid';
import { detectOverlap } from '../utils/collision';
import { DraggableWidget } from './DraggableWidget';

interface DashboardGridProps {
  layout: LayoutItem[];
  onLayoutChange: (layout: LayoutItem[]) => void;
  cols: number;
  rows: number;
  cellSize: number;
  children?: React.ReactNode;
}

interface DropZoneState {
  x: number;
  y: number;
  w: number;
  h: number;
  valid: boolean;
}

// Task 4.1 — DashboardGrid renders a CSS-grid container with absolute-positioned widgets
export function DashboardGrid({
  layout,
  onLayoutChange,
  cols,
  rows,
  cellSize,
  children,
}: DashboardGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Task 4.4 — record pre-drag position for cancel restore (UC1-S1, UC1-E5b)
  const preDragRef = useRef<LayoutItem | null>(null);

  // Task 4.5 / 4.7 — drop zone highlight state (UC1-S4, UC1-E5a)
  const [dropZone, setDropZone] = useState<DropZoneState | null>(null);

  const getDraggingItem = useCallback(
    (id: string) => layout.find((item) => item.id === id) ?? null,
    [layout],
  );

  // Task 4.3 / 4.4 — DndContext onDragStart (UC1-S1)
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = getDraggingItem(String(event.active.id));
      if (item) preDragRef.current = { ...item };
    },
    [getDraggingItem],
  );

  // Task 4.5 — DndContext onDragMove: compute candidate, check collision, update highlight (UC1-S3, UC1-S4, UC1-E5a)
  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const item = getDraggingItem(String(event.active.id));
      if (!item || !preDragRef.current || !gridRef.current) return;

      const gridRect = gridRef.current.getBoundingClientRect();
      const pointerX = (event.activatorEvent as PointerEvent).clientX + event.delta.x - gridRect.left;
      const pointerY = (event.activatorEvent as PointerEvent).clientY + event.delta.y - gridRect.top;

      const { x, y } = pixelToCell(pointerX, pointerY, cellSize);
      const clamped = clampToGrid(x, y, item.w, item.h, cols, rows);
      const candidate: LayoutItem = { ...item, x: clamped.x, y: clamped.y };
      const valid = !detectOverlap(candidate, layout, item.id);

      setDropZone({ x: clamped.x, y: clamped.y, w: item.w, h: item.h, valid });
    },
    [getDraggingItem, layout, cols, rows, cellSize],
  );

  // Task 4.6 — DndContext onDragEnd: snap and commit or restore (UC1-S5, UC1-S6, UC1-S7, UC1-E5b)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDropZone(null);
      const item = getDraggingItem(String(event.active.id));
      if (!item || !preDragRef.current || !gridRef.current) return;

      if (event.over == null && !event.delta.x && !event.delta.y) {
        // Cancelled with no movement — no change needed
        preDragRef.current = null;
        return;
      }

      const gridRect = gridRef.current.getBoundingClientRect();
      const pointerX = (event.activatorEvent as PointerEvent).clientX + event.delta.x - gridRect.left;
      const pointerY = (event.activatorEvent as PointerEvent).clientY + event.delta.y - gridRect.top;

      const { x, y } = pixelToCell(pointerX, pointerY, cellSize);
      const clamped = clampToGrid(x, y, item.w, item.h, cols, rows);
      const candidate: LayoutItem = { ...item, x: clamped.x, y: clamped.y };

      if (detectOverlap(candidate, layout, item.id)) {
        // Invalid drop — UC1-E5b: restore original (no state change needed, layout unchanged)
        preDragRef.current = null;
        return;
      }

      const newLayout = layout.map((l) =>
        l.id === item.id ? { ...l, x: clamped.x, y: clamped.y } : l,
      );
      onLayoutChange(newLayout);
      preDragRef.current = null;
    },
    [getDraggingItem, layout, cols, rows, cellSize, onLayoutChange],
  );

  const gridPixelWidth = cols * cellSize;
  const gridPixelHeight = rows * cellSize;

  return (
    // Task 4.3 — DndContext wrapping the grid
    <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div
        ref={gridRef}
        style={{
          position: 'relative',
          width: gridPixelWidth,
          height: gridPixelHeight,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          backgroundImage:
            'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
        }}
      >
        {/* Task 4.7 — Drop zone overlay (UC1-S4, UC1-E5a) */}
        {dropZone && (
          <div
            className={dropZone.valid ? 'drop-zone-valid' : 'drop-zone-invalid'}
            style={{
              position: 'absolute',
              left: cellToPixel(dropZone.x, dropZone.y, cellSize).px,
              top: cellToPixel(dropZone.x, dropZone.y, cellSize).py,
              width: dropZone.w * cellSize,
              height: dropZone.h * cellSize,
              backgroundColor: dropZone.valid ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
              border: `2px dashed ${dropZone.valid ? '#22c55e' : '#ef4444'}`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {/* Task 4.2 — Render each LayoutItem at its computed pixel position */}
        {layout.map((item) => {
          const { px, py } = cellToPixel(item.x, item.y, cellSize);
          return (
            <DraggableWidget
              key={item.id}
              item={item}
              cellSize={cellSize}
              onResize={(newW, newH) => {
                const newLayout = layout.map((l) =>
                  l.id === item.id ? { ...l, w: newW, h: newH } : l,
                );
                onLayoutChange(newLayout);
              }}
              style={{
                position: 'absolute',
                left: px,
                top: py,
                width: item.w * cellSize,
                height: item.h * cellSize,
              }}
            >
              {children}
            </DraggableWidget>
          );
        })}
      </div>
    </DndContext>
  );
}
