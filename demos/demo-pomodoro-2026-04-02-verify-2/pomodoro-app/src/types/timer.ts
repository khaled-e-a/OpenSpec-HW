// Session type: which kind of session is currently active
export type SessionType = 'work' | 'shortRest' | 'longRest';

// Timer status: lifecycle state of the countdown
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

// Duration constants (in seconds)
export const WORK_DURATION = 30 * 60;       // 1800 s
export const SHORT_REST_DURATION = 5 * 60;  //  300 s
export const LONG_REST_DURATION = 25 * 60;  // 1500 s

// Number of work sessions before a long rest
export const POMODOROS_PER_CYCLE = 4;

// Human-readable labels for each session type
export const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Work',
  shortRest: 'Short Rest',
  longRest: 'Long Rest',
};

// Duration for each session type
export const SESSION_DURATIONS: Record<SessionType, number> = {
  work: WORK_DURATION,
  shortRest: SHORT_REST_DURATION,
  longRest: LONG_REST_DURATION,
};

// Top-level timer state shape
export interface TimerState {
  sessionType: SessionType;
  remainingSeconds: number;
  pomodoroCount: number;
  status: TimerStatus;
}

export const INITIAL_STATE: TimerState = {
  sessionType: 'work',
  remainingSeconds: WORK_DURATION,
  pomodoroCount: 0,
  status: 'idle',
};
