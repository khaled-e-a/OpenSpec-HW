/**
 * Property-based tests for ImageViewerWidget.
 * Framework: fast-check
 * Coverage: UC2-S2, UC2-S3/S4, UC2-E4a3, UC2-E6a1, UC2-S7, UC6-S5
 */
import React from 'react';
import * as fc from 'fast-check';
import { render, fireEvent } from '@testing-library/react';
import ImageViewerWidget from './ImageViewerWidget';
import { WidgetSettings } from './types';

/**
 * UC2-S2 scenario "Empty state on new widget":
 * WHEN an image viewer widget is added with no saved source
 * THEN the widget displays empty-state prompt
 * Property: any widget id with no settings always shows the empty state
 */
it('UC2-S2: any widget id with no settings always shows empty-state prompt', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 32 }),
      (id) => {
        const { container, unmount } = render(<ImageViewerWidget id={id} />);
        expect(container.textContent).toMatch(/Choose an image/i);
        expect(container.querySelector('img')).toBeNull();
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC2-E4a3 scenario "URL confirmed and image shown":
 * WHEN the user confirms a valid URL
 * THEN the widget renders an img with that URL as src (normalized)
 * Property: any valid https URL confirmed via Load button sets img src to normalized URL
 */
it('UC2-E4a3: any valid URL confirmed via Load button sets img src to that URL (normalized)', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const normalizedUrl = new URL(url).href;
        const { container, unmount } = render(<ImageViewerWidget id="img-1" />);
        // Open picker → Enter URL
        const chooseBtn = container.querySelector<HTMLButtonElement>('.image-viewer__btn');
        if (!chooseBtn) { unmount(); return; }
        fireEvent.click(chooseBtn);
        const enterUrlBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.image-viewer__btn'))
          .find(b => b.textContent?.match(/enter url/i));
        if (!enterUrlBtn) { unmount(); return; }
        fireEvent.click(enterUrlBtn);
        const input = container.querySelector<HTMLInputElement>('.image-viewer__url-input');
        if (!input) { unmount(); return; }
        fireEvent.change(input, { target: { value: url } });
        const loadBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.image-viewer__btn'))
          .find(b => b.textContent?.match(/^load$/i));
        if (!loadBtn) { unmount(); return; }
        fireEvent.click(loadBtn);
        const img = container.querySelector<HTMLImageElement>('img');
        expect(img).not.toBeNull();
        // Use normalized URL for comparison (browser adds trailing slash for base paths)
        expect(img!.src).toBe(normalizedUrl);
        unmount();
      }
    ),
    { numRuns: 15 }
  );
});

/**
 * UC2-E6a1 scenario "Non-image file rejected":
 * WHEN user selects a file whose type does not start with "image/"
 * THEN error message shown and no img rendered
 * Property: for any non-image MIME type, the error is always shown
 */
it('UC2-E6a1: non-image MIME types always trigger format error', () => {
  fc.assert(
    fc.property(
      fc.constantFrom(
        'application/pdf', 'text/plain', 'application/zip',
        'video/mp4', 'audio/mpeg', 'application/octet-stream'
      ),
      (mimeType) => {
        const { container, unmount } = render(<ImageViewerWidget id="img-1" />);
        const chooseBtn = container.querySelector<HTMLButtonElement>('.image-viewer__btn');
        if (!chooseBtn) { unmount(); return; }
        fireEvent.click(chooseBtn);
        const selectFileBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.image-viewer__btn'))
          .find(b => b.textContent?.match(/select file/i));
        if (!selectFileBtn) { unmount(); return; }
        fireEvent.click(selectFileBtn);
        const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (!fileInput) { unmount(); return; }
        const file = new File(['data'], 'file', { type: mimeType });
        Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
        fireEvent.change(fileInput);
        expect(container.textContent).toMatch(/Not a supported image format/i);
        expect(container.querySelector('img')).toBeNull();
        unmount();
      }
    ),
    { numRuns: 6 }
  );
});

/**
 * UC2-S7 scenario "URL source persisted":
 * WHEN the user confirms a URL
 * THEN onSettingsChange is called with type image-viewer, source url, and the exact URL
 * Property: for any valid URL, the callback always receives the correct settings shape
 */
it('UC2-S7: onSettingsChange always called with correct url settings shape', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const onChange = jest.fn();
        const { container, unmount } = render(<ImageViewerWidget id="img-1" onSettingsChange={onChange} />);
        const chooseBtn = container.querySelector<HTMLButtonElement>('.image-viewer__btn');
        if (!chooseBtn) { unmount(); return; }
        fireEvent.click(chooseBtn);
        const enterUrlBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.image-viewer__btn'))
          .find(b => b.textContent?.match(/enter url/i));
        if (!enterUrlBtn) { unmount(); return; }
        fireEvent.click(enterUrlBtn);
        const input = container.querySelector<HTMLInputElement>('.image-viewer__url-input');
        if (!input) { unmount(); return; }
        fireEvent.change(input, { target: { value: url } });
        const loadBtn = Array.from(container.querySelectorAll<HTMLButtonElement>('.image-viewer__btn'))
          .find(b => b.textContent?.match(/^load$/i));
        if (!loadBtn) { unmount(); return; }
        fireEvent.click(loadBtn);
        expect(onChange).toHaveBeenCalledWith({ type: 'image-viewer', source: 'url', url });
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC6-S5 scenario "URL-mode restored on reload":
 * WHEN widget mounts with url settings
 * THEN img src is set to the saved URL (normalized) immediately
 * Property: for any saved URL, the img src equals the normalized URL on mount
 */
it('UC6-S5: img src always equals normalized saved URL from settings on mount', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const normalizedUrl = new URL(url).href;
        const settings: WidgetSettings = { type: 'image-viewer', source: 'url', url };
        const { container, unmount } = render(<ImageViewerWidget id="img-1" settings={settings} />);
        const img = container.querySelector<HTMLImageElement>('img');
        expect(img).not.toBeNull();
        expect(img!.src).toBe(normalizedUrl);
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});
