import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DndContext, DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core';
import type { LayoutItem } from '../src/types';
import { DraggableWidget } from '../src/components/DraggableWidget';
import { cellToPixel, pixelToCell, clampToGrid } from '../src/utils/grid';
import { detectOverlap } from '../src/utils/collision';

// Inline dashboard for the fixture — renders widgets with their IDs as labels
const COLS = 6;
const ROWS = 6;
const CELL = 100;

const INITIAL_LAYOUT: LayoutItem[] = [
  { id: 'widget-A', x: 0, y: 0, w: 2, h: 2 },
  { id: 'widget-B', x: 3, y: 0, w: 1, h: 1 },
  { id: 'widget-C', x: 0, y: 3, w: 1, h: 1 },
];

const COLORS: Record<string, string> = {
  'widget-A': '#dbeafe',
  'widget-B': '#dcfce7',
  'widget-C': '#fef9c3',
};

function FixtureDashboard() {
  const [layout, setLayout] = useState<LayoutItem[]>(INITIAL_LAYOUT);
  const [log, setLog] = useState<string[]>([]);
  const [dropZone, setDropZone] = useState<{ x: number; y: number; w: number; h: number; valid: boolean } | null>(null);
  const preDrag = React.useRef<LayoutItem | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const getItem = (id: string) => layout.find((i) => i.id === id) ?? null;

  const handleDragStart = (e: DragStartEvent) => {
    const item = getItem(String(e.active.id));
    if (item) preDrag.current = { ...item };
  };

  const handleDragMove = (e: DragMoveEvent) => {
    const item = getItem(String(e.active.id));
    if (!item || !preDrag.current || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const px = (e.activatorEvent as PointerEvent).clientX + e.delta.x - rect.left;
    const py = (e.activatorEvent as PointerEvent).clientY + e.delta.y - rect.top;
    const { x, y } = pixelToCell(px, py, CELL);
    const clamped = clampToGrid(x, y, item.w, item.h, COLS, ROWS);
    const candidate: LayoutItem = { ...item, x: clamped.x, y: clamped.y };
    const valid = !detectOverlap(candidate, layout, item.id);
    setDropZone({ x: clamped.x, y: clamped.y, w: item.w, h: item.h, valid });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setDropZone(null);
    const item = getItem(String(e.active.id));
    if (!item || !preDrag.current || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const px = (e.activatorEvent as PointerEvent).clientX + e.delta.x - rect.left;
    const py = (e.activatorEvent as PointerEvent).clientY + e.delta.y - rect.top;
    const { x, y } = pixelToCell(px, py, CELL);
    const clamped = clampToGrid(x, y, item.w, item.h, COLS, ROWS);
    const candidate: LayoutItem = { ...item, x: clamped.x, y: clamped.y };
    if (detectOverlap(candidate, layout, item.id)) { preDrag.current = null; return; }
    const newLayout = layout.map((l) => l.id === item.id ? { ...l, x: clamped.x, y: clamped.y } : l);
    setLayout(newLayout);
    const entry = newLayout.map((i) => `${i.id}:(${i.x},${i.y},${i.w}×${i.h})`).join(' ');
    setLog((prev) => [entry, ...prev.slice(0, 4)]);
    preDrag.current = null;
  };

  const handleResize = (id: string, w: number, h: number) => {
    const newLayout = layout.map((l) => l.id === id ? { ...l, w, h } : l);
    setLayout(newLayout);
    const entry = newLayout.map((i) => `${i.id}:(${i.x},${i.y},${i.w}×${i.h})`).join(' ');
    setLog((prev) => [entry, ...prev.slice(0, 4)]);
  };

  return (
    <div>
      <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
        <div
          ref={gridRef}
          style={{
            position: 'relative',
            width: COLS * CELL,
            height: ROWS * CELL,
            backgroundSize: `${CELL}px ${CELL}px`,
            backgroundImage: 'linear-gradient(to right,#e5e7eb 1px,transparent 1px),linear-gradient(to bottom,#e5e7eb 1px,transparent 1px)',
          }}
        >
          {dropZone && (
            <div
              className={dropZone.valid ? 'drop-zone-valid' : 'drop-zone-invalid'}
              style={{
                position: 'absolute',
                left: cellToPixel(dropZone.x, dropZone.y, CELL).px,
                top: cellToPixel(dropZone.x, dropZone.y, CELL).py,
                width: dropZone.w * CELL,
                height: dropZone.h * CELL,
                backgroundColor: dropZone.valid ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
                border: `2px dashed ${dropZone.valid ? '#22c55e' : '#ef4444'}`,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}
          {layout.map((item) => {
            const { px, py } = cellToPixel(item.x, item.y, CELL);
            return (
              <DraggableWidget
                key={item.id}
                item={item}
                cellSize={CELL}
                layout={layout}
                cols={COLS}
                rows={ROWS}
                onResize={(w, h) => handleResize(item.id, w, h)}
                style={{ position: 'absolute', left: px, top: py, width: item.w * CELL, height: item.h * CELL }}
              >
                <div style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#374151',
                  background: COLORS[item.id] ?? '#f9fafb', userSelect: 'none', pointerEvents: 'none',
                }}>
                  {item.id}
                </div>
              </DraggableWidget>
            );
          })}
        </div>
      </DndContext>
      <div data-testid="layout-log" style={{ marginTop: 20, fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <div style={{ margin: 20, fontFamily: 'sans-serif' }}>
    <h2 style={{ color: '#374151', marginBottom: 16 }}>Dashboard — Drag & Drop Fixture</h2>
    <FixtureDashboard />
  </div>
);
