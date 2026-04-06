import { describe, it, expect } from 'vitest';
import { advanceSession, skipToWork, getResetState } from '../utils/sessionUtils';
import {
  INITIAL_STATE,
  WORK_DURATION,
  SHORT_REST_DURATION,
  LONG_REST_DURATION,
} from '../types/timer';
import type { TimerState } from '../types/timer';

// ─── advanceSession tests (task 10.1) ────────────────────────────────────────

describe('advanceSession', () => {
  const workState = (pomodoroCount: number): TimerState => ({
    ...INITIAL_STATE,
    sessionType: 'work',
    pomodoroCount,
  });

  it('UC4-S1: Pomodoro #1 → shortRest', () => {
    const result = advanceSession(workState(0));
    expect(result.sessionType).toBe('shortRest');
    expect(result.remainingSeconds).toBe(SHORT_REST_DURATION);
    expect(result.pomodoroCount).toBe(1);
  });

  it('UC4-S4: Pomodoro #2 → shortRest', () => {
    const result = advanceSession(workState(1));
    expect(result.sessionType).toBe('shortRest');
    expect(result.remainingSeconds).toBe(SHORT_REST_DURATION);
    expect(result.pomodoroCount).toBe(2);
  });

  it('UC4-S4: Pomodoro #3 → shortRest', () => {
    const result = advanceSession(workState(2));
    expect(result.sessionType).toBe('shortRest');
    expect(result.remainingSeconds).toBe(SHORT_REST_DURATION);
    expect(result.pomodoroCount).toBe(3);
  });

  it('UC4-S5: Pomodoro #4 → longRest and resets count', () => {
    const result = advanceSession(workState(3));
    expect(result.sessionType).toBe('longRest');
    expect(result.remainingSeconds).toBe(LONG_REST_DURATION);
    expect(result.pomodoroCount).toBe(0);
  });

  it('UC4-S3: shortRest completion → work', () => {
    const state: TimerState = { ...INITIAL_STATE, sessionType: 'shortRest', pomodoroCount: 1 };
    const result = advanceSession(state);
    expect(result.sessionType).toBe('work');
    expect(result.remainingSeconds).toBe(WORK_DURATION);
    expect(result.pomodoroCount).toBe(1);
  });

  it('UC4-S7: longRest completion → work, count stays 0', () => {
    const state: TimerState = { ...INITIAL_STATE, sessionType: 'longRest', pomodoroCount: 0 };
    const result = advanceSession(state);
    expect(result.sessionType).toBe('work');
    expect(result.remainingSeconds).toBe(WORK_DURATION);
    expect(result.pomodoroCount).toBe(0);
  });
});

// ─── skipToWork tests (task 10.4) ────────────────────────────────────────────

describe('skipToWork', () => {
  it('UC4-E3a: skipping shortRest → work with full work duration', () => {
    const state: TimerState = { ...INITIAL_STATE, sessionType: 'shortRest', remainingSeconds: 120, pomodoroCount: 2 };
    const result = skipToWork(state);
    expect(result.sessionType).toBe('work');
    expect(result.remainingSeconds).toBe(WORK_DURATION);
  });

  it('UC4-E3a: skipping longRest → work with full work duration', () => {
    const state: TimerState = { ...INITIAL_STATE, sessionType: 'longRest', remainingSeconds: 60, pomodoroCount: 0 };
    const result = skipToWork(state);
    expect(result.sessionType).toBe('work');
    expect(result.remainingSeconds).toBe(WORK_DURATION);
  });
});

// ─── getResetState tests (task 10.3) ─────────────────────────────────────────

describe('getResetState', () => {
  it('UC3-S3/S4/S5: returns full initial defaults', () => {
    const reset = getResetState();
    expect(reset.sessionType).toBe('work');
    expect(reset.remainingSeconds).toBe(WORK_DURATION);
    expect(reset.pomodoroCount).toBe(0);
    expect(reset.status).toBe('idle');
  });

  it('UC3-E1a: calling twice returns same defaults (idempotent)', () => {
    const a = getResetState();
    const b = getResetState();
    expect(a).toEqual(b);
  });
});
