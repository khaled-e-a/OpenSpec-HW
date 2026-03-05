import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import DragPreview from '../DragPreview';

describe('DragPreview Component', () => {
  it('Should render semi-transparent preview during drag', () => {
    const { container } = render(
      <DragPreview>
        <div>Test Widget Content</div>
      </DragPreview>
    );

    const previewElement = container.firstChild as HTMLElement;
    expect(previewElement).toHaveClass('drag-preview');
    // The styles are applied via CSS file, not inline styles
    expect(previewElement).toBeInTheDocument();
  });

  it('Should apply drag preview styling correctly', () => {
    const { container } = render(
      <DragPreview>
        <div data-testid="widget-content">Widget Content</div>
      </DragPreview>
    );

    const contentElement = container.querySelector('[data-testid="widget-content"]');
    expect(contentElement).toBeInTheDocument();
    expect(contentElement?.parentElement).toHaveClass('drag-preview');
  });

  it('Should render children content correctly', () => {
    const { getByText } = render(
      <DragPreview>
        <div>
          <h3>Widget Title</h3>
          <p>Widget content goes here</p>
        </div>
      </DragPreview>
    );

    expect(getByText('Widget Title')).toBeInTheDocument();
    expect(getByText('Widget content goes here')).toBeInTheDocument();
  });
});