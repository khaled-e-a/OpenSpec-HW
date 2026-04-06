import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { usePomodoro } from '../hooks/usePomodoro';
import { WORK_DURATION, SHORT_REST_DURATION, LONG_REST_DURATION } from '../types/timer';

// Mock audio to avoid Web Audio API errors in jsdom
vi.mock('../utils/audioUtils', () => ({ playCompletionTone: vi.fn() }));

describe('usePomodoro — pause / resume (task 10.2)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('UC2-S2: pause preserves remaining time', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => { result.current.startTimer(); });
    // Advance 5 seconds
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.state.remainingSeconds).toBe(WORK_DURATION - 5);

    act(() => { result.current.pauseTimer(); });
    expect(result.current.state.status).toBe('paused');
    const frozenTime = result.current.state.remainingSeconds;

    // Time advances but timer should not tick while paused
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.state.remainingSeconds).toBe(frozenTime);
  });

  it('UC2-S6: resume continues from preserved remaining time', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => { result.current.startTimer(); });
    act(() => { vi.advanceTimersByTime(10000); });
    act(() => { result.current.pauseTimer(); });

    const savedRemaining = result.current.state.remainingSeconds;

    act(() => { result.current.resumeTimer(); });
    act(() => { vi.advanceTimersByTime(1000); });

    expect(result.current.state.remainingSeconds).toBe(savedRemaining - 1);
  });
});

describe('usePomodoro — UC2-E2a: pause immediately after start', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('UC2-E2a: pausing within the first second preserves full duration', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => { result.current.startTimer(); });
    // Pause before first tick fires (< 1000 ms elapsed)
    act(() => { vi.advanceTimersByTime(500); });
    act(() => { result.current.pauseTimer(); });

    expect(result.current.state.status).toBe('paused');
    // No tick has fired yet → remaining = full work duration
    expect(result.current.state.remainingSeconds).toBe(WORK_DURATION);
  });
});

describe('usePomodoro — reset (task 10.3)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('UC3-S2/S3/S4/S5: reset while running returns to defaults', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => { result.current.startTimer(); });
    act(() => { vi.advanceTimersByTime(30000); });
    act(() => { result.current.resetTimer(); });

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.sessionType).toBe('work');
    expect(result.current.state.remainingSeconds).toBe(WORK_DURATION);
    expect(result.current.state.pomodoroCount).toBe(0);
  });

  it('UC3-E1a: reset while idle is idempotent', () => {
    const { result } = renderHook(() => usePomodoro());
    act(() => { result.current.resetTimer(); });
    expect(result.current.state.remainingSeconds).toBe(WORK_DURATION);
    expect(result.current.state.status).toBe('idle');
  });
});

describe('usePomodoro — integration: complete one work session (task 10.5)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('UC1-S5, UC1-S6, UC4-S1: work session completion → status completed', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => { result.current.startTimer(); });
    // Run down the full work session
    act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });

    expect(result.current.state.status).toBe('completed');
    expect(result.current.state.remainingSeconds).toBe(0);
  });

  it('UC4-S1: starting after completion advances to shortRest', () => {
    const { result } = renderHook(() => usePomodoro());

    act(() => { result.current.startTimer(); });
    act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
    expect(result.current.state.status).toBe('completed');

    // Start next session
    act(() => { result.current.startTimer(); });

    expect(result.current.state.sessionType).toBe('shortRest');
    expect(result.current.state.remainingSeconds).toBe(SHORT_REST_DURATION);
    expect(result.current.state.status).toBe('running');
  });
});

describe('usePomodoro — UC2-S4: long rest reaches 00:00 and signals completion', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('UC2-S4: long rest countdown reaches 0 and status becomes completed', () => {
    const { result } = renderHook(() => usePomodoro());

    // Advance through 3 work+shortRest cycles, then 4th work session
    for (let i = 0; i < 3; i++) {
      act(() => { result.current.startTimer(); });
      act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
      act(() => { result.current.startTimer(); }); // shortRest
      act(() => { vi.advanceTimersByTime(SHORT_REST_DURATION * 1000); });
      act(() => { result.current.startTimer(); }); // back to work
    }
    // 4th work session
    act(() => { result.current.startTimer(); });
    act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
    // Start long rest
    act(() => { result.current.startTimer(); });
    expect(result.current.state.sessionType).toBe('longRest');

    // Run long rest to completion
    act(() => { vi.advanceTimersByTime(LONG_REST_DURATION * 1000); });

    expect(result.current.state.status).toBe('completed');
    expect(result.current.state.remainingSeconds).toBe(0);
  });

  it('UC2-S4 (PBT): long rest always reaches completed after exactly LONG_REST_DURATION ticks', () => {
    fc.assert(
      fc.property(fc.constant(LONG_REST_DURATION), (duration) => {
        const { result } = renderHook(() => usePomodoro());

        // Fast-path: manually run through 3 work+rest cycles + 4th work, then start long rest
        for (let i = 0; i < 3; i++) {
          act(() => { result.current.startTimer(); });
          act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
          act(() => { result.current.startTimer(); });
          act(() => { vi.advanceTimersByTime(SHORT_REST_DURATION * 1000); });
          act(() => { result.current.startTimer(); });
        }
        act(() => { result.current.startTimer(); });
        act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
        act(() => { result.current.startTimer(); }); // starts longRest
        act(() => { vi.advanceTimersByTime(duration * 1000); });

        expect(result.current.state.status).toBe('completed');
        expect(result.current.state.remainingSeconds).toBe(0);
      }),
      { numRuns: 3 }
    );
  });
});

describe('usePomodoro — integration: 4 pomodoros trigger long rest (task 10.6)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('UC4-S5, UC4-S6: 4th work session leads to longRest', () => {
    const { result } = renderHook(() => usePomodoro());

    // Complete 3 work + 3 short rest cycles
    for (let i = 0; i < 3; i++) {
      // Start work
      act(() => { result.current.startTimer(); });
      act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
      // Start next (short rest)
      act(() => { result.current.startTimer(); });
      act(() => { vi.advanceTimersByTime(SHORT_REST_DURATION * 1000); });
      // complete short rest
      act(() => { result.current.startTimer(); }); // advance from completed shortRest → work
    }

    // Now do the 4th work session
    act(() => { result.current.startTimer(); });
    act(() => { vi.advanceTimersByTime(WORK_DURATION * 1000); });
    // completed state
    expect(result.current.state.status).toBe('completed');

    // Start next: should be longRest
    act(() => { result.current.startTimer(); });
    expect(result.current.state.sessionType).toBe('longRest');
    expect(result.current.state.remainingSeconds).toBe(LONG_REST_DURATION);
  });
});
