# Spec: widget-image

Generated: 2026-03-10

## Overview

This spec defines requirements for the `widget-image` capability — a widget content type that displays a user-selected image from the local filesystem, with the ability to replace the image at any time.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC3-S1 | User activates the file-selection control inside the widget. |
| UC3-S2 | System opens the operating system's file picker, filtered to image file types. |
| UC3-S3 | User selects an image file and confirms. |
| UC3-S4 | System reads the selected image and renders it inside the widget, scaled to fit. |
| UC3-S5 | System retains the image source so the widget re-displays the same image on subsequent renders. |
| UC3-E3a | User cancels the file picker without selecting a file. |
| UC3-E4a | Selected file is not a valid image. |
| UC3-E5a | User wants to replace the current image. |

---

## ADDED Requirements

### Requirement: Image File Selection Control

**Implements**: UC3-S1 - User activates the file-selection control inside the widget.
**Implements**: UC3-S2 - System opens the operating system's file picker, filtered to image file types.
**Implements**: UC3-E3a - User cancels the file picker without selecting a file.

The image content component SHALL render a visible file-selection control (e.g., a "Choose image" button). Activating it SHALL open the operating system's native file picker, filtered to image file types (`accept="image/*"`). If the user closes the picker without selecting a file, the widget's current state SHALL remain unchanged.

#### Scenario: File picker opens on control activation

- **WHEN** the user activates the file-selection control in an image widget
- **THEN** the OS file picker opens, filtered to image file types

#### Scenario: Cancelling the picker leaves the widget unchanged

- **WHEN** the user opens the file picker and then cancels without selecting a file
- **THEN** the image widget displays the same content as before the picker was opened

---

### Requirement: Read and Display Selected Image

**Implements**: UC3-S3 - User selects an image file and confirms.
**Implements**: UC3-S4 - System reads the selected image and renders it inside the widget, scaled to fit.

After the user selects an image file, the system SHALL read it using the browser's `FileReader` API (`readAsDataURL`) and render the resulting data URL in an `<img>` element inside the widget. The image SHALL be scaled to fit within the widget's bounds (`object-fit: contain` or equivalent).

#### Scenario: Selected image is displayed

- **WHEN** the user selects a valid image file from the file picker
- **THEN** the widget renders the image, scaled to fit within the widget bounds

#### Scenario: Image fills the widget area appropriately

- **WHEN** an image is rendered in the widget
- **THEN** it is contained within the widget without overflow or distortion

---

### Requirement: Persist Image Source

**Implements**: UC3-S5 - System retains the image source so the widget re-displays the same image on subsequent renders.

The base64 data URL of the selected image SHALL be stored in `WidgetLayout.imageDataUrl` via `onConfigChange`. On subsequent renders, if `imageDataUrl` is set, the widget SHALL display that image without requiring the user to re-select it.

#### Scenario: Image persists across re-renders

- **WHEN** an image has been selected and the dashboard re-renders
- **THEN** the image widget continues to display the previously selected image

---

### Requirement: Handle Invalid Image File

**Implements**: UC3-E4a - Selected file is not a valid image.

If the selected file cannot be rendered as an image (e.g., a non-image file selected despite the accept filter), the system SHALL display a recoverable error message inside the widget and present the file-selection control again so the user can choose a different file.

#### Scenario: Invalid file shows error

- **WHEN** the user selects a file that cannot be rendered as an image
- **THEN** the widget displays an error message ("Cannot display file — not a valid image") and the file-selection control remains accessible

---

### Requirement: Replace Current Image

**Implements**: UC3-E5a - User wants to replace the current image.

The file-selection control SHALL remain accessible after an image is selected, allowing the user to replace the displayed image at any time by selecting a new file.

#### Scenario: Image can be replaced

- **WHEN** an image is currently displayed and the user activates the file-selection control
- **THEN** the file picker opens and the user can select a new image to replace the current one
