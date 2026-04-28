# Spec: drag-drop-interaction

Generated: 2026-04-28

## Overview
This spec defines requirements for the core drag-and-drop mechanics: drag handles, drop zones, drag previews, and collision/invalid-drop detection.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
- UC1-S1: User grabs a widget's drag handle
- UC1-S2: System lifts the widget visually and displays a drag preview
- UC1-E4a: Pointer outside valid drop zone; system shows no highlight
- UC1-E5a: User releases pointer outside valid zone; widget returns to original position
- UC1-E6a: Target occupied and grid full; widget returned, error indicator shown
- UC5-S1: User moves pointer while dragging a widget
- UC5-S2: System renders a ghost/placeholder at the hovered target cell
- UC5-S3: System updates placeholder position in real time as pointer moves
- UC5-S4: User sees intended drop position clearly distinguished
- UC5-S5: User releases pointer; preview is removed and drop completes
- UC5-E3a: Pointer moves to invalid position; placeholder shown in invalid state

## ADDED Requirements

### Requirement: Provide a dedicated drag handle on each widget
**Implements**: UC1-S1 - User grabs a widget's drag handle
Each widget card SHALL expose a visible drag handle region (grip icon) in its header. Drag operations SHALL only be initiatable from this handle region, not from the widget body.

#### Scenario: Drag initiated from handle
- **WHEN** the user presses down on the drag handle of a widget and moves the pointer
- **THEN** the system begins a drag operation for that widget

#### Scenario: Drag not initiated from widget body
- **WHEN** the user presses down on the widget body (outside the drag handle) and moves the pointer
- **THEN** no drag operation is initiated and the pointer event is passed through to the widget content

---

### Requirement: Display visual lift on drag start
**Implements**: UC1-S2 - System lifts the widget visually and displays a drag preview
The system SHALL visually distinguish a widget that is being dragged (e.g., reduced opacity, elevated shadow) to communicate to the user that it is "in flight".

#### Scenario: Widget appears lifted during drag
- **WHEN** the user initiates a drag on a widget
- **THEN** the original widget position shows a dimmed/ghost representation and the dragged item appears elevated

---

### Requirement: Render real-time drop zone placeholder
**Implements**: UC5-S1 - User moves pointer while dragging; UC5-S2 - System renders ghost/placeholder at hovered target cell; UC5-S3 - System updates placeholder in real time; UC5-S4 - User sees intended drop position clearly distinguished
The system SHALL render a styled placeholder at the target grid cell(s) that updates continuously as the pointer moves between cells during a drag operation.

#### Scenario: Placeholder shown at target cell
- **WHEN** a widget is being dragged and the pointer is over a valid grid region
- **THEN** a placeholder (dashed border, shaded background) is rendered at the target cell(s) showing where the widget will land

#### Scenario: Placeholder updates in real time
- **WHEN** the pointer moves from one grid cell to another during a drag
- **THEN** the placeholder moves to reflect the new target cell without perceptible lag

---

### Requirement: Show invalid state for invalid drop positions
**Implements**: UC1-E4a - Pointer outside valid drop zone; UC5-E3a - Pointer at invalid position; placeholder in invalid state
The system SHALL visually distinguish an invalid drop target from a valid one (e.g., red tint on the placeholder or no placeholder).

#### Scenario: No highlight outside grid bounds
- **WHEN** the pointer moves outside the grid canvas during a drag
- **THEN** no drop zone placeholder is shown

#### Scenario: Invalid placeholder on full grid
- **WHEN** the pointer is over a grid region that cannot accept the widget (grid is full, no reflow possible)
- **THEN** the placeholder is rendered in an invalid visual state (e.g., red tint)

---

### Requirement: Snap widget back on invalid drop
**Implements**: UC1-E5a - User releases pointer outside valid zone; widget returns to original position
The system SHALL animate the dragged widget back to its original grid position when the user releases the pointer outside a valid drop zone.

#### Scenario: Widget returns to origin on out-of-bounds release
- **WHEN** the user releases a dragged widget outside the grid canvas
- **THEN** the widget animates back to its position before the drag started

#### Scenario: Widget returns to origin on full-grid release
- **WHEN** the user releases a dragged widget in an invalid position because the grid is full
- **THEN** the widget animates back to its pre-drag position and a brief error indicator is shown

---

### Requirement: Show error indicator on failed drop
**Implements**: UC1-E6a - Target occupied and grid full; widget returned, error indicator shown
The system SHALL briefly display an error indicator (e.g., shake animation or toast) when a drop is rejected due to the grid being full.

#### Scenario: Error indicator on rejected drop
- **WHEN** a drop is rejected because no valid placement exists
- **THEN** the system shows a brief visual error indicator (shake or toast) to communicate that the drop failed

---

### Requirement: Remove drag preview on drop completion
**Implements**: UC5-S5 - User releases pointer; preview removed, drop completes
The system SHALL remove the drag placeholder and restore the normal grid state immediately upon a successful or cancelled drop.

#### Scenario: Placeholder removed after drop
- **WHEN** the user releases the pointer after a drag (valid or invalid)
- **THEN** the placeholder is no longer visible and the grid returns to its normal display state
