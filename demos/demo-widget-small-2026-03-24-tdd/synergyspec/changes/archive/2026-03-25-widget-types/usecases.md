# Use Cases: widget-types

Generated: 2026-03-25

## Overview

This document captures the use cases for the widget-types change, following Cockburn's use case methodology. The feature gives each dashboard widget a content type — clock, image, file, or webpage — and lets the user change the content source at any time without leaving the dashboard.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | View a live clock on the dashboard |
| User | Display a chosen image on the dashboard |
| User | Read the contents of a chosen file on the dashboard |
| User | View a chosen webpage embedded in the dashboard |
| User | Change the content source of any widget |
| System | Render the correct content for each widget type |
| System | Persist widget type and configuration across layout changes |

---

## Use Cases

### Use Case UC1: View Live Clock Widget

**Primary Actor**: User
**Goal**: See the current time, updated live, on the dashboard

#### Stakeholders & Interests
- User: Wants to see accurate, up-to-date time without leaving the dashboard
- System: Must update the clock without causing full re-renders of the rest of the dashboard

#### Preconditions
- The dashboard is rendered with at least one widget of type `clock`

#### Trigger
The page loads (or a clock widget is added to the layout).

#### Main Success Scenario
1. User opens the dashboard.
2. System renders each `clock`-type widget with the current local time in HH:MM:SS format.
3. System updates the displayed time every second.
4. User reads the current time from the clock widget.

#### Extensions
4a. User navigates away from the page and returns:
  4a1. System resumes live updates — no stale time is displayed.

4b. The tab is hidden (user switches tabs):
  4b1. System pauses the interval timer; resumes when the tab becomes visible again (optional optimisation — not required for V1).

#### Postconditions
- The clock widget displays the current local time and continues to update every second.

---

### Use Case UC2: Display User-Chosen Image

**Primary Actor**: User
**Goal**: Show a personally chosen image inside a dashboard widget

#### Stakeholders & Interests
- User: Wants to pin a meaningful image (photo, chart screenshot, logo) to the dashboard
- System: Must load the image from a local file and display it without network round-trips

#### Preconditions
- The dashboard is rendered with at least one widget of type `image`
- The user's browser supports the File API (`FileReader` or `URL.createObjectURL`)

#### Trigger
The page loads with an `image` widget present, **or** the user opens the image config panel.

#### Main Success Scenario
1. User sees an `image` widget displaying either a placeholder prompt ("Click to choose image") or the previously chosen image.
2. User opens the widget's config panel by clicking the settings icon.
3. System displays a file picker control accepting image files.
4. User selects an image file from their local filesystem.
5. System reads the file and generates an object URL.
6. System renders the selected image, filling the widget area (object-fit: cover).
7. User closes the config panel.

#### Extensions
3a. User cancels the file picker without selecting a file:
  3a1. System keeps the previously displayed image (or placeholder) unchanged.

4a. User selects a non-image file (e.g., a .txt file):
  4a1. System ignores the selection and shows an inline error: "Please select an image file."

6a. The selected file is too large to load quickly:
  6a1. System shows a loading indicator while the object URL is being generated.

#### Postconditions
- The image widget displays the user-selected image.
- The image config (object URL reference) is retained in widget state for as long as the session lasts.

---

### Use Case UC3: Display User-Chosen File Contents

**Primary Actor**: User
**Goal**: Read the text contents of a local file directly inside a dashboard widget

#### Stakeholders & Interests
- User: Wants to quickly review a text file (log, config, notes) without opening a separate editor
- System: Must read the file as text and render it verbatim in a scrollable area

#### Preconditions
- The dashboard is rendered with at least one widget of type `file`
- The user's browser supports the File API (`FileReader.readAsText`)

#### Trigger
The page loads with a `file` widget present, **or** the user opens the file config panel.

#### Main Success Scenario
1. User sees a `file` widget displaying either a placeholder prompt ("Click to choose file") or the previously loaded file's contents.
2. User opens the widget's config panel by clicking the settings icon.
3. System displays a file picker control accepting any file type.
4. User selects a file from their local filesystem.
5. System reads the file as UTF-8 text.
6. System renders the file contents in a scrollable, monospace text area inside the widget.
7. User reads the file contents; closes the config panel.

#### Extensions
3a. User cancels the file picker:
  3a1. System retains the previously displayed contents (or placeholder).

5a. The file is binary or unreadable as UTF-8:
  5a1. System displays a warning: "File could not be read as text." No contents are shown.

5b. The file is very large (> 1 MB):
  5b1. System truncates the displayed text to the first 10 000 characters and appends a notice: "Showing first 10 000 characters."

#### Postconditions
- The file widget displays the text contents of the chosen file.
- The file name is shown in the widget header or config area.

---

### Use Case UC4: Embed a User-Chosen Webpage

**Primary Actor**: User
**Goal**: View a live webpage embedded inside a dashboard widget

#### Stakeholders & Interests
- User: Wants to monitor a webpage (status page, live feed, internal tool) without leaving the dashboard
- System: Must embed the URL in an `<iframe>` and allow the user to change the URL at will

#### Preconditions
- The dashboard is rendered with at least one widget of type `webpage`

#### Trigger
The page loads with a `webpage` widget present, **or** the user opens the webpage config panel.

