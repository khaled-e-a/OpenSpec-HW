import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageWidget } from './ImageWidget';

// ---------------------------------------------------------------------------
// Tasks 3.1–3.6: ImageWidget
// UC2-S1, UC2-S2, UC2-S3, UC2-S4, UC2-S5, UC2-S6, UC2-E3a1, UC2-E4a1
// UC5-S1, UC5-S2, UC5-E4a1
// ---------------------------------------------------------------------------

const noop = () => {};

describe('ImageWidget — placeholder (UC2-S1)', () => {
  it('shows placeholder when no imageUrl configured', () => {
    render(<ImageWidget config={{}} onConfigChange={noop} />);
    expect(screen.getByText(/click to choose image/i)).toBeInTheDocument();
  });

  it('shows <img> when imageUrl is set', () => {
    render(<ImageWidget config={{ imageUrl: 'blob:test/123' }} onConfigChange={noop} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:test/123');
    expect(screen.queryByText(/click to choose image/i)).not.toBeInTheDocument();
  });
});

describe('ImageWidget — config panel (UC2-S2, UC5-S1, UC5-S2)', () => {
  it('UC5-S1: shows settings icon button', () => {
    render(<ImageWidget config={{}} onConfigChange={noop} />);
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('UC5-S2: config panel hidden initially', () => {
    render(<ImageWidget config={{}} onConfigChange={noop} />);
    expect(screen.queryByTestId('image-config-panel')).not.toBeInTheDocument();
  });

  it('UC2-S2: clicking settings opens config panel', () => {
    render(<ImageWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByTestId('image-config-panel')).toBeInTheDocument();
  });

  it('UC2-S7: clicking close button closes panel', () => {
    render(<ImageWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByTestId('image-config-panel')).not.toBeInTheDocument();
  });
});

describe('ImageWidget — file picker (UC2-S3)', () => {
  it('UC2-S3: config panel contains file input accepting image/*', () => {
    render(<ImageWidget config={{}} onConfigChange={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    const input = screen.getByTestId('image-file-input') as HTMLInputElement;
    expect(input.type).toBe('file');
    expect(input.accept).toBe('image/*');
  });
});

describe('ImageWidget — valid image selection (UC2-S4, UC2-S5, UC2-S6)', () => {
  it('UC2-S5: calls onConfigChange with object URL for valid image', () => {
    const mockUrl = 'blob:http://localhost/mock-image';
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => mockUrl),
      revokeObjectURL: vi.fn(),
    });

    const onConfigChange = vi.fn();
    render(<ImageWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    const input = screen.getByTestId('image-file-input');
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(onConfigChange).toHaveBeenCalledWith({ imageUrl: mockUrl });

    vi.unstubAllGlobals();
  });
});

describe('ImageWidget — non-image rejection (UC2-E4a1, UC5-E5a1)', () => {
  it('UC2-E4a1: shows error and does not call onConfigChange for non-image file', () => {
    const onConfigChange = vi.fn();
    render(<ImageWidget config={{}} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));

    const input = screen.getByTestId('image-file-input');
    const file = new File(['text'], 'readme.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onConfigChange).not.toHaveBeenCalled();
  });
});

describe('ImageWidget — cancel preserves config (UC2-E3a1, UC5-E4a1)', () => {
  it('UC2-E3a1: closing panel without selecting keeps existing image', () => {
    const onConfigChange = vi.fn();
    render(<ImageWidget config={{ imageUrl: 'blob:existing' }} onConfigChange={onConfigChange} />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    expect(onConfigChange).not.toHaveBeenCalled();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:existing');
  });
});
