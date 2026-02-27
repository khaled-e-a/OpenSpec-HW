import { useDraggable } from '@dnd-kit/core';

interface ResizeHandleProps {
  itemId: string;
}

export function ResizeHandle({ itemId }: ResizeHandleProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `resize-${itemId}`,
    data: { type: 'resize', itemId },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        cursor: 'se-resize',
        background: 'rgba(0,0,0,0.15)',
        borderTopLeftRadius: 4,
        zIndex: 1,
      }}
      data-testid={`resize-handle-${itemId}`}
      aria-label="Resize widget"
    />
  );
}
