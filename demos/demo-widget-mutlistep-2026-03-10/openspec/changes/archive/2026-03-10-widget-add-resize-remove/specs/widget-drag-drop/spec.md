# Spec: widget-drag-drop (delta)

Generated: 2026-03-10

## Overview

This is a delta spec for the existing `widget-drag-drop` capability. The `WidgetLayout` type already carries `w` and `h` fields, and the existing collision/bounds requirements already operate on those fields. No requirement text changes are needed. This delta formally records the BREAKING contract change to `WidgetLayout` consumers.

## MODIFIED Requirements

### Requirement: WidgetLayout Data Model

**Implements**: (layout contract, no new use case step — supports all UC1/UC2/UC3 operations)

The `WidgetLayout` type SHALL include the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id`  | `string` | Unique widget identifier |
| `col` | `number` | 0-based left column |
| `row` | `number` | 0-based top row |
| `w`   | `number` | Width in grid columns (≥ 1) |
| `h`   | `number` | Height in grid rows (≥ 1) |

**BREAKING**: All consumers of `WidgetLayout` MUST supply `w` and `h`. There is no default or optional fallback.

#### Scenario: All layout entries carry w and h

- **WHEN** a `WidgetLayout` array is passed to `DashboardGrid`
- **THEN** every entry in the array has `w >= 1` and `h >= 1`

#### Scenario: Collision detection uses w and h

- **WHEN** the system evaluates whether a drop or resize candidate is valid
- **THEN** it uses the candidate's `w` and `h` to compute the full occupied bounding box before checking overlap
