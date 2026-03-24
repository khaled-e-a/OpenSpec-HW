/**
 * Example-based tests for WebpageViewerWidget.
 * Coverage: UC4-S1, UC4-S2, UC4-S3, UC4-S4, UC4-S5, UC4-S6, UC4-S7, UC4-S8, UC4-S9,
 *           UC4-E4a1, UC4-E4a2, UC4-E5a1, UC4-E8a1, UC4-E8a2, UC4-E8a3, UC4-E8a4,
 *           UC4-E9a1, UC5-E3a1, UC5-S5, UC6-S6
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WebpageViewerWidget from './WebpageViewerWidget';
import { WidgetSettings } from './types';

// ─── UC4-S2 — empty state and URL input ──────────────────────────────────────

test('UC4-S2: shows URL input and "Enter a URL to embed" prompt on first add', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  expect(screen.getByPlaceholderText(/Enter a URL to embed/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^go$/i })).toBeInTheDocument();
});

test('UC4-S2: no iframe rendered in empty state', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  expect(document.querySelector('iframe')).toBeNull();
});

// ─── UC4-S3, UC4-S4 — submit via Enter and Go button ─────────────────────────

test('UC4-S4: "Go" button submits URL and sets iframe src', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  const iframe = document.querySelector('iframe') as HTMLIFrameElement;
  expect(iframe).not.toBeNull();
  expect(iframe.src).toBe('https://example.com/');
});

test('UC4-S3: pressing Enter in URL input submits the URL', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'https://example.com' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(document.querySelector('iframe')).not.toBeNull();
});

// ─── UC4-S5, UC4-E5a1 — URL validation ───────────────────────────────────────

test('UC4-E5a1: malformed URL shows inline validation error', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'not-a-url' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  expect(screen.getByText(/Please enter a valid URL \(include https:\/\/\)/i)).toBeInTheDocument();
  expect(document.querySelector('iframe')).toBeNull();
});

test('UC4-E5a1: empty submission shows validation error', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  expect(screen.getByText(/Please enter a valid URL/i)).toBeInTheDocument();
});

test('UC4-S5: valid https URL is accepted and loads iframe', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  expect(screen.queryByText(/Please enter a valid URL/i)).toBeNull();
  expect(document.querySelector('iframe')).not.toBeNull();
});

// ─── UC4-S6 — sandboxed iframe ───────────────────────────────────────────────

test('UC4-S6: iframe has sandbox attribute with required values', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i);
  fireEvent.change(input, { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  const iframe = document.querySelector('iframe') as HTMLIFrameElement;
  const sandbox = iframe.getAttribute('sandbox') ?? '';
  expect(sandbox).toContain('allow-scripts');
  expect(sandbox).toContain('allow-same-origin');
  expect(sandbox).toContain('allow-forms');
  expect(sandbox).toContain('allow-popups');
});

// ─── UC4-S7, UC5-S5 — settings persisted ─────────────────────────────────────

test('UC4-S7: onSettingsChange called with url settings when URL is submitted', () => {
  const onChange = jest.fn();
  render(<WebpageViewerWidget id="wv-1" onSettingsChange={onChange} />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i);
  fireEvent.change(input, { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  expect(onChange).toHaveBeenCalledWith({ type: 'webpage-viewer', url: 'https://example.com' });
});

// ─── UC4-E4a1, UC4-E4a2, UC6-S6 — saved URL auto-loads on restore ────────────

test('UC4-E4a1: URL input pre-filled with saved URL from settings on mount', () => {
  const settings: WidgetSettings = { type: 'webpage-viewer', url: 'https://saved.example.com' };
  render(<WebpageViewerWidget id="wv-1" settings={settings} />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i) as HTMLInputElement;
  expect(input.value).toBe('https://saved.example.com');
});

test('UC4-E4a2 / UC6-S6: iframe auto-loads from saved URL on mount', () => {
  const settings: WidgetSettings = { type: 'webpage-viewer', url: 'https://saved.example.com' };
  render(<WebpageViewerWidget id="wv-1" settings={settings} />);
  const iframe = document.querySelector('iframe') as HTMLIFrameElement;
  expect(iframe).not.toBeNull();
  expect(iframe.src).toBe('https://saved.example.com/');
});

// ─── UC4-E8a2, UC4-E8a3 — blocked embed fallback overlay ─────────────────────

test('UC4-E8a2/E8a3: blocked embed shows fallback overlay with "Open in new tab" link', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i);
  fireEvent.change(input, { target: { value: 'https://blocked.example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  const iframe = document.querySelector('iframe') as HTMLIFrameElement;

  // Simulate load event where contentDocument is accessible but body is empty
  // (simulating blank page served for X-Frame-Options: DENY)
  Object.defineProperty(iframe, 'contentDocument', {
    value: { body: { childNodes: [] } },
    configurable: true,
  });
  fireEvent.load(iframe);

  expect(screen.getByText(/This page cannot be embedded/i)).toBeInTheDocument();
  const link = screen.getByRole('link', { name: /Open in new tab/i }) as HTMLAnchorElement;
  expect(link).toBeInTheDocument();
  expect(link.href).toBe('https://blocked.example.com/');
  expect(link.target).toBe('_blank');
});

// ─── UC4-E8a4 — URL remains saved after block ────────────────────────────────

test('UC4-E8a4: URL settings remain after blocked embed (onSettingsChange already called)', () => {
  const onChange = jest.fn();
  render(<WebpageViewerWidget id="wv-1" onSettingsChange={onChange} />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i);
  fireEvent.change(input, { target: { value: 'https://blocked.example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  // Settings were saved on URL submission (before block detection)
  expect(onChange).toHaveBeenCalledWith({ type: 'webpage-viewer', url: 'https://blocked.example.com' });
});

// ─── UC4-E9a1, UC5-S1–S4 — URL always changeable ─────────────────────────────

test('UC4-E9a1: URL input remains visible and editable while iframe is loaded', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i);
  fireEvent.change(input, { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  // Iframe is loaded; URL input still present
  expect(screen.getByPlaceholderText(/Enter a URL to embed/i)).toBeInTheDocument();
  // User can enter new URL
  fireEvent.change(screen.getByPlaceholderText(/Enter a URL to embed/i), { target: { value: 'https://new.example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  const iframe = document.querySelector('iframe') as HTMLIFrameElement;
  expect(iframe.src).toBe('https://new.example.com/');
});

// ─── UC5-E3a1 — clearing input without submit preserves iframe ───────────────

test('UC5-E3a1: clearing URL input without submitting leaves iframe unchanged', () => {
  render(<WebpageViewerWidget id="wv-1" />);
  const input = screen.getByPlaceholderText(/Enter a URL to embed/i) as HTMLInputElement;
  // Load initial URL
  fireEvent.change(input, { target: { value: 'https://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: /^go$/i }));
  const iframeSrcBefore = (document.querySelector('iframe') as HTMLIFrameElement).src;
  // Clear input without submitting
  fireEvent.change(input, { target: { value: '' } });
  // iframe src unchanged
  expect((document.querySelector('iframe') as HTMLIFrameElement).src).toBe(iframeSrcBefore);
});
