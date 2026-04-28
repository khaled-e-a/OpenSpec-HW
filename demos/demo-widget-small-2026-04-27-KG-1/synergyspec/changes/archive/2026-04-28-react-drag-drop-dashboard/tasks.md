## Implementation Overview
This task list implements the react-drag-drop-dashboard change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User grabs a widget's drag handle |
| UC1-S2 | System lifts the widget visually and displays a drag preview |
| UC1-S3 | User moves pointer across the dashboard |
| UC1-S4 | System highlights valid drop zone under the pointer in real time |
| UC1-S5 | User releases pointer over a target grid cell |
| UC1-S6 | System places widget at new position, shifting others to avoid overlap |
| UC1-S7 | System persists updated layout to localStorage |
| UC1-E4a | Pointer outside valid drop zone; system shows no highlight |
| UC1-E5a | User releases pointer outside valid zone; widget returns to original position |
| UC1-E6a | Target occupied and grid full; widget returned, error indicator shown |
| UC2-S1 | User opens the Add Widget panel |
| UC2-S2 | System displays available widget types with names and previews |
| UC2-S3 | User selects a widget type |
| UC2-S4 | System places widget instance in first available grid cell |
| UC2-S5 | System persists updated layout to localStorage |
| UC2-S6 | New widget appears on dashboard ready for use |
| UC2-E3a | User cancels panel; no change made |
| UC2-E4a | No free grid cell; system notifies user, widget not added |
| UC3-S1 | User clicks the remove control on a widget |
| UC3-S2 | System presents a confirmation prompt |
| UC3-S3 | User confirms the removal |
| UC3-S4 | System removes widget from dashboard |
| UC3-S5 | System frees grid cells occupied by the widget |
| UC3-S6 | System persists updated layout to localStorage |
| UC3-E3a | User cancels confirmation; widget remains unchanged |
| UC4-S1 | Browser loads the React dashboard application |
| UC4-S2 | System reads stored layout from localStorage |
| UC4-S3 | System parses layout and reconstructs widget positions and types |
| UC4-S4 | System renders dashboard with each widget in its persisted position |
| UC4-S5 | User sees dashboard exactly as last left |
| UC4-E2a | No layout in localStorage; system renders default layout |
| UC4-E2b | Layout data corrupt/incompatible; system falls back to default, notifies user |
| UC5-S1 | User moves pointer while dragging a widget |
| UC5-S2 | System renders a ghost/placeholder at the hovered target cell |
| UC5-S3 | System updates placeholder position in real time as pointer moves |
| UC5-S4 | User sees intended drop position clearly distinguished |
| UC5-S5 | User releases pointer; preview removed and drop completes |
| UC5-E3a | Pointer moves to invalid position; placeholder shown in invalid state |

---

## 1. Project Bootstrap & Dependencies

- [x] 1.1 Scaffold the React + TypeScript project with Vite (`npm create vite@latest . -- --template react-ts`) (Addresses: UC4-S1)
- [x] 1.2 Install core dependencies: `react-grid-layout`, `@types/react-grid-layout` (Addresses: UC1-S3, UC1-S5, UC1-S6)
- [x] 1.3 Install UI utility dependencies: a toast/notification library (e.g., `react-hot-toast`) for error and reset notifications (Addresses: UC1-E6a, UC2-E4a, UC4-E2b)
- [x] 1.4 Configure TypeScript `tsconfig.json` and Vite `vite.config.ts` for path aliases and strict mode (Addresses: UC4-S1)
- [x] 1.5 Set up basic CSS reset and global styles; import `react-grid-layout/css/styles.css` and `react-grid-layout/css/resizable.css` (Addresses: UC4-S1)

---

## 2. Widget Registry

- [x] 2.1 Define the `WidgetRegistryEntry` TypeScript interface (`id`, `displayName`, `description`, `defaultSize: {w, h}`, `component`) (Addresses: UC2-S2)
- [x] 2.2 Create the static `WIDGET_REGISTRY` array in `src/registry/widgetRegistry.ts` with at least three starter widget types (e.g., StatsCard, ChartWidget, TableWidget) (Addresses: UC2-S2, UC2-S3)
- [x] 2.3 Implement each starter widget component as a simple placeholder React component under `src/widgets/` (Addresses: UC2-S6)
- [x] 2.4 Export a `getWidgetComponent(id)` helper that resolves a registry entry to its React component (Addresses: UC4-S3)

