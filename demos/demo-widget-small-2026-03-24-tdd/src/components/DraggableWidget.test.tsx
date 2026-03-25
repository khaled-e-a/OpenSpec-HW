import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { DraggableWidget } from './DraggableWidget';

// Wrap in DndContext as useDraggable requires it
function Wrapper({ children }: { children: React.ReactNode }) {
  return <DndContext>{children}</DndContext>;
}

// ---------------------------------------------------------------------------
// UC2-S3: Widget rendered with correct grid-column / grid-row styles
// ---------------------------------------------------------------------------
describe('DraggableWidget — grid placement', () => {
  it('UC2-S3: applies correct gridColumn and gridRow styles', () => {
    render(
      <Wrapper>
        <DraggableWidget id="w1" x={1} y={2} w={2} h={1} />
      </Wrapper>
    );
    const el = screen.getByTestId('widget-w1');
    expect(el.style.gridColumn).toBe('2 / span 2');
    expect(el.style.gridRow).toBe('3 / span 1');
  });

  it('UC2-S3: x=0, y=0 maps to gridColumn 1 and gridRow 1', () => {
    render(
      <Wrapper>
        <DraggableWidget id="origin" x={0} y={0} w={1} h={1} />
      </Wrapper>
    );
    const el = screen.getByTestId('widget-origin');
    expect(el.style.gridColumn).toBe('1 / span 1');
    expect(el.style.gridRow).toBe('1 / span 1');
  });
});

// ---------------------------------------------------------------------------
// UC1-S1: Widget is draggable — has data-widget-id and aria-label
// UC1-S1 (Task 6.5): aria-label satisfies @dnd-kit accessibility requirements
// ---------------------------------------------------------------------------
describe('DraggableWidget — accessibility (UC1-S1, Task 6.5)', () => {
  it('UC1-S1: has data-widget-id attribute', () => {
    render(
      <Wrapper>
        <DraggableWidget id="acc" x={0} y={0} w={1} h={1} />
      </Wrapper>
    );
    expect(screen.getByTestId('widget-acc')).toHaveAttribute('data-widget-id', 'acc');
  });

  it('Task 6.5: has aria-label defaulting to "Widget <id>"', () => {
    render(
      <Wrapper>
        <DraggableWidget id="sales" x={0} y={0} w={1} h={1} />
      </Wrapper>
    );
    expect(screen.getByTestId('widget-sales')).toHaveAttribute('aria-label', 'Widget sales');
  });

  it('Task 6.5: aria-label can be overridden via prop', () => {
    render(
      <Wrapper>
        <DraggableWidget id="x" x={0} y={0} w={1} h={1} aria-label="Sales dashboard widget" />
      </Wrapper>
    );
    expect(screen.getByTestId('widget-x')).toHaveAttribute('aria-label', 'Sales dashboard widget');
  });
});
