import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageWidget } from './ImageWidget';
import { FileWidget } from './FileWidget';
import { WebpageWidget } from './WebpageWidget';
import { ClockWidget } from './ClockWidget';

// ---------------------------------------------------------------------------
// Task 8.1: Escape key closes config panel (UC5-S7, UC5-E4a1, UC2-S7, UC3-S7, UC4-S7)
// Task 8.2: ClockWidget has no settings icon (UC5-S3)
// ---------------------------------------------------------------------------

const noop = () => {};

describe('Config panel — Escape key closes panel (UC5-S7, UC5-E4a1)', () => {
  it('UC2-S7: Escape closes ImageWidget config panel', () => {
    render(<ImageWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByTestId('image-config-panel')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('image-config-panel')).not.toBeInTheDocument();
  });

  it('UC3-S7: Escape closes FileWidget config panel', () => {
    render(<FileWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByTestId('file-config-panel')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('file-config-panel')).not.toBeInTheDocument();
  });

  it('UC4-S7: Escape closes WebpageWidget config panel', () => {
    render(<WebpageWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByTestId('webpage-config-panel')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('webpage-config-panel')).not.toBeInTheDocument();
  });
});

describe('ClockWidget — no settings icon (UC5-S3)', () => {
  it('UC5-S3: ClockWidget renders no settings button', () => {
    render(<ClockWidget />);
    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument();
  });
});
