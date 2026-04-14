import { usePomodoroTimer } from '../state/usePomodoroTimer';
import { playBeep } from '../utils/notify';
import { Controls } from './Controls';
import { Display } from './Display';

export function PomodoroTimer() {
  const { state, start, pause, resume, reset } = usePomodoroTimer({
    onPhaseEnd: () => playBeep(),
  });

  return (
    <main className={`pomodoro pomodoro--${state.phase}`}>
      <h1>Pomodoro Timer</h1>
      <Display phase={state.phase} remainingSeconds={state.remainingSeconds} />
      <Controls
        status={state.status}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onReset={reset}
      />
    </main>
  );
}
