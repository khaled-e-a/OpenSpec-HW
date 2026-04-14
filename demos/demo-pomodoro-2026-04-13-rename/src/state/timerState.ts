export const WORK_SECONDS = 25 * 60;
export const REST_SECONDS = 5 * 60;

export type Phase = 'work' | 'rest';
export type Status = 'idle' | 'running' | 'paused';

export interface TimerState {
  phase: Phase;
  status: Status;
  remainingSeconds: number;
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'PHASE_END' };

export const initialState: TimerState = {
  phase: 'work',
  status: 'idle',
  remainingSeconds: WORK_SECONDS,
};

const phaseDuration = (phase: Phase): number =>
  phase === 'work' ? WORK_SECONDS : REST_SECONDS;

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      if (state.status === 'running') return state;
      return { ...state, status: 'running' };

    case 'PAUSE':
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused' };

    case 'RESUME':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'running' };

    case 'RESET':
      return {
        phase: state.phase,
        status: 'idle',
        remainingSeconds: phaseDuration(state.phase),
      };

    case 'TICK':
      if (state.status !== 'running') return state;
      return { ...state, remainingSeconds: state.remainingSeconds - 1 };

    case 'PHASE_END':
      if (state.phase === 'work') {
        return { phase: 'rest', status: 'running', remainingSeconds: REST_SECONDS };
      }
      return { phase: 'work', status: 'idle', remainingSeconds: WORK_SECONDS };
  }
}
