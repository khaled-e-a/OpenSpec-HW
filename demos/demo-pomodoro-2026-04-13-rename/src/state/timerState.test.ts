import { describe, test, expect } from 'vitest';
import { timerReducer, initialState, WORK_SECONDS, REST_SECONDS } from './timerState';

describe('timerReducer', () => {
  test('initial state is idle in work phase with 25 minutes remaining (UC1 precondition)', () => {
    expect(initialState).toEqual({
      phase: 'work',
      status: 'idle',
      remainingSeconds: WORK_SECONDS,
    });
    expect(WORK_SECONDS).toBe(25 * 60);
    expect(REST_SECONDS).toBe(5 * 60);
  });

  test('START transitions idle to running (UC1-S1)', () => {
    const next = timerReducer(initialState, { type: 'START' });
    expect(next.status).toBe('running');
    expect(next.phase).toBe('work');
    expect(next.remainingSeconds).toBe(WORK_SECONDS);
  });

  test('START is ignored when already running', () => {
    const running = { phase: 'work' as const, status: 'running' as const, remainingSeconds: 1000 };
    const next = timerReducer(running, { type: 'START' });
    expect(next).toEqual(running);
  });

  test('TICK decrements remainingSeconds by 1 while running (UC1-S2)', () => {
    const running = { phase: 'work' as const, status: 'running' as const, remainingSeconds: 1500 };
    const next = timerReducer(running, { type: 'TICK' });
    expect(next.remainingSeconds).toBe(1499);
    expect(next.status).toBe('running');
    expect(next.phase).toBe('work');
  });

  test('TICK is a no-op when not running', () => {
    const paused = { phase: 'work' as const, status: 'paused' as const, remainingSeconds: 1200 };
    const next = timerReducer(paused, { type: 'TICK' });
    expect(next).toEqual(paused);
  });

  test('PHASE_END from work transitions to rest running with 5:00 (UC1-S3, UC1-S4)', () => {
    const endOfWork = { phase: 'work' as const, status: 'running' as const, remainingSeconds: 0 };
    const next = timerReducer(endOfWork, { type: 'PHASE_END' });
    expect(next.phase).toBe('rest');
    expect(next.status).toBe('running');
    expect(next.remainingSeconds).toBe(REST_SECONDS);
  });

  test('PHASE_END from rest returns to idle work with 25:00 (UC1-S5, UC1-S6)', () => {
    const endOfRest = { phase: 'rest' as const, status: 'running' as const, remainingSeconds: 0 };
    const next = timerReducer(endOfRest, { type: 'PHASE_END' });
    expect(next.phase).toBe('work');
    expect(next.status).toBe('idle');
    expect(next.remainingSeconds).toBe(WORK_SECONDS);
  });

  test('PAUSE transitions running to paused, retaining remainingSeconds (UC1-E2a)', () => {
    const running = { phase: 'work' as const, status: 'running' as const, remainingSeconds: 1112 };
    const next = timerReducer(running, { type: 'PAUSE' });
    expect(next.status).toBe('paused');
    expect(next.remainingSeconds).toBe(1112);
    expect(next.phase).toBe('work');
  });

  test('PAUSE is ignored when not running', () => {
    const idle = initialState;
    expect(timerReducer(idle, { type: 'PAUSE' })).toEqual(idle);
  });

  test('RESUME transitions paused to running from retained time (UC1-E2a2)', () => {
    const paused = { phase: 'work' as const, status: 'paused' as const, remainingSeconds: 1112 };
    const next = timerReducer(paused, { type: 'RESUME' });
    expect(next.status).toBe('running');
    expect(next.remainingSeconds).toBe(1112);
    expect(next.phase).toBe('work');
  });

  test('RESUME is ignored when not paused', () => {
    const idle = initialState;
    expect(timerReducer(idle, { type: 'RESUME' })).toEqual(idle);
  });

  test('RESET from running work phase restores 25:00 and idles (UC2-S1..S4)', () => {
    const running = { phase: 'work' as const, status: 'running' as const, remainingSeconds: 724 };
    const next = timerReducer(running, { type: 'RESET' });
    expect(next).toEqual({
      phase: 'work',
      status: 'idle',
      remainingSeconds: WORK_SECONDS,
    });
  });

  test('RESET from paused rest phase restores 5:00 in rest phase, idle', () => {
    const pausedRest = { phase: 'rest' as const, status: 'paused' as const, remainingSeconds: 138 };
    const next = timerReducer(pausedRest, { type: 'RESET' });
    expect(next).toEqual({
      phase: 'rest',
      status: 'idle',
      remainingSeconds: REST_SECONDS,
    });
  });
});
