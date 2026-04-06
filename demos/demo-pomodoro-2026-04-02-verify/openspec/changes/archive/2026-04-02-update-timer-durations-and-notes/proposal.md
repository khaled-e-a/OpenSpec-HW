## Why

The default Pomodoro durations (25 min work, 10 min long rest) do not suit all working styles; some users need longer focus blocks and more substantial recovery time. Additionally, users currently have no way to capture what they were working on during a session, forcing them to switch to an external tool for notes.

## What Changes

- **BREAKING** Work session duration changes from 25 minutes to 30 minutes (1800 seconds)
- **BREAKING** Long Rest duration changes from 10 minutes to 25 minutes (1500 seconds)
- Short Rest duration remains unchanged at 5 minutes (300 seconds)
- A persistent notes section is added to the UI so users can write and save free-form notes about the current task

## Capabilities

### New Capabilities
- `task-notes`: A text area in the UI that allows the user to type, edit, and retain notes about the current task. Notes persist across session transitions (work → rest → work) within the same page session and are cleared only when explicitly dismissed by the user.

### Modified Capabilities
- `session-management`: The "Session durations are fixed constants" requirement changes — Work Session duration becomes 30 minutes (1800 s) and Long Rest becomes 25 minutes (1500 s).
- `timer-ui`: The countdown display and session-end banner messages reference specific durations (e.g., "25:00", "10:00") that must be updated to reflect the new values (30:00 and 25:00). The UI also gains a notes input area.

## Impact

- `src/timer.js` — `DURATIONS.WORK` changes from 1500 → 1800; `DURATIONS.LONG_REST` changes from 600 → 1500
- `index.html` — notes textarea added to layout; any hardcoded duration strings updated
- Existing users mid-session at time of deployment will see the new durations on next reset/reload
- No backend, no data migration required; notes are in-page only (no persistence to storage)

---

Created by Khaled@Huawei
