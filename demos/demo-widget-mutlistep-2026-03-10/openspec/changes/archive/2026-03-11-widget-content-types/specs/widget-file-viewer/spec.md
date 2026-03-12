# Spec: widget-file-viewer

Generated: 2026-03-10

## Overview

This spec defines requirements for the `widget-file-viewer` capability — a widget content type that reads and displays the plain-text contents of a user-selected local file, with the ability to change the file at any time.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC4-S1 | User activates the file-selection control inside the widget. |
| UC4-S2 | System opens the operating system's file picker. |
| UC4-S3 | User selects a file and confirms. |
| UC4-S4 | System reads the file's text content and renders it as scrollable text inside the widget. |
| UC4-S5 | System retains the file reference so the widget can re-display the file on subsequent renders. |
| UC4-E3a | User cancels the file picker. |
| UC4-E4a | File cannot be read (access error, binary content, or read failure). |
| UC4-E5a | User wants to change the displayed file. |

---

## ADDED Requirements

### Requirement: File Selection Control

**Implements**: UC4-S1 - User activates the file-selection control inside the widget.
**Implements**: UC4-S2 - System opens the operating system's file picker.
**Implements**: UC4-E3a - User cancels the file picker.

The file viewer content component SHALL render a visible file-selection control (e.g., a "Choose file" button). Activating it SHALL open the operating system's native file picker with no file-type filter (any file may be selected). If the user closes the picker without selecting a file, the widget's current state SHALL remain unchanged.

#### Scenario: File picker opens on control activation

- **WHEN** the user activates the file-selection control in a file viewer widget
- **THEN** the OS file picker opens

#### Scenario: Cancelling the picker leaves the widget unchanged

- **WHEN** the user opens the file picker and cancels without selecting a file
- **THEN** the file viewer displays the same content as before the picker was opened

---

### Requirement: Read and Display File Text Content

**Implements**: UC4-S3 - User selects a file and confirms.
**Implements**: UC4-S4 - System reads the file's text content and renders it as scrollable text inside the widget.

After the user selects a file, the system SHALL read it as text using the browser's `FileReader` API (`readAsText`). The resulting text SHALL be rendered inside the widget in a scrollable, monospace-friendly container. The filename SHALL also be displayed as a label.

#### Scenario: File text is displayed after selection

- **WHEN** the user selects a file from the file picker
- **THEN** the widget reads the file and displays its text content

#### Scenario: Long content is scrollable

- **WHEN** the file content exceeds the widget's visible area
- **THEN** the text container is scrollable so the user can read all content

---

### Requirement: Persist File Content

**Implements**: UC4-S5 - System retains the file reference so the widget can re-display the file on subsequent renders.

The text content and filename of the selected file SHALL be stored in `WidgetLayout.fileText` and `WidgetLayout.fileLabel` via `onConfigChange`. On subsequent renders, if `fileText` is set, the widget SHALL display that content without requiring the user to re-select the file.

#### Scenario: File content persists across re-renders

- **WHEN** a file has been selected and the dashboard re-renders
- **THEN** the file viewer continues to display the previously selected file's content and filename

---

### Requirement: Handle Unreadable File

**Implements**: UC4-E4a - File cannot be read (access error, binary content, or read failure).

If the selected file cannot be read as text (e.g., read permission denied or `FileReader` error), the system SHALL display a recoverable error message inside the widget and present the file-selection control again so the user can choose a different file.

#### Scenario: Unreadable file shows error

- **WHEN** the selected file triggers a `FileReader` error
- **THEN** the widget displays an error message ("Cannot display file — check permissions or file type") and the file-selection control remains accessible

---

### Requirement: Change Displayed File

**Implements**: UC4-E5a - User wants to change the displayed file.

The file-selection control SHALL remain accessible after a file is selected, allowing the user to replace the displayed content at any time by selecting a different file.

#### Scenario: File can be replaced

- **WHEN** file content is currently displayed and the user activates the file-selection control
- **THEN** the file picker opens and the user can select a new file to replace the current content
