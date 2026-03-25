# Spec: widget-types

## Purpose

The `widget-types` capability provides four typed widget content renderers — clock, image, file, and webpage — each with an optional inline configuration panel. All content state is local to the React session; no persistence is required.

---

## Requirements

### Requirement: Widget type model

**Implements**: UC1-S2, UC2-S1, UC3-S1, UC4-S1 — System renders each widget according to its declared type

The system SHALL support a `WidgetType` discriminated union with four members: `'clock' | 'image' | 'file' | 'webpage'`. Each `WidgetLayout` entry MAY include an optional `type` field; when absent the system SHALL default to `'clock'`.

#### Scenario: Default type when absent
- **WHEN** a `WidgetLayout` entry has no `type` field
- **THEN** the system renders that widget as a clock widget

#### Scenario: Typed widget rendered correctly
- **WHEN** a `WidgetLayout` entry has `type: 'image'`
- **THEN** the system renders the image widget content (not a clock)

---

### Requirement: Clock widget display

**Implements**: UC1-S2 — System renders clock widget with current local time (HH:MM:SS)

The system SHALL render a `clock`-type widget showing the current local time in HH:MM:SS (24-hour) format.

#### Scenario: Clock shows current time on render
- **WHEN** a clock widget is rendered
- **THEN** the displayed time matches the current local time in HH:MM:SS format

---

### Requirement: Clock widget live updates

**Implements**: UC1-S3 — System updates the clock display every second

The system SHALL update the displayed time in a clock widget every second. The interval SHALL be cleared when the component unmounts.

#### Scenario: Time advances each second
- **WHEN** one second elapses after the clock widget is rendered
- **THEN** the displayed time advances by one second

#### Scenario: Interval cleared on unmount
- **WHEN** a clock widget is removed from the DOM
- **THEN** no further time updates occur (interval is cleared)

---

### Requirement: Image widget placeholder

**Implements**: UC2-S1 — User sees image widget (placeholder or previously chosen image)

The system SHALL render an `image`-type widget with a placeholder prompt ("Click to choose image") when no image has been selected. When an image has been selected, the system SHALL display that image.

#### Scenario: Placeholder shown initially
- **WHEN** an image widget is rendered with no prior image selection
- **THEN** the widget displays the placeholder prompt text

#### Scenario: Image shown after selection
- **WHEN** a user has previously selected an image
- **THEN** the widget displays that image (not the placeholder)

---

### Requirement: Image file picker

**Implements**: UC2-S3 — System shows file picker accepting image files

The system SHALL present a file input element restricted to image MIME types (`accept="image/*"`) when the image config panel is open.

#### Scenario: File picker accepts only images
- **WHEN** the image config panel is opened
- **THEN** the file input has `accept` attribute set to `image/*`

---

### Requirement: Image loading from file

**Implements**: UC2-S5, UC2-S6 — System reads the file, generates object URL, renders image filling widget

The system SHALL generate an object URL via `URL.createObjectURL` for the selected file and render it in an `<img>` element. The image SHALL fill the widget area (CSS `object-fit: cover` or equivalent). The previous object URL SHALL be revoked when replaced to avoid memory leaks.

#### Scenario: Object URL created on selection
- **WHEN** a user selects a valid image file
- **THEN** the system creates an object URL and renders it as the `src` of an `<img>` element

#### Scenario: Previous URL revoked on replacement
- **WHEN** a user selects a new image to replace a previous one
- **THEN** the old object URL is revoked before the new one is applied

---

### Requirement: Image selection cancellation

**Implements**: UC2-E3a1 — System retains previous image when file picker is cancelled

The system SHALL leave the current image (or placeholder) unchanged when the user dismisses the file picker without selecting a file.

#### Scenario: Cancel preserves existing image
- **WHEN** the user opens the image picker and then cancels without selecting
- **THEN** the widget continues showing the previously selected image (or placeholder)

---

### Requirement: Non-image file rejection

**Implements**: UC2-E4a1 — System shows error for non-image file selection

When a user selects a file whose MIME type does not begin with `image/`, the system SHALL display an inline error message and SHALL NOT update the displayed image.

