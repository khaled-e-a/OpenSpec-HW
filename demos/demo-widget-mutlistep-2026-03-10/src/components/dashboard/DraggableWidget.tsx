import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { WidgetLayout } from './types';
import { useDashboardContext } from './DashboardGrid';
import { WidgetSettings } from './WidgetSettings';
import { WidgetContent } from './WidgetContent';

interface DraggableWidgetProps extends WidgetLayout {
  children: React.ReactNode;
  /** Called when the user clicks the remove (×) button. UC3-S1 */
  onRemove?: () => void;
  /** Called to update widget configuration (type, imageDataUrl, fileText, fileLabel, webpageUrl). */
  onConfigChange?: (updates: Partial<WidgetLayout>) => void;
}

/**
 * Wraps a child widget and makes it draggable within a DashboardGrid.
 * Also renders a remove button (UC3) and a resize handle (UC2).
 *
 * Implements: UC1-S1 — recognises press/hold as drag start
 * Implements: UC1-S2 — visual lift (opacity, z-index) during drag
 * Implements: UC1-S8 — positioned at its current grid cell via CSS grid
 * Implements: UC2-S1 — resize handle activates resize mode via DashboardContext
 * Implements: UC3-S1 — × button triggers onRemove without initiating drag
 */
export function DraggableWidget({ id, col, row, w, h, type, children, onRemove, onConfigChange }: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { col, row, w, h, type, onConfigChange },
  });

  // UC2-S1: get startResize from DashboardGrid via context
  const { startResize } = useDashboardContext();

  // UC1-S1: settings panel state
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  return (
    <div
      ref={setNodeRef}
      data-testid={`widget-${id}`}
      {...attributes}
      {...listeners}
      style={{
        gridColumn: `${col + 1} / span ${w}`,
        gridRow: `${row + 1} / span ${h}`,
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 10 : 'auto',
        touchAction: 'none', // required for @dnd-kit touch sensor
        userSelect: 'none',
        transition: 'opacity 150ms',
        position: 'relative',
      }}
    >
      {onConfigChange ? (
        <WidgetContent layout={{ id, col, row, w, h, type }} onConfigChange={onConfigChange} />
      ) : (
        children || <div>Widget {id}</div>
      )}

      {/* UC3-S1: Remove button — stopPropagation prevents drag activation */}
      {onRemove && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove widget"
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 20,
            height: 20,
            border: 'none',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}

      {/* UC1-S1: Settings toggle button */}
      {onConfigChange && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSettingsOpen(true);
          }}
          aria-label="Widget settings"
          style={{
            position: 'absolute',
            top: 4,
            right: onRemove ? 28 : 4,
            width: 20,
            height: 20,
            border: 'none',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ⚙
        </button>
      )}

      {/* UC2-S1: Resize handle — stopPropagation prevents drag; calls startResize via context */}
      <div
        onPointerDown={(e) => {
          e.stopPropagation();
          startResize(id, e.pointerId, e.clientX, e.clientY);
        }}
        aria-label="Resize widget"
        data-testid={`resize-handle-${id}`}
        style={{
          position: 'absolute',
          bottom: 4,
          right: onRemove ? 28 : 4,
          width: 16,
          height: 16,
          cursor: 'se-resize',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 3,
        }}
      />

      {/* UC1-S2: Settings panel overlay */}
      {settingsOpen && onConfigChange && (
        <WidgetSettings
          currentType={type}
          onConfigChange={onConfigChange}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
