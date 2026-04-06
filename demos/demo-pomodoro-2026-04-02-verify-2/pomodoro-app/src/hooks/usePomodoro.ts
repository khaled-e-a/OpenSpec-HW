import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_STATE } from '../types/timer';
import type { TimerState } from '../types/timer';
import { advanceSession, getResetState, skipToWork } from '../utils/sessionUtils';
import { playCompletionTone } from '../utils/audioUtils';

export interface PomodoroControls {
  state: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
}

export function usePomodoro(): PomodoroControls {
  // 4.1 — top-level state
  const [state, setState] = useState<TimerState>(INITIAL_STATE);

  // 4.2 — interval ID stored in ref (no re-render on change)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper: clear the running interval safely
  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 2.1 + 2.2 — tick logic
  // We use a ref to hold the latest state so the interval closure always sees current values
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setState(prev => {
        const next = prev.remainingSeconds - 1;
        if (next <= 0) {
          // 2.2 / 2.6 — completion: stop interval, transition to completed
          clearTick();
          playCompletionTone(); // 8.1
          return { ...prev, remainingSeconds: 0, status: 'completed' };
        }
        return { ...prev, remainingSeconds: next };
      });
    }, 1000);
  }, [clearTick]);

  // 2.1 — startTimer: begin countdown from current remainingSeconds
  const startTimer = useCallback(() => {
    setState(prev => {
      if (prev.status === 'running') return prev;
      // If completed, advance to next session first then start
      if (prev.status === 'completed') {
        const advanced = advanceSession(prev);
        // Start tick will fire after state update; we trigger it in the effect below
        return { ...prev, ...advanced, status: 'running' };
      }
      return { ...prev, status: 'running' };
    });
  }, []);

  // 2.3 — pauseTimer: clear interval, preserve remainingSeconds
  const pauseTimer = useCallback(() => {
    clearTick();
    setState(prev => {
      if (prev.status !== 'running') return prev;
      return { ...prev, status: 'paused' };
    });
  }, [clearTick]);

  // 2.4 — resumeTimer: restart interval from preserved remainingSeconds
  const resumeTimer = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'paused') return prev;
      return { ...prev, status: 'running' };
    });
  }, []);

  // 2.5 — resetTimer: stop interval, restore full duration for session type (idempotent)
  const resetTimer = useCallback(() => {
    clearTick();
    setState(() => {
      // Per spec UC3-S3/S4/S5: always reset to Work 25:00 and zero count (idempotent)
      return getResetState();
    });
  }, [clearTick]);

  // 3.4 — skipSession: jump to work from shortRest or longRest
  const skipSession = useCallback(() => {
    clearTick();
    setState(prev => {
      if (prev.sessionType === 'work') return prev; // skip only valid on rest
      const next = skipToWork(prev);
      return { ...prev, ...next, status: 'idle' };
    });
  }, [clearTick]);

  // Effect: when status transitions to 'running', start the tick interval
  useEffect(() => {
    if (state.status === 'running') {
      startTick();
    }
    // Cleanup on unmount
    return clearTick;
  }, [state.status, startTick, clearTick]);

  // 3.1–3.3 — advanceSession is called inside startTimer (when status === 'completed')
  // The session manager logic lives in sessionUtils.ts and is applied on the next startTimer call

  return { state, startTimer, pauseTimer, resumeTimer, resetTimer, skipSession };
}
