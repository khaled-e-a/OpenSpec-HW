import React, { useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Widget, { WidgetProps } from './Widget';
import DragPreview from './DragPreview';
import AnimatedWidget from './AnimatedWidget';
import ShakeAnimation from './ShakeAnimation';

interface DraggableWidgetProps extends WidgetProps {
  index: number;
  hasCollision?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  index,
  hasCollision = false,
  onFocus,
  onBlur,
  isFocused,
  ...widgetProps
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable draggableId={widgetProps.id} index={index}>
      {(provided, snapshot) => (
        <>
          <div
            ref={(el) => {
              provided.innerRef(el);
              widgetRef.current = el;
            }}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`draggable-widget ${snapshot.isDragging ? 'dragging' : ''} ${isFocused ? 'focused' : ''}`}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0 : 1,
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            tabIndex={0}
            role="button"
            aria-label={`Drag ${widgetProps.title} widget`}
            aria-grabbed={snapshot.isDragging}
          >
            <ShakeAnimation isShaking={hasCollision}>
              <AnimatedWidget
                {...widgetProps}
                isDragging={snapshot.isDragging}
                isDropping={!snapshot.isDragging && !!provided.draggableProps.style?.transform}
              />
            </ShakeAnimation>
          </div>
          {snapshot.isDragging && (
            <DragPreview>
              <Widget {...widgetProps} />
            </DragPreview>
          )}
        </>
      )}
    </Draggable>
  );
};

export default DraggableWidget;