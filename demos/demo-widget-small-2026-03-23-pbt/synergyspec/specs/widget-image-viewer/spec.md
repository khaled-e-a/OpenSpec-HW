# Spec: widget-image-viewer

Generated: 2026-03-23

## Overview
This spec defines requirements for the image viewer widget — a widget that displays a user-chosen image sourced either from a local file (via the browser file picker) or from a URL. The user can change the source at any time. The source reference is persisted in localStorage and restored on reload.

## Use Case Traceability
This spec implements the following use case steps from usecases.md:
- UC2-S1: User adds an image viewer widget
- UC2-S2: System renders the widget with an empty-state prompt: "Choose an image"
- UC2-S3: User activates the image source picker inside the widget
- UC2-S4: System presents two options: "Select file" and "Enter URL"
- UC2-S5: User selects a local image file via the browser file picker
- UC2-S6: System reads the file client-side, creates an object URL, and displays the image
- UC2-S7: System stores the image source reference in widget settings keyed by widget ID
- UC2-S8: User sees the image displayed at full-fit within the widget bounds
- UC2-E4a1: System shows a text input pre-populated with any previously saved URL
- UC2-E4a2: User types or pastes an image URL and confirms
- UC2-E4a3: System sets the image src to the entered URL
- UC2-E6a1: System displays an inline error: "Not a supported image format"
- UC2-E8a1: System displays an inline error: "Image could not be loaded"
- UC2-E8b1: User activates the image source picker to change the displayed image
- UC5-S1: User activates the source-change control on a configured widget
- UC5-S2: System opens the appropriate picker or input for the widget type
- UC5-S3: User selects or enters the new source
- UC5-S4: System replaces the displayed content with the new source
- UC5-S5: System updates widget settings in localStorage with the new source reference
- UC5-S6: User sees the widget displaying the new content
- UC5-E3a1: Widget retains its current content and source when user cancels
- UC6-S5: System loads image viewer widgets from saved URL source

---

## Requirements

### Requirement: Render empty-state prompt on first add
**Implements**: UC2-S1 - User adds an image viewer widget; UC2-S2 - System renders the widget with an empty-state prompt: "Choose an image"
The system SHALL render the image viewer widget with a visible empty-state prompt ("Choose an image" or equivalent) when no image source has yet been configured.

#### Scenario: Empty state on new widget
- **WHEN** an image viewer widget is added with no previously saved source
- **THEN** the widget displays an empty-state prompt and a control to open the image source picker

---

### Requirement: Present dual-mode source picker
**Implements**: UC2-S3 - User activates the image source picker inside the widget; UC2-S4 - System presents two options: "Select file" and "Enter URL"
The system SHALL present two distinct source options when the user opens the image source picker: "Select file" (opens the native file picker) and "Enter URL" (shows a text input for a URL).

#### Scenario: Picker shows both options
- **WHEN** the user activates the image source picker
- **THEN** both "Select file" and "Enter URL" options are visible and interactive

---

### Requirement: Load image from local file
**Implements**: UC2-S5 - User selects a local image file via the browser file picker; UC2-S6 - System reads the file client-side, creates an object URL, and displays the image; UC2-S8 - User sees the image displayed at full-fit within the widget bounds
The system SHALL open a native `<input type="file" accept="image/*">` when the user chooses "Select file". Upon file selection the system SHALL create a blob URL via `URL.createObjectURL(file)` and render the image inside the widget using `object-fit: contain` (or equivalent full-fit styling).

#### Scenario: File selected and displayed
- **WHEN** the user selects a valid image file via the file picker
- **THEN** the image is displayed full-fit inside the widget bounds

#### Scenario: Blob URL used for local file
- **WHEN** a local file is selected
- **THEN** the image `src` is a `blob:` URL created from the selected file

---

