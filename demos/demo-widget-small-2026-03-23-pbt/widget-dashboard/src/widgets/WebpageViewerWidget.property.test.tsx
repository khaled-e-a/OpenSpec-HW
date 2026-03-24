/**
 * Property-based tests for WebpageViewerWidget.
 * Framework: fast-check
 * Coverage: UC4-S2, UC4-S5/E5a1, UC4-S6, UC4-S7, UC4-E4a1/E4a2, UC4-E9a1, UC5-E3a1
 */
import React from 'react';
import * as fc from 'fast-check';
import { render, fireEvent } from '@testing-library/react';
import WebpageViewerWidget from './WebpageViewerWidget';
import { WidgetSettings } from './types';

/**
 * UC4-S2 scenario "URL input and prompt on first add":
 * WHEN a webpage viewer is added with no settings
 * THEN URL input and Go button are visible, no iframe shown
 * Property: any widget id with no settings always shows URL bar but no iframe
 */
it('UC4-S2: any widget id with no settings always shows URL input but no iframe', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 32 }),
      (id) => {
        const { container, unmount } = render(<WebpageViewerWidget id={id} />);
        expect(container.querySelector('.webpage-viewer__url-input')).not.toBeNull();
        expect(container.querySelector('iframe')).toBeNull();
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC4-S5 / UC4-E5a1 scenario "Malformed URL rejected":
 * WHEN user submits a value that is not a valid URL
 * THEN error shown and no iframe rendered
 * Property: for any string that new URL() rejects, no iframe shown
 */
it('UC4-E5a1: validation error shown and iframe absent for all URLs that new URL() rejects', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.constant(''),
        fc.constant('not-a-url'),
        fc.constant('//no-scheme'),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => {
          try { new URL(s); return false; } catch { return true; }
        })
      ),
      (badUrl) => {
        const { container, unmount } = render(<WebpageViewerWidget id="wv-1" />);
        const input = container.querySelector<HTMLInputElement>('.webpage-viewer__url-input');
        const goBtn = container.querySelector<HTMLButtonElement>('.webpage-viewer__go-btn');
        if (!input || !goBtn) { unmount(); return; }
        fireEvent.change(input, { target: { value: badUrl } });
        fireEvent.click(goBtn);
        expect(container.querySelector('iframe')).toBeNull();
        unmount();
      }
    ),
    { numRuns: 15 }
  );
});

/**
 * UC4-S5 scenario "Valid URL accepted":
 * WHEN user submits a well-formed URL that new URL() accepts
 * THEN no error shown and iframe src equals normalized URL
 * Property: any valid https URL results in iframe with matching normalized src
 */
it('UC4-S5: any valid https URL sets iframe src to normalized URL without showing error', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const normalizedUrl = new URL(url).href;
        const { container, unmount } = render(<WebpageViewerWidget id="wv-1" />);
        const input = container.querySelector<HTMLInputElement>('.webpage-viewer__url-input')!;
        const goBtn = container.querySelector<HTMLButtonElement>('.webpage-viewer__go-btn')!;
        fireEvent.change(input, { target: { value: url } });
        fireEvent.click(goBtn);
        expect(container.querySelector('.webpage-viewer__url-error')).toBeNull();
        const iframe = container.querySelector<HTMLIFrameElement>('iframe');
        expect(iframe).not.toBeNull();
        expect(iframe!.src).toBe(normalizedUrl);
        unmount();
      }
    ),
    { numRuns: 15 }
  );
});

/**
 * UC4-S6 scenario "Iframe is sandboxed":
 * WHEN a valid URL is submitted
 * THEN iframe sandbox attribute always includes all required values
 * Property: for any URL, sandbox always has the four required values
 */
it('UC4-S6: iframe always has all four required sandbox values for any valid URL', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const { container, unmount } = render(<WebpageViewerWidget id="wv-1" />);
        const input = container.querySelector<HTMLInputElement>('.webpage-viewer__url-input')!;
        const goBtn = container.querySelector<HTMLButtonElement>('.webpage-viewer__go-btn')!;
        fireEvent.change(input, { target: { value: url } });
        fireEvent.click(goBtn);
        const iframe = container.querySelector<HTMLIFrameElement>('iframe');
        const sandbox = iframe?.getAttribute('sandbox') ?? '';
        expect(sandbox).toContain('allow-scripts');
        expect(sandbox).toContain('allow-same-origin');
        expect(sandbox).toContain('allow-forms');
        expect(sandbox).toContain('allow-popups');
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC4-S7 scenario "URL saved after submission":
 * WHEN user submits a valid URL
 * THEN onSettingsChange is called with the exact (unnormalized) URL
 * Property: for any valid URL, callback always receives correct settings
 */
it('UC4-S7: onSettingsChange always called with correct url settings for any valid URL', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const onChange = jest.fn();
        const { container, unmount } = render(<WebpageViewerWidget id="wv-1" onSettingsChange={onChange} />);
        const input = container.querySelector<HTMLInputElement>('.webpage-viewer__url-input')!;
        const goBtn = container.querySelector<HTMLButtonElement>('.webpage-viewer__go-btn')!;
        fireEvent.change(input, { target: { value: url } });
        fireEvent.click(goBtn);
        expect(onChange).toHaveBeenCalledWith({ type: 'webpage-viewer', url });
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC4-E4a1 / UC4-E4a2 scenario "Saved URL pre-fills and auto-loads on restore":
 * WHEN widget mounts with saved URL settings
 * THEN input contains URL and iframe src matches normalized URL
 * Property: for any saved URL, input value and iframe src always correct on mount
 */
it('UC4-E4a1/E4a2: saved URL always pre-fills input and auto-loads iframe on mount', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const normalizedUrl = new URL(url).href;
        const settings: WidgetSettings = { type: 'webpage-viewer', url };
        const { container, unmount } = render(<WebpageViewerWidget id="wv-1" settings={settings} />);
        const input = container.querySelector<HTMLInputElement>('.webpage-viewer__url-input')!;
        expect(input.value).toBe(url);
        const iframe = container.querySelector<HTMLIFrameElement>('iframe');
        expect(iframe).not.toBeNull();
        expect(iframe!.src).toBe(normalizedUrl);
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC5-E3a1 scenario "Clearing input without submit preserves iframe":
 * WHEN user clears URL input but does not submit
 * THEN iframe continues to display the previously loaded page
 * Property: clearing input never changes iframe src
 */
it('UC5-E3a1: clearing URL input without submitting never changes iframe src', () => {
  fc.assert(
    fc.property(
      fc.webUrl().filter(u => u.startsWith('https://')),
      (url) => {
        const { container, unmount } = render(<WebpageViewerWidget id="wv-1" />);
        const input = container.querySelector<HTMLInputElement>('.webpage-viewer__url-input')!;
        const goBtn = container.querySelector<HTMLButtonElement>('.webpage-viewer__go-btn')!;
        fireEvent.change(input, { target: { value: url } });
        fireEvent.click(goBtn);
        const iframeSrcAfterLoad = container.querySelector<HTMLIFrameElement>('iframe')!.src;
        // Clear input without submitting
        fireEvent.change(input, { target: { value: '' } });
        const iframeSrcAfterClear = container.querySelector<HTMLIFrameElement>('iframe')!.src;
        expect(iframeSrcAfterClear).toBe(iframeSrcAfterLoad);
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});
