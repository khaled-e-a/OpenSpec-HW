import type { Status } from '../state/timerState';

interface ControlsProps {
  status: Status;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export function Controls({ status, onStart, onPause, onResume, onReset }: ControlsProps) {
  return (
    <div className="controls">
      {status === 'idle' && (
        <button type="button" onClick={onStart}>
          Start
        </button>
      )}
      {status === 'running' && (
        <button type="button" onClick={onPause}>
          Pause
        </button>
      )}
      {status === 'paused' && (
        <button type="button" onClick={onResume}>
          Resume
        </button>
      )}
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
