## ADDED Requirements

### Requirement: Widget types are registered via a module-level registry
The system SHALL provide a `WidgetRegistry` module exporting `register(typeKey: string, Component: React.ComponentType)` and `resolve(typeKey: string): React.ComponentType | undefined` functions. The registry SHALL be a module-level singleton `Map` that persists for the lifetime of the application session.

#### Scenario: Registering a valid widget type
- **WHEN** `WidgetRegistry.register("chart", ChartComponent)` is called with a non-empty string key and a valid React component
- **THEN** the mapping is stored and `WidgetRegistry.resolve("chart")` returns `ChartComponent`

#### Scenario: Registry persists across component mounts
- **WHEN** a widget type is registered before the dashboard mounts and the dashboard is unmounted and remounted
- **THEN** `WidgetRegistry.resolve` returns the same component without re-registration

---

### Requirement: Registration validates its inputs and throws on invalid arguments
The system SHALL throw a descriptive error and SHALL NOT store any mapping when `register` is called with an empty or non-string type key, or with a value that is not a React component (function or class with a render method).

#### Scenario: Empty type key throws
- **WHEN** `WidgetRegistry.register("", SomeComponent)` is called
- **THEN** the system throws an error describing that the type key must be a non-empty string and no mapping is stored

#### Scenario: Non-string type key throws
- **WHEN** `WidgetRegistry.register(42, SomeComponent)` is called with a numeric key
- **THEN** the system throws a descriptive error and no mapping is stored

#### Scenario: Non-component value throws
- **WHEN** `WidgetRegistry.register("table", "not-a-component")` is called
- **THEN** the system throws a descriptive error and no mapping is stored

---

### Requirement: Registering a duplicate type key overwrites the previous mapping with a warning
The system SHALL overwrite the existing mapping when `register` is called with a type key that is already present in the registry. The system SHALL emit a `console.warn` identifying the overwritten key before overwriting.

#### Scenario: Duplicate key overwrites with warning
- **WHEN** `WidgetRegistry.register("chart", NewChartComponent)` is called after `"chart"` was already registered
- **THEN** a console warning is emitted naming the duplicate key and `WidgetRegistry.resolve("chart")` subsequently returns `NewChartComponent`

---

### Requirement: The dashboard resolves widget components from the registry at render time
The system SHALL call `WidgetRegistry.resolve(descriptor.type)` for each widget in the layout during the `DashboardGrid` render cycle. Resolved components SHALL be rendered inside the widget shell, receiving `widgetId`, `config`, and grid-position props.

#### Scenario: Registered widget renders its component
- **WHEN** the layout contains a widget descriptor with type `"metric"` and `"metric"` is registered
- **THEN** the registered `MetricComponent` is rendered inside the widget shell at the widget's grid position

#### Scenario: Registered component receives correct props
- **WHEN** a widget with `id="w1"`, `type="chart"`, and `config={color: "blue"}` is rendered
- **THEN** the resolved `ChartComponent` receives `widgetId="w1"` and `config={color: "blue"}` as props

---

### Requirement: Widgets with unresolvable type keys render a fallback error tile
The system SHALL render a fallback error tile when `WidgetRegistry.resolve` returns `undefined` for a widget's type key. The error tile SHALL display the unrecognised type key string. The system SHALL emit a `console.warn` identifying the missing type key.

#### Scenario: Unknown type renders error tile
- **WHEN** a widget descriptor references type key `"unknown-widget"` and no such key exists in the registry
- **THEN** an error tile is rendered in that widget's slot displaying `"unknown-widget"`, and a console warning is emitted

#### Scenario: Error boundary isolates component render errors
- **WHEN** a registered component throws an error during its render
- **THEN** the React error boundary wrapping the widget shell catches the error and renders an error tile for that widget only, without affecting other widgets
