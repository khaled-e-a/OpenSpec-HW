import type { Phase } from '../state/timerState';

interface DisplayProps {
  phase: Phase;
  remainingSeconds: number;
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function Display({ phase, remainingSeconds }: DisplayProps) {
  return (
    <div className={`display display--${phase}`}>
      <div data-testid="phase" className="display__phase">
        {phase === 'work' ? 'Work' : 'Rest'}
      </div>
      <div data-testid="time" className="display__time">
        {formatTime(remainingSeconds)}
      </div>
    </div>
  );
}
