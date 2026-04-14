## Why

The current 25-minute work session is shorter than many users prefer for deep-focus work, and the 10-minute long rest does not provide enough recovery time after four consecutive Pomodoros. Additionally, users have no way to capture thoughts or context during a work session, forcing them to switch to another application and break their focus.

## What Changes

- **BREAKING** Increase work session duration from 25 minutes (1500 s) to 30 minutes (1800 s)
- **BREAKING** Increase long rest duration from 10 minutes (600 s) to 25 minutes (1500 s)
- Add a task-notes panel that is visible during work sessions, allowing the user to type and edit a free-text note; the note persists for the duration of the session and is cleared on reset or when a new work session begins

## Capabilities

### New Capabilities
- `task-notes`: A text input area that appears during work sessions, allowing the user to type, edit, and view a free-text note. The note is held in memory for the current work session and cleared when the session ends or the timer is reset.

### Modified Capabilities
- `timer-engine`: `WORK_DURATION` constant changes from 1500 s to 1800 s; `LONG_REST_DURATION` constant changes from 600 s to 1500 s. The "Start countdown" requirement wording updates to reference 30 minutes instead of 25.
- `session-manager`: Duration references for `work` (30 min / 1800 s) and `longRest` (25 min / 1500 s) change in cycle-progression requirements; the "Advance to long rest" requirement updates its stated duration accordingly.
- `timer-display`: The "Full-duration display at start" scenario changes from `25:00` to `30:00`; the "Long rest label" scenario duration reference updates from 10 min to 25 min.

## Impact

- `src/types/timer.ts` — update `WORK_DURATION` (1500 → 1800) and `LONG_REST_DURATION` (600 → 1500)
- `src/components/TimerDisplay.tsx` — render new `TaskNotes` component during work sessions
- New files: `src/components/TaskNotes.tsx`, `src/hooks/useTaskNotes.ts` (or inline state in `App`)
- `src/App.tsx` — wire task-notes state through to `TimerDisplay`
- All existing tests asserting `WORK_DURATION === 1500` or `LONG_REST_DURATION === 600` will need updating
- No external dependencies required

---
Created by Khaled@Huawei