### Requirement: Load image from URL
**Implements**: UC2-E4a1 - System shows a text input pre-populated with any previously saved URL; UC2-E4a2 - User types or pastes an image URL and confirms; UC2-E4a3 - System sets the image src to the entered URL
The system SHALL display a text input pre-populated with the previously saved URL (if any) when the user chooses "Enter URL". Upon confirmation the system SHALL set the `<img>` `src` attribute to the entered URL without any additional transformation.

#### Scenario: URL input pre-populated
- **WHEN** the user opens the URL option and a URL was previously saved
- **THEN** the text input contains the previously saved URL

#### Scenario: URL confirmed and image shown
- **WHEN** the user enters a URL and confirms
- **THEN** the widget renders the image from that URL

---

### Requirement: Validate image file type
**Implements**: UC2-E6a1 - System displays an inline error: "Not a supported image format"
The system SHALL validate that the selected file is a recognised image type (by checking `file.type.startsWith('image/')`). If the file is not a supported image type the system SHALL display an inline error message and return the widget to the empty-state prompt.

#### Scenario: Non-image file rejected
- **WHEN** the user selects a file whose MIME type does not start with `image/`
- **THEN** the widget shows an inline error "Not a supported image format" and no image is rendered

---

### Requirement: Handle image load failure
**Implements**: UC2-E8a1 - System displays an inline error: "Image could not be loaded"
The system SHALL attach an `onError` handler to the `<img>` element. If the image fails to load (e.g., 404, CORS, invalid URL), the system SHALL display an inline error message ("Image could not be loaded") and show the source-change control so the user can try a different source.

#### Scenario: URL image fails to load
- **WHEN** the image `src` is set to a URL that cannot be loaded
- **THEN** the widget shows "Image could not be loaded" and the source-change control is visible

---

### Requirement: Allow source change on configured widget
**Implements**: UC2-E8b1 - User activates the image source picker to change the displayed image; UC5-S1 - User activates the source-change control on a configured widget; UC5-S2 - System opens the appropriate picker or input for the widget type; UC5-S3 - User selects or enters the new source; UC5-S4 - System replaces the displayed content with the new source; UC5-S5 - System updates widget settings in localStorage with the new source reference; UC5-S6 - User sees the widget displaying the new content; UC5-E3a1 - Widget retains its current content and source when user cancels
The system SHALL provide a visible control on a configured image viewer widget that re-opens the source picker. If the user cancels the picker without selecting a new source the currently displayed image and saved source SHALL remain unchanged.

#### Scenario: Source-change control visible on configured widget
- **WHEN** the image viewer widget is displaying an image
- **THEN** a change-source control (e.g., a "Change image" button or overlay icon) is visible

#### Scenario: Cancel preserves current source
- **WHEN** the user opens the source picker and cancels without selecting anything
- **THEN** the widget continues to display the current image unchanged

---

### Requirement: Persist image source reference
**Implements**: UC2-S7 - System stores the image source reference in widget settings keyed by widget ID; UC6-S5 - System loads image viewer widgets from saved URL source
The system SHALL write the image source to `dashboard-widget-settings` in localStorage under the widget's ID when a source is confirmed. For URL-mode images, the URL string SHALL be persisted. For file-mode images, NO source SHALL be persisted (blob URLs are session-only). On reload, URL-mode widgets SHALL restore and display the image; file-mode widgets SHALL show the empty-state prompt.

#### Scenario: URL source persisted
- **WHEN** the user confirms a URL as the image source and 300ms elapses (debounce)
- **THEN** `dashboard-widget-settings[widgetId].url` equals the confirmed URL in localStorage

#### Scenario: File-mode source not persisted
- **WHEN** the user selects a local file as the image source
- **THEN** no URL is written to `dashboard-widget-settings` for this widget (source type is `'file'`)

#### Scenario: URL-mode restored on reload
- **WHEN** the dashboard reloads and a widget has a saved URL source
- **THEN** the widget immediately displays the image from the saved URL without user interaction