#### Scenario: Non-image rejected with error
- **WHEN** a user selects a file with a non-image MIME type (e.g., `text/plain`)
- **THEN** the system shows an inline error and the widget image is unchanged

---

### Requirement: File widget placeholder

**Implements**: UC3-S1 — User sees file widget (placeholder or previously loaded file contents)

The system SHALL render a `file`-type widget with a placeholder prompt ("Click to choose file") when no file has been selected, and SHALL display the file contents when a file has been loaded.

#### Scenario: Placeholder shown initially
- **WHEN** a file widget is rendered with no prior file selection
- **THEN** the widget displays the placeholder prompt text

---

### Requirement: File content picker

**Implements**: UC3-S3 — System shows file picker accepting any file

The system SHALL present a file input element with no type restriction when the file config panel is open.

#### Scenario: File picker accepts any type
- **WHEN** the file config panel is opened
- **THEN** the file input has no `accept` restriction (or `accept="*"`)

---

### Requirement: File content reading

**Implements**: UC3-S5, UC3-S6 — System reads the file as UTF-8 text and renders in scrollable monospace area

The system SHALL read the selected file as UTF-8 text using the `FileReader` API and render the result in a scrollable element using a monospace font.

#### Scenario: File text rendered in monospace
- **WHEN** a user selects a text file
- **THEN** the file contents are displayed in a monospace, scrollable element

---

### Requirement: File content truncation

**Implements**: UC3-E5b1 — System truncates content at 10 000 chars with a notice

When the file content exceeds 10 000 characters, the system SHALL truncate the displayed text at 10 000 characters and SHALL append a visible notice informing the user of the truncation.

#### Scenario: Long file truncated
- **WHEN** a selected file contains more than 10 000 characters
- **THEN** the widget shows only the first 10 000 characters and a truncation notice

---

### Requirement: Binary file read error

**Implements**: UC3-E5a1 — System shows error for unreadable (binary) file

When `FileReader.readAsText` raises an error (e.g., unreadable binary file), the system SHALL display an inline error message and SHALL NOT display partial content.

#### Scenario: Unreadable file shows error
- **WHEN** the FileReader fails to read a selected file as text
- **THEN** the widget displays an error message and no file content

---

### Requirement: File selection cancellation

**Implements**: UC3-E3a1 — System retains previous contents when file picker is cancelled

The system SHALL leave current file contents (or placeholder) unchanged when the user cancels the file picker.

#### Scenario: Cancel preserves existing content
- **WHEN** the user opens the file picker and cancels without selecting
- **THEN** the widget continues showing the previously loaded content (or placeholder)

---

### Requirement: Webpage widget placeholder

**Implements**: UC4-S1 — User sees webpage widget (URL prompt or embedded page)

The system SHALL render a `webpage`-type widget with a URL-entry prompt when no URL has been configured, and SHALL render an `<iframe>` when a URL is set.

#### Scenario: Placeholder shown with no URL
- **WHEN** a webpage widget is rendered with no configured URL
- **THEN** the widget displays a URL-entry prompt (not an iframe)

---

### Requirement: Webpage URL input

**Implements**: UC4-S3 — System shows URL input field pre-filled with current URL

The system SHALL present a URL text input pre-filled with the currently configured URL (or blank if none) when the webpage config panel is open.

#### Scenario: URL input pre-filled
- **WHEN** the webpage config panel is opened with an existing URL
- **THEN** the URL input shows that URL as its current value

---

### Requirement: URL validation

**Implements**: UC4-S5, UC4-E5a1 — System validates URL is well-formed; shows error for malformed URL

The system SHALL validate the entered URL using the `URL` constructor before rendering an iframe. If the URL is malformed, the system SHALL display an inline validation error and SHALL NOT update the iframe.

#### Scenario: Valid URL accepted
- **WHEN** the user enters a well-formed URL (e.g., `https://example.com`) and confirms
- **THEN** the system renders an iframe pointing to that URL

#### Scenario: Malformed URL rejected
- **WHEN** the user enters a string that is not a valid URL (e.g., `not a url`)
- **THEN** the system displays a validation error and the iframe is not updated

---

### Requirement: Scheme-less URL normalisation

**Implements**: UC4-E6b1 — System prepends "https://" to scheme-less URL before loading

