# Spec: widget-webpage-viewer

Generated: 2026-03-23

## Overview
This spec defines requirements for the webpage viewer widget — a widget that embeds a user-specified URL inside a sandboxed `<iframe>`. The URL is validated before loading, saved to localStorage, and restored on reload. Pages that refuse embedding are detected and a fallback with a direct link is shown.

## Use Case Traceability
This spec implements the following use case steps from usecases.md:
- UC4-S1: User adds a webpage viewer widget
- UC4-S2: System renders the widget with a URL input and empty-state prompt: "Enter a URL to embed"
- UC4-S3: User types or pastes a URL into the input field
- UC4-S4: User submits the URL
- UC4-S5: System validates that the entered value is a well-formed URL
- UC4-S6: System sets the src of a sandboxed iframe to the validated URL
- UC4-S7: System saves the URL in widget settings keyed by widget ID
- UC4-S8: The target page loads inside the iframe
- UC4-S9: User browses or monitors the embedded page
- UC4-E4a1: System pre-fills URL input with saved URL on dashboard load
- UC4-E4a2: System immediately loads the page in the iframe from saved URL
- UC4-E5a1: System displays inline error: "Please enter a valid URL (include https://)"
- UC4-E8a1: System detects the blocked embed (e.g., via iframe error or load event heuristic)
- UC4-E8a2: System displays a fallback overlay: "This page cannot be embedded"
- UC4-E8a3: System shows a "Open in new tab" link pointing to the URL
- UC4-E8a4: The URL remains saved for the next session
- UC4-E9a1: User updates the URL input with a new URL
- UC5-S1: User activates the source-change control on a configured widget
- UC5-S2: System opens the appropriate picker or input for the widget type
- UC5-S3: User selects or enters the new source
- UC5-S4: System replaces the displayed content with the new source
- UC5-S5: System updates widget settings in localStorage with the new source reference
- UC5-S6: User sees the widget displaying the new content
- UC5-E3a1: Widget retains its current content and source when user cancels
- UC6-S6: System loads webpage viewer widgets from saved URL

---

## ADDED Requirements

### Requirement: Render URL input and empty-state prompt
**Implements**: UC4-S1 - User adds a webpage viewer widget; UC4-S2 - System renders the widget with a URL input and empty-state prompt: "Enter a URL to embed"
The system SHALL render the webpage viewer widget with a visible URL text input and an empty-state prompt ("Enter a URL to embed") when no URL has been configured. The URL input SHALL be always accessible so the user can change the URL at any time.

#### Scenario: Empty state on new widget
- **WHEN** a webpage viewer widget is added with no previously saved URL
- **THEN** the widget shows the URL input and the empty-state prompt; no iframe is rendered

---

### Requirement: Accept URL input via text field
**Implements**: UC4-S3 - User types or pastes a URL into the input field; UC4-S4 - User submits the URL
The system SHALL provide a text input that accepts keyboard entry and paste. The user SHALL be able to submit the URL by pressing Enter or by activating a "Go" button adjacent to the input.

#### Scenario: Enter key submits URL
- **WHEN** the user presses Enter while the URL input is focused
- **THEN** the URL is submitted for validation

#### Scenario: Go button submits URL
- **WHEN** the user clicks the "Go" button
- **THEN** the URL is submitted for validation

---

### Requirement: Validate URL before loading
**Implements**: UC4-S5 - System validates that the entered value is a well-formed URL; UC4-E5a1 - System displays inline error: "Please enter a valid URL (include https://)"
The system SHALL validate the submitted value using the `URL` constructor (i.e., `new URL(value)` inside a try/catch). If the value is malformed or empty the system SHALL display an inline error "Please enter a valid URL (include https://)" and SHALL NOT update the iframe `src`.

#### Scenario: Valid URL accepted
- **WHEN** the user submits a well-formed URL (e.g., `https://example.com`)
- **THEN** no validation error is shown and the iframe src is updated

#### Scenario: Malformed URL rejected
- **WHEN** the user submits a value that is not a valid URL (e.g., `not-a-url`, empty string)
- **THEN** the widget shows the inline error and the iframe is not updated

---

