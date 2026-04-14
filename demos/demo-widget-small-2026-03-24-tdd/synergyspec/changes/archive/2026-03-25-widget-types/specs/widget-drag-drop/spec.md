# Spec: widget-drag-drop (delta)

Generated: 2026-03-25

## Overview

Delta spec for the `widget-drag-drop` capability. The `widget-types` change extends the `WidgetLayout` data model with `type` and `config` fields. All existing drag-and-drop requirements remain unchanged; only the data model requirement is modified.

## Use Case Traceability

This delta implements the following use case steps:

- UC5-S5: System updates the widget content config (requires WidgetLayout to carry config)

---

## MODIFIED Requirements

### Requirement: Widget layout data model

**Implements**: UC5-S5 — System updates the widget content config

The `WidgetLayout` interface SHALL include the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique widget identifier |
| `x` | `number` | ✅ | Column index (0-based) |
| `y` | `number` | ✅ | Row index (0-based) |
| `w` | `number` | ✅ | Width in grid cells (≥ 1) |
| `h` | `number` | ✅ | Height in grid cells (≥ 1) |
| `type` | `WidgetType` | ❌ (optional) | Content type: `'clock' \| 'image' \| 'file' \| 'webpage'`. Defaults to `'clock'` when absent. |
| `config` | `WidgetConfig` | ❌ (optional) | Content configuration payload (image URL, file text/name, webpage URL). |

The `gridGeometry.ts` pure functions (`snapToCell`, `buildOccupancySet`, `isValidPlacement`, `resolveLayout`) SHALL operate exclusively on the positional fields (`id`, `x`, `y`, `w`, `h`) and SHALL ignore `type` and `config`.

#### Scenario: Layout with no type field is valid
- **WHEN** a `WidgetLayout` entry is provided without a `type` field
- **THEN** the system accepts it and defaults the widget type to `'clock'`

#### Scenario: Layout with type field is valid
- **WHEN** a `WidgetLayout` entry is provided with `type: 'image'`
- **THEN** the system accepts it and renders an image widget

#### Scenario: Geometry functions ignore type and config
- **WHEN** `isValidPlacement` or `resolveLayout` is called with a layout containing `type` and `config` fields
- **THEN** the result is identical to calling with a layout that omits those fields
