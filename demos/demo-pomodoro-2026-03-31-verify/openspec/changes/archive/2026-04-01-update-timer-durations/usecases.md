# Use Cases: update-timer-durations

Generated: 2026-03-31

## Overview

This document captures the use cases for the update-timer-durations change. The change is narrowly scoped: only the session durations change (work: 25→30 min, rest: 5→15 min). All behavioral use cases (pause, resume, reset, auto-transition) remain unchanged and are covered by the existing specs. This document covers only the goals directly affected by the duration update.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Complete a 30-minute focused work session |
| User | Take a 15-minute rest break |

---

## Use Cases

### UC1: Complete an Updated Work Session

**Primary Actor**: User
**Goal**: Complete a timed 30-minute focused work session (updated from 25 minutes)

#### Stakeholders & Interests
- User: Wants a longer, deep-focus work block that matches their concentration capacity
- System: Must initialize and count down from the new 30-minute (1800 s) duration

#### Preconditions
- The timer application is open and updated to the new durations
- Timer is in work mode, idle state

#### Trigger
User starts the work timer.

#### Main Success Scenario
1. User starts the timer.
2. System begins a 30-minute countdown in work mode.
3. System displays remaining time starting from 30:00, updating every second.
4. User works until the countdown completes.
5. System detects that the 30-minute session has ended.
6. System signals end of work session.
7. System transitions automatically to rest mode, showing a 15-minute rest timer ready to start.

#### Extensions
1a. User opens the app for the first time after the update:
  1a1. System displays "30:00" (not "25:00") in idle work mode.

#### Postconditions
- The 30-minute work session is complete.
- System is in rest mode showing a 15-minute timer ready to start.

---

### UC2: Take an Updated Rest Break

**Primary Actor**: User
**Goal**: Take a 15-minute rest break (updated from 5 minutes)

#### Stakeholders & Interests
- User: Wants a longer, more restorative rest period between work sessions
- System: Must initialize and count down from the new 15-minute (900 s) duration

#### Preconditions
- System is in rest mode (transitioned automatically after a work session, or on load)
- Rest timer has not yet started

#### Trigger
User starts the rest timer.

#### Main Success Scenario
1. User starts the rest timer.
2. System begins a 15-minute countdown in rest mode.
3. System displays remaining rest time starting from 15:00, updating every second.
4. User rests until the countdown completes.
5. System detects that the 15-minute rest period has ended.
6. System signals end of rest break.
7. System transitions automatically to work mode, showing a 30-minute work timer ready to start.

#### Extensions
1a. User opens the app for the first time after the update:
  1a1. After a work session ends, system shows "15:00" (not "05:00") in idle rest mode.

#### Postconditions
- The 15-minute rest break is complete.
- System is in work mode showing a 30-minute timer ready to start.

---

## Notes
- These use cases are delta use cases — they describe only what changes relative to the existing behavior
- All other use cases (pause, resume, reset, auto-transition) are unchanged and covered by existing specs
- The only observable user-facing difference is the duration values (30 min / 15 min)

---

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User starts the timer |
| UC1-S2 | System begins a 30-minute countdown in work mode |
| UC1-S3 | System displays remaining time starting from 30:00, updating every second |
| UC1-S5 | System detects that the 30-minute session has ended |
| UC1-S7 | System transitions automatically to rest mode with 15-minute timer ready |
| UC1-E1a1 | System displays "30:00" on load in idle work mode |
| UC2-S1 | User starts the rest timer |
| UC2-S2 | System begins a 15-minute countdown in rest mode |
| UC2-S3 | System displays remaining rest time starting from 15:00, updating every second |
| UC2-S5 | System detects that the 15-minute rest period has ended |
| UC2-S7 | System transitions automatically to work mode with 30-minute timer ready |
| UC2-E1a1 | System displays "15:00" in idle rest mode after a work session ends |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
