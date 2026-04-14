import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { PomodoroTimer } from './PomodoroTimer';
import { WORK_SECONDS, REST_SECONDS } from '../state/timerState';

describe('<PomodoroTimer /> integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('full lifecycle: start → tick → pause → resume → reset', () => {
    render(<PomodoroTimer />);

    expect(screen.getByTestId('time')).toHaveTextContent('25:00');
    expect(screen.getByTestId('phase')).toHaveTextContent(/work/i);

    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByTestId('time')).toHaveTextContent('24:57');

    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId('time')).toHaveTextContent('24:57');

    fireEvent.click(screen.getByRole('button', { name: /resume/i }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId('time')).toHaveTextContent('24:55');

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByTestId('time')).toHaveTextContent('25:00');
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  test('work→rest→idle cycle transitions phases automatically (UC1-S3..S6)', () => {
    render(<PomodoroTimer />);

    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    act(() => {
      vi.advanceTimersByTime(WORK_SECONDS * 1000);
    });
    expect(screen.getByTestId('phase')).toHaveTextContent(/rest/i);
    expect(screen.getByTestId('time')).toHaveTextContent('05:00');

    act(() => {
      vi.advanceTimersByTime(REST_SECONDS * 1000);
    });
    expect(screen.getByTestId('phase')).toHaveTextContent(/work/i);
    expect(screen.getByTestId('time')).toHaveTextContent('25:00');
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });
});
