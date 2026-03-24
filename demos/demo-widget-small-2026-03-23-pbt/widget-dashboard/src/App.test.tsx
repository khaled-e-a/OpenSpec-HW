import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard grid', () => {
  render(<App />);
  const title = screen.getByText(/My Dashboard/i);
  expect(title).toBeInTheDocument();
});
