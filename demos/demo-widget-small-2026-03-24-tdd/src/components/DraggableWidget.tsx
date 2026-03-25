// DraggableWidget.tsx
// UC2-S3, UC2-S4: Renders a widget at the correct grid position and span.
// UC1-S1: Widget is draggable via useDraggable.
// UC1-S2: Shows dimmed placeholder while drag is active.
// UC2-S6, UC3-S6, UC4-S6, UC5-S6: Renders WidgetContent for typed widgets.

import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import type { WidgetType, WidgetConfig } from '../utils/gridGeometry';
import { WidgetContent } from './WidgetContent';

export interface DraggableWidgetProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type?: WidgetType;
  config?: WidgetConfig;
  onConfigChange?: (config: WidgetConfig) => void;
  'aria-label'?: string;
}

export function DraggableWidget({
  id, x, y, w, h,
  type, config, onConfigChange,
  'aria-label': ariaLabel,
}: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  const style: CSSProperties = {
    gridColumn: `${x + 1} / span ${w}`,
    gridRow: `${y + 1} / span ${h}`,
    opacity: isDragging ? 0.3 : 1,
    cursor: 'grab',
    boxSizing: 'border-box',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`widget-${id}`}
      data-widget-id={id}
      aria-label={ariaLabel ?? `Widget ${id}`}
      {...listeners}
      {...attributes}
    >
      <WidgetContent
        type={type}
        config={config ?? {}}
        onConfigChange={onConfigChange ?? (() => {})}
      />
    </div>
  );
}
