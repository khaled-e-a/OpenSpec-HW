# Spec: widget-resize

Generated: 2026-03-10

## Overview

This spec defines requirements for the `widget-resize` capability — dragging a resize handle to change a widget's column and row span, with live ghost preview and collision/bounds validation.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC2-S1 | User presses down on the resize handle of a widget |
| UC2-S2 | System enters resize mode — ghost overlay shows current size at current position |
| UC2-S3 | User drags the handle to change the widget's span |
| UC2-S4 | System continuously updates ghost to reflect candidate new size, snapped to whole cells |
| UC2-S5 | System validates candidate size: bounds check and collision check |
| UC2-S6 | Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator |
| UC2-S7 | User releases handle |
| UC2-S8 | System performs final validation of candidate size |
| UC2-S9 | System commits new size — updates `w` and `h` in layout, re-renders widget |
| UC2-S10 | Ghost is removed; widget renders at new size |
| UC2-E3a | Candidate span would be zero — system clamps to 1×1 minimum |
| UC2-E5a | Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize" |
| UC2-E7a | User releases at invalid size — resize cancelled, original size retained |
| UC2-E7b | User presses Escape during resize — resize cancelled immediately, ghost removed |

---

## Requirements

### Requirement: Resize Handle Presence

**Implements**: UC2-S1 - User presses down on the resize handle of a widget

Each widget SHALL render a resize handle — a small, visually distinct interactive target (e.g., at the bottom-right corner). The handle SHALL be reachable by pointer and activate resize mode on press.

#### Scenario: Resize handle visible on each widget

- **WHEN** the dashboard is rendered with at least one widget
- **THEN** each widget displays a resize handle within its bounds

#### Scenario: Pressing handle enters resize mode

- **WHEN** the user presses down on a widget's resize handle
- **THEN** the system enters resize mode for that widget and does not initiate a drag operation

---

### Requirement: Enter Resize Mode with Ghost

**Implements**: UC2-S2 - System enters resize mode — ghost overlay shows current size at current position

On resize handle press, the system SHALL display a ghost overlay at the widget's current `col`, `row`, `w`, and `h` to establish the visual baseline for the resize operation.

#### Scenario: Ghost shown at widget's current size on resize start

- **WHEN** resize mode is entered for a widget
- **THEN** a ghost overlay is rendered at the widget's current grid position and dimensions

---

### Requirement: Continuous Ghost Update During Resize Drag

**Implements**: UC2-S3 - User drags the handle to change the widget's span
**Implements**: UC2-S4 - System continuously updates ghost to reflect candidate new size, snapped to whole cells

As the user drags the resize handle, the system SHALL continuously compute a candidate `(w, h)` from the pointer delta, snapped to whole grid cell increments, and update the ghost overlay to reflect the candidate size.

#### Scenario: Ghost updates to snapped size as pointer moves

- **WHEN** the user moves the pointer while in resize mode
- **THEN** the ghost reflects the nearest whole-cell-snapped candidate `(w, h)` without delay

---

### Requirement: Minimum Size Clamping

**Implements**: UC2-E3a - Candidate span would be zero — system clamps to 1×1 minimum

The system SHALL clamp the candidate `w` and `h` to a minimum of 1 grid unit each. A resize gesture that would produce `w < 1` or `h < 1` SHALL be treated as `w = 1` or `h = 1` respectively.

#### Scenario: Dragging beyond minimum clamps to 1×1

- **WHEN** the user drags the resize handle to a position that would yield `w < 1` or `h < 1`
- **THEN** the ghost renders at `w = 1` / `h = 1` and the system does not allow smaller

---

### Requirement: Resize Validation — Collision and Bounds

**Implements**: UC2-S5 - System validates candidate size: bounds check and collision check
**Implements**: UC2-S6 - Ghost reflects validity — valid normal, invalid shows "cannot resize" indicator
**Implements**: UC2-E5a - Candidate size overlaps widget or exceeds bounds — ghost shows "cannot resize"

The system SHALL continuously validate the candidate `(col, row, w, h)` against grid bounds and collision with other widgets (excluding the widget being resized). The ghost SHALL visually distinguish a valid candidate from an invalid one.

#### Scenario: Valid candidate — ghost shows normal style

- **WHEN** the candidate size fits within bounds and does not overlap other widgets
- **THEN** the ghost renders in its normal valid style

#### Scenario: Invalid candidate — ghost shows "cannot resize" indicator

- **WHEN** the candidate size extends beyond the grid boundary or overlaps another widget
- **THEN** the ghost renders a visually distinct "cannot resize" indicator

---

### Requirement: Commit Resize on Valid Release

**Implements**: UC2-S7 - User releases handle
**Implements**: UC2-S8 - System performs final validation of candidate size
**Implements**: UC2-S9 - System commits new size — updates `w` and `h` in layout, re-renders widget
**Implements**: UC2-S10 - Ghost is removed; widget renders at new size

When the user releases the resize handle, the system SHALL perform a final validation of the candidate size. If valid, the system SHALL update the widget's `w` and `h` in the layout, call `onLayoutChange` with the updated array, and remove the ghost. The widget SHALL re-render at the new span.

#### Scenario: Valid release commits the resize

- **WHEN** the user releases the handle over a valid candidate size
- **THEN** the system calls `onLayoutChange` with the widget's updated `w` and `h`, and the ghost is removed

#### Scenario: Widget renders at new span after commit

- **WHEN** the layout is updated after a successful resize
- **THEN** the widget's `gridColumn` and `gridRow` spans reflect the new `w` and `h`

---

### Requirement: Cancel Resize on Invalid Release

**Implements**: UC2-E7a - User releases at invalid size — resize cancelled, original size retained

If the user releases the handle when the candidate size is invalid, the system SHALL cancel the resize. The widget's `w` and `h` SHALL remain at their original values and the layout SHALL be unchanged.

#### Scenario: Release at invalid size retains original dimensions

- **WHEN** the user releases the resize handle at an invalid candidate size
- **THEN** the widget retains its original `w` and `h`, and `onLayoutChange` is NOT called

---

### Requirement: Cancel Resize via Escape

**Implements**: UC2-E7b - User presses Escape during resize — resize cancelled immediately, ghost removed

The system SHALL cancel an in-progress resize when the user presses the Escape key. The widget SHALL retain its original dimensions, the layout SHALL remain unchanged, and the ghost SHALL be removed immediately.

#### Scenario: Escape cancels resize

- **WHEN** resize mode is active and the user presses Escape
- **THEN** the resize is cancelled immediately, the ghost is removed, and the widget's `w` and `h` are unchanged
