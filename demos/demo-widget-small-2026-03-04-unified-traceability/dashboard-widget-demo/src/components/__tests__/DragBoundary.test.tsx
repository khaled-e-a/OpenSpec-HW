import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DragBoundary from '../DragBoundary';

describe('DragBoundary Component', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
  });

  it('Should show boundary warning when dragging outside', async () => {
    const onBoundaryHit = jest.fn();
    const { container } = render(
      <DragBoundary isDragging={true} onBoundaryHit={onBoundaryHit} />
    );

    // Simulate mouse at top boundary
    fireEvent.mouseMove(document, { clientX: 512, clientY: 10 });

    await waitFor(() => {
      expect(onBoundaryHit).toHaveBeenCalledWith('top');
      const warningElement = container.querySelector('.boundary-warning.top');
      expect(warningElement).toBeInTheDocument();
      expect(warningElement).toHaveTextContent('↑ Move back to dashboard area');
    });
  });

  it('Should detect bottom boundary', async () => {
    const onBoundaryHit = jest.fn();
    render(<DragBoundary isDragging={true} onBoundaryHit={onBoundaryHit} />);

    // Simulate mouse at bottom boundary
    fireEvent.mouseMove(document, { clientX: 512, clientY: 758 });

    await waitFor(() => {
      expect(onBoundaryHit).toHaveBeenCalledWith('bottom');
    });
  });

  it('Should detect left boundary', async () => {
    const onBoundaryHit = jest.fn();
    render(<DragBoundary isDragging={true} onBoundaryHit={onBoundaryHit} />);

    // Simulate mouse at left boundary
    fireEvent.mouseMove(document, { clientX: 10, clientY: 384 });

    await waitFor(() => {
      expect(onBoundaryHit).toHaveBeenCalledWith('left');
    });
  });

  it('Should detect right boundary', async () => {
    const onBoundaryHit = jest.fn();
    render(<DragBoundary isDragging={true} onBoundaryHit={onBoundaryHit} />);

    // Simulate mouse at right boundary
    fireEvent.mouseMove(document, { clientX: 1014, clientY: 384 });

    await waitFor(() => {
      expect(onBoundaryHit).toHaveBeenCalledWith('right');
    });
  });

  it('Should not show warning when not dragging', () => {
    const onBoundaryHit = jest.fn();
    const { container } = render(
      <DragBoundary isDragging={false} onBoundaryHit={onBoundaryHit} />
    );

    fireEvent.mouseMove(document, { clientX: 10, clientY: 10 });

    const warningElement = container.querySelector('.boundary-warning');
    expect(warningElement).not.toBeInTheDocument();
    expect(onBoundaryHit).not.toHaveBeenCalled();
  });
});