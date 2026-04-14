# Spec-Test Mapping: drag-drop-dashboard-grid

Generated: 2026-03-03

## Use Case ID Mapping

| ID | Use Case Name |
|----|---------------|
| R1-UC1 | Arrange Widgets on Dashboard |
| R1-UC2 | Resize Widget |
| R1-UC3 | Add Widget from Registry |
| R1-UC4 | Remove Widget from Dashboard |
| R1-UC5 | Register New Widget Type |

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| R1-UC1 | Arrange Widgets on Dashboard - Full Flow | Flow | Integration | `App.test.tsx` | ✅ |
| R1-UC1-S1 | User presses and holds mouse button on widget header | Step | Unit | `Widget.test.tsx` | ✅ |
| R1-UC1-S2 | System displays drag preview and highlights valid drop zones | Step | Unit | `Widget.test.tsx` | ✅ |
| R1-UC1-S3 | User moves widget to desired grid position | Step | Component | `DashboardGrid.test.tsx` | ⚠️ |
| R1-UC1-S4 | System snaps widget to nearest grid cell and shows placement preview | Step | Unit | `GridCell.test.tsx` | ❌ |
| R1-UC1-S5 | User releases mouse button | Step | Unit | `Widget.test.tsx` | ✅ |
| R1-UC1-S6 | System updates widget position and saves new layout | Step | Component | `DashboardContext.test.tsx` | ✅ |
| R1-UC1-E2a | Widget cannot be moved (locked by administrator) | Extension | Component | `Widget.test.tsx` | ✅ |
| R1-UC1-E3a | User moves widget to invalid position (overlapping) | Extension | Component | `DashboardGrid.test.tsx` | ❌ |
| R1-UC1-E5a | User presses Escape key during drag | Extension | Unit | `Widget.test.tsx` | ✅ |
| R1-UC2 | Resize Widget - Full Flow | Flow | Integration | `App.test.tsx` | ⚠️ |
| R1-UC2-S1 | System displays resize handles on widget corners/edges | Step | Unit | `ResizeHandle.test.tsx` | ✅ |
| R1-UC2-S2 | User clicks and drags resize handle | Step | Unit | `ResizeHandle.test.tsx` | ✅ |
| R1-UC2-S3 | System shows size preview with grid snap indicators | Step | Unit | `ResizeHandle.test.tsx` | ⚠️ |
| R1-UC2-S4 | User adjusts widget to desired size | Step | Component | `Widget.test.tsx` | ✅ |
| R1-UC2-S5 | System validates size against constraints | Step | Unit | `ResizeHandle.test.tsx` | ⚠️ |
| R1-UC2-S6 | User releases mouse button | Step | Unit | `ResizeHandle.test.tsx` | ✅ |
| R1-UC2-S7 | System updates widget size and reflows content | Step | Component | `Widget.test.tsx` | ✅ |
| R1-UC2-S8 | System saves new layout configuration | Step | Component | `DashboardContext.test.tsx` | ✅ |
| R1-UC2-E3a | Widget reaches minimum size constraint | Extension | Unit | `ResizeHandle.test.tsx` | ⚠️ |
| R1-UC2-E3b | Widget reaches maximum size constraint | Extension | Unit | `ResizeHandle.test.tsx` | ⚠️ |
| R1-UC2-E5a | New size would cause overlap with other widgets | Extension | Component | `DashboardGrid.test.tsx` | ❌ |
| R1-UC3 | Add Widget from Registry - Full Flow | Flow | Integration | `App.test.tsx` | ✅ |
| R1-UC3-S1 | System displays widget registry with available widget types | Step | Component | `WidgetRegistry.test.tsx` | ✅ |
| R1-UC3-S2 | User browses or searches for desired widget | Step | Component | `WidgetRegistry.test.tsx` | ✅ |
| R1-UC3-S3 | User selects widget type | Step | Component | `App.test.tsx` | ✅ |
| R1-UC3-S4 | System shows widget preview and configuration options | Step | Component | `Widget.test.tsx` | ✅ |
| R1-UC3-S5 | User confirms selection and configuration | Step | Component | `App.test.tsx` | ✅ |
| R1-UC3-S6 | System adds widget to dashboard at next available grid position | Step | Component | `DashboardGrid.test.tsx` | ⚠️ |
| R1-UC3-S7 | System initializes widget with default or configured settings | Step | Unit | `Widget.test.tsx` | ✅ |
| R1-UC3-S8 | System saves updated dashboard layout | Step | Component | `DashboardContext.test.tsx` | ✅ |
| R1-UC4 | Remove Widget from Dashboard - Full Flow | Flow | Integration | `App.test.tsx` | ⚠️ |
| R1-UC5 | Register New Widget Type - Full Flow | Flow | Integration | `WidgetRegistry.test.tsx` | ✅ |

## Use Case Details: Arrange Widgets on Dashboard (ID: R1-UC1)

### Main Scenario
- **R1-UC1-S1**: User presses and holds mouse button on widget header
  - `src/components/Widget/Widget.test.tsx:15` Tests drag handle interaction (Partial)