### Requirement: Embed page in sandboxed iframe
**Implements**: UC4-S6 - System sets the src of a sandboxed iframe to the validated URL; UC4-S8 - The target page loads inside the iframe; UC4-S9 - User browses or monitors the embedded page
The system SHALL set the `src` of an `<iframe>` element to the validated URL. The iframe SHALL include the `sandbox` attribute with at minimum the values `allow-scripts allow-same-origin allow-forms allow-popups` to enable basic page functionality while preventing top-level navigation and parent DOM access.

#### Scenario: Iframe src set on valid submission
- **WHEN** a valid URL is submitted
- **THEN** the iframe element's `src` attribute equals the submitted URL

#### Scenario: Iframe is sandboxed
- **WHEN** the iframe is rendered
- **THEN** its `sandbox` attribute includes `allow-scripts`, `allow-same-origin`, `allow-forms`, and `allow-popups`

---

### Requirement: Pre-fill and auto-load saved URL on restore
**Implements**: UC4-E4a1 - System pre-fills URL input with saved URL on dashboard load; UC4-E4a2 - System immediately loads the page in the iframe from saved URL; UC6-S6 - System loads webpage viewer widgets from saved URL
The system SHALL pre-populate the URL input field with the saved URL when a webpage viewer widget is restored from localStorage on page load. The system SHALL also set the iframe `src` to the saved URL immediately, causing the page to begin loading without any user interaction.

#### Scenario: Saved URL pre-fills input on reload
- **WHEN** the dashboard reloads and a webpage viewer widget has a saved URL
- **THEN** the URL input field contains the saved URL

#### Scenario: Saved URL auto-loads in iframe on reload
- **WHEN** the dashboard reloads and a webpage viewer widget has a saved URL
- **THEN** the iframe `src` is set to the saved URL immediately on mount

---

### Requirement: Show fallback overlay for blocked embeds
**Implements**: UC4-E8a1 - System detects the blocked embed (e.g., via iframe error or load event heuristic); UC4-E8a2 - System displays a fallback overlay: "This page cannot be embedded"; UC4-E8a3 - System shows a "Open in new tab" link pointing to the URL; UC4-E8a4 - The URL remains saved for the next session
The system SHALL attempt to detect when the embedded page refuses to load inside the iframe (e.g., via X-Frame-Options or CSP `frame-ancestors` restrictions). Upon detecting a blocked embed, the system SHALL overlay the iframe with a message "This page cannot be embedded" and SHALL show an anchor link with `target="_blank"` pointing to the URL, labeled "Open in new tab".

#### Scenario: Fallback shown for embed-blocked page
- **WHEN** the iframe fires an error or the content is determined to be blocked
- **THEN** the fallback overlay with "This page cannot be embedded" is displayed

#### Scenario: Open in new tab link present
- **WHEN** the fallback overlay is shown
- **THEN** an "Open in new tab" link is visible and its `href` equals the submitted URL

---

### Requirement: Persist URL in widget settings
**Implements**: UC4-S7 - System saves the URL in widget settings keyed by widget ID
The system SHALL write the confirmed URL to `dashboard-widget-settings` in localStorage under the widget's ID (debounced at 300ms). The URL SHALL be stored as a plain string under the key `url` within the widget's settings entry.

#### Scenario: URL saved after submission
- **WHEN** the user submits a valid URL and 300ms elapses (debounce)
- **THEN** `dashboard-widget-settings[widgetId].url` equals the submitted URL in localStorage

---

### Requirement: Allow URL change on configured widget
**Implements**: UC5-S1 - User activates the source-change control on a configured widget; UC5-S2 - System opens the appropriate picker or input for the widget type; UC5-S3 - User selects or enters the new source; UC5-S4 - System replaces the displayed content with the new source; UC5-S5 - System updates widget settings in localStorage with the new source reference; UC5-S6 - User sees the widget displaying the new content; UC5-E3a1 - Widget retains its current content and source when user cancels
The URL input SHALL remain accessible while the iframe is displaying content, allowing the user to update the URL at any time. If the user clears the input and does not submit, the current iframe content SHALL remain unchanged.

#### Scenario: URL input accessible while iframe loaded
- **WHEN** the iframe is displaying a page
- **THEN** the URL input is still visible and editable

#### Scenario: Clearing input without submit preserves iframe
- **WHEN** the user clears the URL input but does not press Enter or click Go
- **THEN** the iframe continues to display the previously loaded page
