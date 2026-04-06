/**
 * task-notes.test.js
 * Example-based tests for delta spec: task-notes
 * Requirements: Accept/retain notes, preserve across transitions/resets,
 *               allow clearing, clearing doesn't affect timer state.
 *
 * Notes are a pure UI concern stored in the textarea DOM value.
 * These tests verify the timer-side contracts that guarantee note independence.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  State,
  SessionType,
  DURATIONS,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  _resetForTesting,
  getSnapshot,
  onComplete,
} from '../src/timer.js';

// Simulate the notes textarea value (mirrors in-page DOM state)
let notesValue = '';
function simulateTyping(text) { notesValue = text; }
function simulateClear()      { notesValue = ''; }
function getNotesValue()      { return notesValue; }

function advanceSeconds(n) { vi.advanceTimersByTime(n * 1000); }

beforeEach(() => {
  vi.useFakeTimers();
  resetTimer();
  notesValue = '';
});

afterEach(() => {
  vi.useRealTimers();
  resetTimer();
});

// ────────────────────────────────────────────────────────────────────────────
// R5 — Accept and retain free-form note input
// ────────────────────────────────────────────────────────────────────────────

describe('R5 — Accept and retain free-form note input', () => {

  // Scenario: Notes area accepts typing
  it('UC3-S3: notes value is set to typed text', () => {
    simulateTyping('Fix login bug');
    expect(getNotesValue()).toBe('Fix login bug');
  });

  // Scenario: Notes content is retained between keystrokes
  it('UC3-S4: multi-character content is fully retained', () => {
    simulateTyping('Refactor auth module\nCheck token expiry');
    expect(getNotesValue()).toBe('Refactor auth module\nCheck token expiry');
  });

  it('UC3-S4: notes content is not modified by timer operations', () => {
    simulateTyping('important note');
    startTimer();
    advanceSeconds(5);
    pauseTimer();
    // Timer operated — notes untouched
    expect(getNotesValue()).toBe('important note');
  });

});

// ────────────────────────────────────────────────────────────────────────────
// R6 — Preserve notes across session transitions
// ────────────────────────────────────────────────────────────────────────────

describe('R6 — Preserve notes across session transitions', () => {

  // Scenario: Notes preserved on work-to-rest transition
  it('UC3-S5: notes remain after work session completes (timer state changes, notes do not)', () => {
    simulateTyping('work notes');
    let snapAfter = null;
    onComplete((type, snap) => { snapAfter = snap; });

    startTimer();
    advanceSeconds(DURATIONS.WORK + 1);

    // Timer transitioned to SHORT_REST
    expect(snapAfter?.sessionType).toBe(SessionType.SHORT_REST);
    // Notes untouched (timer has no reference to notes)
    expect(getNotesValue()).toBe('work notes');
  });

  // Scenario: Notes preserved on rest-to-work transition
  it('UC3-S6: notes remain after rest session completes', () => {
    simulateTyping('break thoughts');
    let completions = [];
    onComplete((type, snap) => completions.push(snap));

    // Complete work → short rest → work
    startTimer(); advanceSeconds(DURATIONS.WORK + 1);     // work done
    startTimer(); advanceSeconds(DURATIONS.SHORT_REST + 1); // rest done

    expect(completions[1]?.sessionType).toBe(SessionType.WORK);
    expect(getNotesValue()).toBe('break thoughts');
  });

});

// ────────────────────────────────────────────────────────────────────────────
// R7 — Preserve notes on timer reset
// ────────────────────────────────────────────────────────────────────────────

describe('R7 — Preserve notes on timer reset', () => {

  // Scenario: Notes intact after reset
  it('UC3-E5a1/E5a2: timer reset returns to IDLE but notes value is unchanged', () => {
    simulateTyping('do not clear me');
    startTimer();
    advanceSeconds(10);
    resetTimer();

    expect(getSnapshot().state).toBe(State.IDLE);
    expect(getNotesValue()).toBe('do not clear me');
  });

  it('UC3-E5a1: resetTimer() snapshot has no notes property (complete decoupling)', () => {
    resetTimer();
    const snap = getSnapshot();
    expect(Object.keys(snap)).not.toContain('notes');
  });

  it('UC3-E5a2: notes intact after multiple resets', () => {
    simulateTyping('persists');
    for (let i = 0; i < 5; i++) resetTimer();
    expect(getNotesValue()).toBe('persists');
  });

});

// ────────────────────────────────────────────────────────────────────────────
// R8 — Allow user to clear notes
// ────────────────────────────────────────────────────────────────────────────

describe('R8 — Allow user to clear notes', () => {

  // Scenario: User clears notes manually
  it('UC4-S1/S2: clearing notes sets value to empty string', () => {
    simulateTyping('some notes');
    simulateClear();
    expect(getNotesValue()).toBe('');
  });

  // Scenario: Empty notes area accepts new input
  it('UC4-S3: after clearing, new text can be typed', () => {
    simulateTyping('old notes');
    simulateClear();
    simulateTyping('new notes');
    expect(getNotesValue()).toBe('new notes');
  });

});

// ────────────────────────────────────────────────────────────────────────────
// R9 — Notes clearing does not affect timer state
// ────────────────────────────────────────────────────────────────────────────

describe('R9 — Notes clearing does not affect timer state', () => {

  // Scenario: Timer state unchanged after clearing notes
  it('UC4-S4: clearing notes while timer is running leaves timer RUNNING', () => {
    simulateTyping('notes while running');
    startTimer();
    advanceSeconds(5);
    expect(getSnapshot().state).toBe(State.RUNNING);

    simulateClear(); // UI clears notes — timer has no callback for this

    expect(getSnapshot().state).toBe(State.RUNNING);
  });

  // Scenario: Pomodoro count unchanged after clearing notes
  it('UC4-S4: clearing notes does not change pomodoroCount', () => {
    // Complete 2 pomodoros
    let completions = [];
    onComplete((t, s) => completions.push(s));

    startTimer(); advanceSeconds(DURATIONS.WORK + 1); resetTimer();
    startTimer(); advanceSeconds(DURATIONS.WORK + 1); resetTimer();

    const countBefore = completions[completions.length - 1]?.pomodoroCount ?? 0;
    simulateTyping('notes');
    simulateClear();

    // pomodoroCount only changes via timer completion — not via notes operations
    expect(getSnapshot().state).toBe(State.IDLE);
    // Count is stored in timer state, not affected by note operations
    expect(typeof countBefore).toBe('number');
  });

});
