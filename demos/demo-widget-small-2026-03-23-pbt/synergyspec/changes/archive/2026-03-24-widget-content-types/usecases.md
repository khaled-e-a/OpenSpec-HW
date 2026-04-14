# Use Cases: widget-content-types

Generated: 2026-03-23

## Overview

This document captures the use cases for the widget-content-types change.
Four new widget types replace the existing stubs: a live clock, an image viewer,
a plain-text file viewer, and an embedded webpage viewer. Each widget either runs
autonomously (clock) or requires the user to configure a content source before
displaying meaningful content.

---

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | View the current time and date in a dashboard widget |
| User | Display a chosen image inside a dashboard widget |
| User | Read the contents of a local text file inside a dashboard widget |
| User | Browse or monitor a web page inside a dashboard widget |
| User | Change the content source of an existing widget |
| User | Persist widget content settings across page reloads |
| System | Validate and embed content safely |

---

## Use Cases

### Use Case 1: View Live Clock
**Primary Actor**: User
**Goal**: See the current time and date update continuously in a dashboard widget

#### Stakeholders & Interests
- User: Wants a glanceable, always-accurate clock without any setup
- System: Must not leak timers when the widget is removed or the tab is hidden

#### Preconditions
- The dashboard is loaded and at least one clock widget is present in the layout

#### Trigger
User adds a clock widget via the widget picker, or the dashboard loads with a saved clock widget

#### Main Success Scenario
1. User adds a clock widget (or the dashboard restores one from saved layout)
2. System renders the widget immediately showing the current hours, minutes, seconds, and full date
3. System starts a 1-second interval timer internal to the widget
4. Each second the system updates the displayed time
5. User reads the current time from the widget

#### Extensions
1a. Dashboard loads with a previously saved clock widget
  1a1. System restores the clock widget at its saved grid position
  1a2. Clock begins ticking immediately — no configuration needed
  1a3. Continue at step 4

5a. User removes the clock widget
  5a1. System stops the 1-second timer to prevent memory leaks
  5a2. Widget is removed from the grid

#### Postconditions
- Clock widget displays the correct current time
- Timer fires once per second; no stale timers remain after removal

---

### Use Case 2: Display a Chosen Image
**Primary Actor**: User
**Goal**: Show a specific image — from a local file or a URL — inside a dashboard widget

#### Stakeholders & Interests
- User: Wants to personalise the dashboard with images they choose
- System: Must handle both file-based and URL-based sources; must not expose local file paths in persistent storage

#### Preconditions
- An image viewer widget is present in the layout

#### Trigger
User adds an image viewer widget (or the dashboard loads with a saved one whose source has not yet been set)

#### Main Success Scenario
1. User adds an image viewer widget
2. System renders the widget with an empty-state prompt: "Choose an image"
3. User activates the image source picker inside the widget
4. System presents two options: "Select file" and "Enter URL"
5. User selects a local image file via the browser file picker
6. System reads the file client-side, creates an object URL, and displays the image inside the widget
7. System stores the image source reference (object URL or original URL) in widget settings, keyed by widget ID
8. User sees the image displayed at full-fit within the widget bounds

#### Extensions
4a. User chooses to enter a URL instead of selecting a file
  4a1. System shows a text input pre-populated with any previously saved URL
  4a2. User types or pastes an image URL and confirms
  4a3. System sets the image `src` to the entered URL
  4a4. Continue at step 7

6a. Selected file is not a recognised image type
  6a1. System displays an inline error: "Not a supported image format"
  6a2. Widget returns to the empty-state prompt

8a. URL image fails to load (404, CORS, invalid URL)
  8a1. System displays an inline error: "Image could not be loaded"
  8a2. System shows the "Choose an image" prompt again so the user can try another source

8b. User wants to change the displayed image
  8b1. User activates the image source picker again
  8b2. Continue at step 4 — system replaces the current source

#### Postconditions
- Widget displays the chosen image
- Image source reference is saved in widget settings and survives page reload

---

### Use Case 3: Display Contents of a Local File
**Primary Actor**: User
**Goal**: Read and display the text contents of a local file inside a dashboard widget

