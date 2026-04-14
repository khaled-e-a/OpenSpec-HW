# Spec: widget-webpage

Generated: 2026-03-10

## Overview

This spec defines requirements for the `widget-webpage` capability — a widget content type that embeds a user-supplied URL in a sandboxed `<iframe>`, allowing the user to view a live webpage inline on the dashboard.

## Use Case Traceability

This spec implements the following use case steps:

| Step | Description |
|------|-------------|
| UC5-S1 | User activates the URL input control inside the widget. |
| UC5-S2 | System presents an editable URL field pre-populated with the current URL (or empty if none is set). |
| UC5-S3 | User enters or edits the URL and confirms. |
| UC5-S4 | System loads the URL inside a sandboxed `<iframe>` within the widget. |
| UC5-S5 | Webpage is displayed; user can interact with the embedded page normally. |
| UC5-E3a | User confirms without entering a URL. |
| UC5-E3b | User dismisses the URL input without confirming. |
| UC5-E4a | The page refuses embedding (X-Frame-Options: DENY or SAMEORIGIN). |
| UC5-E4b | The URL is malformed or the host is unreachable. |
| UC5-E5a | User wants to change the URL. |

---

## ADDED Requirements

### Requirement: URL Input Control

**Implements**: UC5-S1 - User activates the URL input control inside the widget.
**Implements**: UC5-S2 - System presents an editable URL field pre-populated with the current URL (or empty if none is set).
**Implements**: UC5-E3b - User dismisses the URL input without confirming.

The webpage content component SHALL render a URL input control that is always accessible. Activating or focusing the control SHALL present an editable text field pre-populated with the current URL (or empty if none is set). The user MAY dismiss the input (e.g., press Escape or click away) without committing a change; in this case the widget state SHALL remain unchanged.

#### Scenario: URL input is accessible

- **WHEN** a widget has `type: 'webpage'`
- **THEN** a URL input control is visible within the widget

#### Scenario: URL field is pre-populated with current URL

- **WHEN** the user activates the URL input and a URL is already set
- **THEN** the input field displays the current URL

#### Scenario: Dismissing without confirming leaves widget unchanged

- **WHEN** the user dismisses the URL input without pressing confirm
- **THEN** the webpage widget continues to display its current state unchanged

---

### Requirement: Load URL in Sandboxed iframe

**Implements**: UC5-S3 - User enters or edits the URL and confirms.
**Implements**: UC5-S4 - System loads the URL inside a sandboxed `<iframe>` within the widget.
**Implements**: UC5-S5 - Webpage is displayed; user can interact with the embedded page normally.

When the user confirms a non-empty URL, the system SHALL store it in `WidgetLayout.webpageUrl` via `onConfigChange` and render it in an `<iframe>` with a `sandbox` attribute permitting scripts, same-origin access, and form submission (`sandbox="allow-scripts allow-same-origin allow-forms"`). The iframe SHALL fill the widget's content area. The user SHALL be able to interact with the embedded page.

#### Scenario: Confirmed URL loads in iframe

- **WHEN** the user confirms a non-empty URL
- **THEN** the URL is loaded inside a sandboxed iframe within the widget

#### Scenario: iframe fills the widget

- **WHEN** an iframe is rendered
- **THEN** it occupies the available content area of the widget

---

### Requirement: Empty URL Shows Placeholder

**Implements**: UC5-E3a - User confirms without entering a URL.

If the user confirms with an empty URL field, the system SHALL remove the iframe (if any) and display a placeholder ("No URL set"). The URL input control SHALL remain accessible.

#### Scenario: Empty confirmation removes iframe

- **WHEN** the user clears the URL field and confirms
- **THEN** no iframe is rendered and a "No URL set" placeholder is shown

---

### Requirement: Persist URL

**Implements**: UC5-E5a - User wants to change the URL.

The confirmed URL SHALL be stored in `WidgetLayout.webpageUrl`. On subsequent renders the widget SHALL load the stored URL without requiring the user to re-enter it. The URL input SHALL remain accessible for the user to change the URL at any time.

#### Scenario: URL persists across re-renders

- **WHEN** a URL has been confirmed and the dashboard re-renders
- **THEN** the webpage widget loads the same URL automatically

#### Scenario: URL can be changed

- **WHEN** an iframe is displayed and the user updates the URL input and confirms
- **THEN** the iframe loads the new URL

---

### Requirement: Handle Embedding Failures

**Implements**: UC5-E4a - The page refuses embedding (X-Frame-Options: DENY or SAMEORIGIN).
**Implements**: UC5-E4b - The URL is malformed or the host is unreachable.

The widget SHALL display a persistent soft warning ("If the page appears blank, it may not allow embedding") to inform the user that some pages block iframe embedding via `X-Frame-Options` or `Content-Security-Policy`. If the iframe fires an `error` event or results in a blank load, the widget SHALL show a more prominent error indicator ("Page could not be loaded — it may not allow embedding"). The URL input SHALL remain accessible so the user can try a different URL.

#### Scenario: Soft warning is shown for all iframes

- **WHEN** an iframe is rendered for any URL
- **THEN** a soft notice informs the user that blank pages may not allow embedding

#### Scenario: Load error shows error indicator

- **WHEN** the iframe fires an error event
- **THEN** the widget displays an error message and the URL input remains accessible for correction
