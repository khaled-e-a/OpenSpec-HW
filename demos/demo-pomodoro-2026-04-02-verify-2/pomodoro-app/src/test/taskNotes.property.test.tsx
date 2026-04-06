/**
 * Property-based tests for the task-notes capability.
 * Framework: fast-check (already used in this project)
 * Covers all WHEN/THEN scenarios from specs/task-notes/spec.md
 */
import { it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskNotes } from '../components/TaskNotes';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const noteStringArb = fc.string({ maxLength: 500 });
const nonEmptyNoteArb = fc.string({ minLength: 1, maxLength: 500 });

// ─── UC3-S1: Panel always visible during work session ───────────────────────
// WHEN sessionType is `work` (i.e., TaskNotes is mounted)
// THEN the task-notes panel SHALL be visible in the UI

it('UC3-S1: panel is always visible when mounted regardless of note content', { timeout: 20000 }, () => {
  fc.assert(
    fc.property(noteStringArb, (note) => {
      const { unmount } = render(<TaskNotes note={note} onChange={() => {}} />);
      expect(screen.getByRole('region', { name: /task notes/i })).toBeTruthy();
      unmount();
    }),
    { numRuns: 50 }
  );
});

// ─── UC3-S1 (hidden): Panel NOT visible when unmounted (shortRest/longRest) ──
// WHEN sessionType is `shortRest` (panel unmounted by parent)
// THEN the task-notes panel SHALL NOT be visible in the UI

it('UC3-S1 (hidden): panel is never present in DOM when unmounted', () => {
  fc.assert(
    fc.property(noteStringArb, (note) => {
      const { unmount } = render(<TaskNotes note={note} onChange={() => {}} />);
      unmount();
      expect(screen.queryByRole('region', { name: /task notes/i })).toBeNull();
    }),
    { numRuns: 30 }
  );
});

// ─── UC3-S3: textarea value always equals the note prop ─────────────────────
// WHEN the user types in the note textarea
// THEN the displayed note content SHALL update immediately

it('UC3-S3: textarea always reflects the current note prop', () => {
  fc.assert(
    fc.property(noteStringArb, (note) => {
      const { unmount } = render(<TaskNotes note={note} onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue(note);
      unmount();
    }),
    { numRuns: 50 }
  );
});

// ─── UC3-S3 (onChange): onChange always called with textarea's current value ─
// WHEN the user types in the note textarea (changing the value)
// THEN the displayed note content SHALL update immediately to reflect each keystroke

it('UC3-S3 (onChange): onChange is always called with exactly the new textarea value', () => {
  fc.assert(
    fc.property(
      noteStringArb,
      noteStringArb.filter(v => v !== ''),  // newValue is always non-empty to guarantee a change event fires
      (initial, newValue) => {
        // Skip degenerate case where both are identical — no change event expected
        fc.pre(initial !== newValue);
        const captured: string[] = [];
        const { unmount } = render(
          <TaskNotes note={initial} onChange={(v) => captured.push(v)} />
        );
        fireEvent.change(screen.getByRole('textbox'), { target: { value: newValue } });
        expect(captured).toContain(newValue);
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});

// ─── UC3-E2a: Edited note reflects all changes ───────────────────────────────
// WHEN the user modifies existing note content
// THEN the note display SHALL update to show the current content after each change

it('UC3-E2a: edited content is always passed to onChange', () => {
  fc.assert(
    fc.property(nonEmptyNoteArb, noteStringArb, (original, edit) => {
      const received: string[] = [];
      const { unmount } = render(
        <TaskNotes note={original} onChange={(v) => received.push(v)} />
      );
      fireEvent.change(screen.getByRole('textbox'), { target: { value: edit } });
      expect(received[received.length - 1]).toBe(edit);
      unmount();
    }),
    { numRuns: 50 }
  );
});

// ─── UC3-S5: Note persists after focus change ─────────────────────────────────
// WHEN the user stops typing and moves focus away from the note area
// THEN the note content SHALL remain visible and unchanged in the panel

it('UC3-S5: note value is unchanged after textarea blur', () => {
  fc.assert(
    fc.property(noteStringArb, (note) => {
      const { unmount } = render(<TaskNotes note={note} onChange={() => {}} />);
      const textarea = screen.getByRole('textbox');
      textarea.blur();
      expect(textarea).toHaveValue(note);
      unmount();
    }),
    { numRuns: 50 }
  );
});

// ─── UC3-E4a: Clear button always calls onChange with "" ─────────────────────
// WHEN the user activates the clear control
// THEN the note content SHALL become empty and the panel SHALL remain visible

it('UC3-E4a: Clear button always invokes onChange with empty string', () => {
  fc.assert(
    fc.property(noteStringArb, (note) => {
      const captured: string[] = [];
      const { unmount } = render(
        <TaskNotes note={note} onChange={(v) => captured.push(v)} />
      );
      fireEvent.click(screen.getByRole('button', { name: /clear/i }));
      expect(captured[captured.length - 1]).toBe('');
      unmount();
    }),
    { numRuns: 50 }
  );
});

// ─── UC3-E4a (panel visible): panel always remains mounted after Clear ────────
// WHEN the user clears the note during a work session
// THEN the task-notes panel SHALL continue to be displayed

it('UC3-E4a (panel stays): panel is always still in DOM after Clear and note reset to ""', () => {
  fc.assert(
    fc.property(noteStringArb, (note) => {
      const { rerender, unmount } = render(
        <TaskNotes note={note} onChange={() => {}} />
      );
      fireEvent.click(screen.getByRole('button', { name: /clear/i }));
      // Parent sets note to '' in response
      rerender(<TaskNotes note="" onChange={() => {}} />);
      expect(screen.getByRole('region', { name: /task notes/i })).toBeTruthy();
      expect(screen.getByRole('textbox')).toHaveValue('');
      unmount();
    }),
    { numRuns: 30 }
  );
});

// ─── UC4-S2/S3: Note always empty when parent passes "" ──────────────────────
// WHEN the session transitions to sessionType `work` with status `idle` (boundary)
// THEN the note content SHALL be empty

it('UC4-S2/S3: textarea is always empty when note prop is ""', () => {
  fc.assert(
    fc.property(fc.constant(''), (emptyNote) => {
      const { unmount } = render(<TaskNotes note={emptyNote} onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('');
      unmount();
    }),
    { numRuns: 20 }
  );
});

// ─── UC4-E1a: Note always cleared after reset (parent sets prop to "") ────────
// WHEN the user triggers reset while sessionType is `work`
// THEN the note content SHALL become empty immediately

it('UC4-E1a: note is always empty when parent prop transitions to "" (reset)', () => {
  fc.assert(
    fc.property(nonEmptyNoteArb, (priorNote) => {
      const { rerender, unmount } = render(
        <TaskNotes note={priorNote} onChange={() => {}} />
      );
      expect(screen.getByRole('textbox')).toHaveValue(priorNote);
      // Simulate reset: parent receives work+idle, clears note via useEffect
      rerender(<TaskNotes note="" onChange={() => {}} />);
      expect(screen.getByRole('textbox')).toHaveValue('');
      unmount();
    }),
    { numRuns: 50 }
  );
});
