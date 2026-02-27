import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Component, type ReactNode } from 'react';
import type { LayoutItem } from '../types';
import { WidgetRegistry } from '../registry/WidgetRegistry';
import { itemToPixelRect } from '../utils/geometry';
import { useGridContext } from './GridContext';
import { ResizeHandle } from './ResizeHandle';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface WidgetWrapperProps {
  item: LayoutItem;
  isDragging: boolean;
  onRemove: (id: string) => void;
}

export function WidgetWrapper({ item, isDragging, onRemove }: WidgetWrapperProps) {
  const { colWidth, rowHeight } = useGridContext();
  const rect = itemToPixelRect(item, colWidth, rowHeight);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style: React.CSSProperties = {
    position: 'absolute',
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Translate.toString(transform),
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    background: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
  };

  const entry = WidgetRegistry.get(item.type);
  const WidgetComponent = entry?.component;

  return (
    <div ref={setNodeRef} style={style} data-testid={`widget-${item.id}`}>
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        style={{
          padding: '4px 8px',
          background: '#f0f0f0',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
        data-testid={`drag-handle-${item.id}`}
      >
        <span style={{ fontSize: 12, color: '#666' }}>⠿ {entry?.displayName ?? item.type}</span>
        <button
          onClick={() => onRemove(item.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            padding: '0 2px',
            color: '#999',
          }}
          aria-label={`Remove ${entry?.displayName ?? item.type}`}
          data-testid={`remove-btn-${item.id}`}
        >
          ×
        </button>
      </div>

      {/* Widget content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        <ErrorBoundary fallback={<div style={{ color: 'red' }}>Widget "{item.type}" not found</div>}>
          {WidgetComponent ? <WidgetComponent item={item} /> : <div>Unknown widget: {item.type}</div>}
        </ErrorBoundary>
      </div>

      {/* Resize handle */}
      {item.resizable !== false && <ResizeHandle itemId={item.id} />}
    </div>
  );
}
