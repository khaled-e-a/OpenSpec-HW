import React, { useRef, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { DashboardLayout, WidgetLayout } from '../types';
import { CELL_WIDTH_PX, CELL_HEIGHT_PX } from '../constants';
import { isValidPlacement } from '../utils/placement';
import { rafThrottle } from '../utils/snapGrid';

interface WidgetProps {
  definition: { id: string; title: string; content?: string };
  layout: WidgetLayout;
  isDragging: boolean;
  onResizeCommit: (id: string, w: number, h: number) => void;
  onResizePreview: (id: string, w: number, h: number, valid: boolean) => void;
  onResizeEnd: () => void;
  allLayout: DashboardLayout;
  onRemove?: () => void;
}

/**
 * Individual dashboard widget with drag handle and resize handle.
 *
 * UC1-S1, UC1-S4: drag initiation via @dnd-kit useDraggable
 * UC1-S2: original slot shown at reduced opacity while dragging
 * UC1-E6b2: CSS transition for cancel animation
 * UC2-S1: resize handle appears on hover
 * UC2-S2, UC2-S4: pointer-capture resize interaction
 */
export const Widget: React.FC<WidgetProps> = ({
  definition,
  layout,
  isDragging,
  onResizeCommit,
  onResizePreview,
  onResizeEnd,
  allLayout,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: definition.id,
  });

  // Resize state
  const resizeOriginRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const widgetStyle: React.CSSProperties = {
    position: 'absolute',
    left: layout.col * CELL_WIDTH_PX,
    top: layout.row * CELL_HEIGHT_PX,
    width: layout.w * CELL_WIDTH_PX,
    height: layout.h * CELL_HEIGHT_PX,
    // UC1-S2: reduced opacity on original slot while dragging
    opacity: isDragging ? 0.3 : 1,
    // UC1-E6b2: animate back to original position on cancel
    transition: isDragging ? 'none' : 'opacity 200ms ease-out, transform 200ms ease-out',
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    boxSizing: 'border-box',
  };

  // Throttled pointer move handler for resize (UC1-S5, UC2-S3)
  const handlePointerMove = rafThrottle((e: PointerEvent) => {
    if (!resizeOriginRef.current) return;
    const { x, y, w: startW, h: startH } = resizeOriginRef.current;
    const deltaX = e.clientX - x;
    const deltaY = e.clientY - y;

    const newW = Math.max(1, Math.round((startW * CELL_WIDTH_PX + deltaX) / CELL_WIDTH_PX));
    const newH = Math.max(1, Math.round((startH * CELL_HEIGHT_PX + deltaY) / CELL_HEIGHT_PX));

    const candidate = { ...layout, w: newW, h: newH };
    const valid = isValidPlacement(allLayout, candidate, layout.id);

    // UC2-S3, UC2-E4a2: update preview (capped at valid size implicitly)
    onResizePreview(layout.id, newW, newH, valid);
  });

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeOriginRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: layout.w,
      h: layout.h,
    };
    setIsResizing(true);

    const onMove = (ev: PointerEvent) => handlePointerMove(ev);
    const onUp = (ev: PointerEvent) => {
      if (!resizeOriginRef.current) return;
      const { x, y, w: startW, h: startH } = resizeOriginRef.current;
      const deltaX = ev.clientX - x;
      const deltaY = ev.clientY - y;

      const newW = Math.max(1, Math.round((startW * CELL_WIDTH_PX + deltaX) / CELL_WIDTH_PX));
      const newH = Math.max(1, Math.round((startH * CELL_HEIGHT_PX + deltaY) / CELL_HEIGHT_PX));
      const candidate = { ...layout, w: newW, h: newH };
      const valid = isValidPlacement(allLayout, candidate, layout.id);

      if (valid) {
        // UC2-S5, UC2-S6: commit the new size
        onResizeCommit(layout.id, newW, newH);
      } else {
        // UC2-E5a1, UC2-E5a2: revert — don't call onResizeCommit
        onResizeEnd();
      }

      resizeOriginRef.current = null;
      setIsResizing(false);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={setNodeRef}
      style={widgetStyle}
      data-testid={`widget-${definition.id}`}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 10,
          padding: '12px 16px',
          color: '#f1f5f9',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
        }}
        {...listeners}
        {...attributes}
      >
        <div style={{ fontWeight: 600, fontSize: 13, color: '#94a3b8' }}>
          {definition.title}
        </div>
        <div style={{ fontWeight: 700, fontSize: 20 }}>{definition.content}</div>

        {/* UC2-S1: resize handle — visible on hover via CSS */}
        <div
          className="resize-handle"
          onPointerDown={handleResizePointerDown}
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            width: 16,
            height: 16,
            cursor: isResizing ? 'se-resize' : 'se-resize',
            opacity: 0,
            transition: 'opacity 150ms',
            borderRight: '3px solid #60a5fa',
            borderBottom: '3px solid #60a5fa',
            borderRadius: '0 0 4px 0',
          }}
          aria-label="Resize widget"
        />

        {/* UC2-S1: remove button — visible on hover */}
        <div
          className="remove-handle"
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 20,
            height: 20,
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 150ms',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
            fontWeight: 700,
            fontSize: 14,
            lineHeight: 1,
            borderRadius: 4,
          }}
          aria-label="Remove widget"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onRemove?.(); } }}
        >
          ×
        </div>
      </div>

      {/* Global CSS for hover reveal of resize handle and remove handle */}
      <style>{`
        [data-testid="${`widget-${definition.id}`}"]:hover .resize-handle {
          opacity: 1 !important;
        }
        [data-testid="${`widget-${definition.id}`}"]:hover .remove-handle {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