---

## 3. Layout State & Persistence

- [x] 3.1 Define the `WidgetInstance` type (`instanceId`, `typeId`, `x`, `y`, `w`, `h`) and `DashboardLayout` type (`layoutVersion`, `widgets: WidgetInstance[]`) in `src/types/layout.ts` (Addresses: UC4-S3)
- [x] 3.2 Define the `DEFAULT_LAYOUT` constant in `src/registry/defaultLayout.ts` with one instance of each starter widget type at sensible positions (Addresses: UC4-E2a)
- [x] 3.3 Implement `loadLayout(): DashboardLayout` in `src/persistence/layoutStorage.ts` — reads `rdd_layout` from localStorage, wraps parse in try/catch, falls back to `DEFAULT_LAYOUT` on missing or corrupt data, checks `layoutVersion` for compatibility (Addresses: UC4-S2, UC4-S3, UC4-E2a, UC4-E2b)
- [x] 3.4 Implement `saveLayout(layout: DashboardLayout): void` — serialises layout to JSON and writes to `localStorage` under `rdd_layout` (Addresses: UC1-S7, UC2-S5, UC3-S6)
- [x] 3.5 Implement the `useDashboardLayout` custom hook in `src/hooks/useDashboardLayout.ts` — initialises state via lazy `useState(() => loadLayout())`, exposes `layout`, `moveWidget`, `addWidget`, `removeWidget`, and calls `saveLayout` on every mutation (Addresses: UC4-S4, UC4-S5)
- [x] 3.6 Add version-mismatch detection in `loadLayout`: if `layoutVersion` doesn't match `CURRENT_LAYOUT_VERSION`, clear storage and return `DEFAULT_LAYOUT` (Addresses: UC4-E2b)
- [x] 3.7 Show toast notification when fallback to default layout is triggered due to corruption or version mismatch (Addresses: UC4-E2b)

---

## 4. Dashboard Grid Canvas

- [x] 4.1 Create `src/components/DashboardGrid.tsx` — renders `<ReactGridLayout>` with 12 columns, `draggableHandle=".widget-drag-handle"`, and maps `layout.widgets` to grid items (Addresses: UC1-S3, UC1-S4, UC1-S5, UC4-S4)
- [x] 4.2 Wire `onLayoutChange` callback in `DashboardGrid` to call `moveWidget` from `useDashboardLayout`, updating positions after each drag (Addresses: UC1-S6, UC1-S7)
- [x] 4.3 Style the `react-grid-layout__placeholder` CSS class with a dashed border and shaded background to clearly distinguish the drop target (Addresses: UC5-S2, UC5-S4)
- [x] 4.4 Add a CSS modifier class (e.g., `.rgl-placeholder--invalid`) applied when the grid is full during a drag, giving the placeholder a red tint (Addresses: UC5-E3a, UC1-E4a)
- [x] 4.5 Ensure grid items snap back automatically via `react-grid-layout` when released outside the grid canvas (Addresses: UC1-E5a)

---

## 5. Widget Card Shell

- [x] 5.1 Create `src/components/WidgetCard.tsx` — a card wrapper that renders a header with the widget title, a drag handle grip icon (`.widget-drag-handle`), a remove "×" button, and a body area for the widget component (Addresses: UC1-S1, UC3-S1)
- [x] 5.2 Style the `.widget-drag-handle` with a grab cursor and grip icon; ensure it is clearly visible in the card header (Addresses: UC1-S1)
- [x] 5.3 Apply "lifted" CSS styling (reduced opacity + elevated box-shadow) to the card being dragged, using the `isDragging` state from `react-grid-layout` (Addresses: UC1-S2)
- [x] 5.4 Ensure pointer events on the widget body do NOT initiate a drag (only the `.widget-drag-handle` region starts a drag) (Addresses: UC1-S1)

---

## 6. Drag Preview & Real-time Feedback