When the user enters a URL without a scheme (e.g., `example.com`), the system SHALL prepend `https://` before validation and iframe rendering.

#### Scenario: Scheme prepended automatically
- **WHEN** the user enters `example.com` (no scheme) and confirms
- **THEN** the iframe `src` is set to `https://example.com`

---

### Requirement: Webpage iframe rendering

**Implements**: UC4-S6 — System renders iframe pointing to the supplied URL

The system SHALL render an `<iframe>` element with `src` set to the validated URL. The iframe SHALL have a sandbox attribute of at least `allow-scripts allow-same-origin allow-forms`.

#### Scenario: Iframe rendered with correct src
- **WHEN** a valid URL is confirmed
- **THEN** an `<iframe>` with `src` matching the URL is present in the DOM

---

### Requirement: Webpage URL clear

**Implements**: UC4-E4a1 — System removes iframe and shows placeholder when URL is cleared

When the user clears the URL input and confirms, the system SHALL remove the iframe and display the placeholder prompt.

#### Scenario: Clear URL removes iframe
- **WHEN** the user clears the URL input and confirms
- **THEN** no iframe is rendered and the placeholder prompt is displayed

---

### Requirement: Iframe embedding restriction notice

**Implements**: UC4-E6a1 — Browser blocks iframe; system shows helper note about embedding restrictions

The system SHALL display a persistent helper note beneath the iframe informing the user that some sites may block embedding, so they are not confused when the iframe appears blank.

#### Scenario: Helper note always visible with iframe
- **WHEN** an iframe is rendered for a webpage widget
- **THEN** a helper note about embedding restrictions is visible below the iframe

---

### Requirement: Widget config panel

**Implements**: UC5-S1, UC5-S2, UC5-S3, UC5-S7 — Settings icon opens inline config panel with type-appropriate control; closes on demand

Non-clock widgets SHALL display a settings icon (⚙) button. When clicked, the system SHALL render an inline config panel overlaid on the widget. The panel SHALL show the appropriate control for the widget type (file picker for image/file, URL input for webpage). The panel SHALL be dismissible via a close button or the Escape key.

#### Scenario: Settings icon present on non-clock widget
- **WHEN** an image, file, or webpage widget is rendered
- **THEN** a settings icon button is visible on the widget

#### Scenario: Clock widget has no settings icon
- **WHEN** a clock widget is rendered
- **THEN** no settings icon button is present

#### Scenario: Config panel opens on click
- **WHEN** the user clicks the settings icon
- **THEN** the inline config panel becomes visible

#### Scenario: Config panel closed by close button
- **WHEN** the config panel is open and the user clicks the close button
- **THEN** the config panel is no longer visible

#### Scenario: Config panel closed by Escape
- **WHEN** the config panel is open and the user presses Escape
- **THEN** the config panel is no longer visible

---

### Requirement: Config change commit

**Implements**: UC5-S5, UC5-S6 — System updates widget content config and re-renders

When the user confirms a new file selection or URL, the system SHALL update the widget's content config and re-render the widget with the new content.

#### Scenario: New image committed and displayed
- **WHEN** the user selects a valid new image file
- **THEN** the widget immediately displays the new image

#### Scenario: New URL committed and iframe updated
- **WHEN** the user enters a valid new URL and confirms
- **THEN** the widget iframe updates to point to the new URL

---

### Requirement: Config change cancellation

**Implements**: UC5-E4a1 — System closes config panel; content unchanged when user cancels

When the user closes the config panel without committing a change (cancel / Escape / close button), the system SHALL leave the current widget content unchanged.

#### Scenario: Cancel leaves content unchanged
- **WHEN** the config panel is opened and closed without confirming a new source
- **THEN** the widget content is identical to what it was before the panel was opened

---

### Requirement: Config validation before commit

**Implements**: UC5-E5a1 — System shows inline validation error; content unchanged until valid source provided

The system SHALL not update widget content until a valid source is provided. Inline validation errors SHALL be shown for invalid inputs; the widget SHALL continue showing its previous content.

#### Scenario: Invalid input shows error, no update
- **WHEN** the user provides an invalid input (wrong file type, malformed URL) and attempts to confirm
- **THEN** an inline error is shown and the widget content is unchanged
