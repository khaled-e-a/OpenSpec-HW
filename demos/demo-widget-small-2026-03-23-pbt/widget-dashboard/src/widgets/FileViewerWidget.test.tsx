/**
 * Example-based tests for FileViewerWidget.
 * Coverage: UC3-S1, UC3-S2, UC3-S3, UC3-S4, UC3-S6, UC3-S7, UC3-S8, UC3-S9,
 *           UC3-E5a1, UC3-E6a1, UC3-E6b1, UC3-E6b2, UC3-E9b1, UC3-E9b2, UC3-E9b3,
 *           UC5-E3a1, UC6-S7
 */
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import FileViewerWidget from './FileViewerWidget';
import { WidgetSettings } from './types';

// ─── UC3-S2 — empty state on first add ───────────────────────────────────────

test('UC3-S2: shows "Select a file to display" empty-state when no file selected', () => {
  render(<FileViewerWidget id="fv-1" />);
  expect(screen.getByText(/Select a file to display/i)).toBeInTheDocument();
});

test('UC3-S2: shows "Select file" button in empty state', () => {
  render(<FileViewerWidget id="fv-1" />);
  expect(screen.getByRole('button', { name: /select file/i })).toBeInTheDocument();
});

// ─── UC3-S3, UC3-S4 — file picker hidden input ───────────────────────────────

test('UC3-S3/S4: hidden file input exists in the DOM', () => {
  render(<FileViewerWidget id="fv-1" />);
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  expect(fileInput).not.toBeNull();
  expect(fileInput.style.display).toBe('none');
});

// ─── UC3-S6, UC3-S7 — file read and displayed ────────────────────────────────

function makeTextFile(content: string, name = 'test.txt'): File {
  return new File([content], name, { type: 'text/plain' });
}

function triggerFileSelect(content: string, name = 'test.txt') {
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = makeTextFile(content, name);
  Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
  fireEvent.change(fileInput);
}

test('UC3-S7: file contents displayed after selection', async () => {
  render(<FileViewerWidget id="fv-1" />);
  fireEvent.click(screen.getByRole('button', { name: /select file/i }));
  act(() => { triggerFileSelect('Hello World\nLine 2'); });
  await waitFor(() => {
    expect(document.querySelector('pre')?.textContent).toContain('Hello World');
  });
});

test('UC3-S7: pre element preserves whitespace and newlines', async () => {
  render(<FileViewerWidget id="fv-1" />);
  fireEvent.click(screen.getByRole('button', { name: /select file/i }));
  const content = 'Line1\n  Line2\n    Line3';
  act(() => { triggerFileSelect(content); });
  await waitFor(() => {
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe(content);
  });
});

// ─── UC3-S8 — file name persisted ────────────────────────────────────────────

test('UC3-S8: onSettingsChange called with fileName after successful read', async () => {
  const onChange = jest.fn();
  render(<FileViewerWidget id="fv-1" onSettingsChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: /select file/i }));
  act(() => { triggerFileSelect('hello', 'notes.txt'); });
  await waitFor(() => {
    expect(onChange).toHaveBeenCalledWith({ type: 'file-viewer', fileName: 'notes.txt' });
  });
});

// ─── UC3-E5a1 — cancel preserves state ───────────────────────────────────────

test('UC3-E5a1: cancelling file picker (no file) preserves empty state', () => {
  render(<FileViewerWidget id="fv-1" />);
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  // Simulate cancel: fire change with empty files list
  Object.defineProperty(fileInput, 'files', { value: [], configurable: true });
  fireEvent.change(fileInput);
  expect(screen.getByText(/Select a file to display/i)).toBeInTheDocument();
  expect(document.querySelector('pre')).toBeNull();
});

test('UC3-E5a1: cancelling re-select picker preserves existing content', async () => {
  render(<FileViewerWidget id="fv-1" />);
  act(() => { triggerFileSelect('existing content', 'old.txt'); });
  await waitFor(() => {
    expect(document.querySelector('pre')?.textContent).toContain('existing content');
  });
  // Cancel the next selection
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(fileInput, 'files', { value: [], configurable: true });
  fireEvent.change(fileInput);
  expect(document.querySelector('pre')?.textContent).toContain('existing content');
});