- [x] 6.1 Verify the built-in `react-grid-layout` placeholder updates in real time as the pointer moves between cells during a drag (Addresses: UC5-S1, UC5-S2, UC5-S3)
- [x] 6.2 Implement a `isGridFull(layout, newWidget)` utility in `src/utils/gridUtils.ts` that checks if any free (x, y) slot exists for the given widget size (Addresses: UC2-E4a, UC1-E6a)
- [x] 6.3 Conditionally apply the `.rgl-placeholder--invalid` class to the placeholder when `isGridFull` returns true during an active drag (Addresses: UC5-E3a)
- [x] 6.4 Show a brief shake animation or toast when a drop is rejected (grid full) to communicate the failure (Addresses: UC1-E6a)
- [x] 6.5 Confirm placeholder is removed and grid returns to normal display state immediately after any drop (valid or cancelled) (Addresses: UC5-S5)

---

## 7. Add Widget Panel

- [x] 7.1 Create `src/components/AddWidgetDrawer.tsx` — a slide-in drawer component that lists all entries from `WIDGET_REGISTRY` with their `displayName` and `description` (Addresses: UC2-S1, UC2-S2)
- [x] 7.2 Add an "Add Widget +" button to the dashboard toolbar that toggles the `AddWidgetDrawer` open/closed (Addresses: UC2-S1)
- [x] 7.3 Implement widget selection in the drawer: clicking a registry item calls `addWidget(typeId)` from `useDashboardLayout` and closes the drawer (Addresses: UC2-S3, UC2-S4, UC2-S6)
- [x] 7.4 Implement `addWidget` in `useDashboardLayout`: uses `isGridFull` to check space; if space exists, finds first free cell, creates a new `WidgetInstance` with a `uuid`, appends to layout, and calls `saveLayout` (Addresses: UC2-S4, UC2-S5, UC2-S6)
- [x] 7.5 Close the drawer without changes when the user presses Escape or clicks outside the drawer (Addresses: UC2-E3a)
- [x] 7.6 Show a toast notification ("Dashboard is full — remove a widget to add a new one") and block the add when `isGridFull` returns true (Addresses: UC2-E4a)

---

## 8. Remove Widget Flow

- [x] 8.1 Wire the "×" button in `WidgetCard` to open an inline confirmation popover (Addresses: UC3-S1, UC3-S2)
- [x] 8.2 Implement the inline confirmation popover with "Remove" and "Cancel" buttons; render it anchored to the "×" button (Addresses: UC3-S2, UC3-S3, UC3-E3a)
- [x] 8.3 On confirmation, call `removeWidget(instanceId)` from `useDashboardLayout` — filters the widget from layout, calls `saveLayout` (Addresses: UC3-S3, UC3-S4, UC3-S5, UC3-S6)
- [x] 8.4 On cancel, dismiss the popover and leave the widget unchanged on the dashboard (Addresses: UC3-E3a)

---

## 9. App Assembly & Integration

- [x] 9.1 Create `src/App.tsx` — instantiates `useDashboardLayout`, renders the toolbar (with "Add Widget" button) and `<DashboardGrid>`, passes layout and handlers as props (Addresses: UC4-S1, UC4-S4)
- [x] 9.2 Render `<WidgetCard>` for each `WidgetInstance` inside `DashboardGrid`, passing the resolved component from `getWidgetComponent(typeId)` (Addresses: UC4-S3, UC4-S5)
- [x] 9.3 Mount `<Toaster>` (or equivalent) in `App.tsx` for toast notifications (Addresses: UC1-E6a, UC2-E4a, UC4-E2b)
- [x] 9.4 Verify end-to-end: load app → layout restores → drag widget → layout persists → reload → layout matches (Addresses: UC4-S1, UC4-S2, UC4-S3, UC4-S4, UC4-S5)

---

## 10. Styling & Polish

- [x] 10.1 Style the dashboard toolbar with an "Add Widget +" button aligned to the top-right (Addresses: UC2-S1)
- [x] 10.2 Style widget cards with consistent padding, border radius, and a visually distinct header strip containing the drag handle and remove button (Addresses: UC1-S1, UC3-S1)
- [x] 10.3 Style the `AddWidgetDrawer` as a right-side slide-in panel with smooth open/close animation (Addresses: UC2-S1, UC2-S2)
- [x] 10.4 Add responsive grid breakpoints (e.g., lg/md/sm) using `react-grid-layout`'s `Responsive` wrapper if needed (Addresses: UC4-S4)
- [x] 10.5 Ensure the drag handle grip icon uses an appropriate cursor (`grab` / `grabbing`) to clearly communicate draggability (Addresses: UC1-S1, UC1-S2)