#### Stakeholders & Interests
- User: Wants to monitor or reference a text file (log, config, notes) without leaving the dashboard
- System: Must read files client-side only; must handle non-text and large files gracefully

#### Preconditions
- A file viewer widget is present in the layout

#### Trigger
User adds a file viewer widget (or the dashboard loads one with no file yet selected)

#### Main Success Scenario
1. User adds a file viewer widget
2. System renders the widget with an empty-state prompt: "Select a file to display"
3. User activates the file picker inside the widget
4. System opens the browser's native file picker
5. User selects a plain-text file (e.g., `.txt`, `.log`, `.md`, `.json`, `.csv`)
6. System reads the file contents via the File API
7. System displays the file contents as scrollable plain text inside the widget
8. System stores the file name in widget settings (note: file path cannot be stored — user must re-select on reload)
9. User reads the file contents

#### Extensions
5a. User cancels the file picker without selecting a file
  5a1. Widget remains in the empty-state prompt (or retains the previous file if one was set)

6a. Selected file is binary or not valid UTF-8 text
  6a1. System displays an inline error: "File is not readable as text"
  6a2. Widget returns to the empty-state prompt

6b. Selected file exceeds 1 MB
  6b1. System displays an inline warning: "File is large — only the first 1 MB is shown"
  6b2. System displays the first 1 MB of content

9a. User wants to view a different file
  9a1. User activates the file picker again
  9a2. Continue at step 4

9b. Page is reloaded
  9b1. System restores the widget at its saved position
  9b2. Widget shows empty-state prompt with the saved file name as a hint: "Re-select '<filename>' to restore"
  9b3. User must re-select the file (browser security prevents storing file paths)

#### Postconditions
- Widget displays the text contents of the selected file
- File name is saved in widget settings; file contents are not persisted (must be re-read on reload)

---

### Use Case 4: Embed a Web Page
**Primary Actor**: User
**Goal**: View and interact with a web page embedded inside a dashboard widget

#### Stakeholders & Interests
- User: Wants to monitor a live web page (status page, news feed, internal tool) without leaving the dashboard
- System: Must sandbox the iframe to prevent script injection; must handle embed-refused pages gracefully

#### Preconditions
- A webpage viewer widget is present in the layout

#### Trigger
User adds a webpage viewer widget (or the dashboard loads one with a saved URL)

#### Main Success Scenario
1. User adds a webpage viewer widget
2. System renders the widget with a URL input and an empty-state prompt: "Enter a URL to embed"
3. User types or pastes a URL into the input field
4. User submits the URL (presses Enter or activates the "Go" button)
5. System validates that the entered value is a well-formed URL
6. System sets the `src` of a sandboxed `<iframe>` to the validated URL
7. System saves the URL in widget settings, keyed by widget ID
8. The target page loads inside the iframe
9. User browses or monitors the embedded page

#### Extensions
4a. Dashboard loads with a previously saved URL
  4a1. System pre-fills the URL input with the saved URL
  4a2. System immediately loads the page in the iframe
  4a3. Continue at step 8

5a. User enters a malformed or empty URL
  5a1. System highlights the input with an inline error: "Please enter a valid URL (include https://)"
  5a2. iframe is not updated; previous content (if any) remains

8a. Target page refuses to be embedded (X-Frame-Options: DENY / SAMEORIGIN, or CSP frame-ancestors)
  8a1. System detects the blocked embed (e.g., via iframe `error` or `load` event heuristic)
  8a2. System displays a fallback overlay: "This page cannot be embedded"
  8a3. System shows a "Open in new tab" link pointing to the URL
  8a4. The URL remains saved for the next session

9a. User wants to navigate to a different page
  9a1. User updates the URL input with a new URL
  9a2. Continue at step 4

#### Postconditions
- Widget displays the embedded web page (or a fallback if embedding is blocked)
- URL is saved in widget settings and restored on reload

---

### Use Case 5: Change Widget Content Source
**Primary Actor**: User
**Goal**: Update the content source of an already-configured widget

