import { useCallback, useEffect, useReducer, useRef } from 'react';
import { initialState, timerReducer, Phase, TimerState } from './timerState';

interface UsePomodoroTimerOptions {
  onPhaseEnd?: (endedPhase: Phase) => void;
}

interface UsePomodoroTimerResult {
  state: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function usePomodoroTimer(
  options: UsePomodoroTimerOptions = {},
): UsePomodoroTimerResult {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const onPhaseEndRef = useRef(options.onPhaseEnd);
  onPhaseEndRef.current = options.onPhaseEnd;

  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'running' && state.remainingSeconds <= 0) {
      onPhaseEndRef.current?.(state.phase);
      dispatch({ type: 'PHASE_END' });
    }
  }, [state.status, state.remainingSeconds, state.phase]);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, start, pause, resume, reset };
}
