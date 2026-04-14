## ADDED Requirements

### Requirement: Widget types are registered via a module-level singleton
The system SHALL expose a `WidgetRegistry` singleton object with `register`, `get`, and `list` methods. Widget types SHALL be stored in an internal `Map<string, RegistryEntry>`. The registry SHALL be importable from any module without requiring a React provider.

```ts
interface RegistryEntry {
  component: React.ComponentType<WidgetProps>;
  displayName: string;
  defaultSize: { w: number; h: number };
}
```

#### Scenario: Registry is available as a module import
- **WHEN** any module imports `WidgetRegistry`
- **THEN** the same singleton instance is returned regardless of how many times it is imported

---

### Requirement: Register validates and stores a widget type
`WidgetRegistry.register(key, entry)` SHALL validate that `key` is a non-empty string, `entry.component` is a valid React component, `entry.displayName` is a non-empty string, and `entry.defaultSize.w` and `entry.defaultSize.h` are both positive integers. On success, the entry SHALL be stored keyed by `key`.

#### Scenario: Valid widget type is registered
- **WHEN** `WidgetRegistry.register("chart", { component: ChartWidget, displayName: "Chart", defaultSize: { w: 4, h: 3 } })` is called
- **THEN** the entry is stored and `WidgetRegistry.get("chart")` returns the entry

#### Scenario: Duplicate key rejected
- **WHEN** `WidgetRegistry.register` is called with a `key` that already exists in the registry
- **THEN** a `RegistrationError` is thrown with the message `"Widget type '<key>' is already registered"`

#### Scenario: Empty key rejected
- **WHEN** `key` is an empty string or not a string
- **THEN** a `RegistrationError` is thrown with a descriptive message and no entry is stored

#### Scenario: Invalid component rejected
- **WHEN** `entry.component` is not a valid React component (e.g., a plain string, number, or `null`)
- **THEN** a `RegistrationError` is thrown and no entry is stored

#### Scenario: Non-positive defaultSize rejected
- **WHEN** `entry.defaultSize.w` or `entry.defaultSize.h` is `0`, negative, or non-integer
- **THEN** a `RegistrationError` is thrown and no entry is stored

---

### Requirement: Registry lookup returns a registered entry or undefined
`WidgetRegistry.get(key)` SHALL return the `RegistryEntry` for the given key, or `undefined` if the key has not been registered.

#### Scenario: Lookup returns registered entry
- **WHEN** `WidgetRegistry.get("chart")` is called after registering the "chart" type
- **THEN** the previously registered `RegistryEntry` is returned

#### Scenario: Lookup returns undefined for unknown key
- **WHEN** `WidgetRegistry.get("unknown-type")` is called
- **THEN** `undefined` is returned

---

### Requirement: Add Widget to Dashboard places a new widget instance on the grid
The system SHALL allow the Dashboard User to add a widget instance by selecting a type from the widget palette. The system SHALL look up the type in `WidgetRegistry`, find the first unoccupied cell range that fits the widget's `defaultSize`, create a new `LayoutItem` with a unique `id`, and invoke `onLayoutChange` with the updated layout.

#### Scenario: Add Widget to Dashboard — happy path
- **WHEN** the user selects a registered widget type from the palette and confirms placement
- **THEN** a new layout entry is created at the first available grid position, the widget renders on the dashboard, and `onLayoutChange` is invoked with the updated layout

#### Scenario: Unregistered type selected
- **WHEN** the user attempts to add a widget type that is not found in the registry
- **THEN** an error notification is shown and no layout change is made

#### Scenario: Dashboard full
- **WHEN** no unoccupied cell range of sufficient size exists on the grid
- **THEN** the system displays a notification that the dashboard is full and no layout change is made

#### Scenario: New widget gets unique instance ID
- **WHEN** the same widget type is added to the dashboard twice
- **THEN** each instance has a distinct `id` value in the layout array

---

### Requirement: Remove Widget from Dashboard removes the instance from the layout
The system SHALL allow the Dashboard User to remove a widget instance by activating its remove control. The system SHALL request user confirmation before removing. On confirmation, the layout entry SHALL be removed from the layout state, the widget component SHALL be unmounted, and `onLayoutChange` SHALL be invoked.

#### Scenario: Remove Widget from Dashboard — happy path
- **WHEN** the user activates the remove control on a widget and confirms the confirmation prompt
- **THEN** the widget is removed from the layout, its grid cells are freed, and `onLayoutChange` is invoked with the updated layout (widget omitted)

#### Scenario: Remove cancelled at confirmation
- **WHEN** the user activates the remove control but then cancels the confirmation prompt
- **THEN** no layout change is made and the widget remains on the dashboard

#### Scenario: Widget type remains in registry after removal
- **WHEN** a widget instance is removed from the dashboard
- **THEN** `WidgetRegistry.get` for that widget's type still returns its `RegistryEntry` and the type can be re-added

#### Scenario: Widget already absent from layout on remove
- **WHEN** the widget to be removed is no longer present in the layout at the time of removal
- **THEN** the system performs a no-op and invokes `onLayoutChange` with the current unmodified layout
