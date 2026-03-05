import React from 'react';
import { useDrag } from 'react-dnd';
import { Widget } from '../types/widget';

interface DraggableWidgetProps {
  widget: Widget;
  children: React.ReactNode;
  onMove: (id: string, position: { x: number; y: number }) => void;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  children,
  onMove
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'widget',
    item: {
      id: widget.id,
      type: 'widget',
      position: widget.position,
      size: widget.size,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: widget.draggable !== false,
  }), [widget]);

  const opacity = isDragging ? 0.5 : 1;
  const cursor = widget.draggable !== false ? 'move' : 'default';

  return (
    <div
      ref={drag}
      style={{
        opacity,
        cursor,
        width: '100%',
        height: '100%',
      }}
      role={widget.draggable !== false ? 'button' : undefined}
      aria-label={widget.draggable !== false ? `Drag ${widget.title}` : undefined}
    >
      {children}
    </div>
  );
};