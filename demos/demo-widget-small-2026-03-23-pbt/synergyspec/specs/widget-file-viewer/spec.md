# Spec: widget-file-viewer

Generated: 2026-03-23

## Overview
This spec defines requirements for the file viewer widget — a widget that reads and displays the plain-text contents of a local file selected by the user via the browser's native file picker. Binary files and files exceeding 1 MB are handled with appropriate error/warning states. The file name (but not contents) is persisted in localStorage as a re-select hint after page reload.

## Use Case Traceability
This spec implements the following use case steps from usecases.md:
- UC3-S1: User adds a file viewer widget
- UC3-S2: System renders the widget with an empty-state prompt: "Select a file to display"
- UC3-S3: User activates the file picker inside the widget
- UC3-S4: System opens the browser's native file picker
- UC3-S5: User selects a plain-text file
- UC3-S6: System reads the file contents via the File API
- UC3-S7: System displays the file contents as scrollable plain text inside the widget
- UC3-S8: System stores the file name in widget settings
- UC3-S9: User reads the file contents
- UC3-E5a1: Widget remains in empty-state prompt when user cancels the file picker
- UC3-E6a1: System displays an inline error: "File is not readable as text"
- UC3-E6b1: System displays an inline warning: "File is large — only the first 1 MB is shown"
- UC3-E9b1: System restores the widget at its saved position
- UC3-E9b2: Widget shows empty-state prompt with the saved file name as a hint: "Re-select '<filename>' to restore"
- UC3-E9b3: User must re-select the file (browser security prevents storing file paths)
- UC5-S1: User activates the source-change control on a configured widget
- UC5-S2: System opens the appropriate picker or input for the widget type
- UC5-S3: User selects or enters the new source
- UC5-S4: System replaces the displayed content with the new source
- UC5-S5: System updates widget settings in localStorage with the new source reference
- UC5-S6: User sees the widget displaying the new content
- UC5-E3a1: Widget retains its current content and source when user cancels
- UC6-S7: System shows file viewer widgets in empty-state with saved file name hint

---

## Requirements

### Requirement: Render empty-state prompt on first add
**Implements**: UC3-S1 - User adds a file viewer widget; UC3-S2 - System renders the widget with an empty-state prompt: "Select a file to display"
The system SHALL render the file viewer widget with an empty-state prompt ("Select a file to display") and a visible file-picker activation control when no file has yet been selected.

#### Scenario: Empty state on new widget
- **WHEN** a file viewer widget is added with no previously saved file name
- **THEN** the widget displays the empty-state prompt and a "Select file" button

---

### Requirement: Open native file picker
**Implements**: UC3-S3 - User activates the file picker inside the widget; UC3-S4 - System opens the browser's native file picker
The system SHALL open a native `<input type="file">` (no `accept` restriction — any file type) when the user activates the file-picker control. The input SHALL be triggered programmatically so it can be visually integrated into the widget UI.

#### Scenario: File picker opens on activation
- **WHEN** the user clicks the "Select file" control
- **THEN** the browser's native file picker dialog opens

---

### Requirement: Read file contents via File API
**Implements**: UC3-S5 - User selects a plain-text file; UC3-S6 - System reads the file contents via the File API
The system SHALL use `FileReader.readAsText()` to read the selected file as a UTF-8 string entirely client-side, without uploading the file to any server.

#### Scenario: Text file read asynchronously
- **WHEN** the user selects a file
- **THEN** the system reads it using FileReader and awaits the `load` event before displaying content

---

### Requirement: Display file contents as scrollable plain text
**Implements**: UC3-S7 - System displays the file contents as scrollable plain text inside the widget; UC3-S9 - User reads the file contents
The system SHALL display the file contents inside the widget as a scrollable, monospace, white-space-preserving text area (not editable). The text SHALL preserve all newlines, indentation, and whitespace from the original file.

#### Scenario: File contents displayed verbatim
- **WHEN** a plain-text file is successfully read
- **THEN** the widget shows the file's full text content with original formatting preserved

#### Scenario: Content area is scrollable
- **WHEN** the file content exceeds the widget's visible height
- **THEN** the content area scrolls vertically without overflowing the widget boundary

---

### Requirement: Handle cancelled file picker
**Implements**: UC3-E5a1 - Widget remains in empty-state prompt when user cancels the file picker
The system SHALL NOT change widget state when the user dismisses the file picker without selecting a file. If a file was previously displayed, it SHALL continue to be shown.

