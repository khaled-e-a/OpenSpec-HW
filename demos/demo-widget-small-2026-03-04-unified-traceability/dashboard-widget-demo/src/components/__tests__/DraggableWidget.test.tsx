import React from 'react';
import { render } from '@testing-library/react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import '@testing-library/jest-dom';
import DraggableWidget from '../DraggableWidget';

describe('DraggableWidget Component', () => {
  it('Should handle mouse down event on widget', () => {
    const { container } = render(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="test">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <DraggableWidget
                id="test-widget"
                index={0}
                title="Test Widget"
                size="medium"
              >
                <div>Widget Content</div>
              </DraggableWidget>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );

    const draggableElement = container.querySelector('.draggable-widget');
    expect(draggableElement).toHaveAttribute('aria-label', 'Drag Test Widget widget');
    expect(draggableElement).toHaveAttribute('role', 'button');
    expect(draggableElement).toHaveAttribute('tabIndex', '0');
  });

  it('Should apply correct ARIA attributes for accessibility', () => {
    const { container } = render(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="test">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <DraggableWidget
                id="test-widget"
                index={0}
                title="Test Widget"
                size="medium"
                isFocused={true}
              >
                <div>Widget Content</div>
              </DraggableWidget>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );

    const draggableElement = container.querySelector('.draggable-widget');
    expect(draggableElement).toHaveClass('focused');
    expect(draggableElement).toHaveAttribute('aria-grabbed', 'false');
  });

  it('Should render widget content correctly', () => {
    const { getByText } = render(
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="test">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <DraggableWidget
                id="test-widget"
                index={0}
                title="Test Widget"
                size="medium"
              >
                <div>Test Content</div>
              </DraggableWidget>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );

    expect(getByText('Test Widget')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();
  });
});