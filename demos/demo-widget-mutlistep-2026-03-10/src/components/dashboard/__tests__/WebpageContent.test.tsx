/**
 * Component tests for WebpageContent.
 *
 * Covers:
 *   UC5-S1 — User activates the URL input control inside the webpage widget
 *   UC5-S2 — System presents an editable URL field
 *   UC5-S3 — User enters or edits the URL and confirms
 *   UC5-S4 — System loads the URL in a sandboxed iframe within the widget
 *   UC5-S5 — Webpage is displayed; user can interact with the embedded page
 *   UC5-E3a — User confirms without entering a URL — system removes iframe and shows placeholder
 *   UC5-E3b — User dismisses the URL input without confirming — widget unchanged
 *   UC5-E4a — Page refuses embedding — system shows error and presents URL input
 *   UC5-E4b — URL is malformed or unreachable — system shows load-error and presents URL input
 *   UC5-E5a — User changes the URL by re-activating the URL input control
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WebpageContent } from '../content/WebpageContent';
import type { WidgetLayout } from '../types';

describe('WebpageContent', () => {
  const mockOnConfigChange = vi.fn();
  const mockUrl = 'https://example.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UC5-S1/S2 — URL input presentation', () => {
    it('shows "No URL set" placeholder when no URL is configured', () => {
      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      expect(screen.getByText('No URL set')).toBeTruthy();
      expect(screen.getByText('Enter URL')).toBeTruthy();
    });

    it('shows URL input form when "Enter URL" is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));

      expect(screen.getByPlaceholderText('Enter URL (e.g., https://example.com)')).toBeTruthy();
      expect(screen.getByText('Clear')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('shows URL input form when URL is present but change is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      await user.click(screen.getByText('Change'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      expect(input).toBeTruthy();
      expect((input as HTMLInputElement).value).toBe(mockUrl);
    });
  });

  describe('UC5-S3 — URL confirmation', () => {
    it('calls onConfigChange with URL when Load is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      await user.type(input, mockUrl);

      await user.click(screen.getByText('Load'));

      expect(mockOnConfigChange).toHaveBeenCalledWith({ webpageUrl: mockUrl });
    });

    it('submits on Enter key press', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      await user.type(input, mockUrl);

      await user.keyboard('{Enter}');

      expect(mockOnConfigChange).toHaveBeenCalledWith({ webpageUrl: mockUrl });
    });
  });

  describe('UC5-S4/S5 — iframe rendering', () => {
    it('renders iframe with sandbox attributes when URL is provided', () => {
      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const iframe = screen.getByTitle('Embedded webpage');
      expect(iframe).toBeTruthy();
      expect(iframe.getAttribute('src')).toBe(mockUrl);
      expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-forms');
      expect(iframe.style.width).toBe('100%');
      expect(iframe.style.height).toBe('100%');
    });

    it('displays URL in read-only input when iframe is shown', () => {
      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const urlInput = screen.getByDisplayValue(mockUrl);
      expect(urlInput).toBeTruthy();
      expect((urlInput as HTMLInputElement).readOnly).toBe(true);
    });

    it('shows embedding warning when iframe is displayed', () => {
      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      expect(screen.getByText('If the page appears blank, it may not allow embedding')).toBeTruthy();
    });
  });

  describe('UC5-E3a — empty URL confirmation', () => {
    it('clears URL when Load is clicked with empty input', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      await user.click(screen.getByText('Change'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      await user.clear(input);

      await user.click(screen.getByText('Clear'));

      expect(mockOnConfigChange).toHaveBeenCalledWith({ webpageUrl: '' });
    });

    it('shows "Clear" button when input is empty', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));

      expect(screen.getByText('Clear')).toBeTruthy();
    });
  });

  describe('UC5-E3b — dismissal without confirmation', () => {
    it('closes input without changes on Cancel click', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));
      await user.click(screen.getByText('Cancel'));

      expect(mockOnConfigChange).not.toHaveBeenCalled();
      expect(screen.queryByPlaceholderText('Enter URL')).toBeFalsy();
    });

    it('closes input without changes on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      await user.type(input, mockUrl);
      await user.keyboard('{Escape}');

      expect(mockOnConfigChange).not.toHaveBeenCalled();
      expect(screen.queryByPlaceholderText('Enter URL')).toBeFalsy();
    });

    it('clears input on blur when empty', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      await user.click(document.body);

      expect(mockOnConfigChange).not.toHaveBeenCalled();
    });
  });

  describe('UC5-E4a/E4b — iframe error handling', () => {
    it('shows error message when iframe fails to load', () => {
      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const iframe = screen.getByTitle('Embedded webpage');
      fireEvent.error(iframe);

      expect(screen.getByText('Page could not be loaded')).toBeTruthy();
      expect(screen.getByText('Try different URL')).toBeTruthy();
    });

    it('provides URL input after load error', () => {
      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const iframe = screen.getByTitle('Embedded webpage');
      fireEvent.error(iframe);

      expect(screen.getByText('Try different URL')).toBeTruthy();
    });
  });

  describe('UC5-E5a — URL replacement', () => {
    it('allows changing URL via "Change" button', async () => {
      const user = userEvent.setup();
      const newUrl = 'https://newsite.com';

      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      await user.click(screen.getByText('Change'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      await user.clear(input);
      await user.type(input, newUrl);
      await user.click(screen.getByText('Load'));

      expect(mockOnConfigChange).toHaveBeenCalledWith({ webpageUrl: newUrl });
    });
  });

  describe('layout and styling', () => {
    it('uses full height container for webpage content', () => {
      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const container = screen.getByTitle('Embedded webpage').closest('div')?.parentElement;
      expect(container?.style.height).toBe('100%');
      expect(container?.style.display).toBe('flex');
      expect(container?.style.flexDirection).toBe('column');
    });

    it('positions embedding warning at bottom of iframe', () => {
      render(
        <WebpageContent
          webpageUrl={mockUrl}
          onConfigChange={mockOnConfigChange}
        />
      );

      const warning = screen.getByText('If the page appears blank, it may not allow embedding');
      expect(warning.style.position).toBe('absolute');
      expect(warning.style.bottom).toBe('8px');
    });
  });

  describe('auto-focus behavior', () => {
    it('auto-focuses URL input when shown', async () => {
      const user = userEvent.setup();

      render(
        <WebpageContent onConfigChange={mockOnConfigChange} />
      );

      await user.click(screen.getByText('Enter URL'));

      const input = screen.getByPlaceholderText('Enter URL (e.g., https://example.com)');
      expect(document.activeElement).toBe(input);
    });
  });
});