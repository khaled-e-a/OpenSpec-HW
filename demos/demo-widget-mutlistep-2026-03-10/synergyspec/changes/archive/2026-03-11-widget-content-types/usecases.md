# Use Cases: widget-content-types

Generated: 2026-03-10

## Overview

This document captures the use cases for the widget-content-types change, following Cockburn's use case methodology. The change gives each dashboard widget a content type — clock, image, file viewer, or webpage — and allows the user to select and change a widget's type and its type-specific content at any time.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| User | See the current local time on the dashboard at a glance |
| User | Display a chosen image inside a dashboard widget |
| User | Read the contents of a chosen local file inside a dashboard widget |
| User | View an embedded webpage inside a dashboard widget |
| User | Change what type of content a widget shows |
| User | Update the specific content a widget is displaying (image, file, or URL) |

---

## Use Cases

### Use Case 1: Select or Change Widget Content Type

**Primary Actor**: User
**Goal**: Choose which of the four content types a widget displays, or switch away from the current type.

#### Stakeholders & Interests
- **User**: Wants to personalise each widget to show the information they care about; wants the change to take effect immediately.
- **System**: Must preserve layout state and widget identity while updating the content type; must not lose existing widget configuration for types not being switched away from.

#### Preconditions
- At least one widget exists on the dashboard.

#### Trigger
User activates the settings control on a widget.

#### Main Success Scenario
1. User activates the settings control on a widget.
2. System opens a settings panel for that widget, showing the currently active type and the four available types (clock, image, file, webpage).
3. User selects a content type.
4. System updates the widget to the selected type and closes the settings panel.
5. Widget renders the new content type immediately (clock starts ticking; image/file/webpage renders its configured source, or its empty state if no source is yet configured).

#### Extensions

**3a. User selects the same type that is already active.**
- 3a1. System makes no change to the widget; closes the settings panel.

**3b. User dismisses the settings panel without selecting a type.**
- 3b1. System closes the panel; widget type is unchanged.

**5a. Selected type requires a source (image, file, or webpage) and none has been configured yet.**
- 5a1. System renders the type's empty/placeholder state inside the widget (e.g., "No image selected", "No file selected", "No URL set").
- 5a2. User can proceed to configure the source at their own pace (see UC3, UC4, UC5).

#### Postconditions
- The widget's `type` field reflects the user's selection.
- The widget renders content appropriate to the new type.

---

### Use Case 2: View Current Time on Dashboard

**Primary Actor**: User
**Goal**: See the current local time continuously updated in a dashboard widget without navigating away.

#### Stakeholders & Interests
- **User**: Wants an always-current time display that requires no interaction.
- **System**: Must keep the displayed time accurate and update it automatically.

#### Preconditions
- A widget exists with `type: "clock"`.

#### Trigger
The dashboard renders a widget whose type is "clock".

#### Main Success Scenario
1. System renders the widget using the clock content component.
2. System displays the current local time in a readable format (e.g., HH:MM:SS).
3. System refreshes the displayed time every second.
4. Time remains current for as long as the widget is visible.

#### Extensions

*(none — clock type requires no user interaction and has no meaningful error states)*

#### Postconditions
- The displayed time is within one second of the actual local time.
- Time updates continue automatically while the widget is on screen.

---

### Use Case 3: Display a Personal Image

**Primary Actor**: User
**Goal**: Show a chosen image from the local filesystem inside a dashboard widget.

#### Stakeholders & Interests
- **User**: Wants to pick any image from their computer and have it fill the widget; wants to be able to swap it later without removing the widget.
- **System**: Must render the image within the widget's bounds and preserve the selection.

#### Preconditions
- A widget exists with `type: "image"`.

#### Trigger
User activates the image selection control within the widget (or the widget already has a configured image and the user triggers a change).

#### Main Success Scenario
1. User activates the file-selection control inside the widget.
2. System opens the operating system's file picker, filtered to image file types.
3. User selects an image file and confirms.
4. System reads the selected image and renders it inside the widget, scaled to fit.
5. System retains the image source so the widget re-displays the same image on subsequent renders.

#### Extensions

**3a. User cancels the file picker without selecting a file.**
- 3a1. System leaves the widget in its current state (previously selected image remains, or placeholder if none was set).

**4a. Selected file is not a valid image.**
- 4a1. System displays an error indicator inside the widget ("Cannot display file — not a valid image").
- 4a2. System presents the file-selection control again so the user can choose a different file.

**5a. User wants to replace the current image.**
- 5a1. User activates the file-selection control again; scenario resumes from step 2.

#### Postconditions
- The widget displays the chosen image.
- The image source is retained; the widget shows the same image after page reload.

---

### Use Case 4: Display Contents of a Local File

**Primary Actor**: User
**Goal**: Read the plain-text contents of a chosen local file in a dashboard widget, without leaving the dashboard.

#### Stakeholders & Interests
- **User**: Wants to monitor or reference a local text file (e.g., log, notes, config) at a glance; wants to be able to swap the file without removing the widget.
- **System**: Must read and display the file contents faithfully; must handle unreadable or binary files gracefully.

#### Preconditions
- A widget exists with `type: "file"`.

#### Trigger
User activates the file-selection control within the widget (or the widget already has a configured file and the user triggers a change).

