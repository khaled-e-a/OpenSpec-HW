/**
 * Component tests for ImageContent.
 *
 * Covers:
 *   UC3-S1 — User activates the file-selection control inside the image widget
 *   UC3-S2 — System opens the OS file picker filtered to image file types
 *   UC3-S3 — User selects an image file and confirms
 *   UC3-S4 — System reads the selected image and renders it inside the widget, scaled to fit
 *   UC3-S5 — System retains the image source for subsequent renders
 *   UC3-E3a — User cancels the file picker — widget remains in its current state
 *   UC3-E4a — Selected file is not a valid image — system shows error and prompts re-selection
 *   UC3-E5a — User replaces the current image by re-activating the file-selection control
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageContent } from '../content/ImageContent';
import type { WidgetLayout } from '../types';

// Mock FileReader
global.FileReader = vi.fn(() => ({
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  result: null
}));

describe('ImageContent', () => {
  const mockOnConfigChange = vi.fn();
  const mockImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset FileReader mock
    (global.FileReader as any).mockClear();
  });

  describe('UC3-S1 — file selection control', () => {
    it('renders "Choose image" button when no image is selected', () => {
      render(
        <ImageContent onConfigChange={mockOnConfigChange} />
      );

      expect(screen.getByText('No image selected')).toBeTruthy();
      expect(screen.getByText('Choose image')).toBeTruthy();
    });

    it('renders hidden file input with image/* accept attribute', () => {
      render(
        <ImageContent onConfigChange={mockOnConfigChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput?.type).toBe('file');
      expect(fileInput?.accept).toBe('image/*');
      expect(fileInput?.style.display).toBe('none');
    });

    it('triggers file input click when button is clicked', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      // Mock the file input click
      HTMLInputElement.prototype.click = mockClick;

      render(
        <ImageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Choose image'));
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('UC3-S3/S4 — image loading and display', () => {
    it('displays selected image when imageDataUrl is provided', () => {
      render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe(mockImageDataUrl);
      expect(img.getAttribute('alt')).toBe('Selected');
    });

    it('scales image to fit container with object-fit: contain', () => {
      render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const img = screen.getByRole('img');
      expect(img.style.width).toBe('100%');
      expect(img.style.height).toBe('100%');
      expect(img.style.objectFit).toBe('contain');
    });

    it('shows "Change image" button when image is displayed', () => {
      render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      expect(screen.getByText('Change image')).toBeTruthy();
    });

    it('calls onConfigChange with imageDataUrl after file selection', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

      render(
        <ImageContent onConfigChange={mockOnConfigChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Simulate file selection
      await user.upload(fileInput, mockFile);

      // FileReader should be called
      expect(FileReader).toHaveBeenCalled();

      // Simulate FileReader onload
      const readerInstance = (FileReader as any).mock.results[0].value;
      readerInstance.result = mockImageDataUrl;
      readerInstance.onload?.({ target: { result: mockImageDataUrl } });

      expect(mockOnConfigChange).toHaveBeenCalledWith({ imageDataUrl: mockImageDataUrl });
    });
  });

  describe('UC3-E3a — file picker cancellation', () => {
    it('preserves current image when file picker is cancelled', async () => {
      const user = userEvent.setup();

      render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Simulate cancelling file picker (no file selected)
      fireEvent.change(fileInput, { target: { files: [] } });

      // Image should still be displayed
      expect(screen.getByRole('img')).toBeTruthy();
      expect(mockOnConfigChange).not.toHaveBeenCalled();
    });
  });

  describe('UC3-E4a — invalid image handling', () => {
    it('shows error message when image fails to load', () => {
      render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const img = screen.getByRole('img');

      // Simulate image load error
      fireEvent.error(img);

      expect(screen.getByText('Cannot display file — not a valid image')).toBeTruthy();
      expect(screen.getByText('Choose image')).toBeTruthy();
    });

    it('keeps file selection accessible after error', () => {
      render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const img = screen.getByRole('img');
      fireEvent.error(img);

      // Should be able to select another file
      expect(screen.getByText('Choose image')).toBeTruthy();
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput?.type).toBe('file');
    });
  });

  describe('UC3-E5a — image replacement', () => {
    it('allows changing current image via "Change image" button', async () => {
      const user = userEvent.setup();
      const newImageDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';
      const mockFile = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      // Click change image button
      await user.click(screen.getByText('Change image'));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Simulate new image loading
      const readerInstance = (FileReader as any).mock.results[0].value;
      readerInstance.result = newImageDataUrl;
      readerInstance.onload?.({ target: { result: newImageDataUrl } });

      expect(mockOnConfigChange).toHaveBeenCalledWith({ imageDataUrl: newImageDataUrl });
    });
  });

  describe('UC3-S5 — state persistence', () => {
    it('retains image display between renders', () => {
      const { rerender } = render(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      expect(screen.getByRole('img')).toBeTruthy();

      // Force re-render
      rerender(
        <ImageContent
          imageDataUrl={mockImageDataUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      // Image should still be displayed
      expect(screen.getByRole('img')).toBeTruthy();
    });
  });
});