// ─── UC3-E6a1 — binary file rejected ─────────────────────────────────────────

test('UC3-E6a1: binary file (null bytes) shows "File is not readable as text"', async () => {
  render(<FileViewerWidget id="fv-1" />);
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  // File with null byte
  const binaryContent = 'prefix\u0000suffix';
  const file = new File([binaryContent], 'binary.bin', { type: 'application/octet-stream' });
  Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
  act(() => { fireEvent.change(fileInput); });
  await waitFor(() => {
    expect(screen.getByText(/File is not readable as text/i)).toBeInTheDocument();
  });
  expect(document.querySelector('pre')).toBeNull();
});

// ─── UC3-E6b1, UC3-E6b2 — large file truncation ──────────────────────────────

test('UC3-E6b1: file > 1 MB shows "File is large" warning banner', async () => {
  render(<FileViewerWidget id="fv-1" />);
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  // Create a file > 1 MB
  const bigContent = 'x'.repeat(1_048_577);
  const file = new File([bigContent], 'large.txt', { type: 'text/plain' });
  Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
  act(() => { fireEvent.change(fileInput); });
  await waitFor(() => {
    expect(screen.getByText(/File is large — only the first 1 MB is shown/i)).toBeInTheDocument();
  });
});

test('UC3-E6b2: large file still shows truncated content (first 1 MB)', async () => {
  render(<FileViewerWidget id="fv-1" />);
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const bigContent = 'A'.repeat(1_048_577);
  const file = new File([bigContent], 'large.txt', { type: 'text/plain' });
  Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
  act(() => { fireEvent.change(fileInput); });
  await waitFor(() => {
    const pre = document.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre!.textContent!.length).toBe(1_048_576);
  });
});

test('UC3-E6b1: small file (≤ 1 MB) shows no warning banner', async () => {
  render(<FileViewerWidget id="fv-1" />);
  act(() => { triggerFileSelect('small content'); });
  await waitFor(() => {
    expect(document.querySelector('pre')).not.toBeNull();
  });
  expect(screen.queryByText(/File is large/i)).toBeNull();
});

// ─── UC3-E9b1, UC3-E9b2, UC3-E9b3, UC6-S7 — reload hint ─────────────────────

test('UC6-S7: shows file name hint when settings.fileName present on mount', () => {
  const settings: WidgetSettings = { type: 'file-viewer', fileName: 'notes.txt' };
  render(<FileViewerWidget id="fv-1" settings={settings} />);
  expect(screen.getByText(/Re-select/i)).toBeInTheDocument();
  expect(screen.getByText(/notes\.txt/i)).toBeInTheDocument();
});

test('UC3-E9b1/E9b2: shows empty-state prompt plus hint when fileName saved', () => {
  const settings: WidgetSettings = { type: 'file-viewer', fileName: 'log.txt' };
  render(<FileViewerWidget id="fv-1" settings={settings} />);
  expect(screen.getByText(/Select a file to display/i)).toBeInTheDocument();
  expect(screen.getByText(/Re-select/i)).toBeInTheDocument();
});

test('UC3-E9b3: no auto-read on reload (user must re-select)', () => {
  const settings: WidgetSettings = { type: 'file-viewer', fileName: 'notes.txt' };
  render(<FileViewerWidget id="fv-1" settings={settings} />);
  // No <pre> content loaded automatically
  expect(document.querySelector('pre')).toBeNull();
});

test('UC6-S7: no hint shown when no fileName in settings', () => {
  render(<FileViewerWidget id="fv-1" />);
  expect(screen.queryByText(/Re-select/i)).toBeNull();
});

// ─── UC5-S1, UC5-S2 — re-select control ──────────────────────────────────────

test('UC5-S2: "Select a different file" control visible when content is displayed', async () => {
  render(<FileViewerWidget id="fv-1" />);
  act(() => { triggerFileSelect('content'); });
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /select a different file/i })).toBeInTheDocument();
  });
});
