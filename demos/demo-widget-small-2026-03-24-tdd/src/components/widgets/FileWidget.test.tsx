import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileWidget } from './FileWidget';

// ---------------------------------------------------------------------------
// Tasks 4.1–4.6: FileWidget
// UC3-S1, UC3-S2, UC3-S3, UC3-S4, UC3-S5, UC3-S6, UC3-S7
// UC3-E3a1, UC3-E5a1, UC3-E5b1
// ---------------------------------------------------------------------------

const noop = () => {};

describe('FileWidget — placeholder (UC3-S1)', () => {
  it('shows placeholder when no fileText configured', () => {
    render(<FileWidget config={{}} onConfigChange={noop} />);
    expect(screen.getByText(/click to choose file/i)).toBeInTheDocument();
  });

  it('renders file contents in pre element when fileText is set', () => {
    render(<FileWidget config={{ fileText: 'hello world', fileName: 'test.txt' }} onConfigChange={noop} />);
    expect(screen.getByTestId('file-content')).toHaveTextContent('hello world');
  });
});

describe('FileWidget — config panel (UC3-S2, UC5-S1, UC5-S2)', () => {
  it('shows settings icon button', () => {
    render(<FileWidget config={{}} onConfigChange={noop} />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('config panel hidden initially', () => {
    render(<FileWidget config={{}} onConfigChange={noop} />);
    expect(screen.queryByTestId('file-config-panel')).not.toBeInTheDocument();
  });

  it('UC3-S2: clicking settings opens config panel', () => {
    render(<FileWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByTestId('file-config-panel')).toBeInTheDocument();
  });
});

describe('FileWidget — file picker (UC3-S3)', () => {
  it('UC3-S3: file input has no type restriction', () => {
    render(<FileWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    const input = screen.getByTestId('file-file-input') as HTMLInputElement;
    expect(input.type).toBe('file');
    // No accept restriction — accept is empty or "*"
    expect(input.accept === '' || input.accept === '*').toBe(true);
  });
});

describe('FileWidget — successful read (UC3-S4, UC3-S5, UC3-S6)', () => {
  it('UC3-S5: calls onConfigChange with file text after FileReader reads file', async () => {
    const onConfigChange = vi.fn();
    render(<FileWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    const input = screen.getByTestId('file-file-input');
    const file = new File(['hello file content'], 'notes.txt', { type: 'text/plain' });

    // Stub FileReader
    const originalFileReader = globalThis.FileReader;
    const mockReader = {
      readAsText: vi.fn(function (this: any) {
        setTimeout(() => {
          this.result = 'hello file content';
          this.onload?.({ target: this } as any);
        }, 0);
      }),
      onload: null as any,
      onerror: null as any,
    };
    vi.stubGlobal('FileReader', vi.fn(() => mockReader));

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onConfigChange).toHaveBeenCalledWith({
        fileText: 'hello file content',
        fileName: 'notes.txt',
      });
    });

    vi.stubGlobal('FileReader', originalFileReader);
  });
});

describe('FileWidget — truncation (UC3-E5b1)', () => {
  it('UC3-E5b1: truncates content at 10 000 chars and shows notice', async () => {
    const longText = 'x'.repeat(12000);
    const onConfigChange = vi.fn();
    render(<FileWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    const input = screen.getByTestId('file-file-input');
    const file = new File([longText], 'big.txt', { type: 'text/plain' });

    const mockReader = {
      readAsText: vi.fn(function (this: any) {
        setTimeout(() => {
          this.result = longText;
          this.onload?.({ target: this } as any);
        }, 0);
      }),
      onload: null as any,
      onerror: null as any,
    };
    vi.stubGlobal('FileReader', vi.fn(() => mockReader));

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const [call] = onConfigChange.mock.calls;
      expect(call[0].fileText).toHaveLength(10000 + '\nShowing first 10 000 characters.'.length);
      expect(call[0].fileText).toContain('Showing first 10 000 characters.');
    });

    vi.unstubAllGlobals();
  });
});

describe('FileWidget — read error (UC3-E5a1)', () => {
  it('UC3-E5a1: shows error when FileReader fires onerror', async () => {
    const onConfigChange = vi.fn();
    render(<FileWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    const input = screen.getByTestId('file-file-input');
    const file = new File(['data'], 'binary.bin', { type: 'application/octet-stream' });

    const mockReader = {
      readAsText: vi.fn(function (this: any) {
        setTimeout(() => {
          this.onerror?.({} as any);
        }, 0);
      }),
      onload: null as any,
      onerror: null as any,
    };
    vi.stubGlobal('FileReader', vi.fn(() => mockReader));

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert').textContent).toMatch(/could not be read as text/i);
    });

    expect(onConfigChange).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('FileWidget — cancel (UC3-E3a1, UC5-E4a1)', () => {
  it('UC3-E3a1: closing panel without selecting does not call onConfigChange', () => {
    const onConfigChange = vi.fn();
    render(<FileWidget config={{ fileText: 'existing', fileName: 'old.txt' }} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onConfigChange).not.toHaveBeenCalled();
  });
});
