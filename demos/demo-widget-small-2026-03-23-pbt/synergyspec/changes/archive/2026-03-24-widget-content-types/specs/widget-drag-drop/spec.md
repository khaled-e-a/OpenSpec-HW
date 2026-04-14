# Spec: widget-drag-drop (delta)

Generated: 2026-03-23

## Overview
This is a **delta spec** for the existing `widget-drag-drop` capability. It captures requirement-level changes driven by the `widget-content-types` change: the `WIDGET_REGISTRY` contract is updated to replace the three stub widget types with four new real content types, and `DEFAULT_LAYOUT` is updated to reflect the new defaults.

## Use Case Traceability
This delta implements changes to the following use case steps (from the modified `widget-drag-drop` capability perspective):
- UC6-S3: System validates the settings map against currently registered widget IDs — the set of valid type keys changes
- UC6-E3a1: System silently discards settings entries for widget IDs no longer in the layout — stale stub-type widgets are pruned

---

## MODIFIED Requirements

### Requirement: Widget registry defines available types
**Implements**: UC6-S3 - System validates the settings map against currently registered widget IDs
The `WIDGET_REGISTRY` map SHALL contain exactly the following four entries (replacing the previous three stub entries):

| Key | Display name | Default width (cols) | Default height (rows) |
|-----|-------------|---------------------|-----------------------|
| `clock` | Clock | 2 | 1 |
| `image-viewer` | Image Viewer | 3 | 2 |
| `file-viewer` | File Viewer | 3 | 2 |
| `webpage-viewer` | Webpage Viewer | 4 | 3 |

The registry SHALL NOT contain `text-card`, `metric-card`, or `chart-placeholder`.

#### Scenario: Registry contains four new types
- **WHEN** the widget picker reads WIDGET_REGISTRY
- **THEN** it finds exactly the four entries: clock, image-viewer, file-viewer, webpage-viewer

#### Scenario: Legacy stub types absent from registry
- **WHEN** the widget picker reads WIDGET_REGISTRY
- **THEN** text-card, metric-card, and chart-placeholder are not present

---

### Requirement: Default layout uses the four new widget types
**Implements**: UC1-S1 - User adds a clock widget or the dashboard loads with a saved clock widget (first-run scenario)
The `DEFAULT_LAYOUT` constant SHALL contain one instance of each of the four new widget types at non-overlapping grid positions. The `DEFAULT_TYPE_MAP` constant SHALL map each default widget ID to its corresponding new type key.

#### Scenario: Default layout places one of each new type
- **WHEN** the dashboard first loads with no saved layout
- **THEN** the grid contains four widgets: clock (2×1), image-viewer (3×2), file-viewer (3×2), webpage-viewer (4×3)

#### Scenario: No stub types in default layout
- **WHEN** the dashboard first loads with no saved layout
- **THEN** no widget of type text-card, metric-card, or chart-placeholder is rendered

---

## ADDED Requirements

### Requirement: Stale stub-type widgets pruned on load
**Implements**: UC6-E3a1 - System silently discards settings entries for widget IDs no longer in the layout
The existing stale-ID pruning behaviour (UC3-E3a in the original widget-drag-drop spec) SHALL apply to widgets whose stored type is `text-card`, `metric-card`, or `chart-placeholder`, since these types are no longer present in `WIDGET_REGISTRY`. Such widgets SHALL be silently removed from the restored layout without error.

#### Scenario: Stored stub-type widget discarded on load
- **WHEN** the dashboard loads and localStorage contains a widget with type `text-card`, `metric-card`, or `chart-placeholder`
- **THEN** that widget is not rendered on the grid (it is treated as stale and discarded)

#### Scenario: Non-stub widgets unaffected
- **WHEN** the dashboard loads and localStorage contains widgets of types `clock`, `image-viewer`, `file-viewer`, or `webpage-viewer`
- **THEN** those widgets are restored to their saved grid positions normally