#### Scenario: Cancel on empty widget preserves empty state
- **WHEN** the user opens the file picker and cancels without selecting a file
- **THEN** the widget stays in the empty-state prompt

#### Scenario: Cancel on configured widget preserves current content
- **WHEN** a file is already displayed and the user opens the picker and cancels
- **THEN** the previously displayed file content remains unchanged

---

### Requirement: Reject non-text files
**Implements**: UC3-E6a1 - System displays an inline error: "File is not readable as text"
The system SHALL detect when a file cannot be decoded as UTF-8 text (via `FileReader` `error` event or presence of null bytes in the result) and SHALL display the inline error "File is not readable as text". The widget SHALL return to the empty-state prompt after this error.

#### Scenario: Binary file rejected
- **WHEN** the user selects a binary file (e.g., a PNG or PDF)
- **THEN** the widget displays "File is not readable as text" and shows the empty-state prompt

---

### Requirement: Warn and truncate files exceeding 1 MB
**Implements**: UC3-E6b1 - System displays an inline warning: "File is large — only the first 1 MB is shown"
The system SHALL check `file.size` before reading. If the file exceeds 1,048,576 bytes (1 MiB), the system SHALL read only the first 1,048,576 bytes via `file.slice(0, 1_048_576)` and SHALL display an inline warning banner: "File is large — only the first 1 MB is shown". The truncated content SHALL be displayed below the warning.

#### Scenario: Large file truncated with warning
- **WHEN** the user selects a file whose size exceeds 1 MB
- **THEN** the widget shows the warning banner and displays only the first 1 MB of text

#### Scenario: Small file shows no warning
- **WHEN** the user selects a file whose size is ≤ 1 MB
- **THEN** no warning banner is shown and the full file content is displayed

---

### Requirement: Store file name in widget settings
**Implements**: UC3-S8 - System stores the file name in widget settings
The system SHALL write the file name (`file.name`) to `dashboard-widget-settings` in localStorage under the widget's ID after successfully reading the file. The file path and contents SHALL NOT be stored.

#### Scenario: File name persisted
- **WHEN** a file is successfully read and displayed, and 300ms elapses (debounce)
- **THEN** `dashboard-widget-settings[widgetId].fileName` equals the file's name in localStorage

#### Scenario: File contents not persisted
- **WHEN** a file is selected and read
- **THEN** the file contents are NOT written to localStorage

---

### Requirement: Show file name hint on reload
**Implements**: UC3-E9b1 - System restores the widget at its saved position; UC3-E9b2 - Widget shows empty-state prompt with the saved file name as a hint: "Re-select '<filename>' to restore"; UC3-E9b3 - User must re-select the file (browser security prevents storing file paths); UC6-S7 - System shows file viewer widgets in empty-state with saved file name hint
The system SHALL show the empty-state prompt on reload when a file viewer widget has a saved `fileName` in settings, augmented with the hint "Re-select '<filename>' to restore". The system SHALL NOT attempt to re-read the file automatically (browser security prevents this).

#### Scenario: Hint shown on reload with saved file name
- **WHEN** the dashboard reloads and a file viewer widget has `fileName` in settings
- **THEN** the widget shows the empty-state prompt plus the text "Re-select '<filename>' to restore"

#### Scenario: No hint when no file ever selected
- **WHEN** the dashboard reloads and a file viewer widget has no saved file name
- **THEN** the widget shows only the plain empty-state prompt with no file name hint

---

### Requirement: Allow re-selection of a different file
**Implements**: UC5-S1 - User activates the source-change control on a configured widget; UC5-S2 - System opens the appropriate picker or input for the widget type; UC5-S3 - User selects or enters the new source; UC5-S4 - System replaces the displayed content with the new source; UC5-S5 - System updates widget settings in localStorage with the new source reference; UC5-S6 - User sees the widget displaying the new content; UC5-E3a1 - Widget retains its current content and source when user cancels
The system SHALL provide a visible "Select a different file" control on a file viewer widget that is already displaying content. Activating it SHALL open the file picker again. If cancelled, the current content SHALL be preserved.

#### Scenario: Re-select control visible on configured widget
- **WHEN** a file viewer widget is displaying file contents
- **THEN** a re-selection control is visible within the widget

#### Scenario: New file replaces old content
- **WHEN** the user selects a new file via the re-selection control
- **THEN** the widget displays the new file's contents and updates the stored file name
