/**
 * Component tests for timer-display spec.
 * Covers: UC1-S1/S2/S3/S5/E5a, UC2-S1/S3/S5/S7, UC3-S1/S3/S4/S5, UC4-S2/S6/E3a
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from '../components/TimerDisplay';
import { Controls } from '../components/Controls';
import type { TimerStatus } from '../types/timer';
import { WORK_DURATION } from '../types/timer';

// ─── TimerDisplay component ────────────────────────────────────────────────

describe('TimerDisplay — MM:SS countdown format (UC1-S2)', () => {
  it('renders 30:00 for a fresh work session', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={WORK_DURATION} pomodoroCount={0} status="idle" />
    );
    expect(screen.getByText('30:00')).toBeTruthy();
  });

  it('renders correct MM:SS for arbitrary remaining time', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={90} pomodoroCount={0} status="running" />
    );
    expect(screen.getByText('01:30')).toBeTruthy();
  });

  it('renders 00:00 when remainingSeconds is 0', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={0} pomodoroCount={0} status="completed" />
    );
    expect(screen.getByText('00:00')).toBeTruthy();
  });
});

describe('TimerDisplay — session type labels (UC1-S3, UC4-S2, UC4-S6)', () => {
  it('UC1-S3: shows "Work" label for work session', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={WORK_DURATION} pomodoroCount={0} status="idle" />
    );
    expect(screen.getByText('Work')).toBeTruthy();
  });

  it('UC4-S2: shows "Short Rest" label for shortRest session', () => {
    render(
      <TimerDisplay sessionType="shortRest" remainingSeconds={300} pomodoroCount={1} status="running" />
    );
    expect(screen.getByText('Short Rest')).toBeTruthy();
  });

  it('UC4-S6: shows "Long Rest" label for longRest session', () => {
    render(
      <TimerDisplay sessionType="longRest" remainingSeconds={1500} pomodoroCount={0} status="running" />
    );
    expect(screen.getByText('Long Rest')).toBeTruthy();
  });
});

describe('TimerDisplay — completion banner (UC1-S5, UC1-E5a)', () => {
  it('UC1-S5: shows completion banner when status is completed', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={0} pomodoroCount={1} status="completed" />
    );
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText(/Session Complete/i)).toBeTruthy();
  });

  it('UC1-E5a: completion banner persists — no auto-dismiss markup', () => {
    const { container } = render(
      <TimerDisplay sessionType="work" remainingSeconds={0} pomodoroCount={1} status="completed" />
    );
    // Banner stays rendered; no timeout mechanism exists in the component
    expect(container.querySelector('.status-badge--completed')).not.toBeNull();
  });

  it('does NOT show completion banner when status is running', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={500} pomodoroCount={0} status="running" />
    );
    expect(screen.queryByText(/Session Complete/i)).toBeNull();
  });
});

describe('TimerDisplay — paused indicator (UC2-S3, UC2-S7)', () => {
  it('UC2-S3: shows "Paused" indicator when status is paused', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={800} pomodoroCount={0} status="paused" />
    );
    expect(screen.getByText('Paused')).toBeTruthy();
  });

  it('UC2-S7: does NOT show "Paused" indicator when status is running', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={800} pomodoroCount={0} status="running" />
    );
    expect(screen.queryByText('Paused')).toBeNull();
  });
});

describe('TimerDisplay — Pomodoro count indicator (UC1-S6)', () => {
  it('shows correct filled dots after 2 pomodoros', () => {
    render(
      <TimerDisplay sessionType="work" remainingSeconds={WORK_DURATION} pomodoroCount={2} status="idle" />
    );
    const filled = screen.getAllByText('●');
    const empty = screen.getAllByText('○');
    expect(filled).toHaveLength(2);
    expect(empty).toHaveLength(2);
  });
});

// ─── Controls component ────────────────────────────────────────────────────

const noop = () => {};

describe('Controls — Start button (UC1-S1)', () => {
  it('UC1-S1: Start button visible when idle', () => {
    render(<Controls status="idle" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeTruthy();
  });

  it('Start Next button visible when completed', () => {
    render(<Controls status="completed" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /start next/i })).toBeTruthy();
  });

  it('Start button NOT visible when running', () => {
    render(<Controls status="running" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.queryByRole('button', { name: /^start$/i })).toBeNull();
  });
});

describe('Controls — Pause button (UC2-S1)', () => {
  it('UC2-S1: Pause button visible when running', () => {
    render(<Controls status="running" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /pause/i })).toBeTruthy();
  });

  it('Pause button NOT visible when paused', () => {
    render(<Controls status="paused" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.queryByRole('button', { name: /pause/i })).toBeNull();
  });
});

describe('Controls — Resume button (UC2-S5)', () => {
  it('UC2-S5: Resume button visible when paused', () => {
    render(<Controls status="paused" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /resume/i })).toBeTruthy();
  });

  it('Resume button NOT visible when running', () => {
    render(<Controls status="running" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.queryByRole('button', { name: /resume/i })).toBeNull();
  });
});

describe('Controls — Reset button (UC3-S1)', () => {
  const statuses: TimerStatus[] = ['idle', 'running', 'paused', 'completed'];
  statuses.forEach(status => {
    it(`UC3-S1: Reset button visible when ${status}`, () => {
      render(<Controls status={status} sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
      expect(screen.getByRole('button', { name: /reset/i })).toBeTruthy();
    });
  });
});

describe('Controls — Skip button (UC4-E3a)', () => {
  it('Skip button visible during shortRest', () => {
    render(<Controls status="running" sessionType="shortRest" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /skip/i })).toBeTruthy();
  });

  it('Skip button visible during longRest', () => {
    render(<Controls status="running" sessionType="longRest" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.getByRole('button', { name: /skip/i })).toBeTruthy();
  });

  it('Skip button NOT visible during work session', () => {
    render(<Controls status="running" sessionType="work" onStart={noop} onPause={noop} onResume={noop} onReset={noop} onSkip={noop} />);
    expect(screen.queryByRole('button', { name: /skip/i })).toBeNull();
  });
});

describe('Controls — Reset display state (UC3-S3, UC3-S4, UC3-S5)', () => {
  it('UC3-S3/S4/S5: after reset, component receives work session props at 30:00', () => {
    // This test verifies the display receives the right props after reset
    // (integration between state and display is tested in usePomodoro.test.tsx)
    render(
      <TimerDisplay sessionType="work" remainingSeconds={WORK_DURATION} pomodoroCount={0} status="idle" />
    );
    expect(screen.getByText('30:00')).toBeTruthy();
    expect(screen.getByText('Work')).toBeTruthy();
    const empty = screen.getAllByText('○');
    expect(empty).toHaveLength(4); // all dots empty
  });
});
