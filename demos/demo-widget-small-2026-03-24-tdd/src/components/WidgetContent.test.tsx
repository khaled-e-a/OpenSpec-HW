import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetContent } from './WidgetContent';

// ---------------------------------------------------------------------------
// Tasks 6.1–6.2: WidgetContent dispatcher
// UC1-S2, UC2-S1, UC3-S1, UC4-S1, UC5-S5, UC5-S6
// ---------------------------------------------------------------------------

const noop = () => {};

describe('WidgetContent dispatcher (UC1-S2, UC2-S1, UC3-S1, UC4-S1)', () => {
  it('renders ClockWidget when type is clock', () => {
    render(<WidgetContent type="clock" config={{}} onConfigChange={noop} />);
    expect(screen.getByTestId('clock-display')).toBeInTheDocument();
  });

  it('defaults to ClockWidget when type is undefined', () => {
    render(<WidgetContent type={undefined} config={{}} onConfigChange={noop} />);
    expect(screen.getByTestId('clock-display')).toBeInTheDocument();
  });

  it('renders ImageWidget placeholder when type is image (no config)', () => {
    render(<WidgetContent type="image" config={{}} onConfigChange={noop} />);
    expect(screen.getByText(/click to choose image/i)).toBeInTheDocument();
  });

  it('renders FileWidget placeholder when type is file (no config)', () => {
    render(<WidgetContent type="file" config={{}} onConfigChange={noop} />);
    expect(screen.getByText(/click to choose file/i)).toBeInTheDocument();
  });

  it('renders WebpageWidget placeholder when type is webpage (no config)', () => {
    render(<WidgetContent type="webpage" config={{}} onConfigChange={noop} />);
    expect(screen.getByText(/enter a url/i)).toBeInTheDocument();
  });
});
