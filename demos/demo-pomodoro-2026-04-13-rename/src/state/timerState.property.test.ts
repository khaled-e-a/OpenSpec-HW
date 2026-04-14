import { describe, test } from 'vitest';
import fc from 'fast-check';
import {
  timerReducer,
  WORK_SECONDS,
  REST_SECONDS,
  TimerState,
  Phase,
  Status,
} from './timerState';

const phaseArb: fc.Arbitrary<Phase> = fc.constantFrom('work', 'rest');
const statusArb: fc.Arbitrary<Status> = fc.constantFrom('idle', 'running', 'paused');

const anyStateArb: fc.Arbitrary<TimerState> = fc.record({
  phase: phaseArb,
  status: statusArb,
  remainingSeconds: fc.integer({ min: 0, max: WORK_SECONDS }),
});

const phaseDuration = (phase: Phase): number =>
  phase === 'work' ? WORK_SECONDS : REST_SECONDS;

describe('timerReducer — property-based', () => {
  test('UC1-S1 (Start from idle work phase): START always transitions idle→running without changing phase or remainingSeconds', () => {
    fc.assert(
      fc.property(phaseArb, fc.integer({ min: 0, max: WORK_SECONDS }), (phase, remainingSeconds) => {
        const state: TimerState = { phase, status: 'idle', remainingSeconds };
        const next = timerReducer(state, { type: 'START' });
        return (
          next.status === 'running' &&
          next.phase === phase &&
          next.remainingSeconds === remainingSeconds
        );
      }),
    );
  });

  test('UC1-S1 (Start ignored while already running): START on a running state is a no-op', () => {
    fc.assert(
      fc.property(phaseArb, fc.integer({ min: 0, max: WORK_SECONDS }), (phase, remainingSeconds) => {
        const state: TimerState = { phase, status: 'running', remainingSeconds };
        const next = timerReducer(state, { type: 'START' });
        return (
          next.status === state.status &&
          next.phase === state.phase &&
          next.remainingSeconds === state.remainingSeconds
        );
      }),
    );
  });

  test('UC1-S2 (Remaining time updates every second): TICK while running strictly decrements remainingSeconds by 1 and preserves phase/status', () => {
    fc.assert(
      fc.property(phaseArb, fc.integer({ min: 1, max: WORK_SECONDS }), (phase, remainingSeconds) => {
        const state: TimerState = { phase, status: 'running', remainingSeconds };
        const next = timerReducer(state, { type: 'TICK' });
        return (
          next.remainingSeconds === remainingSeconds - 1 &&
          next.phase === phase &&
          next.status === 'running'
        );
      }),
    );
  });

  test('UC1-S2 invariant: TICK on a non-running state is a no-op for any arbitrary state', () => {
    fc.assert(
      fc.property(anyStateArb, (state) => {
        fc.pre(state.status !== 'running');
        const next = timerReducer(state, { type: 'TICK' });
        return (
          next.status === state.status &&
          next.phase === state.phase &&
          next.remainingSeconds === state.remainingSeconds
        );
      }),
    );
  });

  test('UC1-S3 / UC1-S4 (Work phase completes → Auto-transition to rest): PHASE_END from work always yields rest/running/300s', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        const state: TimerState = { phase: 'work', status, remainingSeconds: 0 };
        const next = timerReducer(state, { type: 'PHASE_END' });
        return (
          next.phase === 'rest' &&
          next.status === 'running' &&
          next.remainingSeconds === REST_SECONDS
        );
      }),
    );
  });

  test('UC1-S5 / UC1-S6 (Rest phase completes → Cycle ends, awaits next start): PHASE_END from rest always yields work/idle/1500s', () => {
    fc.assert(
      fc.property(statusArb, (status) => {
        const state: TimerState = { phase: 'rest', status, remainingSeconds: 0 };
        const next = timerReducer(state, { type: 'PHASE_END' });
        return (
          next.phase === 'work' &&
          next.status === 'idle' &&
          next.remainingSeconds === WORK_SECONDS
        );
      }),
    );
  });

  test('UC1-E2a / UC1-E2a1 (Pause mid-work): PAUSE while running preserves phase + remainingSeconds and sets status=paused', () => {
    fc.assert(
      fc.property(phaseArb, fc.integer({ min: 0, max: WORK_SECONDS }), (phase, remainingSeconds) => {
        const state: TimerState = { phase, status: 'running', remainingSeconds };
        const next = timerReducer(state, { type: 'PAUSE' });
        return (
          next.status === 'paused' &&
          next.phase === phase &&
          next.remainingSeconds === remainingSeconds
        );
      }),
    );
  });

  test('UC1-E2a2 (Resume after pause): RESUME while paused preserves phase + remainingSeconds and sets status=running', () => {
    fc.assert(
      fc.property(phaseArb, fc.integer({ min: 0, max: WORK_SECONDS }), (phase, remainingSeconds) => {
        const state: TimerState = { phase, status: 'paused', remainingSeconds };
        const next = timerReducer(state, { type: 'RESUME' });
        return (
          next.status === 'running' &&
          next.phase === phase &&
          next.remainingSeconds === remainingSeconds
        );
      }),
    );
  });

  test('UC2 (Reset while running in work phase): RESET from a running work state restores 1500s/idle/work', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: WORK_SECONDS }), (remainingSeconds) => {
        const state: TimerState = { phase: 'work', status: 'running', remainingSeconds };
        const next = timerReducer(state, { type: 'RESET' });
        return (
          next.phase === 'work' &&
          next.status === 'idle' &&
          next.remainingSeconds === WORK_SECONDS
        );
      }),
    );
  });

  test('UC2 (Reset while paused in rest phase): RESET from a paused rest state restores 300s/idle/rest', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: REST_SECONDS }), (remainingSeconds) => {
        const state: TimerState = { phase: 'rest', status: 'paused', remainingSeconds };
        const next = timerReducer(state, { type: 'RESET' });
        return (
          next.phase === 'rest' &&
          next.status === 'idle' &&
          next.remainingSeconds === REST_SECONDS
        );
      }),
    );
  });

  test('UC2 global invariant: RESET from any state always yields idle + phase-specific full duration', () => {
    fc.assert(
      fc.property(anyStateArb, (state) => {
        const next = timerReducer(state, { type: 'RESET' });
        return (
          next.status === 'idle' &&
          next.phase === state.phase &&
          next.remainingSeconds === phaseDuration(state.phase)
        );
      }),
    );
  });
});
