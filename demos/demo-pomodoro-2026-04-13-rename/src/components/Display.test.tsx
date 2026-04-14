import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Display } from './Display';

describe('<Display />', () => {
  test('renders 25:00 for 1500 remaining seconds', () => {
    render(<Display phase="work" remainingSeconds={1500} />);
    expect(screen.getByTestId('time')).toHaveTextContent('25:00');
  });

  test('renders 05:00 for 300 remaining seconds', () => {
    render(<Display phase="rest" remainingSeconds={300} />);
    expect(screen.getByTestId('time')).toHaveTextContent('05:00');
  });

  test('pads single-digit seconds with zero', () => {
    render(<Display phase="work" remainingSeconds={65} />);
    expect(screen.getByTestId('time')).toHaveTextContent('01:05');
  });

  test('shows "Work" label for work phase (UC1-S2)', () => {
    render(<Display phase="work" remainingSeconds={1500} />);
    expect(screen.getByTestId('phase')).toHaveTextContent(/work/i);
  });

  test('shows "Rest" label for rest phase', () => {
    render(<Display phase="rest" remainingSeconds={300} />);
    expect(screen.getByTestId('phase')).toHaveTextContent(/rest/i);
  });

  test('renders 00:00 when remainingSeconds is 0', () => {
    render(<Display phase="work" remainingSeconds={0} />);
    expect(screen.getByTestId('time')).toHaveTextContent('00:00');
  });
});
