import type { SessionType, TimerState } from '../types/timer';
import {
  WORK_DURATION,
  SHORT_REST_DURATION,
  LONG_REST_DURATION,
  POMODOROS_PER_CYCLE,
  INITIAL_STATE,
} from '../types/timer';

/**
 * Given the current state after a session has just completed,
 * return the next TimerState (sessionType + remainingSeconds + pomodoroCount).
 * Does NOT change status — the caller decides that.
 *
 * UC1-S6, UC4-S1–S7
 */
export function advanceSession(state: TimerState): Pick<TimerState, 'sessionType' | 'remainingSeconds' | 'pomodoroCount'> {
  const { sessionType, pomodoroCount } = state;

  if (sessionType === 'work') {
    const newCount = pomodoroCount + 1;
    if (newCount >= POMODOROS_PER_CYCLE) {
      // 4th Pomodoro complete → long rest, reset count
      return { sessionType: 'longRest', remainingSeconds: LONG_REST_DURATION, pomodoroCount: 0 };
    }
    // Pomodoros 1–3 → short rest
    return { sessionType: 'shortRest', remainingSeconds: SHORT_REST_DURATION, pomodoroCount: newCount };
  }

  // shortRest or longRest completed → back to work
  return { sessionType: 'work', remainingSeconds: WORK_DURATION, pomodoroCount };
}

/**
 * Skip the current rest session and jump straight to work.
 * UC4-E3a
 */
export function skipToWork(_state: TimerState): Pick<TimerState, 'sessionType' | 'remainingSeconds'> {
  return { sessionType: 'work', remainingSeconds: WORK_DURATION };
}

/**
 * Full reset to initial defaults.
 * UC3-S4, UC3-S5, UC3-E1a
 */
export function getResetState(): TimerState {
  return { ...INITIAL_STATE };
}

/**
 * Return the full duration for a given session type.
 */
export function durationFor(sessionType: SessionType): number {
  switch (sessionType) {
    case 'work':      return WORK_DURATION;
    case 'shortRest': return SHORT_REST_DURATION;
    case 'longRest':  return LONG_REST_DURATION;
  }
}
