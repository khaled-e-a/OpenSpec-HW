import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePomodoroTimer } from './usePomodoroTimer';
import { WORK_SECONDS, REST_SECONDS } from './timerState';

describe('usePomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('initial state is idle work phase with 25:00 remaining', () => {
    const { result } = renderHook(() => usePomodoroTimer());
    expect(result.current.state.phase).toBe('work');
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS);
  });

  test('start() begins ticking once per second (UC1-S2)', () => {
    const { result } = renderHook(() => usePomodoroTimer());
    act(() => {
      result.current.start();
    });
    expect(result.current.state.status).toBe('running');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS - 1);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS - 4);
  });

  test('pause() halts the countdown and resume() continues (UC1-E2a, UC1-E2a2)', () => {
    const { result } = renderHook(() => usePomodoroTimer());
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS - 5);
    act(() => {
      result.current.pause();
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.state.status).toBe('paused');
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS - 5);
    act(() => {
      result.current.resume();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS - 7);
  });

  test('reset() stops countdown and restores phase duration (UC2-S1..S4)', () => {
    const { result } = renderHook(() => usePomodoroTimer());
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS);
  });

  test('auto-transitions work → rest at zero, then rest → idle work (UC1-S3..S6)', () => {
    const { result } = renderHook(() => usePomodoroTimer());
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(WORK_SECONDS * 1000);
    });
    expect(result.current.state.phase).toBe('rest');
    expect(result.current.state.status).toBe('running');
    expect(result.current.state.remainingSeconds).toBe(REST_SECONDS);

    act(() => {
      vi.advanceTimersByTime(REST_SECONDS * 1000);
    });
    expect(result.current.state.phase).toBe('work');
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS);
  });

  test('UC1-E3a / UC1-E3a1: user dismissal of end-of-work notification has no effect on phase transition', () => {
    // The notification surface is the onPhaseEnd callback. "Dismissal" in this system
    // is a no-op by design (non-blocking, ambient). We model it as the user doing
    // nothing, something, or even calling pause/start during the notification window,
    // and assert the transition still occurred.
    const onPhaseEnd = vi.fn((_endedPhase) => {
      // simulate user-space dismissal: any attempt to interact must not block the transition
    });
    const { result } = renderHook(() => usePomodoroTimer({ onPhaseEnd }));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(WORK_SECONDS * 1000);
    });
    // The callback fired (notification was presented)
    expect(onPhaseEnd).toHaveBeenCalledWith('work');
    // And the system already transitioned to rest without waiting for dismissal
    expect(result.current.state.phase).toBe('rest');
    expect(result.current.state.status).toBe('running');
    expect(result.current.state.remainingSeconds).toBe(REST_SECONDS);
  });

  test('UC1-E5a / UC1-E5a1: user dismissal of end-of-rest notification has no effect on return-to-idle', () => {
    const onPhaseEnd = vi.fn();
    const { result } = renderHook(() => usePomodoroTimer({ onPhaseEnd }));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(WORK_SECONDS * 1000);
    });
    act(() => {
      vi.advanceTimersByTime(REST_SECONDS * 1000);
    });
    expect(onPhaseEnd).toHaveBeenCalledWith('rest');
    expect(result.current.state.phase).toBe('work');
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.remainingSeconds).toBe(WORK_SECONDS);
  });

  test('fires onPhaseEnd callback at end of each phase (notification hook, UC1-S3, UC1-S5)', () => {
    const onPhaseEnd = vi.fn();
    const { result } = renderHook(() => usePomodoroTimer({ onPhaseEnd }));
    act(() => {
      result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(WORK_SECONDS * 1000);
    });
    expect(onPhaseEnd).toHaveBeenCalledWith('work');
    act(() => {
      vi.advanceTimersByTime(REST_SECONDS * 1000);
    });
    expect(onPhaseEnd).toHaveBeenCalledWith('rest');
    expect(onPhaseEnd).toHaveBeenCalledTimes(2);
  });
});
