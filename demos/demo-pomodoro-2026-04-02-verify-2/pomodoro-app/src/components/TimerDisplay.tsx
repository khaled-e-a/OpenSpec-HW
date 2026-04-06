import type { SessionType, TimerStatus } from '../types/timer';
import { SESSION_LABELS, POMODOROS_PER_CYCLE } from '../types/timer';
import { formatTime } from '../utils/formatTime';

interface TimerDisplayProps {
  sessionType: SessionType;
  remainingSeconds: number;
  pomodoroCount: number;
  status: TimerStatus;
}

/**
 * Presentational component: renders countdown, session label,
 * Pomodoro dots, paused indicator, and completion banner.
 * Tasks 5.1, 5.2, 5.3, 7.1, 7.2
 */
export function TimerDisplay({ sessionType, remainingSeconds, pomodoroCount, status }: TimerDisplayProps) {
  // 5.3 — Pomodoro progress dots
  const dots = Array.from({ length: POMODOROS_PER_CYCLE }, (_, i) => (
    <span key={i} className={`dot ${i < pomodoroCount ? 'dot--filled' : 'dot--empty'}`}>
      {i < pomodoroCount ? '●' : '○'}
    </span>
  ));

  return (
    <div className={`timer-display timer-display--${sessionType}`}>
      {/* 5.2 — Session type label */}
      <div className="session-label">{SESSION_LABELS[sessionType]}</div>

      {/* 5.1 — Countdown in MM:SS */}
      <div className="countdown">{formatTime(remainingSeconds)}</div>

      {/* 5.3 — Pomodoro dots */}
      <div className="pomodoro-dots" aria-label={`${pomodoroCount} of ${POMODOROS_PER_CYCLE} pomodoros complete`}>
        {dots}
      </div>

      {/* 7.1 — Paused indicator */}
      {status === 'paused' && (
        <div className="status-badge status-badge--paused" role="status">Paused</div>
      )}

      {/* 7.2 — Completion banner */}
      {status === 'completed' && (
        <div className="status-badge status-badge--completed" role="status">
          Session Complete! 🎉
        </div>
      )}
    </div>
  );
}
