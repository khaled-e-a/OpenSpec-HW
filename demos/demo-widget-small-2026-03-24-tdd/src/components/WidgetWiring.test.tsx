import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableWidget } from './DraggableWidget';
import { DndContext } from '@dnd-kit/core';

// ---------------------------------------------------------------------------
// Task 7.1: DraggableWidget renders WidgetContent instead of children
// UC2-S6, UC3-S6, UC4-S6, UC5-S6
// ---------------------------------------------------------------------------

describe('DraggableWidget — WidgetContent rendering (UC2-S6, UC3-S6, UC4-S6)', () => {
  it('renders ClockWidget when type is clock', () => {
    render(
      <DndContext>
        <DraggableWidget id="w1" x={0} y={0} w={1} h={1} type="clock" config={{}} onConfigChange={() => {}} />
      </DndContext>
    );
    expect(screen.getByTestId('clock-display')).toBeInTheDocument();
  });

  it('defaults to ClockWidget when type is undefined', () => {
    render(
      <DndContext>
        <DraggableWidget id="w1" x={0} y={0} w={1} h={1} config={{}} onConfigChange={() => {}} />
      </DndContext>
    );
    expect(screen.getByTestId('clock-display')).toBeInTheDocument();
  });

  it('renders image placeholder when type is image', () => {
    render(
      <DndContext>
        <DraggableWidget id="w2" x={0} y={0} w={1} h={1} type="image" config={{}} onConfigChange={() => {}} />
      </DndContext>
    );
    expect(screen.getByText(/click to choose image/i)).toBeInTheDocument();
  });

  it('renders file placeholder when type is file', () => {
    render(
      <DndContext>
        <DraggableWidget id="w3" x={0} y={0} w={1} h={1} type="file" config={{}} onConfigChange={() => {}} />
      </DndContext>
    );
    expect(screen.getByText(/click to choose file/i)).toBeInTheDocument();
  });

  it('renders webpage placeholder when type is webpage', () => {
    render(
      <DndContext>
        <DraggableWidget id="w4" x={0} y={0} w={1} h={1} type="webpage" config={{}} onConfigChange={() => {}} />
      </DndContext>
    );
    expect(screen.getByText(/enter a url/i)).toBeInTheDocument();
  });
});
