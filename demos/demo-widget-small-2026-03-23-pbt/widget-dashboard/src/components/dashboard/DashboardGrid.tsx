import React, { useCallback, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import {
  snapAndClamp,
  buildOccupancyGrid,
  findNearestFreeCell,
  gravityReflow,
} from '../../utils/gridUtils';
import Widget from './Widget';
import WidgetSlot from './WidgetSlot';
import DropCellGrid from './DropCellGrid';
import WidgetPicker from './WidgetPicker';
import UndoToast from './UndoToast';

interface DashboardGridProps {
  columns?: number;
  rows?: number;
  cellSize?: number;
}

const GRID_COLS = 12;
const GRID_ROWS = 8;

// Tasks 4.1–4.9
const DashboardGrid: React.FC<DashboardGridProps> = ({
  columns = GRID_COLS,
  rows = GRID_ROWS,
  cellSize = 80,
}) => {
  // Task 7.1 — destructure widgetSettings and updateWidgetSettings (UC6-S2, UC6-S8)
  const { layout, widgetTypes, widgetSettings, moveWidget, resizeWidget, addWidget, removeWidget, undoRemove, updateWidgetSettings, showUndoToast } =
    useDashboardLayout();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number }>({ col: 0, row: 0 });
  const [conflictFlash, setConflictFlash] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const dragOriginRef = useRef<{ col: number; row: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Task 4.2 — sensors with 5px activation threshold (UC1-S1)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { distance: 5 } })
  );

  // Task 4.3 — record origin on drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    const widget = layout[id];
    if (widget) {
      dragOriginRef.current = { col: widget.col, row: widget.row };
      setHoverCell({ col: widget.col, row: widget.row });
    }
  }, [layout]);

  // Task 4.4 — compute hovered cell from delta
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const id = event.active.id as string;
    const widget = layout[id];
    if (!widget || !dragOriginRef.current) return;
    const deltaCol = event.delta.x / cellSize;
    const deltaRow = event.delta.y / cellSize;
    const rawCol = dragOriginRef.current.col + deltaCol;
    const rawRow = dragOriginRef.current.row + deltaRow;
    const snapped = snapAndClamp(rawCol, rawRow, widget.w, widget.h, columns, rows);
    setHoverCell(snapped);
  }, [layout, cellSize, columns, rows]);

  // Task 4.5 — commit drop with snap + reflow; or revert
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const id = event.active.id as string;
    const widget = layout[id];
    if (!widget || !dragOriginRef.current) { setActiveId(null); return; }

    const deltaCol = event.delta.x / cellSize;
    const deltaRow = event.delta.y / cellSize;
    const rawCol = dragOriginRef.current.col + deltaCol;
    const rawRow = dragOriginRef.current.row + deltaRow;
    const snapped = snapAndClamp(rawCol, rawRow, widget.w, widget.h, columns, rows);

    const occupancy = buildOccupancyGrid(layout, columns, rows, id);
    const target = findNearestFreeCell(occupancy, snapped.col, snapped.row, widget.w, widget.h, columns, rows);

    if (!target) {
      // UC1-E6a — no valid cell, flash conflict and cancel
      setConflictFlash(true);
      setTimeout(() => setConflictFlash(false), 400);
      setActiveId(null);
      dragOriginRef.current = null;
      return;
    }

    moveWidget(id, target.col, target.row);
    setActiveId(null);
    dragOriginRef.current = null;
  }, [layout, cellSize, columns, rows, moveWidget]);

  // Task 4.6 — cancel: return to origin
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    dragOriginRef.current = null;
  }, []);

  // Resize handler — wraps hook commit, returns success for feedback
  const handleResize = useCallback((id: string, w: number, h: number): boolean => {
    const widget = layout[id];
    if (!widget) return false;
    const updated = { ...layout, [id]: { ...widget, w, h } };
    const reflowed = gravityReflow(updated, id, columns, rows);
    if (!reflowed) return false;
    resizeWidget(id, w, h);
    return true;
  }, [layout, columns, rows, resizeWidget]);

  const activeWidget = activeId ? layout[activeId] : null;
  const activeType   = activeId ? widgetTypes[activeId] : null;
  const occupancyForHighlight = activeId
    ? buildOccupancyGrid(layout, columns, rows, activeId)
    : [];

  return (
    <div style={{ position: 'relative' }}>
      {/* Dashboard toolbar */}
      <div className="dashboard-toolbar">
        <span className="dashboard-toolbar__title">My Dashboard</span>
        <button
          className="dashboard-toolbar__add"
          onClick={() => setPickerOpen(true)}
          type="button"
        >
          + Add Widget
        </button>
      </div>

      {/* Widget picker (tasks 8.x) */}
      {pickerOpen && (
        <WidgetPicker
          onAdd={addWidget}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Task 4.1 — CSS Grid container */}
        <div
          ref={gridRef}
          className="dashboard-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            position: 'relative',
            width: columns * cellSize,
            height: rows * cellSize,
          }}
        >
          {/* Task 4.7 — drop zone highlight overlay (only during drag) */}
          {activeId && activeWidget && (
            <DropCellGrid
              columns={columns}
              rows={rows}
              cellSize={cellSize}
              hoverCol={hoverCell.col}
              hoverRow={hoverCell.row}
              widgetW={activeWidget.w}
              widgetH={activeWidget.h}
              occupancy={occupancyForHighlight}
              conflictFlash={conflictFlash}
            />
          )}

          {/* Task 4.9 — render each widget in a WidgetSlot */}
          {/* Task 7.2 — pass settings and onSettingsChange (UC6-S4–S7) */}
          {Object.values(layout).map(entry => (
            <WidgetSlot key={entry.id} col={entry.col} row={entry.row} w={entry.w} h={entry.h}>
              <Widget
                id={entry.id}
                type={widgetTypes[entry.id] ?? ''}
                w={entry.w}
                h={entry.h}
                cellSize={cellSize}
                gridCols={columns}
                gridRows={rows}
                onRemove={removeWidget}
                onResize={handleResize}
                settings={widgetSettings[entry.id]}
                onSettingsChange={(s) => updateWidgetSettings(entry.id, s)}
              />
            </WidgetSlot>
          ))}
        </div>

        {/* Task 4.8 — DragOverlay clone */}
        <DragOverlay>
          {activeId && activeWidget && activeType && (
            <Widget
              id={activeId}
              type={activeType}
              w={activeWidget.w}
              h={activeWidget.h}
              cellSize={cellSize}
              gridCols={columns}
              gridRows={rows}
              onRemove={() => {}}
              onResize={() => false}
              isOverlay
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Undo toast (tasks 9.2–9.5) */}
      <UndoToast
        visible={showUndoToast}
        onUndo={undoRemove}
        onDismiss={undoRemove}
      />
    </div>
  );
};

export default DashboardGrid;
