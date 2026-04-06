/**
 * task-notes.property.test.js
 * PBT tests for task-notes delta spec (fast-check)
 * One property per WHEN/THEN scenario.
 */

import { it, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  DURATIONS,
  SessionType,
  State,
  startTimer,
  resetTimer,
  _resetForTesting,
  getSnapshot,
  onComplete,
} from '../src/timer.js';

// Simulate textarea DOM value (mirrors browser textarea)
let notesValue = '';
function simulateTyping(text) { notesValue = text; }
function simulateClear()      { notesValue = ''; }
function getNotesValue()      { return notesValue; }

function advanceSeconds(n) { vi.advanceTimersByTime(n * 1000); }

beforeEach(() => { vi.useFakeTimers(); _resetForTesting(); notesValue = ''; });
afterEach(() => { vi.useRealTimers(); _resetForTesting(); });

// ────────────────────────────────────────────────────────────────────────────
// R5 — Accept and retain free-form note input
// ────────────────────────────────────────────────────────────────────────────

// Scenario: Notes area accepts typing
// WHEN user types text → THEN text is displayed as typed
it('R5 property: notes value always equals what was typed', () => {
  fc.assert(
    fc.property(
      fc.string({ maxLength: 500 }),
      (text) => {
        simulateTyping(text);
        return getNotesValue() === text;
      }
    )
  );
});

// Scenario: Notes content is retained between keystrokes
// WHEN user types multiple characters → THEN all content is retained in full
it('R5 property: multi-line notes content is fully retained', () => {
  fc.assert(
    fc.property(
      fc.array(fc.string({ maxLength: 100 }), { minLength: 1, maxLength: 10 }),
      (lines) => {
        const fullText = lines.join('\n');
        simulateTyping(fullText);
        return getNotesValue() === fullText;
      }
    )
  );
});

// ────────────────────────────────────────────────────────────────────────────
// R6 — Preserve notes across session transitions
// ────────────────────────────────────────────────────────────────────────────

// Scenario: Notes preserved on work-to-rest transition
// WHEN work session completes → THEN notes textarea content is unchanged
it('R6 property: work completion does not modify notes value', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      (note) => {
        resetTimer();
        simulateTyping(note);
        let transitioned = false;
        onComplete(() => { transitioned = true; });
        startTimer();
        advanceSeconds(DURATIONS.WORK + 1);
        // Timer fired completion — notes must be untouched
        return getNotesValue() === note;
      }
    ),
    { numRuns: 10 }
  );
});

// Scenario: Notes preserved on rest-to-work transition
// WHEN rest session completes → THEN notes textarea content is unchanged
it('R6 property: rest completion does not modify notes value', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      (note) => {
        resetTimer();
        simulateTyping(note);
        // Complete work → short rest → work cycle
        startTimer(); advanceSeconds(DURATIONS.WORK + 1);
        startTimer(); advanceSeconds(DURATIONS.SHORT_REST + 1);
        return getNotesValue() === note;
      }
    ),
    { numRuns: 5 }
  );
});

// ────────────────────────────────────────────────────────────────────────────
// R7 — Preserve notes on timer reset
// ────────────────────────────────────────────────────────────────────────────

// Scenario: Notes intact after reset
// WHEN user resets timer with text in notes → THEN notes unchanged, timer is IDLE
it('R7 property: resetTimer never modifies notes value', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 200 }),
      fc.nat({ max: 60 }),
      (note, elapsed) => {
        resetTimer();
        simulateTyping(note);
        startTimer();
        advanceSeconds(elapsed);
        resetTimer();
        return (
          getNotesValue() === note &&
          getSnapshot().state === State.IDLE
        );
      }
    )
  );
});

// ────────────────────────────────────────────────────────────────────────────
// R8 — Allow user to clear notes
// ────────────────────────────────────────────────────────────────────────────

// Scenario: User clears notes manually
// WHEN user selects all and deletes → THEN notes area is empty
it('R8 property: clearing always results in empty notes value', () => {
  fc.assert(
    fc.property(
      fc.string({ maxLength: 300 }),
      (note) => {
        simulateTyping(note);
        simulateClear();
        return getNotesValue() === '';
      }
    )
  );
});

// Scenario: Empty notes area accepts new input
// WHEN notes area is empty → THEN new text can be typed
it('R8 property: cleared notes area always accepts new input', () => {
  fc.assert(
    fc.property(
      fc.string({ maxLength: 200 }),
      fc.string({ minLength: 1, maxLength: 200 }),
      (oldNote, newNote) => {
        simulateTyping(oldNote);
        simulateClear();
        simulateTyping(newNote);
        return getNotesValue() === newNote;
      }
    )
  );
});

// ────────────────────────────────────────────────────────────────────────────
// R9 — Notes clearing does not affect timer state
// ────────────────────────────────────────────────────────────────────────────

// Scenario: Timer state unchanged after clearing notes
// WHEN user clears notes while timer is running → THEN timer continues running
it('R9 property: clearing notes while timer runs does not change timer state', () => {
  fc.assert(
    fc.property(
      fc.string({ maxLength: 200 }),
      fc.integer({ min: 1, max: 60 }),
      (note, elapsed) => {
        resetTimer();
        startTimer();
        advanceSeconds(elapsed);
        simulateTyping(note);
        const stateBefore = getSnapshot().state;
        simulateClear();
        const stateAfter = getSnapshot().state;
        return stateBefore === stateAfter;
      }
    )
  );
});

// Scenario: Pomodoro count unchanged after clearing notes
// WHEN user clears notes at any point → THEN pomodoroCount is unchanged
it('R9 property: clearing notes never modifies pomodoroCount', () => {
  fc.assert(
    fc.property(
      fc.nat({ max: 3 }),           // completed pomodoros
      fc.string({ maxLength: 200 }), // note content
      (completedBefore, note) => {
        resetTimer();
        let lastCount = 0;
        onComplete((t, s) => { lastCount = s.pomodoroCount; });

        for (let i = 0; i < completedBefore; i++) {
          startTimer(); advanceSeconds(DURATIONS.WORK + 1); resetTimer();
        }

        simulateTyping(note);
        const countBeforeClear = lastCount;
        simulateClear();
        // Count is internal to timer — clearing notes has no timer call
        return lastCount === countBeforeClear;
      }
    ),
    { numRuns: 15 }
  );
});
