# Use Cases: timer-adjustments-and-task-notes

Generated: 2026-04-02

## Overview

This document captures the use cases for the timer-adjustments-and-task-notes change. The change involves two duration adjustments (work session: 25→30 min, long rest: 10→25 min) and the introduction of a task-notes feature that lets users capture free-text notes during a work session.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | Complete a 30-minute focused work session |
| User | Capture a thought or note without leaving the Pomodoro session |
| User | Review the note they wrote during the current session |
| User | Have the note automatically cleared when starting fresh |

---

## Use Cases

### UC1: Complete an Extended Work Session

**Primary Actor**: User
**Goal**: Run a 30-minute focused work session (updated from the previous 25 minutes)

#### Stakeholders & Interests
- User: Wants a longer, uninterrupted work block that matches their preferred deep-work rhythm
- System: Must accurately count down 30 minutes and signal completion correctly

#### Preconditions
- The application is loaded and showing the initial idle state
- No session is currently running

#### Trigger
User starts the timer to begin a work session

#### Main Success Scenario
1. User starts the timer to begin a work session
2. System begins counting down from 30:00, updating the display each second
3. System shows the session type label as "Work"
4. User works for the full 30 minutes without interruption
5. System reaches 00:00 and signals session completion
6. System records the completed Pomodoro and advances to the next session in the cycle

#### Extensions
5a. Timer reaches 00:00 while user is away:
  5a1. System holds the completion state until the user initiates the next action

#### Postconditions
- One Pomodoro is recorded as complete
- System is ready to start the next session (short rest or long rest)

---

### UC2: Recover with an Extended Long Rest

**Primary Actor**: User
**Goal**: Take a 25-minute long rest after completing four Pomodoros (updated from the previous 10 minutes)

#### Stakeholders & Interests
- User: Wants a meaningfully longer recovery period after a full cycle of four 30-minute sessions
- System: Must use the updated long-rest duration (25 min / 1500 s) in cycle transitions

#### Preconditions
- The user has just completed their 4th Pomodoro in the current cycle
- System has transitioned to the long rest session

#### Trigger
System automatically advances to long rest after the 4th work session completes; user starts the rest

#### Main Success Scenario
1. System transitions to the long rest session (25 minutes) and shows "Long Rest"
2. User starts the long rest countdown
3. System counts down from 25:00, updating each second
4. System reaches 00:00 and signals long rest completion
5. System resets the Pomodoro counter and readies the next work cycle

#### Extensions
3a. User skips the long rest:
  3a1. User triggers skip; system advances to the next work session immediately

#### Postconditions
- Long rest is complete; pomodoroCount is 0
- System is ready to begin the next full cycle

---

### UC3: Capture a Note During a Work Session

**Primary Actor**: User
**Goal**: Write a free-text note to capture a thought or context without leaving the Pomodoro session

#### Stakeholders & Interests
- User: Wants to record an idea, a reminder, or a distraction without context-switching to another app
- System: Must provide a visible, editable note area during work sessions and preserve the content until the session ends or the timer is reset

#### Preconditions
- A work session is active (running or paused)
- The task-notes panel is visible

#### Trigger
User decides to record a thought during the work session

#### Main Success Scenario
1. System displays the task-notes panel alongside the timer during the work session
2. User opens or focuses the note area and begins typing
3. System captures each keystroke and reflects the note content immediately in the panel
4. User finishes typing and returns focus to their work
5. Note content remains visible and intact for the rest of the session

#### Extensions
2a. User edits an existing note (adds, deletes, or modifies text):
  2a1. System updates the displayed note to reflect each change as the user types

4a. User clears the note manually:
  4a1. System empties the note content; panel remains visible

#### Postconditions
- The note is preserved in the panel for the duration of the current work session
- The user's work session continues uninterrupted

---

### UC4: Note Is Cleared at Session Boundary

**Primary Actor**: User
**Goal**: Start each new work session with a clean note area, free of content from previous sessions

#### Stakeholders & Interests
- User: Does not want notes from a previous work block to clutter the next one
- System: Must clear the note content when the current session ends (timer completes and a new session starts) or when the timer is reset

#### Preconditions
- A note exists in the task-notes panel from the current or a previous work session

#### Trigger
User starts a new work session after the previous one ended, or user triggers a reset

#### Main Success Scenario
1. User completes a work session or resets the timer
2. System clears the note content from the task-notes panel
3. System readies the panel for a new note in the next work session

#### Extensions
1a. User resets the timer mid-session:
  1a1. System clears the note immediately on reset, regardless of session type

#### Postconditions
- The task-notes panel is empty
- The next work session begins with a blank note area

---

## Notes
- UC1 and UC2 address the **duration changes** only; all other timer behaviour (pause, resume, reset, skip, cycle progression) is unchanged from the previous `simple-pomodoro-timer` change.
- UC3 and UC4 address the **new task-notes capability**.
- The task-notes panel is only shown during work sessions; it is hidden during short rest and long rest.
- No persistence across page reloads is required (MVP — in-memory only).

---

## Use Case Traceability Mapping

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User starts the timer to begin a work session |
| UC1-S2 | System begins countdown from 30:00, updating each second |
| UC1-S3 | System shows session type label as "Work" |
| UC1-S4 | User works for the full 30 minutes without interruption |
| UC1-S5 | System reaches 00:00 and signals session completion |
| UC1-S6 | System records the completed Pomodoro and advances to the next session |
| UC1-E5a | Timer completes while user is away; system holds completion state |
| UC2-S1 | System transitions to long rest (25 min) and shows "Long Rest" |
| UC2-S2 | User starts the long rest countdown |
| UC2-S3 | System counts down from 25:00, updating each second |
| UC2-S4 | System reaches 00:00 and signals long rest completion |
| UC2-S5 | System resets Pomodoro counter and readies the next work cycle |
| UC2-E3a | User triggers skip; system advances to next work session immediately |
| UC3-S1 | System displays the task-notes panel during the work session |
| UC3-S2 | User focuses the note area and begins typing |
| UC3-S3 | System captures input and reflects note content immediately |
| UC3-S4 | User finishes typing and returns focus to their work |
| UC3-S5 | Note content remains visible and intact for the rest of the session |
| UC3-E2a | User edits existing note; system updates display with each change |
| UC3-E4a | User manually clears the note; system empties content, panel stays visible |
| UC4-S1 | User completes a work session or resets the timer |
| UC4-S2 | System clears the note content from the task-notes panel |
| UC4-S3 | System readies the panel for a new note in the next work session |
| UC4-E1a | User resets the timer mid-session; system clears the note immediately |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
