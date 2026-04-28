# Spec: layout-persistence

Generated: 2026-04-28

## Overview
This spec defines requirements for serialising and deserialising dashboard layout state to and from `localStorage`, including default layout fallback and corrupt-data recovery.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC1-S7: System persists updated layout to localStorage
- UC2-S5: System persists updated layout to localStorage (after add)
- UC3-S6: System persists updated layout to localStorage (after remove)
- UC4-S1: Browser loads the React dashboard application
- UC4-S2: System reads stored layout from localStorage
- UC4-S3: System parses layout and reconstructs widget positions and types
- UC4-S4: System renders dashboard with each widget in its persisted position
- UC4-S5: User sees dashboard exactly as last left
- UC4-E2a: No layout in localStorage; system renders default layout
- UC4-E2b: Layout data corrupt/incompatible; system falls back to default, notifies user

## ADDED Requirements

### Requirement: Persist layout on every mutation
**Implements**: UC1-S7 - System persists updated layout to localStorage; UC2-S5 - System persists after add; UC3-S6 - System persists after remove
The system SHALL write the current dashboard layout to `localStorage` (key: `rdd_layout`) after every layout change, including widget moves, additions, and removals. The stored value SHALL include a `layoutVersion` field and an array of widget instances with their grid coordinates and type IDs.

#### Scenario: Layout written after widget move
- **WHEN** the user drops a widget in a new position
- **THEN** the updated layout is written to localStorage before the next user interaction

#### Scenario: Layout written after widget add
- **WHEN** a new widget is added to the dashboard
- **THEN** the updated layout (including the new widget) is written to localStorage

#### Scenario: Layout written after widget remove
- **WHEN** a widget is removed from the dashboard
- **THEN** the updated layout (without the removed widget) is written to localStorage

---

### Requirement: Read and restore layout on application load
**Implements**: UC4-S1 - Browser loads React dashboard; UC4-S2 - System reads stored layout; UC4-S3 - System parses layout and reconstructs positions; UC4-S4 - Renders with persisted positions; UC4-S5 - User sees dashboard as last left
The system SHALL read the stored layout from `localStorage` during application initialisation (before first render) and use it to reconstruct widget positions and types on the grid.

#### Scenario: Dashboard restored from localStorage
- **WHEN** the user loads or reloads the dashboard page and a valid layout is stored
- **THEN** each widget is rendered at its previously persisted (x, y, w, h) position

#### Scenario: Widget types correctly reconstructed
- **WHEN** the layout is restored from localStorage
- **THEN** each widget renders its correct component type as stored

---

### Requirement: Render default layout on first visit
**Implements**: UC4-E2a - No layout in localStorage; system renders default layout
The system SHALL render a pre-defined default layout when no stored layout is found in `localStorage` (e.g., first visit or storage cleared).

#### Scenario: Default layout on empty localStorage
- **WHEN** the dashboard loads and no `rdd_layout` key exists in localStorage
- **THEN** the dashboard renders the default layout containing the pre-configured starter widgets

---

### Requirement: Recover gracefully from corrupt or incompatible stored layout
**Implements**: UC4-E2b - Layout data corrupt/incompatible; system falls back to default, notifies user
The system SHALL detect corrupt or schema-incompatible layout data (via try/catch and `layoutVersion` mismatch), discard the corrupt entry, fall back to the default layout, and display a brief notification to the user.

#### Scenario: Corrupt JSON triggers fallback
- **WHEN** the stored `rdd_layout` value cannot be parsed as valid JSON
- **THEN** the system logs a warning, clears the stored value, and renders the default layout

#### Scenario: Version mismatch triggers fallback
- **WHEN** the stored layout's `layoutVersion` does not match the current application version
- **THEN** the system discards the stored layout, renders the default layout, and notifies the user that the layout was reset

#### Scenario: User notified of layout reset
- **WHEN** the system falls back to the default layout due to corrupt or incompatible data
- **THEN** a brief notification is displayed informing the user that the layout was reset to default
