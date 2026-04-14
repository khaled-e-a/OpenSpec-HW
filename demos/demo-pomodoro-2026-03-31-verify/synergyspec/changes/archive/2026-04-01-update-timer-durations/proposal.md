## Why

The default Pomodoro durations (25 min work / 5 min rest) are too short for deep-focus work and insufficient recovery between sessions. Updating to 30-minute work sessions and 15-minute rest periods better accommodates extended concentration blocks and proper rest.

## What Changes

- **BREAKING**: Work session duration changes from 25 minutes (1500 s) to 30 minutes (1800 s)
- **BREAKING**: Rest session duration changes from 5 minutes (300 s) to 15 minutes (900 s)
- Initial timer display on load updates to reflect the new defaults ("30:00" for work, "15:00" for rest)

## Capabilities

### New Capabilities

_(none — no new capabilities are introduced)_

### Modified Capabilities

- `timer-core`: Duration requirements for work and rest sessions are changing (1500 s → 1800 s, 300 s → 900 s)
- `timer-ui`: Default display values change to reflect new durations ("25:00" → "30:00" on load, "05:00" → "15:00" after work session ends)

## Impact

- `index.html`: `DURATIONS` constant — `work: 1500` → `work: 1800`, `rest: 300` → `rest: 900`
- No structural or behavioral changes — only the numeric duration values change
- No API, backend, or dependency changes

Created by Khaled@Huawei
