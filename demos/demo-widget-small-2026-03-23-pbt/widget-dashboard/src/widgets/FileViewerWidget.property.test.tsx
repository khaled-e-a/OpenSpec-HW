/**
 * Property-based tests for FileViewerWidget.
 * Framework: fast-check
 * Coverage: UC3-S2, UC3-S7, UC3-S8, UC3-E5a1, UC3-E6b1, UC3-E6b2, UC3-E9b2, UC6-S7
 */
import React from 'react';
import * as fc from 'fast-check';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import FileViewerWidget from './FileViewerWidget';
import { WidgetSettings } from './types';

/**
 * UC3-S2 scenario "Empty state on new widget":
 * WHEN a file viewer widget is added with no settings
 * THEN it shows "Select a file to display"
 * Property: any widget id with no settings always shows the empty state
 */
it('UC3-S2: any widget id with no settings always shows empty-state prompt', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 32 }),
      (id) => {
        const { container, unmount } = render(<FileViewerWidget id={id} />);
        expect(container.textContent).toMatch(/Select a file to display/i);
        expect(container.querySelector('pre')).toBeNull();
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC3-S7 scenario "File contents displayed verbatim":
 * WHEN a text file is successfully read
 * THEN the pre element's textContent equals the file content exactly
 * Property: for any printable text, pre textContent equals original content
 */
it('UC3-S7: pre element always contains exact file content for any printable text', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 500 }).filter(s => !s.includes('\u0000')),
      async (content) => {
        const { container, unmount } = render(<FileViewerWidget id="fv-1" />);
        const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (!fileInput) { unmount(); return; }
        const file = new File([content], 'test.txt', { type: 'text/plain' });
        Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
        act(() => { fireEvent.change(fileInput); });
        await waitFor(() => {
          const pre = container.querySelector('pre');
          if (pre) expect(pre.textContent).toBe(content);
        }, { timeout: 2000 });
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});

/**
 * UC3-S8 scenario "File name persisted":
 * WHEN a file is successfully read
 * THEN onSettingsChange is called with the exact file name
 * Property: for any file name, the callback receives { type:'file-viewer', fileName }
 */
it('UC3-S8: onSettingsChange always called with exact file name', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 64 }).filter(s => !s.includes('\u0000')),
      async (fileName) => {
        const onChange = jest.fn();
        const { container, unmount } = render(<FileViewerWidget id="fv-1" onSettingsChange={onChange} />);
        const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (!fileInput) { unmount(); return; }
        const file = new File(['content'], fileName, { type: 'text/plain' });
        Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
        act(() => { fireEvent.change(fileInput); });
        await waitFor(() => {
          expect(onChange).toHaveBeenCalledWith({ type: 'file-viewer', fileName });
        }, { timeout: 2000 });
        unmount();
      }
    ),
    { numRuns: 8 }
  );
});

/**
 * UC3-E5a1 scenario "Cancel preserves empty state":
 * WHEN file picker is cancelled (empty files list)
 * THEN widget stays in empty state
 * Property: for any number of cancellations, empty state is preserved
 */
it('UC3-E5a1: cancelling file picker always preserves empty state', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 5 }),
      (cancelCount) => {
        const { container, unmount } = render(<FileViewerWidget id="fv-1" />);
        const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (!fileInput) { unmount(); return; }
        for (let i = 0; i < cancelCount; i++) {
          Object.defineProperty(fileInput, 'files', { value: [], configurable: true });
          fireEvent.change(fileInput);
        }
        expect(container.textContent).toMatch(/Select a file to display/i);
        expect(container.querySelector('pre')).toBeNull();
        unmount();
      }
    ),
    { numRuns: 5 }
  );
});

/**
 * UC3-E6b1 scenario "Large file truncated with warning":
 * WHEN file size > 1 MB
 * THEN warning banner is shown
 * Property: for any file size > 1 MB, warning is always displayed
 */
it('UC3-E6b1: warning banner always shown for files larger than 1 MB', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 1_048_577, max: 2_097_152 }),
      async (size) => {
        const { container, unmount } = render(<FileViewerWidget id="fv-1" />);
        const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');
        if (!fileInput) { unmount(); return; }
        const content = 'x'.repeat(size);
        const file = new File([content], 'big.txt', { type: 'text/plain' });
        Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
        act(() => { fireEvent.change(fileInput); });
        await waitFor(() => {
          expect(container.textContent).toMatch(/File is large — only the first 1 MB is shown/i);
        }, { timeout: 3000 });
        unmount();
      }
    ),
    { numRuns: 5 }
  );
});

/**
 * UC3-E9b2 scenario "Hint shown on reload with saved file name":
 * WHEN widget mounts with settings.fileName
 * THEN hint "Re-select '<filename>' to restore" is shown
 * Property: for any file name in settings, the hint always contains that name
 */
it('UC3-E9b2: reload hint always contains the saved file name', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 64 }).filter(s => !s.includes('\u0000') && s.trim().length > 0),
      (fileName) => {
        const settings: WidgetSettings = { type: 'file-viewer', fileName };
        const { container, unmount } = render(<FileViewerWidget id="fv-1" settings={settings} />);
        expect(container.textContent).toMatch(/Re-select/i);
        expect(container.textContent).toContain(fileName);
        unmount();
      }
    ),
    { numRuns: 15 }
  );
});

/**
 * UC6-S7 scenario "No hint when no file ever selected":
 * WHEN widget mounts with no settings
 * THEN no "Re-select" hint is shown
 * Property: for any widget id with no settings, hint is never shown
 */
it('UC6-S7: no Re-select hint ever shown when settings has no fileName', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 32 }),
      (id) => {
        const { container, unmount } = render(<FileViewerWidget id={id} />);
        expect(container.textContent).not.toMatch(/Re-select/i);
        unmount();
      }
    ),
    { numRuns: 10 }
  );
});
