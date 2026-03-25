import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WebpageWidget } from './WebpageWidget';

// ---------------------------------------------------------------------------
// Tasks 5.1–5.6: WebpageWidget
// UC4-S1, UC4-S2, UC4-S3, UC4-S4, UC4-S5, UC4-S6, UC4-S7
// UC4-E4a1, UC4-E5a1, UC4-E6a1, UC4-E6b1
// UC5-S1, UC5-S2, UC5-S3, UC5-E4a1
// ---------------------------------------------------------------------------

const noop = () => {};

describe('WebpageWidget — placeholder (UC4-S1)', () => {
  it('shows URL-entry prompt when no webpageUrl configured', () => {
    render(<WebpageWidget config={{}} onConfigChange={noop} />);
    expect(screen.getByText(/enter a url/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/embedded page/i)).not.toBeInTheDocument();
  });

  it('renders iframe when webpageUrl is set', () => {
    render(<WebpageWidget config={{ webpageUrl: 'https://example.com' }} onConfigChange={noop} />);
    const iframe = screen.getByTitle(/embedded page/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com');
  });
});

describe('WebpageWidget — embedding restriction note (UC4-E6a1)', () => {
  it('UC4-E6a1: shows helper note when iframe is rendered', () => {
    render(<WebpageWidget config={{ webpageUrl: 'https://example.com' }} onConfigChange={noop} />);
    expect(screen.getByTestId('embedding-note')).toBeInTheDocument();
  });

  it('does not show embedding note when no URL is set', () => {
    render(<WebpageWidget config={{}} onConfigChange={noop} />);
    expect(screen.queryByTestId('embedding-note')).not.toBeInTheDocument();
  });
});

describe('WebpageWidget — config panel (UC4-S2, UC5-S1, UC5-S2)', () => {
  it('shows settings icon button', () => {
    render(<WebpageWidget config={{}} onConfigChange={noop} />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('config panel hidden initially', () => {
    render(<WebpageWidget config={{}} onConfigChange={noop} />);
    expect(screen.queryByTestId('webpage-config-panel')).not.toBeInTheDocument();
  });

  it('UC4-S2: clicking settings opens config panel', () => {
    render(<WebpageWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByTestId('webpage-config-panel')).toBeInTheDocument();
  });

  it('UC4-S3: URL input pre-filled with current URL', () => {
    render(<WebpageWidget config={{ webpageUrl: 'https://example.com' }} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    const input = screen.getByTestId('webpage-url-input') as HTMLInputElement;
    expect(input.value).toBe('https://example.com');
  });

  it('UC4-S3: URL input blank when no URL configured', () => {
    render(<WebpageWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    const input = screen.getByTestId('webpage-url-input') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

describe('WebpageWidget — valid URL (UC4-S4, UC4-S5, UC4-S6)', () => {
  it('UC4-S6: calls onConfigChange with valid URL on confirm', () => {
    const onConfigChange = vi.fn();
    render(<WebpageWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.change(screen.getByTestId('webpage-url-input'), { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(onConfigChange).toHaveBeenCalledWith({ webpageUrl: 'https://example.com' });
  });
});

describe('WebpageWidget — scheme-less URL (UC4-E6b1)', () => {
  it('UC4-E6b1: prepends https:// to scheme-less URL', () => {
    const onConfigChange = vi.fn();
    render(<WebpageWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.change(screen.getByTestId('webpage-url-input'), { target: { value: 'example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(onConfigChange).toHaveBeenCalledWith({ webpageUrl: 'https://example.com' });
  });
});

describe('WebpageWidget — malformed URL (UC4-E5a1)', () => {
  it('UC4-E5a1: shows error for malformed URL and does not call onConfigChange', () => {
    const onConfigChange = vi.fn();
    render(<WebpageWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.change(screen.getByTestId('webpage-url-input'), { target: { value: 'not a url :// bad' } });
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onConfigChange).not.toHaveBeenCalled();
  });
});

describe('WebpageWidget — clear URL (UC4-E4a1)', () => {
  it('UC4-E4a1: clears iframe when URL is emptied and confirmed', () => {
    const onConfigChange = vi.fn();
    render(<WebpageWidget config={{ webpageUrl: 'https://example.com' }} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.change(screen.getByTestId('webpage-url-input'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /load/i }));
    expect(onConfigChange).toHaveBeenCalledWith({ webpageUrl: '' });
  });
});

describe('WebpageWidget — cancel (UC5-E4a1)', () => {
  it('UC5-E4a1: closing panel without confirming does not call onConfigChange', () => {
    const onConfigChange = vi.fn();
    render(<WebpageWidget config={{ webpageUrl: 'https://example.com' }} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onConfigChange).not.toHaveBeenCalled();
  });
});
