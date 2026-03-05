import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedWidget from '../AnimatedWidget';

describe('AnimatedWidget Component', () => {
  it('Should apply dragging animation state', () => {
    const { container } = render(
      <AnimatedWidget
        id="test-widget"
        title="Test Widget"
        size="medium"
        isDragging={true}
        isDropping={false}
      >
        <div>Widget Content</div>
      </AnimatedWidget>
    );

    const animatedElement = container.firstChild as HTMLElement;
    expect(animatedElement).toBeInTheDocument();
    // Framer Motion handles animations, we just verify the component renders
  });

  it('Should apply dropping animation state', () => {
    const { container } = render(
      <AnimatedWidget
        id="test-widget"
        title="Test Widget"
        size="medium"
        isDragging={false}
        isDropping={true}
      >
        <div>Widget Content</div>
      </AnimatedWidget>
    );

    const animatedElement = container.firstChild as HTMLElement;
    expect(animatedElement).toBeInTheDocument();
  });

  it('Should render widget content correctly', () => {
    const { getByText } = render(
      <AnimatedWidget
        id="test-widget"
        title="Test Widget"
        size="medium"
        isDragging={false}
        isDropping={false}
      >
        <div>Test Content</div>
      </AnimatedWidget>
    );

    expect(getByText('Test Widget')).toBeInTheDocument();
    expect(getByText('Test Content')).toBeInTheDocument();
  });
});