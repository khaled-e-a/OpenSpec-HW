import React, { useRef, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { DashboardLayout, WidgetLayout } from '../types';
import type { WidgetDefinition } from '../types';
import { CELL_WIDTH_PX, CELL_HEIGHT_PX, GRID_COLS, WIDGET_REGISTRY } from '../constants';
import { isValidPlacement } from '../utils/placement';
import { pointerToGridCoords, rafThrottle } from '../utils/snapGrid';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { Widget } from './Widget';
import { DropPreview } from './DropPreview';

interface DashboardGridProps {
  layout?: DashboardLayout;
  widgets?: WidgetDefinition[];
  onCommit?: (newLayout: DashboardLayout) => void;
}

interface SnapTarget {
  col: number;
  row: number;
  w: number;
  h: number;
  isValid: boolean;
}

interface ResizePreviewState {
  id: string;
  w: number;
  h: number;
  isValid: boolean;
}

/**
 * Main dashboard grid component.
 *
 * UC1-S1, UC1-S6: drag start/end via @dnd-kit DndContext
 * UC1-S2: DragOverlay renders ghost copy
 * UC1-S3, UC1-S5: DropPreview updated via onDragMove
 * UC1-S7: snap committed to layout on valid drop
 * UC1-E3a1/E3a2: red preview + drop rejected on collision
 * UC1-E6a1/E6a2: onDragCancel/invalid drop = no layout mutation
 * UC1-E6b1/E6b3: Escape key via @dnd-kit onDragCancel
 * UC1-E6b2: cancel animation via CSS transition on Widget
 * UC2-S1–S6: resize handled inside Widget with callbacks here
 * UC3-S3/S4: widgets rendered at saved positions from layout prop
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  layout: layoutProp,
  widgets: widgetsProp,
  onCommit: onCommitProp,
}) => {
  const {
    layout: hookLayout,
    commitLayout: hookCommitLayout,
    addWidget,
    removeWidget,
  } = useDashboardLayout();

  // Use props if provided (for backwards compat / testing), otherwise use hook state
  const layout = layoutProp ?? hookLayout;
  const widgets = widgetsProp ?? WIDGET_REGISTRY;
  const onCommit = onCommitProp ?? hookCommitLayout;

  const gridRef = useRef<HTMLDivElement>(null);

  // Active drag state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [snapTarget, setSnapTarget] = useState<SnapTarget | null>(null);

  // Resize preview state
  const [resizePreview, setResizePreview] = useState<ResizePreviewState | null>(null);

  // Catalogue state
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Compute available widgets (not currently in layout)
  const availableWidgets = WIDGET_REGISTRY.filter(
    (w) => !layout.some((l) => l.id === w.id)
  );

  const handleAddWidget = (widgetId: string) => {
    setAddError(null);
    const success = addWidget(widgetId);
    if (success) {
      setIsCatalogueOpen(false);
    } else {
      setAddError('Not enough space to add this widget.');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const getWidgetLayout = useCallback(
    (id: string): WidgetLayout | undefined => layout.find((l) => l.id === id),
    [layout]
  );

  // UC1-S1, UC1-S2: drag started — record active widget
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
    setSnapTarget(null);
  }, []);

  // UC1-S3, UC1-S4, UC1-S5, UC1-E3a1: update snap preview on every drag move
  const handleDragMove = useCallback(
    rafThrottle((event: DragMoveEvent) => {
      const id = String(event.active.id);
      const widgetLayout = layout.find((l) => l.id === id);
      if (!widgetLayout || !gridRef.current) return;

      // @dnd-kit provides the pointer position via activatorEvent + delta
      const activatorEvent = event.activatorEvent as PointerEvent;
      const pointerX = activatorEvent.clientX + event.delta.x;
      const pointerY = activatorEvent.clientY + event.delta.y;

      const gridRect = gridRef.current.getBoundingClientRect();
      const { col, row } = pointerToGridCoords(
        pointerX,
        pointerY,
        gridRect,
        widgetLayout.w,
        widgetLayout.h
      );

      const candidate: WidgetLayout = { ...widgetLayout, col, row };
      const isValid = isValidPlacement(layout, candidate, id);

      setSnapTarget({ col, row, w: widgetLayout.w, h: widgetLayout.h, isValid });
    }),
    [layout]
  );

  // UC1-S6, UC1-S7, UC1-E3a2, UC1-E6a1, UC1-E6a2: drop handler
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      setSnapTarget(null);

      const id = String(event.active.id);
      const widgetLayout = layout.find((l) => l.id === id);

      // UC1-E6a1/E6a2: out-of-bounds or no valid target — no mutation
      if (!widgetLayout || !snapTarget) return;
      if (!snapTarget.isValid) return; // UC1-E3a2

      const newEntry: WidgetLayout = {
        ...widgetLayout,
        col: snapTarget.col,
        row: snapTarget.row,
      };
      const newLayout = layout.map((l) => (l.id === id ? newEntry : l));

      // UC1-S7: update layout state; UC1-S8: persist (handled in hook via onCommit)
      onCommit(newLayout);
    },
    [layout, snapTarget, onCommit]
  );

  // UC1-E6b1, UC1-E6b3: Escape key — cancel without mutation
  const handleDragCancel = useCallback(() => {
    setActiveDragId(null);
    setSnapTarget(null);
  }, []);

  // UC2-S5, UC2-S6, UC2-S7: resize confirmed
  const handleResizeCommit = useCallback(
    (id: string, w: number, h: number) => {
      setResizePreview(null);
      const newLayout = layout.map((l) => (l.id === id ? { ...l, w, h } : l));
      onCommit(newLayout);
    },
    [layout, onCommit]
  );

  // UC2-S3, UC2-E4a2: resize preview update
  const handleResizePreview = useCallback(
    (id: string, w: number, h: number, isValid: boolean) => {
      setResizePreview({ id, w, h, isValid });
    },
    []
  );

  // UC2-E5a1, UC2-E5a2: resize cancelled — clear preview without mutating
  const handleResizeEnd = useCallback(() => {
    setResizePreview(null);
  }, []);

  const gridWidth = GRID_COLS * CELL_WIDTH_PX;
  const gridRows = Math.max(...layout.map((l) => l.row + l.h), 6);
  const gridHeight = gridRows * CELL_HEIGHT_PX;

  const activeWidget = activeDragId
    ? widgets.find((w) => w.id === activeDragId)
    : null;
  const activeWidgetLayout = activeDragId ? getWidgetLayout(activeDragId) : null;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Dashboard header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', marginBottom: 8 }}>
        <button
          onClick={() => { setIsCatalogueOpen((o) => !o); setAddError(null); }}
          style={{
            padding: '6px 14px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
          aria-label="Add widget"
        >
          + Add widget
        </button>
      </div>

      {/* Widget catalogue panel */}
      {isCatalogueOpen && (
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            maxWidth: 400,
          }}
          data-testid="widget-catalogue"
        >
          <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 10, fontSize: 14 }}>
            Add a widget
          </div>
          {availableWidgets.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              All widgets are already on the dashboard.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {availableWidgets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => handleAddWidget(w.id)}
                  style={{
                    padding: '8px 12px',
                    background: '#0f172a',
                    color: '#f1f5f9',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 13,
                  }}
                  data-testid={`catalogue-item-${w.id}`}
                >
                  {w.title}
                </button>
              ))}
            </div>
          )}
          {addError && (
            <div style={{ color: '#f87171', fontSize: 13, marginTop: 8 }} role="alert">
              {addError}
            </div>
          )}
        </div>
      )}

      {/* Existing dashboard grid — keep exactly as is */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Grid container — UC3-S3: widgets rendered at saved positions */}
        <div
          ref={gridRef}
          style={{
            position: 'relative',
            width: gridWidth,
            height: gridHeight,
            background: 'repeating-linear-gradient(0deg, #1e293b 0px, #1e293b 79px, #334155 79px, #334155 80px), repeating-linear-gradient(90deg, #1e293b 0px, #1e293b 79px, #334155 79px, #334155 80px)',
            borderRadius: 12,
            overflow: 'visible',
          }}
          data-testid="dashboard-grid"
        >
          {widgets.map((widgetDef) => {
            const wLayout = layout.find((l) => l.id === widgetDef.id);
            if (!wLayout) return null;

            // Apply resize preview if active
            const displayLayout =
              resizePreview && resizePreview.id === widgetDef.id
                ? { ...wLayout, w: resizePreview.w, h: resizePreview.h }
                : wLayout;

            return (
              <Widget
                key={widgetDef.id}
                definition={widgetDef}
                layout={displayLayout}
                isDragging={activeDragId === widgetDef.id}
                onResizeCommit={handleResizeCommit}
                onResizePreview={handleResizePreview}
                onResizeEnd={handleResizeEnd}
                onRemove={() => removeWidget(wLayout.id)}
                allLayout={layout}
              />
            );
          })}

          {/* UC1-S3, UC1-S5, UC1-E3a1: snap preview overlay */}
          {snapTarget && (
            <DropPreview
              col={snapTarget.col}
              row={snapTarget.row}
              w={snapTarget.w}
              h={snapTarget.h}
              isValid={snapTarget.isValid}
            />
          )}

          {/* UC2-S3, UC2-E4a2: resize preview overlay */}
          {resizePreview && !activeDragId && (() => {
            const wLayout = layout.find((l) => l.id === resizePreview.id);
            if (!wLayout) return null;
            return (
              <DropPreview
                col={wLayout.col}
                row={wLayout.row}
                w={resizePreview.w}
                h={resizePreview.h}
                isValid={resizePreview.isValid}
              />
            );
          })()}
        </div>

        {/* UC1-S2, UC1-E6b2: drag ghost overlay */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
          {activeWidget && activeWidgetLayout ? (
            <div
              style={{
                width: activeWidgetLayout.w * CELL_WIDTH_PX,
                height: activeWidgetLayout.h * CELL_HEIGHT_PX,
                backgroundColor: '#1e293b',
                border: '2px solid #60a5fa',
                borderRadius: 10,
                opacity: 0.85,
                display: 'flex',
                flexDirection: 'column',
                padding: '12px 16px',
                color: '#f1f5f9',
                fontFamily: 'system-ui, sans-serif',
                gap: 8,
                boxSizing: 'border-box',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: '#94a3b8' }}>
                {activeWidget.title}
              </div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{activeWidget.content}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
