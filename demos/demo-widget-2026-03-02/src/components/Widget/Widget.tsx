import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GridConfig, DashboardWidget } from '../../types';
import { ResizeHandle } from './ResizeHandle';
import { useDashboard } from '../../context/DashboardContext';

export interface WidgetProps {
  widget: DashboardWidget;
  gridConfig: GridConfig;
  isEditMode: boolean;
  onMove?: (widgetId: string, position: { x: number; y: number }) => void;
  onResize?: (widgetId: string, size: { width: number; height: number }) => void;
}

export interface WidgetProps {
  widget: DashboardWidget;
  gridConfig: GridConfig;
  isEditMode: boolean;
  onMove?: (widgetId: string, position: { x: number; y: number }) => void;
  onResize?: (widgetId: string, size: { width: number; height: number }) => void;
}

export const Widget: React.FC<WidgetProps> = ({
  widget,
  gridConfig,
  isEditMode,
  onMove,
  onResize,
}) => {
  const { id, position, size, type, locked } = widget;
  const [isResizing, setIsResizing] = useState(false);
  const { getWidgetComponent } = useDashboard();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { widget, type: 'widget' },
    disabled: !isEditMode || locked,
  });

  const widgetStyle: React.CSSProperties = {
    gridColumn: `${position.x + 1} / span ${size.width}`,
    gridRow: `${position.y + 1} / span ${size.height}`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleResize = (newSize: { width: number; height: number }) => {
    if (onResize) {
      onResize(id, newSize);
    }
  };

  const WidgetComponent = getWidgetComponent(type);

  return (
    <div
      ref={setNodeRef}
      className={`widget ${isEditMode ? 'widget--editable' : ''} ${
        isDragging ? 'widget--dragging' : ''
      } ${locked ? 'widget--locked' : ''}`}
      style={widgetStyle}
    >
      {isEditMode && !locked && (
        <div
          className="widget-header"
          {...listeners}
          {...attributes}
        >
          <span className="widget-title">{type}</span>
          <div className="widget-controls">
            <button className="widget-control" aria-label="Drag widget">
              ⋮⋮
            </button>
          </div>
        </div>
      )}

      <div className="widget-content">
        {WidgetComponent ? (
          <WidgetComponent widget={widget} />
        ) : (
          <div className="widget-error">Widget type "{type}" not found</div>
        )}
      </div>

      {isEditMode && !locked && (
        <>
          <ResizeHandle
            position="bottom-right"
            gridConfig={gridConfig}
            currentSize={size}
            onResize={handleResize}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            position="bottom"
            gridConfig={gridConfig}
            currentSize={size}
            onResize={handleResize}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
          <ResizeHandle
            position="right"
            gridConfig={gridConfig}
            currentSize={size}
            onResize={handleResize}
            onResizeStart={() => setIsResizing(true)}
            onResizeEnd={() => setIsResizing(false)}
          />
        </>
      )}
    </div>
  );
};