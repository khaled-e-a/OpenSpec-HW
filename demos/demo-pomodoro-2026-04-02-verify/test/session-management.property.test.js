/**
 * session-management.property.test.js
 * PBT tests for session-management delta spec (fast-check)
 * One property per WHEN/THEN scenario.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

function advanceSeconds(n) { vi.advanceTimersByTime(n * 1000); }

beforeEach(() => { vi.useFakeTimers(); _resetForTesting(); });
afterEach(() => { vi.useRealTimers(); _resetForTesting(); });

// ────────────────────────────────────────────────────────────────────────────
// R1 — Session durations are fixed constants
// ────────────────────────────────────────────────────────────────────────────

// Scenario: Work session duration
// WHEN a Work Session starts → THEN initial countdown is exactly 1800 s
it('UC1-S2 property: Work session always starts at 1800 s regardless of system state', () => {
  fc.assert(
    fc.property(
      fc.nat({ max: 100 }), // arbitrary number of previous resets
      (resets) => {
        for (let i = 0; i < resets; i++) resetTimer();
        const snap = getSnapshot();
        return snap.sessionType === SessionType.WORK
          ? snap.remainingSeconds === DURATIONS.WORK
          : true; // only assert when in Work state
      }
    )
  );
});

// Scenario: Short Rest duration
// WHEN a Short Rest starts → THEN initial countdown is exactly 300 s
it('UC1-S2/R1 property: SHORT_REST duration constant is always 300', () => {
  fc.assert(
    fc.property(
      fc.nat({ max: 10 }),
      (_ignored) => DURATIONS.SHORT_REST === 300
    )
  );
});

// Scenario: Long Rest duration
// WHEN a Long Rest starts → THEN initial countdown is exactly 1500 s
it('UC2-S1 property: LONG_REST duration constant is always 1500', () => {
  fc.assert(
    fc.property(
      fc.nat({ max: 10 }),
      (_ignored) => DURATIONS.LONG_REST === 1500
    )
  );
});

// ────────────────────────────────────────────────────────────────────────────
// R2 — Determine next session type after work session
// ────────────────────────────────────────────────────────────────────────────

// Helper: naturally cycle through N work sessions (with rests between them)
// Returns the snapshot produced when the Nth work session completes.
function runNWorkSessionsNaturally(n) {
  let lastWorkSnap = null;
  onComplete((type, snap) => {
    if (type === SessionType.WORK) lastWorkSnap = snap;
  });
  for (let i = 0; i < n; i++) {
    startTimer(); advanceSeconds(DURATIONS.WORK + 1);           // complete work
    if (i < n - 1) { startTimer(); advanceSeconds(DURATIONS.SHORT_REST + 1); } // cycle rest except last
  }
  return lastWorkSnap;
}

// Scenario: Transition to Short Rest (non-multiple of 4)
// WHEN count % 4 !== 0 → THEN next session is Short Rest
it('UC1-S7 property: after non-multiple-of-4 work completion, next is SHORT_REST', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 3 }), // safe range: 1, 2, 3 (all non-multiples of 4)
      (targetCount) => {
        _resetForTesting();
        const snap = runNWorkSessionsNaturally(targetCount);
        return snap?.sessionType === SessionType.SHORT_REST;
      }
    ),
    { numRuns: 3 }
  );
});

// Scenario: Transition to Long Rest (multiple of 4)
// WHEN count % 4 === 0 → THEN next session is Long Rest (25 min)
it('UC1-E7a1 property: after 4th work completion, next is LONG_REST at 1500 s', () => {
  fc.assert(
    fc.property(
      fc.constant(4),
      (targetCount) => {
        _resetForTesting();
        // Cycle through 3 work→rest pairs, then complete 4th work without consuming rest
        let finalSnap = null;
        onComplete((type, snap) => { if (type === SessionType.WORK) finalSnap = snap; });
        for (let i = 0; i < targetCount - 1; i++) {
          startTimer(); advanceSeconds(DURATIONS.WORK + 1);
          startTimer(); advanceSeconds(DURATIONS.SHORT_REST + 1);
        }
        startTimer(); advanceSeconds(DURATIONS.WORK + 1);
        return (
          finalSnap?.sessionType === SessionType.LONG_REST &&
          finalSnap?.remainingSeconds === 1500
        );
      }
    ),
    { numRuns: 1 }
  );
});

// Scenario: Fourth pomodoro triggers Long Rest
// WHEN the 4th work session completes → THEN next session is Long Rest (25 min)
it('UC1-E7a1 property: exactly the 4th pomodoro always triggers Long Rest', () => {
  fc.assert(
    fc.property(
      fc.constant(null),
      () => {
        _resetForTesting();
        let snaps = [];
        onComplete((type, snap) => { if (type === SessionType.WORK) snaps.push(snap); });
        for (let i = 0; i < 3; i++) {
          startTimer(); advanceSeconds(DURATIONS.WORK + 1);
          startTimer(); advanceSeconds(DURATIONS.SHORT_REST + 1);
        }
        startTimer(); advanceSeconds(DURATIONS.WORK + 1);
        const afterFourth = snaps[snaps.length - 1];
        return (
          afterFourth?.sessionType === SessionType.LONG_REST &&
          afterFourth?.remainingSeconds === DURATIONS.LONG_REST
        );
      }
    ),
    { numRuns: 1 }
  );
});

// Scenario: First three pomodoros trigger Short Rest
// WHEN 1st/2nd/3rd pomodoro completes → THEN next session is Short Rest
it('UC1-S7 property: first three pomodoros always yield Short Rest', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 3 }),
      (nthPomodoro) => {
        _resetForTesting();
        const snap = runNWorkSessionsNaturally(nthPomodoro);
        return snap?.sessionType === SessionType.SHORT_REST;
      }
    ),
    { numRuns: 3 }
  );
});
