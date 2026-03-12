/**
 * Component tests for FileContent.
 *
 * Covers:
 *   UC4-S1 — User activates the file-selection control inside the file viewer widget
 *   UC4-S2 — System opens the OS file picker
 *   UC4-S3 — User selects a file and confirms
 *   UC4-S4 — System reads the file's text content and renders it as scrollable text inside the widget
 *   UC4-S5 — System retains the file reference for subsequent renders
 *   UC4-E3a — User cancels the file picker — widget remains in its current state
 *   UC4-E4a — File cannot be read — system shows error and prompts re-selection
 *   UC4-E5a — User changes the displayed file by re-activating the file-selection control
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileContent } from '../content/FileContent';
import type { WidgetLayout } from '../types';

// Mock FileReader
global.FileReader = vi.fn(() => ({
  readAsText: vi.fn(),
  onload: null,
  onerror: null,
  result: null
}));

describe('FileContent', () => {
  const mockOnConfigChange = vi.fn();
  const mockFileText = 'Hello, World!\nThis is a test file.';
  const mockFileName = 'test.txt';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset FileReader mock
    (global.FileReader as any).mockClear();
  });

  describe('UC4-S1 — file selection control', () => {
    it('renders "Choose file" button when no file is selected', () => {
      render(
        <FileContent onConfigChange={mockOnConfigChange} />
      );

      expect(screen.getByText('No file selected')).toBeTruthy();
      expect(screen.getByText('Choose file')).toBeTruthy();
    });

    it('renders hidden file input', () => {
      render(
        <FileContent onConfigChange={mockOnConfigChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput?.type).toBe('file');
      expect(fileInput?.style.display).toBe('none');
    });

    it('triggers file input click when button is clicked', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      // Mock the file input click
      HTMLInputElement.prototype.click = mockClick;

      render(
        <FileContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Choose file'));
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('UC4-S3/S4 — file loading and display', () => {
    it('displays file content when fileText is provided', () => {
      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      expect(screen.getByText(mockFileName)).toBeTruthy();
      const pre = document.querySelector('pre');
      expect(pre?.textContent).toContain('Hello, World!');
      expect(pre?.textContent).toContain('This is a test file.');
    });

    it('renders file content in a scrollable pre element', () => {
      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      const preElement = document.querySelector('pre');
      expect(preElement).toBeTruthy();
      expect(preElement?.style.overflow).toBe('auto');
      expect(preElement?.style.whiteSpace).toBe('pre-wrap');
      expect(preElement?.style.wordBreak).toBe('break-word');
    });

    it('displays file name as header', () => {
      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      const header = screen.getByText(mockFileName);
      expect(header).toBeTruthy();
      expect(header.style.backgroundColor).toBe('rgb(241, 245, 249)');
      expect(header.style.borderBottom).toMatch(/1px solid/);
      expect(header.style.fontWeight).toBe('500');
    });

    it('shows "Change file" button when file is displayed', () => {
      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      expect(screen.getByText('Change file')).toBeTruthy();
    });

    it('calls onConfigChange with fileText and fileLabel after file selection', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test content'], 'selected.txt', { type: 'text/plain' });

      render(
        <FileContent onConfigChange={mockOnConfigChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Simulate file selection
      await user.upload(fileInput, mockFile);

      // FileReader should be called
      expect(FileReader).toHaveBeenCalled();

      // Simulate FileReader onload
      const readerInstance = (FileReader as any).mock.results[0].value;
      readerInstance.result = 'test content';
      readerInstance.onload?.({ target: { result: 'test content' } });

      expect(mockOnConfigChange).toHaveBeenCalledWith({
        fileText: 'test content',
        fileLabel: 'selected.txt'
      });
    });
  });

  describe('UC4-E3a — file picker cancellation', () => {
    it('preserves current file when file picker is cancelled', async () => {
      const user = userEvent.setup();

      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Simulate cancelling file picker (no file selected)
      fireEvent.change(fileInput, { target: { files: [] } });

      // File content should still be displayed
      const pre = document.querySelector('pre');
      expect(pre?.textContent).toContain('Hello, World!');
      expect(mockOnConfigChange).not.toHaveBeenCalled();
    });
  });

  describe('UC4-E4a — file read error handling', () => {
    it('shows error message when file cannot be read', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      render(
        <FileContent onConfigChange={mockOnConfigChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Simulate FileReader error
      const readerInstance = (FileReader as any).mock.results[0].value;
      act(() => { readerInstance.onerror?.(); });

      expect(screen.getByText('Cannot display file — check permissions or file type')).toBeTruthy();
      expect(screen.getByText('Choose file')).toBeTruthy();
    });

    it('keeps file selection accessible after error', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      render(
        <FileContent onConfigChange={mockOnConfigChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Simulate error
      const readerInstance = (FileReader as any).mock.results[0].value;
      act(() => { readerInstance.onerror?.(); });

      // Should be able to select another file
      expect(screen.getByText('Choose file')).toBeTruthy();
      const newFileInput = document.querySelector('input[type="file"]');
      expect(newFileInput?.type).toBe('file');
    });
  });

  describe('UC4-E5a — file replacement', () => {
    it('allows changing current file via "Change file" button', async () => {
      const user = userEvent.setup();
      const newFileText = 'New file content';
      const newFileName = 'new.txt';
      const mockFile = new File(['New file content'], 'new.txt', { type: 'text/plain' });

      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      // Click change file button
      await user.click(screen.getByText('Change file'));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Simulate new file loading
      const readerInstance = (FileReader as any).mock.results[0].value;
      readerInstance.result = newFileText;
      readerInstance.onload?.({ target: { result: newFileText } });

      expect(mockOnConfigChange).toHaveBeenCalledWith({
        fileText: newFileText,
        fileLabel: newFileName
      });
    });
  });

  describe('UC4-S5 — state persistence', () => {
    it('retains file content between renders', () => {
      const { rerender } = render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      // Check for parts of the text since it's split across lines
      expect(document.querySelector('pre')?.textContent).toContain('Hello, World!');
      expect(document.querySelector('pre')?.textContent).toContain('This is a test file.');

      // Force re-render
      rerender(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      // File content should still be displayed
      expect(document.querySelector('pre')?.textContent).toContain('Hello, World!');
    });
  });

  describe('layout and styling', () => {
    it('uses full height container for file content', () => {
      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      const container = document.querySelector('pre')?.parentElement;
      expect(container?.style.height).toBe('100%');
      expect(container?.style.display).toBe('flex');
      expect(container?.style.flexDirection).toBe('column');
    });

    it('positions change button at bottom right', () => {
      render(
        <FileContent
          fileText={mockFileText}
          fileLabel={mockFileName}
          onConfigChange={mockOnConfigChange}
        />
      );

      const button = screen.getByText('Change file');
      expect(button.style.margin).toBe('8px');
      expect(button.style.alignSelf).toBe('flex-end');
    });
  });
});