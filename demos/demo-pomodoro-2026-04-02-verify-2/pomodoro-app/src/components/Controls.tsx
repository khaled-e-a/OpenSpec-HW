import type { SessionType, TimerStatus } from '../types/timer';

interface ControlsProps {
  status: TimerStatus;
  sessionType: SessionType;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

/**
 * Control bar: Start / Pause / Resume / Reset / Skip buttons.
 * Tasks 6.1–6.5
 */
export function Controls({ status, sessionType, onStart, onPause, onResume, onReset, onSkip }: ControlsProps) {
  const isRest = sessionType === 'shortRest' || sessionType === 'longRest';

  return (
    <div className="controls" role="group" aria-label="Timer controls">
      {/* 6.1 — Start: visible when idle or completed */}
      {(status === 'idle' || status === 'completed') && (
        <button className="btn btn--primary" onClick={onStart}>
          {status === 'completed' ? 'Start Next' : 'Start'}
        </button>
      )}

      {/* 6.2 — Pause: visible when running */}
      {status === 'running' && (
        <button className="btn btn--secondary" onClick={onPause}>
          Pause
        </button>
      )}

      {/* 6.3 — Resume: visible when paused */}
      {status === 'paused' && (
        <button className="btn btn--primary" onClick={onResume}>
          Resume
        </button>
      )}

      {/* 6.4 — Reset: always visible */}
      <button className="btn btn--ghost" onClick={onReset}>
        Reset
      </button>

      {/* 6.5 — Skip: only during rest sessions */}
      {isRest && (
        <button className="btn btn--ghost" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  );
}
