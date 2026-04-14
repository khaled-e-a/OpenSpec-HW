# Spec: widget-drag-drop (delta)

Generated: 2026-03-10

## Overview

Delta spec for the existing `widget-drag-drop` capability. The `WidgetLayout` type gains a mandatory `type: WidgetType` field to support content-typed widgets. This is a BREAKING change — all existing consumers of `WidgetLayout` must supply `type`.

No existing drag-drop requirements change in behaviour; only the data model contract is extended.

## MODIFIED Requirements

### Requirement: WidgetLayout Data Model

**Implements**: (layout contract — supports all UC1–UC5 operations across widget-content-types)

The `WidgetLayout` type SHALL include the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique widget identifier |
| `col` | `number` | 0-based left column |
| `row` | `number` | 0-based top row |
| `w` | `number` | Width in grid columns (≥ 1) |
| `h` | `number` | Height in grid rows (≥ 1) |
| `type` | `WidgetType` | Content type: `'clock' \| 'image' \| 'file' \| 'webpage'` |
| `imageDataUrl?` | `string` | Base64 data URL for image type |
| `fileText?` | `string` | Plain text content for file type |
| `fileLabel?` | `string` | Display filename for file type |
| `webpageUrl?` | `string` | URL for webpage type |

**BREAKING**: All consumers of `WidgetLayout` MUST supply `type`. There is no default or optional fallback. TypeScript enforces this at compile time.

#### Scenario: All layout entries carry type

- **WHEN** a `WidgetLayout` array is passed to `DashboardGrid`
- **THEN** every entry has a `type` value of `'clock'`, `'image'`, `'file'`, or `'webpage'`

#### Scenario: Collision detection and bounds checks are unaffected by new fields

- **WHEN** the system evaluates whether a drop or resize candidate is valid
- **THEN** it uses only `col`, `row`, `w`, and `h` — the `type` and config fields are ignored
