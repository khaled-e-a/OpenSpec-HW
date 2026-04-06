import { useState, useEffect } from 'react';
import { usePomodoro } from './hooks/usePomodoro';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { TaskNotes } from './components/TaskNotes';
import './App.css';

/**
 * Root application component.
 * Owns all timer state via usePomodoro and note state via useState.
 * Wires controls to handlers and conditionally renders TaskNotes during work sessions.
 */
function App() {
  const { state, startTimer, pauseTimer, resumeTimer, resetTimer, skipSession } = usePomodoro();

  // Task 4.1: note state owned in App
  const [note, setNote] = useState('');

  // Task 4.3: clear note whenever a new work session becomes idle
  // (covers both session-boundary auto-clear and reset mid-session)
  useEffect(() => {
    if (state.sessionType === 'work' && state.status === 'idle') {
      setNote('');
    }
  }, [state.sessionType, state.status]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Pomodoro Timer</h1>
      </header>

      <main className="app-main">
        <TimerDisplay
          sessionType={state.sessionType}
          remainingSeconds={state.remainingSeconds}
          pomodoroCount={state.pomodoroCount}
          status={state.status}
        />

        <Controls
          status={state.status}
          sessionType={state.sessionType}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onSkip={skipSession}
        />

        {/* Task 4.2: show task-notes panel only during work sessions */}
        {state.sessionType === 'work' && (
          <TaskNotes note={note} onChange={setNote} />
        )}
      </main>
    </div>
  );
}

export default App;
