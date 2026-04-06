/**
 * Property-based tests for session-manager spec.
 * Framework: fast-check
 * Covers: UC1-S3/S6, UC3-S4/S5/E1a, UC4-S1–S7/E3a
 */
import { it, expect } from 'vitest';
import * as fc from 'fast-check';
import { advanceSession, skipToWork, getResetState } from '../utils/sessionUtils';
import { INITIAL_STATE, WORK_DURATION, SHORT_REST_DURATION, LONG_REST_DURATION, POMODOROS_PER_CYCLE } from '../types/timer';
import type { TimerState, SessionType } from '../types/timer';

// Arbitraries
const sessionTypeArb = fc.constantFrom<SessionType>('work', 'shortRest', 'longRest');
const pomodoroCountArb = fc.integer({ min: 0, max: POMODOROS_PER_CYCLE - 1 });
const workStateArb = pomodoroCountArb.map(count => ({
  ...INITIAL_STATE,
  sessionType: 'work' as SessionType,
  pomodoroCount: count,
}));
const restSessionTypeArb = fc.constantFrom<SessionType>('shortRest', 'longRest');

// ─── UC1-S3: Initial sessionType is always work ──────────────────────────────

it('UC1-S3: initial state always has sessionType = work', () => {
  fc.assert(
    fc.property(fc.constant(null), () => {
      const state = getResetState();
      expect(state.sessionType).toBe('work');
    }),
    { numRuns: 10 }
  );
});

// ─── UC1-S6 / UC4-S1/S4: Work sessions 1–3 always advance to shortRest ──────

it('UC1-S6/UC4-S1/S4: any work session with count 0..2 always advances to shortRest', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: POMODOROS_PER_CYCLE - 2 }),  // 0,1,2
      (count) => {
        const state: TimerState = { ...INITIAL_STATE, sessionType: 'work', pomodoroCount: count };
        const next = advanceSession(state);
        expect(next.sessionType).toBe('shortRest');
        expect(next.remainingSeconds).toBe(SHORT_REST_DURATION);
        expect(next.pomodoroCount).toBe(count + 1);
      }
    ),
    { numRuns: 30 }
  );
});

// ─── UC4-S5: 4th work session (count=3) always advances to longRest ──────────

it('UC4-S5: work session with pomodoroCount=3 always triggers longRest', () => {
  fc.assert(
    fc.property(fc.constant(POMODOROS_PER_CYCLE - 1), (count) => {
      const state: TimerState = { ...INITIAL_STATE, sessionType: 'work', pomodoroCount: count };
      const next = advanceSession(state);
      expect(next.sessionType).toBe('longRest');
      expect(next.remainingSeconds).toBe(LONG_REST_DURATION);
      expect(next.pomodoroCount).toBe(0);
    }),
    { numRuns: 5 }
  );
});

// ─── UC4-S2: SHORT_REST_DURATION is always 300 ───────────────────────────────

it('UC4-S2: shortRest duration is always exactly 300 seconds (5 min)', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 2 }),
      (count) => {
        const state: TimerState = { ...INITIAL_STATE, sessionType: 'work', pomodoroCount: count };
        const next = advanceSession(state);
        expect(next.remainingSeconds).toBe(SHORT_REST_DURATION);
        expect(SHORT_REST_DURATION).toBe(300);
      }
    ),
    { numRuns: 15 }
  );
});

// ─── UC4-S3: shortRest completion always returns to work with WORK_DURATION ──

it('UC4-S3: shortRest completion always transitions to work with 1800 seconds', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: POMODOROS_PER_CYCLE }),
      (count) => {
        const state: TimerState = { ...INITIAL_STATE, sessionType: 'shortRest', pomodoroCount: count };
        const next = advanceSession(state);
        expect(next.sessionType).toBe('work');
        expect(next.remainingSeconds).toBe(WORK_DURATION);
      }
    ),
    { numRuns: 20 }
  );
});

// ─── UC4-S6: LONG_REST_DURATION is always 1500 ───────────────────────────────

