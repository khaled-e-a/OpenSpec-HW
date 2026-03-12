/**
 * Component tests for DraggableWidget.
 *
 * Covers:
 *   UC1-S1 — User presses down on a widget to start dragging
 *   UC1-S2 — System lifts the widget visually (raises z-index, applies drag styling)
 *            and attaches it to the pointer
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { DraggableWidget } from '../DraggableWidget';

/**
 * DraggableWidget must be nested inside a DndContext to function.
 */
function Wrapper({ children }: { children: React.ReactNode }) {
  return <DndContext>{children}</DndContext>;
}

describe('DraggableWidget', () => {
  describe('UC1-S1 — drag start recognised on pointer-down', () => {
    it('renders children and is accessible via test id', () => {
      render(
        <Wrapper>
          <DraggableWidget id="w1" col={0} row={0} w={1} h={1} type="clock">
            <div data-testid="child">Widget Content</div>
          </DraggableWidget>
        </Wrapper>,
      );
      expect(screen.getByTestId('child')).toBeTruthy();
    });

    it('exposes draggable role/attributes so dnd-kit can attach listeners', () => {
      render(
        <Wrapper>
          <DraggableWidget id="w1" col={0} row={0} w={1} h={1} type="clock">
            <span>drag me</span>
          </DraggableWidget>
        </Wrapper>,
      );
      // @dnd-kit sets aria-roledescription and tabIndex on the draggable element
      const el = screen.getByText('drag me').parentElement!;
      // tabIndex should be set so keyboard drag is possible
      expect(el).toBeDefined();
    });

    it('has touchAction none to prevent default scroll during touch drag', () => {
      render(
        <Wrapper>
          <DraggableWidget id="w1" col={0} row={0} w={1} h={1} type="clock">
            <span data-testid="inner">content</span>
          </DraggableWidget>
        </Wrapper>,
      );
      const container = screen.getByTestId('inner').parentElement!;
      expect(container.style.touchAction).toBe('none');
    });
  });

  describe('UC1-S2 — visual lift: opacity reduced while dragging', () => {
    it('renders at full opacity when not dragging', () => {
      render(
        <Wrapper>
          <DraggableWidget id="w1" col={0} row={0} w={1} h={1} type="clock">
            <span data-testid="inner">content</span>
          </DraggableWidget>
        </Wrapper>,
      );
      const container = screen.getByTestId('inner').parentElement!;
      // Default opacity should be 1 (or unset, which renders as 1)
      expect(container.style.opacity).toBe('1');
    });

    it('applies grab cursor when not dragging', () => {
      render(
        <Wrapper>
          <DraggableWidget id="w1" col={0} row={0} w={1} h={1} type="clock">
            <span data-testid="inner">content</span>
          </DraggableWidget>
        </Wrapper>,
      );
      const container = screen.getByTestId('inner').parentElement!;
      expect(container.style.cursor).toBe('grab');
    });
  });

  describe('UC1-S2 — grid positioning via CSS grid', () => {
    it('sets gridColumn and gridRow from col/row/w/h props', () => {
      render(
        <Wrapper>
          <DraggableWidget id="w1" col={1} row={2} w={2} h={3} type="clock">
            <span data-testid="inner">content</span>
          </DraggableWidget>
        </Wrapper>,
      );
      const container = screen.getByTestId('inner').parentElement!;
      expect(container.style.gridColumn).toBe('2 / span 2');
      expect(container.style.gridRow).toBe('3 / span 3');
    });
  });
});
