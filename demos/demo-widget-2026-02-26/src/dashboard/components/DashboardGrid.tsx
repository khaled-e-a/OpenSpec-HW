import { DndContext, type DragEndEvent, type DragCancelEvent, type DragMoveEvent, type DragStartEvent } from '@dnd-kit/core';
import { useState, useRef, useEffect, useMemo } from 'react';
import type { LayoutItem } from '../types';
import { GridCanvas } from './GridCanvas';
import { WidgetWrapper } from './WidgetWrapper';
import { DragGhost } from './DragGhost';
import { snapToGrid, snapToSize } from '../utils/snap';
import { hasAnyOverlap } from '../utils/collision';
import { pushDown, findFirstAvailablePosition } from '../utils/layout';
import { WidgetPalette } from './WidgetPalette';
import { WidgetRegistry } from '../registry/WidgetRegistry';
import { ResizeGhost } from './ResizeGhost';
import { itemToPixelRect } from '../utils/geometry';

interface DashboardGridProps {
  layout: LayoutItem[];
  columns?: number;
  rowHeight?: number;
  onLayoutChange: (layout: LayoutItem[]) => void;
}

export function DashboardGrid({
  layout,
  columns: columnsProp = 12,
  rowHeight: rowHeightProp = 80,
  onLayoutChange,
}: DashboardGridProps) {
  const columns = Number.isInteger(columnsProp) && columnsProp > 0
    ? columnsProp
    : (() => { console.warn('[DashboardGrid] invalid columns prop, defaulting to 12'); return 12; })();

  const rowHeight = typeof rowHeightProp === 'number' && rowHeightProp > 0
    ? rowHeightProp
    : (() => { console.warn('[DashboardGrid] invalid rowHeight prop, defaulting to 80'); return 80; })();

  // Measure container width here so drag handlers can access colWidth
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, []);

  const colWidth = useMemo(
    () => (containerWidth > 0 && columns > 0 ? containerWidth / columns : 0),
    [containerWidth, columns],
  );

  // Interaction state
  const [activeItem, setActiveItem] = useState<LayoutItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<LayoutItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizePreview, setResizePreview] = useState<{ w: number; h: number } | null>(null);

  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type?: string; itemId?: string; item?: LayoutItem } | undefined;
    if (data?.type === 'resize') {
      const item = layout.find((i) => i.id === data.itemId);
      if (item) {
        setResizingId(item.id);
        setResizePreview({ w: item.w, h: item.h });
      }
    } else {
      const item = layout.find((i) => i.id === String(event.active.id));
      setActiveItem(item ?? null);
    }
  }

  function handleDragMove(event: DragMoveEvent) {
    const data = event.active.data.current as { type?: string; itemId?: string } | undefined;
    if (data?.type === 'resize' && resizingId && colWidth > 0) {
      const item = layout.find((i) => i.id === resizingId);
      if (!item) return;
      const candidate = snapToSize(
        event.delta.x,
        event.delta.y,
        colWidth,
        rowHeight,
        item,
        columns,
      );
      setResizePreview({ w: Math.max(candidate.w, 1), h: Math.max(candidate.h, 1) });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const data = event.active.data.current as { type?: string; itemId?: string } | undefined;

    if (data?.type === 'resize') {
      const itemId = resizingId;
      setResizingId(null);
      if (!itemId || !resizePreview) { setResizePreview(null); return; }
      const item = layout.find((i) => i.id === itemId);
      if (!item) { setResizePreview(null); return; }

      const resized: LayoutItem = { ...item, ...resizePreview };
      const newLayout = pushDown(
        layout.map((i) => (i.id === itemId ? resized : i)),
        resized,
      );

      if (newLayout === null) {
        showNotification('Cannot resize: not enough space to push displaced widgets');
      } else {
        onLayoutChange(newLayout);
      }
      setResizePreview(null);
      return;
    }

    // Drag-to-move commit
    setActiveItem(null);
    const dragged = layout.find((i) => i.id === String(event.active.id));
    if (!dragged || colWidth === 0) return;

    const originRect = itemToPixelRect(dragged, colWidth, rowHeight);
    const snapped = snapToGrid(
      originRect.left + event.delta.x,
      originRect.top + event.delta.y,
      colWidth,
      rowHeight,
      dragged,
      columns,
    );

    const candidate: LayoutItem = { ...dragged, ...snapped };
    const others = layout.filter((i) => i.id !== dragged.id);

    if (!hasAnyOverlap(candidate, others)) {
      onLayoutChange(layout.map((i) => (i.id === dragged.id ? candidate : i)));
    }
  }

  function handleDragCancel(_event: DragCancelEvent) {
    setActiveItem(null);
    setResizingId(null);
    setResizePreview(null);
  }

  function handleAddWidget(type: string) {
    const entry = WidgetRegistry.get(type);
    if (!entry) { showNotification(`Unknown widget type: ${type}`); return; }
    const pos = findFirstAvailablePosition(layout, entry.defaultSize, columns);
    if (!pos) { showNotification('Dashboard is full — remove a widget first'); return; }
    const newItem: LayoutItem = {
      id: crypto.randomUUID(),
      type,
      x: pos.x,
      y: pos.y,
      w: entry.defaultSize.w,
      h: entry.defaultSize.h,
    };
    onLayoutChange([...layout, newItem]);
  }

  function handleRemoveRequest(id: string) {
    setRemoveTarget(layout.find((i) => i.id === id) ?? null);
  }

  function confirmRemove() {
    if (!removeTarget) return;
    onLayoutChange(layout.filter((i) => i.id !== removeTarget.id));
    setRemoveTarget(null);
  }

  const resizingItem = resizingId ? layout.find((i) => i.id === resizingId) : null;
  const resizePreviewPx = resizingItem && resizePreview && colWidth > 0
    ? { width: resizePreview.w * colWidth, height: resizePreview.h * rowHeight }
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notification && (
        <div role="alert" style={{ padding: '8px 12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 4, fontSize: 14 }}>
          {notification}
        </div>
      )}

      <WidgetPalette onAdd={handleAddWidget} />

      <DndContext
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div ref={containerRef} style={{ width: '100%' }}>
          <GridCanvas colWidth={colWidth} columns={columns} rowHeight={rowHeight} layout={layout}>
            {layout.map((item) => (
              <div key={item.id}>
                <WidgetWrapper
                  item={item}
                  isDragging={activeItem?.id === item.id}
                  onRemove={handleRemoveRequest}
                />
                {resizingId === item.id && resizePreviewPx && (
                  <ResizeGhost
                    width={resizePreviewPx.width}
                    height={resizePreviewPx.height}
                  />
                )}
              </div>
            ))}
            <DragGhost layout={layout} activeItem={activeItem} colWidth={colWidth} />
          </GridCanvas>
        </div>
      </DndContext>

      {removeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300 }}>
            <p>Remove <strong>{WidgetRegistry.get(removeTarget.type)?.displayName ?? removeTarget.type}</strong>?</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setRemoveTarget(null)}>Cancel</button>
              <button
                onClick={confirmRemove}
                style={{ background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}
                data-testid="confirm-remove"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