#### Main Success Scenario
1. User sees a `webpage` widget displaying either a URL-entry prompt or an embedded page.
2. User opens the widget's config panel by clicking the settings icon.
3. System displays a URL input field pre-filled with the current URL (or blank if none set).
4. User types or pastes a URL and confirms (presses Enter or clicks "Load").
5. System validates that the input is a well-formed URL.
6. System renders an `<iframe>` pointing to the supplied URL, filling the widget area.
7. User views the embedded webpage; closes the config panel.

#### Extensions
4a. User clears the URL field and confirms:
  4a1. System removes the iframe and shows the placeholder prompt again.

5a. The URL is not well-formed:
  5a1. System highlights the field with an error: "Please enter a valid URL (e.g., https://example.com)."
  5a2. System does not update the iframe until a valid URL is entered.

6a. The target site sets `X-Frame-Options: DENY` or `CSP: frame-ancestors 'none'`:
  6a1. The browser blocks the iframe load; the widget shows the browser's built-in blocked-frame message.
  6a2. System shows a helper note beneath the iframe: "This site may not allow embedding."

6b. User does not include a scheme (types "example.com" without "https://"):
  6b1. System prepends "https://" and loads the URL.

#### Postconditions
- The webpage widget renders an iframe pointing to the user-supplied URL.
- The URL is retained in widget state for the duration of the session.

---

### Use Case UC5: Change Widget Content Source

**Primary Actor**: User
**Goal**: Replace the content source (image, file, or URL) of an existing widget at any time

#### Stakeholders & Interests
- User: Wants to update a widget's content without removing and re-adding it, keeping its position and size
- System: Must update content state without altering `WidgetLayout` position/size fields

#### Preconditions
- At least one non-clock widget (image, file, or webpage) is present on the dashboard

#### Trigger
User clicks the settings icon on any non-clock widget.

#### Main Success Scenario
1. User clicks the settings icon on a widget.
2. System opens an inline config panel overlaid on the widget.
3. For `image` / `file` widgets: System shows a file picker. For `webpage` widgets: System shows a URL input.
4. User selects a new file or enters a new URL.
5. System updates the widget's content config.
6. System re-renders the widget with the new content.
7. System closes the config panel.

#### Extensions
4a. User cancels without making a change (closes panel or presses Escape):
  4a1. System closes the config panel; widget content is unchanged.

5a. The new selection is invalid (wrong file type, malformed URL):
  5a1. System shows an inline validation error (as per UC2-E4a, UC3-E5a, or UC4-E5a).
  5a2. Widget content is not changed until a valid source is provided.

#### Postconditions
- The widget displays the new content.
- The widget's layout position and size are unchanged.

---

## Use Case Traceability Mapping

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User opens the dashboard |
| UC1-S2 | System renders clock widget with current local time (HH:MM:SS) |
| UC1-S3 | System updates the clock display every second |
| UC1-S4 | User reads the time |
| UC1-E4a1 | System resumes live updates after tab navigation |
| UC2-S1 | User sees image widget (placeholder or previously chosen image) |
| UC2-S2 | User opens the image widget config panel |
| UC2-S3 | System shows file picker accepting image files |
| UC2-S4 | User selects an image file |
| UC2-S5 | System reads the file and generates an object URL |
| UC2-S6 | System renders the selected image filling the widget area |
| UC2-S7 | User closes the config panel |
| UC2-E3a1 | System retains previous image when file picker is cancelled |
| UC2-E4a1 | System shows error for non-image file selection |
| UC3-S1 | User sees file widget (placeholder or previously loaded file contents) |
| UC3-S2 | User opens the file widget config panel |
| UC3-S3 | System shows file picker accepting any file |
| UC3-S4 | User selects a file |
| UC3-S5 | System reads the file as UTF-8 text |
| UC3-S6 | System renders file contents in scrollable monospace area |
| UC3-S7 | User reads the file and closes the config panel |
| UC3-E3a1 | System retains previous contents when file picker is cancelled |
| UC3-E5a1 | System shows error for unreadable (binary) file |
| UC3-E5b1 | System truncates content at 10 000 chars with a notice |
| UC4-S1 | User sees webpage widget (URL prompt or embedded page) |
| UC4-S2 | User opens the webpage widget config panel |
| UC4-S3 | System shows URL input field pre-filled with current URL |
| UC4-S4 | User enters or pastes a URL and confirms |
| UC4-S5 | System validates the URL is well-formed |
| UC4-S6 | System renders iframe pointing to the supplied URL |
| UC4-S7 | User views embedded webpage and closes the config panel |
| UC4-E4a1 | System removes iframe and shows placeholder when URL is cleared |
| UC4-E5a1 | System shows validation error for malformed URL |
| UC4-E6a1 | Browser blocks iframe; system shows helper note about embedding restrictions |
| UC4-E6b1 | System prepends "https://" to scheme-less URL before loading |
| UC5-S1 | User clicks settings icon on a widget |
| UC5-S2 | System opens inline config panel on the widget |
| UC5-S3 | System shows appropriate control (file picker or URL input) per widget type |
| UC5-S4 | User selects a new file or enters a new URL |
| UC5-S5 | System updates the widget content config |
| UC5-S6 | System re-renders the widget with new content |
| UC5-S7 | System closes the config panel |
| UC5-E4a1 | System closes config panel; content unchanged when user cancels |
| UC5-E5a1 | System shows inline validation error; content unchanged until valid source provided |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
