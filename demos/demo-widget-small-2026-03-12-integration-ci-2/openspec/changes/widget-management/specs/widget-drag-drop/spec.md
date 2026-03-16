# Spec: widget-drag-drop (delta)

Generated: 2026-03-13

## Overview
This is a delta spec for the existing `widget-drag-drop` capability. It adds a requirement to explicitly permit shrinking a widget below its original size during a resize interaction, clarifying that the only lower bound is the 1×1 minimum (already specified). No existing requirements are removed or renamed.

See `usecases.md` "Use Case Traceability Mapping" for the complete list of use case steps.

## Use Case Traceability
This delta spec addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC2-E4b1 | System enforces minimum size constraint (1×1 grid units) |
| UC2-E4b2 | Widget cannot be resized below minimum |

---

## ADDED Requirements

### Requirement: Allow Shrink Resize Below Original Size
**Implements**: UC2-E4b1 - System enforces minimum size constraint (1×1 grid units); UC2-E4b2 - Widget cannot be resized below minimum
The system SHALL permit a user to resize a widget to any size smaller than its current size, down to the minimum of 1 column × 1 row. There is no lower bound other than the 1×1 minimum — the widget's original (pre-session) size does not constrain how small it can be resized.

#### Scenario: Widget shrunk below original size
- **WHEN** the user drags the resize handle to reduce the widget's size below its starting size for the session
- **THEN** the resize is permitted as long as the resulting size is at least 1 column × 1 row

#### Scenario: Shrink stopped at 1×1 minimum
- **WHEN** the user attempts to drag the resize handle to reduce the widget size below 1 column or 1 row
- **THEN** the size is clamped to 1 column × 1 row and the resize is not permitted to go further