#### Main Success Scenario
1. User activates the file-selection control inside the widget.
2. System opens the operating system's file picker.
3. User selects a file and confirms.
4. System reads the file's text content and renders it as scrollable text inside the widget.
5. System retains the file reference so the widget can re-display the file on subsequent renders.

#### Extensions

**3a. User cancels the file picker.**
- 3a1. System leaves the widget in its current state (previously selected file remains, or placeholder if none was set).

**4a. File cannot be read (access error, binary content, or read failure).**
- 4a1. System displays an error indicator inside the widget ("Cannot display file — check permissions or file type").
- 4a2. System presents the file-selection control so the user can choose a different file.

**5a. User wants to change the displayed file.**
- 5a1. User activates the file-selection control again; scenario resumes from step 2.

#### Postconditions
- The widget displays the text content of the selected file.
- The file reference is retained for subsequent renders.

---

### Use Case 5: Embed a Webpage

**Primary Actor**: User
**Goal**: View a live webpage inline inside a dashboard widget, without opening a separate browser tab.

#### Stakeholders & Interests
- **User**: Wants to monitor a webpage (dashboard, status page, news feed) without context-switching; wants to change the URL without removing the widget.
- **System**: Must load the URL in a sandboxed frame and report clearly if embedding is blocked.

#### Preconditions
- A widget exists with `type: "webpage"`.

#### Trigger
User activates the URL input control within the widget (or the widget already has a configured URL and the user triggers a change).

#### Main Success Scenario
1. User activates the URL input control inside the widget.
2. System presents an editable URL field pre-populated with the current URL (or empty if none is set).
3. User enters or edits the URL and confirms.
4. System loads the URL inside a sandboxed `<iframe>` within the widget.
5. Webpage is displayed; user can interact with the embedded page normally.

#### Extensions

**3a. User confirms without entering a URL.**
- 3a1. System removes the iframe (or keeps it absent) and shows placeholder text ("No URL set").

**3b. User dismisses the URL input without confirming.**
- 3b1. System leaves the widget in its current state.

**4a. The page refuses embedding (X-Frame-Options: DENY or SAMEORIGIN).**
- 4a1. System detects that the iframe failed to load its content.
- 4a2. System displays an error indicator inside the widget ("This page cannot be embedded").
- 4a3. System presents the URL input so the user can try a different URL.

**4b. The URL is malformed or the host is unreachable.**
- 4b1. System shows a generic load-error message inside the widget ("Page could not be loaded").
- 4b2. System presents the URL input so the user can correct or replace the URL.

**5a. User wants to change the URL.**
- 5a1. User activates the URL input control again; scenario resumes from step 2.

#### Postconditions
- The widget displays the specified webpage in a sandboxed frame.
- The URL is retained so the same page loads on subsequent dashboard renders.

---

## Use Case Traceability Mapping

This section provides the centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | User activates the settings control on a widget. |
| UC1-S2 | System opens a settings panel for that widget, showing the currently active type and the four available types (clock, image, file, webpage). |
| UC1-S3 | User selects a content type. |
| UC1-S4 | System updates the widget to the selected type and closes the settings panel. |
| UC1-S5 | Widget renders the new content type immediately (clock starts ticking; image/file/webpage renders its configured source, or its empty state if no source is yet configured). |
| UC1-E3a | User selects the same type that is already active. |
| UC1-E3b | User dismisses the settings panel without selecting a type. |
| UC1-E5a | Selected type requires a source (image, file, or webpage) and none has been configured yet. |
| UC2-S1 | System renders the widget using the clock content component. |
| UC2-S2 | System displays the current local time in a readable format (e.g., HH:MM:SS). |
| UC2-S3 | System refreshes the displayed time every second. |
| UC2-S4 | Time remains current for as long as the widget is visible. |
| UC3-S1 | User activates the file-selection control inside the widget. |
| UC3-S2 | System opens the operating system's file picker, filtered to image file types. |
| UC3-S3 | User selects an image file and confirms. |
| UC3-S4 | System reads the selected image and renders it inside the widget, scaled to fit. |
| UC3-S5 | System retains the image source so the widget re-displays the same image on subsequent renders. |
| UC3-E3a | User cancels the file picker without selecting a file. |
| UC3-E4a | Selected file is not a valid image. |
| UC3-E5a | User wants to replace the current image. |
| UC4-S1 | User activates the file-selection control inside the widget. |
| UC4-S2 | System opens the operating system's file picker. |
| UC4-S3 | User selects a file and confirms. |
| UC4-S4 | System reads the file's text content and renders it as scrollable text inside the widget. |
| UC4-S5 | System retains the file reference so the widget can re-display the file on subsequent renders. |
| UC4-E3a | User cancels the file picker. |
| UC4-E4a | File cannot be read (access error, binary content, or read failure). |
| UC4-E5a | User wants to change the displayed file. |
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

### Mapping Guidelines for Downstream Artifacts
- **Specs**: Reference steps using `**Implements**: UC1-S1 - [description]`
- **Design**: Reference steps using `**Addresses**: UC1-S1 - [description]`
- **Tasks**: Reference steps using `(Addresses: UC1-S1)` or `(Addresses: UC1-S1, UC1-S2)`
