# Spec: task-notes (new capability)

Generated: 2026-04-02

## Overview
New capability spec for `task-notes`.
Provides a free-text note panel that is visible only during work sessions. The user can type, edit, and manually clear a note. The note persists for the duration of the current work session and is automatically cleared when the session ends or the timer is reset.

See usecases.md "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC3-S1: System displays the task-notes panel during the work session
- UC3-S2: User focuses the note area and begins typing
- UC3-S3: System captures input and reflects note content immediately
- UC3-S4: User finishes typing and returns focus to their work
- UC3-S5: Note content remains visible and intact for the rest of the session
- UC3-E2a: User edits existing note; system updates display with each change
- UC3-E4a: User manually clears the note; system empties content, panel stays visible
- UC4-S1: User completes a work session or resets the timer
- UC4-S2: System clears the note content from the task-notes panel
- UC4-S3: System readies the panel for a new note in the next work session
- UC4-E1a: User resets the timer mid-session; system clears the note immediately on reset

## ADDED Requirements

### Requirement: Display task-notes panel during work session
**Implements**: UC3-S1 - System displays the task-notes panel during the work session
The system SHALL render the task-notes panel in the UI when and only when `sessionType` is `work`.

#### Scenario: Panel visible during work session
- **WHEN** sessionType is `work`
- **THEN** the task-notes panel SHALL be visible in the UI

#### Scenario: Panel hidden during short rest
- **WHEN** sessionType is `shortRest`
- **THEN** the task-notes panel SHALL NOT be visible in the UI

#### Scenario: Panel hidden during long rest
- **WHEN** sessionType is `longRest`
- **THEN** the task-notes panel SHALL NOT be visible in the UI

---

### Requirement: Accept user input in the note area
**Implements**: UC3-S2 - User focuses the note area and begins typing
**Implements**: UC3-S3 - System captures input and reflects note content immediately
**Implements**: UC3-E2a - User edits existing note; system updates display with each change
The system SHALL provide an editable text area within the task-notes panel that accepts keyboard input and immediately reflects each change in the displayed note content.

#### Scenario: Note area is editable during work session
- **WHEN** sessionType is `work`
- **THEN** the note textarea SHALL be focusable and accept keyboard input

#### Scenario: Note content updates on each keystroke
- **WHEN** the user types in the note textarea
- **THEN** the displayed note content SHALL update immediately to reflect each keystroke

#### Scenario: Edited note reflects all changes
- **WHEN** the user modifies existing note content (adds, deletes, or replaces text)
- **THEN** the note display SHALL update to show the current content after each change

---

### Requirement: Persist note content for the session duration
**Implements**: UC3-S4 - User finishes typing and returns focus to their work
**Implements**: UC3-S5 - Note content remains visible and intact for the rest of the session
The system SHALL retain the note content in the panel for the entire duration of the current work session, regardless of whether the user is actively editing it.

#### Scenario: Note persists after user stops typing
- **WHEN** the user stops typing and moves focus away from the note area
- **THEN** the note content SHALL remain visible and unchanged in the panel

#### Scenario: Note persists while timer is running
- **WHEN** the timer is running during a work session and note content exists
- **THEN** the note content SHALL remain intact throughout the countdown

#### Scenario: Note persists while timer is paused
- **WHEN** the timer is paused during a work session and note content exists
- **THEN** the note content SHALL remain intact while the timer is paused

---

### Requirement: Allow manual note clearing
**Implements**: UC3-E4a - User manually clears the note; system empties content, panel stays visible
The system SHALL provide a mechanism (e.g., a "Clear" button) that empties the note content while keeping the task-notes panel visible.

#### Scenario: Clear button empties the note
- **WHEN** the user activates the clear control
- **THEN** the note content SHALL become empty and the panel SHALL remain visible

#### Scenario: Panel remains visible after clearing
- **WHEN** the user clears the note during a work session
- **THEN** the task-notes panel SHALL continue to be displayed (not hidden)

---

### Requirement: Clear note at session boundary
**Implements**: UC4-S1 - User completes a work session or resets the timer
**Implements**: UC4-S2 - System clears the note content from the task-notes panel
**Implements**: UC4-S3 - System readies the panel for a new note in the next work session
The system SHALL automatically clear the note content when a new work session begins (i.e., after the previous session ends and the session transitions to a new `work` + `idle` state).

#### Scenario: Note cleared when new work session starts
- **WHEN** the session transitions to sessionType `work` with status `idle` after a completed session
- **THEN** the note content SHALL be empty

#### Scenario: Note area is blank at the start of each new work session
- **WHEN** a new work session becomes idle
- **THEN** the task-notes panel SHALL display an empty note area

---

### Requirement: Clear note immediately on reset
**Implements**: UC4-E1a - User resets the timer mid-session; system clears the note immediately on reset
The system SHALL clear the note content immediately when the user triggers a reset, regardless of the current session type or timer status.

#### Scenario: Note cleared on reset during work session
- **WHEN** the user triggers reset while sessionType is `work`
- **THEN** the note content SHALL become empty immediately

#### Scenario: Note cleared on reset during rest session
- **WHEN** the user triggers reset while sessionType is `shortRest` or `longRest`
- **THEN** the note content SHALL become empty immediately (note will not be visible, but state is cleared)
