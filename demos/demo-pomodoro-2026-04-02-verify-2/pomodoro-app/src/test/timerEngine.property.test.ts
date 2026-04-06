/**
 * Property-based tests for timer-engine spec.
 * Framework: fast-check
 * Covers: UC1-S1/S2/S4/S5/E5a, UC2-S2/S6/E2a
 */
import { it, beforeEach, afterEach } from 'vitest';
import { expect } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePomodoro } from '../hooks/usePomodoro';
import { WORK_DURATION } from '../types/timer';

vi.mock('../utils/audioUtils', () => ({ playCompletionTone: vi.fn() }));

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

// ─── UC1-S1: Timer starts from configured duration ───────────────────────────

it('UC1-S1: timer always starts from the session full duration', () => {
  fc.assert(
    fc.property(
      // arbitrary elapsed time before start is called (0 ms — just exploring different env states)
      fc.nat({ max: 5000 }),
      (preElapsed) => {
        const { result } = renderHook(() => usePomodoro());
        // advance some time before starting (simulates arbitrary env delay)
        act(() => { vi.advanceTimersByTime(preElapsed); });
        act(() => { result.current.startTimer(); });
        // immediately after start, remaining should equal full work duration
        expect(result.current.state.remainingSeconds).toBe(WORK_DURATION);
      }
    ),
    { numRuns: 25 }
  );
});

// ─── UC1-S2: Each tick decrements by exactly 1 second ───────────────────────

it('UC1-S2: each tick decrements remaining by exactly 1 second', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 50 }),   // number of ticks to observe
      (ticks) => {
        const { result } = renderHook(() => usePomodoro());
        act(() => { result.current.startTimer(); });
        const before = result.current.state.remainingSeconds;
        act(() => { vi.advanceTimersByTime(ticks * 1000); });
        const after = result.current.state.remainingSeconds;
        // Each tick decrements by 1; total decrement = ticks
        expect(before - after).toBe(ticks);
      }
    ),
    { numRuns: 30 }
  );
});

// ─── UC1-S4: Countdown runs without input until zero ────────────────────────

it('UC1-S4: running timer always decrements without additional user input', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 30 }),
      (ticks) => {
        const { result } = renderHook(() => usePomodoro());
        act(() => { result.current.startTimer(); });
        act(() => { vi.advanceTimersByTime(ticks * 1000); });
        const remaining = result.current.state.remainingSeconds;
        // No pause/reset was called — remaining must be strictly less than start
        expect(remaining).toBeLessThan(WORK_DURATION);
        expect(remaining).toBeGreaterThanOrEqual(0);
      }
    ),
    { numRuns: 30 }
  );
});

// ─── UC1-S5: Status becomes 'completed' when remaining reaches 0 ─────────────

it('UC1-S5: status is always "completed" when remaining reaches 0', () => {
  fc.assert(
    fc.property(
      fc.constant(WORK_DURATION),  // invariant: always the full duration
      (duration) => {
        const { result } = renderHook(() => usePomodoro());
        act(() => { result.current.startTimer(); });
        act(() => { vi.advanceTimersByTime(duration * 1000); });
        expect(result.current.state.status).toBe('completed');
        expect(result.current.state.remainingSeconds).toBe(0);
      }
    ),
    { numRuns: 5 }
  );
});

// ─── UC1-E5a: Completed state persists without user action ──────────────────

it('UC1-E5a: completed state persists for any arbitrary extra elapsed time', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1000, max: 60000 }),  // arbitrary extra ms after completion
      (extraMs) => {
        const { result } = renderHook(() => usePomodoro());
        act(() => { result.current.startTimer(); });
        act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
        expect(result.current.state.status).toBe('completed');
        // Extra time passes — no start called — status must stay 'completed'
        act(() => { vi.advanceTimersByTime(extraMs); });
        expect(result.current.state.status).toBe('completed');
        expect(result.current.state.remainingSeconds).toBe(0);
      }
    ),
    { numRuns: 20 }
  );
});

// ─── UC2-S2: Pause always freezes remaining time ────────────────────────────

it('UC2-S2: remaining time is always frozen after pause regardless of when pause occurs', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 20 }),   // seconds elapsed before pause
      fc.integer({ min: 1, max: 20 }),   // seconds elapsed after pause
      (before, after) => {
        const { result } = renderHook(() => usePomodoro());
        act(() => { result.current.startTimer(); });
        act(() => { vi.advanceTimersByTime(before * 1000); });
        act(() => { result.current.pauseTimer(); });
        const frozenAt = result.current.state.remainingSeconds;
        act(() => { vi.advanceTimersByTime(after * 1000); });
        // Invariant: remaining does NOT change while paused
        expect(result.current.state.remainingSeconds).toBe(frozenAt);
      }
    ),
    { numRuns: 30 }
  );
});

// ─── UC2-S6: Resume always continues from the frozen remaining time ──────────

it('UC2-S6: after resume, timer decrements from exactly the frozen value', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 15 }),
      fc.integer({ min: 1, max: 15 }),
      fc.integer({ min: 1, max: 10 }),
      (before, pauseDuration, afterResume) => {
        const { result } = renderHook(() => usePomodoro());
        act(() => { result.current.startTimer(); });
        act(() => { vi.advanceTimersByTime(before * 1000); });
        act(() => { result.current.pauseTimer(); });
        const frozen = result.current.state.remainingSeconds;
        act(() => { vi.advanceTimersByTime(pauseDuration * 1000); });
        act(() => { result.current.resumeTimer(); });
        act(() => { vi.advanceTimersByTime(afterResume * 1000); });
        // Invariant: remaining = frozen - afterResume ticks
        expect(result.current.state.remainingSeconds).toBe(frozen - afterResume);
      }
    ),
    { numRuns: 30 }
  );
});

// ─── UC2-E2a: Immediate pause halts near-full duration ──────────────────────

it('UC2-E2a: pausing within the first tick always halts near the full duration', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 999 }),  // pause within first second
      (msBeforePause) => {
        const { result } = renderHook(() => usePomodoro());
        act(() => { result.current.startTimer(); });
        act(() => { vi.advanceTimersByTime(msBeforePause); });
        act(() => { result.current.pauseTimer(); });
        // Invariant: remaining is WORK_DURATION (no tick has fired yet in < 1000ms)
        expect(result.current.state.remainingSeconds).toBe(WORK_DURATION);
        expect(result.current.state.status).toBe('paused');
      }
    ),
    { numRuns: 30 }
  );
});
