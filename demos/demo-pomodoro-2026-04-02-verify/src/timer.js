// =============================================================================
// simple-pomodoro-timer — timer.js
// Timer Core Engine + Session State Machine
// =============================================================================

// ---------------------------------------------------------------------------
// Task 1.2 — Session duration constants
// ---------------------------------------------------------------------------
export const DURATIONS = {
  WORK:       30 * 60,  // 1800 seconds
  SHORT_REST:  5 * 60,  //  300 seconds
  LONG_REST:  25 * 60,  // 1500 seconds — note: coincidentally equals the old WORK duration (was 10 min)
};

// ---------------------------------------------------------------------------
// Task 3.1 — Timer state enum
// ---------------------------------------------------------------------------
export const State = Object.freeze({
  IDLE:    'IDLE',
  RUNNING: 'RUNNING',
  PAUSED:  'PAUSED',
});

export const SessionType = Object.freeze({
  WORK:       'WORK',
  SHORT_REST: 'SHORT_REST',
  LONG_REST:  'LONG_REST',
});

export const SESSION_LABELS = {
  [SessionType.WORK]:       'Work Session',
  [SessionType.SHORT_REST]: 'Short Rest',
  [SessionType.LONG_REST]:  'Long Rest',
};

// ---------------------------------------------------------------------------
// Internal timer state
// ---------------------------------------------------------------------------
let _state          = State.IDLE;           // current run state
let _sessionType    = SessionType.WORK;     // current session type
let _remainingSeconds = DURATIONS.WORK;     // seconds left on display
let _initialSeconds = DURATIONS.WORK;       // full duration of current session
let _startedAt      = null;                 // wall-clock epoch when interval started
let _intervalId     = null;                 // setInterval handle
let _pomodoroCount  = 0;                    // completed work sessions

// Registered callback — UI supplies this
let _onTick         = null;   // (snapshot) => void
let _onComplete     = null;   // (sessionType, snapshot) => void

// ---------------------------------------------------------------------------
// Public API — read state
// ---------------------------------------------------------------------------
export function getSnapshot() {
  return {
    state:            _state,
    sessionType:      _sessionType,
    remainingSeconds: _remainingSeconds,
    pomodoroCount:    _pomodoroCount,
    label:            SESSION_LABELS[_sessionType],
  };
}

// ---------------------------------------------------------------------------
// Public API — register callbacks
// ---------------------------------------------------------------------------
export function onTick(fn)     { _onTick     = fn; }
export function onComplete(fn) { _onComplete = fn; }

// ---------------------------------------------------------------------------
// Test-only: full state reset including pomodoroCount and callbacks
// ---------------------------------------------------------------------------
export function _resetForTesting() {
  _clearInterval();
  _state            = State.IDLE;
  _sessionType      = SessionType.WORK;
  _remainingSeconds = DURATIONS.WORK;
  _initialSeconds   = DURATIONS.WORK;
  _startedAt        = null;
  _intervalId       = null;
  _pomodoroCount    = 0;
  _onTick           = null;
  _onComplete       = null;
}

// ---------------------------------------------------------------------------
// Task 2.1 — startTimer(initialSeconds)
// ---------------------------------------------------------------------------
export function startTimer() {
  if (_state === State.RUNNING) return; // idempotent guard (task 2.7)

  _initialSeconds   = _remainingSeconds; // honour current remaining (covers resume path)
  _startedAt        = Date.now();
  _state            = State.RUNNING;

  _intervalId = setInterval(_tick, 1000);
  _notify();
}

// ---------------------------------------------------------------------------
// Task 2.4 — pauseTimer()
// ---------------------------------------------------------------------------
export function pauseTimer() {
  if (_state !== State.RUNNING) return; // idempotent guard (task 2.7)

  _clearInterval();
  _state = State.PAUSED;
  // _remainingSeconds already holds the last correct value from _tick
  _notify();
}

// ---------------------------------------------------------------------------
// Task 2.5 — resumeTimer()
// ---------------------------------------------------------------------------
export function resumeTimer() {
  if (_state !== State.PAUSED) return; // idempotent guard (task 2.7)

  // Resume treats remaining as new initial; reset wall-clock anchor
  startTimer();
}

// ---------------------------------------------------------------------------
// Task 2.6 — resetTimer()
// ---------------------------------------------------------------------------
export function resetTimer() {
  _clearInterval();

  // Task 3.6: reset during rest → transition to Work Session IDLE
  if (_sessionType !== SessionType.WORK) {
    _sessionType = SessionType.WORK;
  }

  _remainingSeconds = DURATIONS[_sessionType];
  _initialSeconds   = _remainingSeconds;
  _startedAt        = null;
  _state            = State.IDLE;
  // pomodoroCount NOT modified (task 2.6 / UC5-S4)

  _notify();
}

// ---------------------------------------------------------------------------
// Task 2.2 — per-tick drift-corrected countdown
// Task 2.3 — session-complete detection
// ---------------------------------------------------------------------------
function _tick() {
  const elapsed    = Math.floor((Date.now() - _startedAt) / 1000);
  _remainingSeconds = Math.max(0, _initialSeconds - elapsed);

  if (_remainingSeconds <= 0) {
    _clearInterval();
    _completeSession();
    return;
  }

  _notify();
}

// ---------------------------------------------------------------------------
// Task 3.2 + 3.3 + 3.4 + 3.5 — session completion routing
// ---------------------------------------------------------------------------
function _completeSession() {
  const completedType = _sessionType;

  if (completedType === SessionType.WORK) {
    // Task 3.2 — increment count
    _pomodoroCount += 1;

    // Task 3.3 — route: Long Rest every 4th pomodoro, else Short Rest
    _sessionType = (_pomodoroCount % 4 === 0)
      ? SessionType.LONG_REST
      : SessionType.SHORT_REST;
  } else {
    // Task 3.4 / 3.5 — any rest completion → back to Work
    _sessionType = SessionType.WORK;
  }

  _remainingSeconds = DURATIONS[_sessionType];
  _initialSeconds   = _remainingSeconds;
  _state            = State.IDLE;

  if (_onComplete) _onComplete(completedType, getSnapshot());
  _notify();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function _clearInterval() {
  if (_intervalId !== null) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
}

function _notify() {
  if (_onTick) _onTick(getSnapshot());
}