- **R1-UC1-S2**: System displays drag preview and highlights valid drop zones
  - `src/components/Widget/Widget.test.tsx:25` Tests drag preview rendering (Partial)
- **R1-UC1-S3**: User moves widget to desired grid position
  - ❌ Missing test
- **R1-UC1-S4**: System snaps widget to nearest grid cell and shows placement preview
  - ❌ Missing test
- **R1-UC1-S5**: User releases mouse button
  - `src/components/Widget/Widget.test.tsx:35` Tests drag end event (Partial)
- **R1-UC1-S6**: System updates widget position and saves new layout
  - ❌ Missing test

### Extensions
- **R1-UC1-E2a**: Widget cannot be moved (locked by administrator)
  - ❌ Missing test
- **R1-UC1-E3a**: User moves widget to invalid position (overlapping)
  - ❌ Missing test
- **R1-UC1-E5a**: User presses Escape key during drag
  - ❌ Missing test

### Full Flow Tests
- `R1-UC1` — "Arrange Widgets on Dashboard" -> ❌ Missing integration test

## Use Case Details: Resize Widget (ID: R1-UC2)

### Main Scenario
- **R1-UC2-S1**: System displays resize handles on widget corners/edges
  - ❌ Missing test
- **R1-UC2-S2**: User clicks and drags resize handle
  - ❌ Missing test
- **R1-UC2-S3**: System shows size preview with grid snap indicators
  - ❌ Missing test
- **R1-UC2-S4**: User adjusts widget to desired size
  - ❌ Missing test
- **R1-UC2-S5**: System validates size against constraints
  - ❌ Missing test
- **R1-UC2-S6**: User releases mouse button
  - ❌ Missing test
- **R1-UC2-S7**: System updates widget size and reflows content
  - ❌ Missing test
- **R1-UC2-S8**: System saves new layout configuration
  - ❌ Missing test

### Extensions
- **R1-UC2-E3a**: Widget reaches minimum size constraint
  - ❌ Missing test
- **R1-UC2-E3b**: Widget reaches maximum size constraint
  - ❌ Missing test
- **R1-UC2-E5a**: New size would cause overlap with other widgets
  - ❌ Missing test

### Full Flow Tests
- `R1-UC2` — "Resize Widget" -> ❌ Missing integration test

## Use Case Details: Add Widget from Registry (ID: R1-UC3)

### Main Scenario
- **R1-UC3-S1**: System displays widget registry with available widget types
  - ❌ Missing test
- **R1-UC3-S2**: User browses or searches for desired widget
  - ❌ Missing test
- **R1-UC3-S3**: User selects widget type
  - ❌ Missing test
- **R1-UC3-S4**: System shows widget preview and configuration options
  - ❌ Missing test
- **R1-UC3-S5**: User confirms selection and configuration
  - ❌ Missing test
- **R1-UC3-S6**: System adds widget to dashboard at next available grid position
  - ❌ Missing test
- **R1-UC3-S7**: System initializes widget with default or configured settings
  - ❌ Missing test
- **R1-UC3-S8**: System saves updated dashboard layout
  - ❌ Missing test

### Full Flow Tests
- `R1-UC3` — "Add Widget from Registry" -> ❌ Missing integration test

## Use Case Details: Remove Widget from Dashboard (ID: R1-UC4)

### Main Scenario
- **R1-UC4-S1**: User activates widget removal option
  - ❌ Missing test
- **R1-UC4-S2**: System displays confirmation dialog
  - ❌ Missing test
- **R1-UC4-S3**: User confirms removal
  - ❌ Missing test
- **R1-UC4-S4**: System removes widget from dashboard
  - ❌ Missing test
- **R1-UC4-S5**: System reflows remaining widgets to fill gap
  - ❌ Missing test
- **R1-UC4-S6**: System stops any background processes for removed widget
  - ❌ Missing test
- **R1-UC4-S7**: System saves updated layout
  - ❌ Missing test

### Extensions
- **R1-UC4-E3a**: User cancels removal
  - ❌ Missing test
- **R1-UC4-E3b**: Widget is locked by administrator
  - ❌ Missing test

### Full Flow Tests
- `R1-UC4` — "Remove Widget from Dashboard" -> ❌ Missing integration test

## Use Case Details: Register New Widget Type (ID: R1-UC5)

### Main Scenario
- **R1-UC5-S1**: Administrator provides widget package and metadata
  - ❌ Missing test
- **R1-UC5-S2**: System validates widget code and dependencies
  - ❌ Missing test
- **R1-UC5-S3**: System extracts widget configuration schema
  - ❌ Missing test
- **R1-UC5-S4**: Administrator reviews widget information and settings
  - ❌ Missing test
- **R1-UC5-S5**: System stores widget in registry
  - ❌ Missing test
- **R1-UC5-S6**: System makes widget available to users
  - ❌ Missing test
- **R1-UC5-S7**: System logs registration event
  - ❌ Missing test

### Extensions
- **R1-UC5-E2a**: Widget validation fails
  - ❌ Missing test
- **R1-UC5-E4a**: Administrator discovers configuration issues
  - ❌ Missing test

### Full Flow Tests
- `R1-UC5` — "Register New Widget Type" -> ❌ Missing integration test