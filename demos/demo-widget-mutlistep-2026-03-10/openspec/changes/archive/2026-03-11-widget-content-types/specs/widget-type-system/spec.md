# Spec: widget-type-system

Generated: 2026-03-10

## Overview

This spec defines requirements for the `widget-type-system` capability — the `type` field on `WidgetLayout`, the per-widget settings panel that lets the user select or change a widget's content type, and the content dispatch router that renders the correct component for each type.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User activates the settings control on a widget. |
| UC1-S2 | System opens a settings panel for that widget, showing the currently active type and the four available types (clock, image, file, webpage). |
| UC1-S3 | User selects a content type. |
| UC1-S4 | System updates the widget to the selected type and closes the settings panel. |
| UC1-S5 | Widget renders the new content type immediately (clock starts ticking; image/file/webpage renders its configured source, or its empty state if no source is yet configured). |
| UC1-E3a | User selects the same type that is already active. |
| UC1-E3b | User dismisses the settings panel without selecting a type. |
| UC1-E5a | Selected type requires a source (image, file, or webpage) and none has been configured yet. |

---

## ADDED Requirements

### Requirement: Widget Type Field

**Implements**: UC1-S4 - System updates the widget to the selected type and closes the settings panel.
**Implements**: UC1-S5 - Widget renders the new content type immediately (clock starts ticking; image/file/webpage renders its configured source, or its empty state if no source is yet configured).

Every `WidgetLayout` entry SHALL carry a mandatory `type` field of type `WidgetType = 'clock' | 'image' | 'file' | 'webpage'`. A `WidgetLayout` without a `type` is invalid; TypeScript SHALL enforce this at compile time.

#### Scenario: All layout entries carry a type

- **WHEN** a `WidgetLayout` array is passed to `DashboardGrid`
- **THEN** every entry in the array has a `type` value that is one of `'clock'`, `'image'`, `'file'`, or `'webpage'`

#### Scenario: Type change is reflected in layout state

- **WHEN** the user changes a widget's content type
- **THEN** the widget's `type` field in the layout array is updated to the new type and `onLayoutChange` is called with the updated array

---

### Requirement: Settings Toggle Control

**Implements**: UC1-S1 - User activates the settings control on a widget.
**Implements**: UC1-E3b - User dismisses the settings panel without selecting a type.

Each widget SHALL render a visible settings toggle control (e.g., a gear button). Activating the control SHALL open the settings panel. Activating it again, or activating a dedicated close/dismiss control within the panel, SHALL close the panel without changing the widget's type. The settings toggle SHALL call `event.stopPropagation()` on `pointerDown` to prevent drag activation.

#### Scenario: Settings control opens the panel

- **WHEN** the user activates the settings toggle on a widget
- **THEN** the settings panel opens for that widget

#### Scenario: Dismissing the panel leaves type unchanged

- **WHEN** the user closes the settings panel without selecting a type
- **THEN** the widget's type and configuration remain unchanged

#### Scenario: Settings toggle does not initiate drag

- **WHEN** the user presses the settings toggle
- **THEN** no drag operation is initiated for that widget

---

### Requirement: Settings Panel — Type Selection

**Implements**: UC1-S2 - System opens a settings panel for that widget, showing the currently active type and the four available types (clock, image, file, webpage).
**Implements**: UC1-S3 - User selects a content type.
**Implements**: UC1-E3a - User selects the same type that is already active.

The settings panel SHALL display all four content types as selectable options, clearly indicating which type is currently active. Selecting a different type SHALL update the widget and close the panel (see Content Dispatch Routing requirement). Selecting the already-active type SHALL close the panel without making any change.

#### Scenario: Panel shows all four types

- **WHEN** the settings panel is open
- **THEN** all four types (`clock`, `image`, `file`, `webpage`) are visible and selectable

#### Scenario: Current type is indicated

- **WHEN** the settings panel is open
- **THEN** the widget's current type is visually distinguished from the others (e.g., highlighted or marked as active)

#### Scenario: Selecting the active type closes without changing

- **WHEN** the user selects the type that is already active
- **THEN** the panel closes and the widget's type remains unchanged

---

### Requirement: Content Dispatch Routing

**Implements**: UC1-S5 - Widget renders the new content type immediately (clock starts ticking; image/file/webpage renders its configured source, or its empty state if no source is yet configured).
**Implements**: UC1-E5a - Selected type requires a source (image, file, or webpage) and none has been configured yet.

A `WidgetContent` dispatcher component SHALL render the appropriate content component based on `type`. For `clock`: renders the clock component. For `image`, `file`, `webpage`: renders the type-specific component, which displays a placeholder ("No image selected", "No file selected", "No URL set") when no source has been configured.

#### Scenario: Clock type renders immediately

- **WHEN** a widget has `type: 'clock'`
- **THEN** the clock content component is rendered inside the widget

#### Scenario: Image type renders placeholder when no image is configured

- **WHEN** a widget has `type: 'image'` and no `imageDataUrl` is set
- **THEN** the widget renders a "No image selected" placeholder with a file-selection control

#### Scenario: File type renders placeholder when no file is configured

- **WHEN** a widget has `type: 'file'` and no `fileText` is set
- **THEN** the widget renders a "No file selected" placeholder with a file-selection control

#### Scenario: Webpage type renders placeholder when no URL is configured

- **WHEN** a widget has `type: 'webpage'` and no `webpageUrl` is set
- **THEN** the widget renders a "No URL set" placeholder with a URL input control

---

### Requirement: Configuration Change Callback

**Implements**: UC1-S4 - System updates the widget to the selected type and closes the settings panel.

`DraggableWidget` SHALL accept an `onConfigChange: (updates: Partial<WidgetLayout>) => void` prop. Content components and the settings panel SHALL call this callback to persist type changes and type-specific configuration (image data URL, file text, URL). The parent (`App.tsx`) SHALL merge the partial update into the layout array and call `setLayout`.

#### Scenario: Type change propagates to parent

- **WHEN** the user selects a new type in the settings panel
- **THEN** `onConfigChange` is called with `{ type: <newType> }` and the parent updates the layout

#### Scenario: Config change persists within the session

- **WHEN** `onConfigChange` is called with a partial update
- **THEN** the updated fields are reflected in the layout array on the next render
