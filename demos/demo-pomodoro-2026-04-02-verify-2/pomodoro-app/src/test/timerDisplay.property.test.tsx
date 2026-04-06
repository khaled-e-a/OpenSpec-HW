/**
 * Property-based tests for timer-display spec.
 * Framework: fast-check
 * Covers: UC1-S2/S3/S5/E5a, UC2-S1/S3/S5/S7, UC3-S1/S3, UC4-S2/S6
 */
import { it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from '../components/TimerDisplay';
import { Controls } from '../components/Controls';
import { formatTime } from '../utils/formatTime';
import { SESSION_LABELS, WORK_DURATION } from '../types/timer';
import type { SessionType, TimerStatus } from '../types/timer';

const sessionTypeArb = fc.constantFrom<SessionType>('work', 'shortRest', 'longRest');
const timerStatusArb = fc.constantFrom<TimerStatus>('idle', 'running', 'paused', 'completed');
const remainingSecondsArb = fc.integer({ min: 0, max: WORK_DURATION });
const pomodoroCountArb = fc.integer({ min: 0, max: 4 });
const noop = () => {};

// ─── UC1-S2: formatTime always produces valid MM:SS ─────────────────────────

it('UC1-S2: formatTime always produces MM:SS for any non-negative seconds', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 5999 }),
      (seconds) => {
        const result = formatTime(seconds);
        // Must match MM:SS pattern
        expect(result).toMatch(/^\d{2}:\d{2}$/);
        const [mm, ss] = result.split(':').map(Number);
        expect(mm).toBeGreaterThanOrEqual(0);
        expect(ss).toBeGreaterThanOrEqual(0);
        expect(ss).toBeLessThan(60);
        // Round-trip: mm*60+ss should equal original seconds
        expect(mm * 60 + ss).toBe(seconds);
      }
    ),
    { numRuns: 100 }
  );
});

it('UC1-S2: TimerDisplay always renders a valid MM:SS string', () => {
  fc.assert(
    fc.property(remainingSecondsArb, pomodoroCountArb, timerStatusArb, sessionTypeArb,
      (remaining, count, status, sessionType) => {
        const { unmount } = render(
          <TimerDisplay sessionType={sessionType} remainingSeconds={remaining} pomodoroCount={count} status={status} />
        );
        const countdown = screen.queryByText(/^\d{2}:\d{2}$/);
        expect(countdown).not.toBeNull();
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});

// ─── UC1-S3: Session label always matches the sessionType ───────────────────

it('UC1-S3/UC4-S2/UC4-S6: displayed label always matches the sessionType prop', () => {
  fc.assert(
    fc.property(sessionTypeArb, remainingSecondsArb,
      (sessionType, remaining) => {
        const { unmount } = render(
          <TimerDisplay sessionType={sessionType} remainingSeconds={remaining} pomodoroCount={0} status="idle" />
        );
        const expectedLabel = SESSION_LABELS[sessionType];
        expect(screen.getByText(expectedLabel)).toBeTruthy();
        unmount();
      }
    ),
    { numRuns: 30 }
  );
});

// ─── UC1-S5: Completion banner present iff status is 'completed' ─────────────

it('UC1-S5/UC1-E5a: completion banner is present iff status = completed', () => {
  fc.assert(
    fc.property(timerStatusArb, sessionTypeArb, remainingSecondsArb,
      (status, sessionType, remaining) => {
        const { unmount } = render(
          <TimerDisplay sessionType={sessionType} remainingSeconds={remaining} pomodoroCount={0} status={status} />
        );
        const banner = screen.queryByText(/Session Complete/i);
        if (status === 'completed') {
          expect(banner).not.toBeNull();
        } else {
          expect(banner).toBeNull();
        }
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});

// ─── UC2-S1: Pause button visible iff status = running ──────────────────────

it('UC2-S1: Pause button is visible iff status = running', () => {
  fc.assert(
    fc.property(timerStatusArb, sessionTypeArb,
      (status, sessionType) => {
        const { unmount } = render(
          <Controls status={status} sessionType={sessionType}
            onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />
        );
        const pauseBtn = screen.queryByRole('button', { name: /pause/i });
        if (status === 'running') {
          expect(pauseBtn).not.toBeNull();
        } else {
          expect(pauseBtn).toBeNull();
        }
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});

// ─── UC2-S3: Paused indicator visible iff status = paused ───────────────────

it('UC2-S3/UC2-S7: Paused indicator is visible iff status = paused', () => {
  fc.assert(
    fc.property(timerStatusArb, sessionTypeArb, remainingSecondsArb,
      (status, sessionType, remaining) => {
        const { unmount } = render(
          <TimerDisplay sessionType={sessionType} remainingSeconds={remaining} pomodoroCount={0} status={status} />
        );
        const pausedLabel = screen.queryByText('Paused');
        if (status === 'paused') {
          expect(pausedLabel).not.toBeNull();
        } else {
          expect(pausedLabel).toBeNull();
        }
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});

// ─── UC2-S5: Resume button visible iff status = paused ──────────────────────

it('UC2-S5: Resume button is visible iff status = paused', () => {
  fc.assert(
    fc.property(timerStatusArb, sessionTypeArb,
      (status, sessionType) => {
        const { unmount } = render(
          <Controls status={status} sessionType={sessionType}
            onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />
        );
        const resumeBtn = screen.queryByRole('button', { name: /resume/i });
        if (status === 'paused') {
          expect(resumeBtn).not.toBeNull();
        } else {
          expect(resumeBtn).toBeNull();
        }
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});

// ─── UC3-S1: Reset button always visible in every state ─────────────────────

it('UC3-S1: Reset button is always visible regardless of status or session type', () => {
  fc.assert(
    fc.property(timerStatusArb, sessionTypeArb,
      (status, sessionType) => {
        const { unmount } = render(
          <Controls status={status} sessionType={sessionType}
            onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />
        );
        expect(screen.getByRole('button', { name: /reset/i })).toBeTruthy();
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});

// ─── UC3-S3: Display always shows 30:00 when remainingSeconds = WORK_DURATION

it('UC3-S3: TimerDisplay always shows 30:00 when remainingSeconds = 1800', () => {
  fc.assert(
    fc.property(timerStatusArb, pomodoroCountArb,
      (status, count) => {
        const { unmount } = render(
          <TimerDisplay sessionType="work" remainingSeconds={WORK_DURATION} pomodoroCount={count} status={status} />
        );
        expect(screen.getByText('30:00')).toBeTruthy();
        unmount();
      }
    ),
    { numRuns: 30 }
  );
});

// ─── UC4-E3a: Skip button visible iff session is rest type ──────────────────

it('UC4-E3a: Skip button visible iff sessionType is shortRest or longRest', () => {
  fc.assert(
    fc.property(timerStatusArb, sessionTypeArb,
      (status, sessionType) => {
        const { unmount } = render(
          <Controls status={status} sessionType={sessionType}
            onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />
        );
        const skipBtn = screen.queryByRole('button', { name: /skip/i });
        if (sessionType === 'shortRest' || sessionType === 'longRest') {
          expect(skipBtn).not.toBeNull();
        } else {
          expect(skipBtn).toBeNull();
        }
        unmount();
      }
    ),
    { numRuns: 50 }
  );
});