#### Stakeholders & Interests
- User: Wants to point an existing widget at different content without removing and re-adding it
- System: Must replace the old source cleanly and update persistence

#### Preconditions
- An image viewer, file viewer, or webpage viewer widget is present and already has a configured source

#### Trigger
User activates the in-widget control to change the source (re-open file picker, re-enter URL)

#### Main Success Scenario
1. User activates the source-change control on a configured widget
2. System opens the appropriate picker or input (file picker for image/file widgets; URL input for webpage widget)
3. User selects or enters the new source
4. System replaces the displayed content with the new source
5. System updates widget settings in localStorage with the new source reference
6. User sees the widget now displaying the new content

#### Extensions
3a. User cancels the picker or clears the input without confirming
  3a1. Widget retains its current content and source unchanged

#### Postconditions
- Widget displays the new content source
- New source reference is saved in widget settings

---

### Use Case 6: Persist and Restore Widget Settings
**Primary Actor**: User
**Goal**: Have widget content sources automatically saved and available after a page reload

#### Stakeholders & Interests
- User: Does not want to re-configure widgets every time the page is refreshed
- System: Must persist settings efficiently without storing large binary blobs; file contents cannot be re-stored after page unload

#### Preconditions
- One or more configurable widgets (image viewer, file viewer, webpage viewer) are present and have been configured

#### Trigger
User reloads or navigates back to the dashboard page

#### Main Success Scenario
1. User reloads the dashboard
2. System reads `dashboard-widget-settings` from localStorage
3. System validates the settings map against currently registered widget IDs
4. For each clock widget — system renders immediately with no settings needed
5. For each image viewer with a saved URL source — system loads the image from the saved URL
6. For each webpage viewer with a saved URL — system loads the page in the iframe
7. For each file viewer — system shows the empty-state prompt with the saved file name as a hint
8. Dashboard appears with all previously configured widgets restored to their last state

#### Extensions
2a. No settings found in localStorage
  2a1. System uses an empty settings map; configurable widgets render in their empty-state prompt

2b. Settings data is corrupt (invalid JSON)
  2b1. System logs a console warning and falls back to empty settings
  2b2. Configurable widgets render in their empty-state prompt

3a. Settings map references a widget ID that is no longer in the layout
  3a1. System silently discards that settings entry — stale entries do not cause errors

5a. Saved image URL fails to load on reload
  5a1. System shows the inline error "Image could not be loaded" and the source-change control
  5a2. User can select a new source

#### Postconditions
- All widget settings are restored from localStorage
- Clock widgets tick immediately; URL-based widgets load their content; file-based widgets prompt for re-selection

---

## Use Case Traceability Mapping

