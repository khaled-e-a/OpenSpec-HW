## ADDED Requirements

### Requirement: Widget type registration

The system SHALL provide a `registerWidget(id, definition)` function that adds a widget type to the global registry. Each registration SHALL declare:
- `id` — unique kebab-case string identifier
- `component` — the React component to render as the widget body
- `defaultW` / `defaultH` — default size in grid units
- `minW` / `minH` — minimum allowed size in grid units
- Optionally `maxW` / `maxH` — maximum allowed size in grid units

#### Scenario: Widget type registered successfully
- **WHEN** `registerWidget('metric-card', definition)` is called with a valid definition
- **THEN** the registry SHALL contain an entry keyed `'metric-card'`

#### Scenario: Duplicate registration overwrites previous
- **WHEN** `registerWidget` is called with an ID that already exists
- **THEN** the new definition SHALL replace the previous one

---

### Requirement: Render registered widget content

The system SHALL look up the widget's `type` in the registry when rendering a `WidgetWrapper` and render the associated component inside the widget shell. The component SHALL receive the widget's `id` and current layout (`{ x, y, w, h }`) as props.

#### Scenario: Known widget type renders content
- **WHEN** a `WidgetLayout` with `type: 'metric-card'` is in the layout
- **THEN** the `MetricCard` component registered under `'metric-card'` SHALL be rendered inside the widget

#### Scenario: Widget receives layout props
- **WHEN** a widget with `{ w: 4, h: 2 }` is rendered
- **THEN** the registered component SHALL receive `w=4` and `h=2` in its props

---

### Requirement: Error placeholder for unknown widget type

The system SHALL render a visible error placeholder in place of the widget body when the `type` is not found in the registry. The placeholder SHALL display the unknown type string so developers can diagnose misconfiguration.

#### Scenario: Unknown type shows placeholder
- **WHEN** a `WidgetLayout` has `type: 'unknown-widget'` and no such type is registered
- **THEN** a placeholder element SHALL be shown with text identifying `'unknown-widget'` as unrecognised

#### Scenario: Placeholder does not crash the grid
- **WHEN** one widget has an unknown type
- **THEN** all other widgets SHALL continue to render and be interactive

---

### Requirement: Default widget sizes applied on add

The system SHALL use the registered `defaultW` and `defaultH` values when placing a new widget via `addWidget(type)`. If the widget type is not registered at the time of the call, the operation SHALL be a no-op and an error SHALL be logged to the console.

#### Scenario: Default size used for new widget
- **WHEN** `addWidget('bar-chart')` is called and `'bar-chart'` declares `defaultW: 4, defaultH: 3`
- **THEN** the new widget SHALL be placed with `w=4, h=3`

#### Scenario: addWidget with unregistered type is rejected
- **WHEN** `addWidget('ghost-type')` is called and `'ghost-type'` is not registered
- **THEN** no widget SHALL be added to the layout and a console error SHALL be emitted

---

### Requirement: Widget shell with header controls

Each widget rendered on the grid SHALL be wrapped in a shell that provides:
- A drag handle area in the header
- A remove button (×) in the header
- A content area where the registered component renders

The shell SHALL not dictate the visual styling beyond layout structure; consumers can style via CSS.

#### Scenario: Drag handle present
- **WHEN** any registered widget is rendered
- **THEN** a drag handle element SHALL be present in the widget header

#### Scenario: Remove button present
- **WHEN** any registered widget is rendered
- **THEN** a × remove button SHALL be present in the widget header

#### Scenario: Content area renders registered component
- **WHEN** any registered widget is rendered
- **THEN** the registered component SHALL appear in the content area below the header

---

## Use Case Requirements

### UC-04: Add Widget to Dashboard

**Name**: Add a New Widget to the Grid

**Actors**: Dashboard user

**Preconditions**:
- The dashboard is rendered
- At least one registered widget type is available

**Trigger**: The user selects a widget type from a widget picker / add menu

**Main Scenario**:
1. User opens the widget picker and selects a widget type
2. The system places the widget at the first available grid position that fits the widget's default size
3. The new widget renders on the grid with a brief entrance animation

**Alternative Flows**:
- A1: No contiguous space fits the default size → the grid expands vertically to accommodate the new widget

**Exception / Error Flows**:
- E1: Unknown widget type ID → an error placeholder is shown in place of the widget body

**Postconditions**:
- The new widget appears on the grid
- Layout state is updated to include the new widget entry