it('UC4-S6: longRest duration is always exactly 1500 seconds (25 min)', () => {
  fc.assert(
    fc.property(fc.constant(POMODOROS_PER_CYCLE - 1), (count) => {
      const state: TimerState = { ...INITIAL_STATE, sessionType: 'work', pomodoroCount: count };
      const next = advanceSession(state);
      expect(next.remainingSeconds).toBe(LONG_REST_DURATION);
      expect(LONG_REST_DURATION).toBe(1500);
    }),
    { numRuns: 5 }
  );
});

// ─── UC4-S7: longRest completion always resets counter to 0 ─────────────────

it('UC4-S7: longRest completion always returns to work with pomodoroCount = 0', () => {
  fc.assert(
    fc.property(fc.constant(0), (count) => {
      const state: TimerState = { ...INITIAL_STATE, sessionType: 'longRest', pomodoroCount: count };
      const next = advanceSession(state);
      expect(next.sessionType).toBe('work');
      expect(next.remainingSeconds).toBe(WORK_DURATION);
      expect(next.pomodoroCount).toBe(0);
    }),
    { numRuns: 5 }
  );
});

// ─── UC3-S4/S5: Reset always restores work session defaults ─────────────────

it('UC3-S4/S5: getResetState always returns work session with pomodoroCount = 0', () => {
  fc.assert(
    fc.property(fc.constant(null), () => {
      const state = getResetState();
      expect(state.sessionType).toBe('work');
      expect(state.remainingSeconds).toBe(WORK_DURATION);
      expect(state.pomodoroCount).toBe(0);
      expect(state.status).toBe('idle');
    }),
    { numRuns: 10 }
  );
});

// ─── UC3-E1a: Reset is idempotent for any arbitrary prior state ─────────────

it('UC3-E1a: getResetState is always idempotent regardless of call order', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 10 }),  // arbitrary number of reset calls
      (calls) => {
        const states = Array.from({ length: calls }, () => getResetState());
        states.forEach(s => {
          expect(s).toEqual(states[0]);
        });
      }
    ),
    { numRuns: 20 }
  );
});

// ─── UC4-E3a: Skip always transitions to work from any rest session ──────────

it('UC4-E3a: skipToWork always produces work session from any rest session type', () => {
  fc.assert(
    fc.property(
      restSessionTypeArb,
      fc.integer({ min: 0, max: 599 }),  // arbitrary remaining seconds during rest
      fc.integer({ min: 0, max: POMODOROS_PER_CYCLE }),
      (sessionType, remainingSeconds, pomodoroCount) => {
        const state: TimerState = { sessionType, remainingSeconds, pomodoroCount, status: 'running' };
        const next = skipToWork(state);
        expect(next.sessionType).toBe('work');
        expect(next.remainingSeconds).toBe(WORK_DURATION);
      }
    ),
    { numRuns: 40 }
  );
});

// ─── Invariant: pomodoroCount is always in range 0..POMODOROS_PER_CYCLE ──────

it('advanceSession always keeps pomodoroCount in valid range [0, POMODOROS_PER_CYCLE]', () => {
  fc.assert(
    fc.property(workStateArb, (state) => {
      const next = advanceSession(state);
      expect(next.pomodoroCount).toBeGreaterThanOrEqual(0);
      expect(next.pomodoroCount).toBeLessThanOrEqual(POMODOROS_PER_CYCLE);
    }),
    { numRuns: 50 }
  );
});

// ─── Invariant: sessionType always transitions to a valid value ──────────────

it('advanceSession always produces a valid sessionType', () => {
  const validTypes: SessionType[] = ['work', 'shortRest', 'longRest'];
  fc.assert(
    fc.property(
      sessionTypeArb,
      pomodoroCountArb,
      (sessionType, pomodoroCount) => {
        const state: TimerState = { ...INITIAL_STATE, sessionType, pomodoroCount };
        const next = advanceSession(state);
        expect(validTypes).toContain(next.sessionType);
      }
    ),
    { numRuns: 50 }
  );
});