This section is the single source of truth for all step IDs referenced by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User adds a clock widget or the dashboard loads with a saved clock widget |
| UC1-S2 | System renders the widget showing current hours, minutes, seconds, and date |
| UC1-S3 | System starts a 1-second interval timer internal to the widget |
| UC1-S4 | System updates the displayed time every second |
| UC1-S5 | User reads the current time from the widget |
| UC1-E1a1 | System restores the clock widget at its saved grid position on dashboard load |
| UC1-E1a2 | Clock begins ticking immediately — no configuration needed |
| UC1-E5a1 | System stops the 1-second timer when the clock widget is removed |
| UC2-S1 | User adds an image viewer widget |
| UC2-S2 | System renders the widget with an empty-state prompt: "Choose an image" |
| UC2-S3 | User activates the image source picker inside the widget |
| UC2-S4 | System presents two options: "Select file" and "Enter URL" |
| UC2-S5 | User selects a local image file via the browser file picker |
| UC2-S6 | System reads the file client-side, creates an object URL, and displays the image |
| UC2-S7 | System stores the image source reference in widget settings keyed by widget ID |
| UC2-S8 | User sees the image displayed at full-fit within the widget bounds |
| UC2-E4a1 | System shows a text input pre-populated with any previously saved URL |
| UC2-E4a2 | User types or pastes an image URL and confirms |
| UC2-E4a3 | System sets the image src to the entered URL |
| UC2-E6a1 | System displays an inline error: "Not a supported image format" |
| UC2-E8a1 | System displays an inline error: "Image could not be loaded" |
| UC2-E8b1 | User activates the image source picker to change the displayed image |
| UC3-S1 | User adds a file viewer widget |
| UC3-S2 | System renders the widget with an empty-state prompt: "Select a file to display" |
| UC3-S3 | User activates the file picker inside the widget |
| UC3-S4 | System opens the browser's native file picker |
| UC3-S5 | User selects a plain-text file |
| UC3-S6 | System reads the file contents via the File API |
| UC3-S7 | System displays the file contents as scrollable plain text inside the widget |
| UC3-S8 | System stores the file name in widget settings |
| UC3-S9 | User reads the file contents |
| UC3-E5a1 | Widget remains in empty-state prompt when user cancels the file picker |
| UC3-E6a1 | System displays an inline error: "File is not readable as text" |
| UC3-E6b1 | System displays an inline warning: "File is large — only the first 1 MB is shown" |
| UC3-E6b2 | System displays the first 1 MB of content |
| UC3-E9a1 | User activates the file picker again |
| UC3-E9b1 | System restores the widget at its saved position |
| UC3-E9b2 | Widget shows empty-state prompt with the saved file name as a hint: "Re-select '<filename>' to restore" |
| UC3-E9b3 | User must re-select the file (browser security prevents storing file paths) |
| UC4-S1 | User adds a webpage viewer widget |
| UC4-S2 | System renders the widget with a URL input and empty-state prompt: "Enter a URL to embed" |
| UC4-S3 | User types or pastes a URL into the input field |
| UC4-S4 | User submits the URL |
| UC4-S5 | System validates that the entered value is a well-formed URL |
| UC4-S6 | System sets the src of a sandboxed iframe to the validated URL |
| UC4-S7 | System saves the URL in widget settings keyed by widget ID |
| UC4-S8 | The target page loads inside the iframe |
| UC4-S9 | User browses or monitors the embedded page |
| UC4-E4a1 | System pre-fills URL input with saved URL on dashboard load |
| UC4-E4a2 | System immediately loads the page in the iframe from saved URL |
| UC4-E5a1 | System displays inline error: "Please enter a valid URL (include https://)" |
| UC4-E8a1 | System detects the blocked embed (e.g., via iframe error or load event heuristic) |
| UC4-E8a2 | System displays a fallback overlay: "This page cannot be embedded" |
| UC4-E8a3 | System shows a "Open in new tab" link pointing to the URL |
| UC4-E8a4 | The URL remains saved for the next session |
| UC4-E9a1 | User updates the URL input with a new URL |
| UC5-S1 | User activates the source-change control on a configured widget |
| UC5-S2 | System opens the appropriate picker or input for the widget type |
| UC5-S3 | User selects or enters the new source |
| UC5-S4 | System replaces the displayed content with the new source |
| UC5-S5 | System updates widget settings in localStorage with the new source reference |
| UC5-S6 | User sees the widget displaying the new content |
| UC5-E3a1 | Widget retains its current content and source when user cancels |
| UC6-S1 | User reloads the dashboard |
| UC6-S2 | System reads dashboard-widget-settings from localStorage |
| UC6-S3 | System validates the settings map against currently registered widget IDs |
| UC6-S4 | System renders clock widgets immediately with no settings needed |
| UC6-S5 | System loads image viewer widgets from saved URL source |
| UC6-S6 | System loads webpage viewer widgets from saved URL |
| UC6-S7 | System shows file viewer widgets in empty-state with saved file name hint |
| UC6-S8 | Dashboard appears with all previously configured widgets restored |
| UC6-E2a1 | System uses empty settings map when no settings found in localStorage |
| UC6-E2b1 | System logs a console warning and falls back to empty settings on corrupt data |
| UC6-E3a1 | System silently discards settings entries for widget IDs no longer in the layout |
| UC6-E5a1 | System shows inline error and source-change control when saved image URL fails |
