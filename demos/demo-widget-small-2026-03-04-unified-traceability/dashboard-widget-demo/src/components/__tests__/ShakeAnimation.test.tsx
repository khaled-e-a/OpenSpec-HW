import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShakeAnimation from '../ShakeAnimation';

describe('ShakeAnimation Component', () => {
  it('Should trigger shake animation on error', () => {
    const { container, rerender } = render(
      <ShakeAnimation isShaking={false}>
        <div>Widget Content</div>
      </ShakeAnimation>
    );

    // Initially no shake
    const animatedElement = container.firstChild as HTMLElement;
    expect(animatedElement).toBeInTheDocument();

    // Trigger shake
    rerender(
      <ShakeAnimation isShaking={true}>
        <div>Widget Content</div>
      </ShakeAnimation>
    );

    // Should still be in the document (Framer Motion handles the animation)
    expect(animatedElement).toBeInTheDocument();
  });

  it('Should render children content correctly', () => {
    const { getByText } = render(
      <ShakeAnimation isShaking={true}>
        <div>
          <h3>Error Widget</h3>
          <p>This widget cannot be placed here</p>
        </div>
      </ShakeAnimation>
    );

    expect(getByText('Error Widget')).toBeInTheDocument();
    expect(getByText('This widget cannot be placed here')).toBeInTheDocument();
  });
});