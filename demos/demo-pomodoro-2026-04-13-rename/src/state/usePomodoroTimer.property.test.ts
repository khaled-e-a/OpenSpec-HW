import { describe, test, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { usePomodoroTimer } from './usePomodoroTimer';
import { WORK_SECONDS, REST_SECONDS } from './timerState';

describe('usePomodoroTimer — property-based', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('UC1-E3a / UC1-E5a (Phase transition does not wait for dismissal): for arbitrary phase-end timings, the hook never gets stuck at remaining=0 and always transitions phase exactly when the countdown expires, regardless of whether any user interaction occurs', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10 }), fc.boolean(), (extraTicks, pauseFirst) => {
        const { result, unmount } = renderHook(() => usePomodoroTimer());

        act(() => {
          result.current.start();
        });

        if (pauseFirst) {
          act(() => {
            vi.advanceTimersByTime(1000);
          });
          act(() => {
            result.current.pause();
          });
          act(() => {
            result.current.resume();
          });
        }

        act(() => {
          vi.advanceTimersByTime(WORK_SECONDS * 1000);
        });

        const afterWork = result.current.state;
        const workTransitionedWithoutDismissal =
          afterWork.phase === 'rest' &&
          afterWork.status === 'running' &&
          afterWork.remainingSeconds === REST_SECONDS;

        act(() => {
          vi.advanceTimersByTime(REST_SECONDS * 1000);
        });

        const afterRest = result.current.state;
        const restTransitionedWithoutDismissal =
          afterRest.phase === 'work' &&
          afterRest.status === 'idle' &&
          afterRest.remainingSeconds === WORK_SECONDS;

        act(() => {
          vi.advanceTimersByTime(extraTicks * 1000);
        });
        const idleIsStable =
          result.current.state.phase === 'work' &&
          result.current.state.status === 'idle' &&
          result.current.state.remainingSeconds === WORK_SECONDS;

        unmount();
        return workTransitionedWithoutDismissal && restTransitionedWithoutDismissal && idleIsStable;
      }),
      { numRuns: 20 },
    );
  });
});
