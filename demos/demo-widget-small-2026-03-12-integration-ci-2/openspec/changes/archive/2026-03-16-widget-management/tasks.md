## Implementation Overview
This task list implements the widget-management change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

| Step | Description |
|------|-------------|
| UC1-S1 | User opens the widget catalogue |
| UC1-S2 | System displays available widgets not currently on the grid |
| UC1-S3 | User selects a widget from the catalogue |
| UC1-S4 | System finds the first available grid position for the new widget |
| UC1-S5 | System places the widget at that position with a default size |
| UC1-S6 | System closes the catalogue |
| UC1-S7 | System persists the updated layout to local storage |
| UC1-E2a1 | System displays an empty catalogue when all widgets are already on the grid |
| UC1-E4a1 | System displays an error when no grid space is available for the new widget |
| UC1-E4a2 | System does not add the widget when no space is available |
| UC2-S1 | User hovers over a widget; remove control becomes visible |
| UC2-S2 | User clicks the remove control on the target widget |
| UC2-S3 | System removes the widget from the grid |
| UC2-S4 | System leaves remaining widgets in their current positions |
| UC2-S5 | System persists the updated layout to local storage |
| UC2-E2a1 | System removes the widget immediately without a confirmation dialog |
| UC2-E2a2 | Removed widget becomes available again in the catalogue |
| UC2-E3a1 | System removes the last widget, leaving an empty grid |
| UC2-E3a2 | System persists the empty layout |

---

## 1. Types & Utilities

- [x] 1.1 Confirm `WidgetLayout` type in `src/types.ts` has `id`, `col`, `row`, `w`, `h` fields — no schema change needed (Addresses: UC1-S5)
- [x] 1.2 Add `findFirstAvailablePosition(layout, widgetId, w, h): { col, row } | null` utility to `src/utils/placement.ts` using first-fit scan with `isValidPlacement` (Addresses: UC1-S4, UC1-E4a2)

---

## 2. Hook — useDashboardLayout

- [x] 2.1 Add `addWidget(widgetId: string): boolean` action to `useDashboardLayout`: calls `findFirstAvailablePosition`, appends new `WidgetLayout` with default size `w=4, h=2`, calls `localStorage.setItem`, returns `true`; returns `false` without mutating if no space found (Addresses: UC1-S4, UC1-S5, UC1-S7, UC1-E4a2)
- [x] 2.2 Add `removeWidget(widgetId: string): void` action to `useDashboardLayout`: filters the layout array to exclude the target widget, calls `localStorage.setItem` (Addresses: UC2-S3, UC2-S4, UC2-S5, UC2-E3a1, UC2-E3a2)

---

## 3. Widget Component — Remove Control

- [x] 3.1 Add `onRemove?: () => void` prop to `Widget` component (Addresses: UC2-S2)
- [x] 3.2 Render a `×` remove button in the top-right corner of the widget with `opacity: 0` at rest and `opacity: 1` on widget hover, using the same CSS transition pattern as the existing resize handle (Addresses: UC2-S1, UC2-E2a1)
- [x] 3.3 Wire the remove button's `onClick` to call `onRemove()` when provided; stop propagation so it does not trigger drag (Addresses: UC2-S2, UC2-E2a1)

---

## 4. DashboardGrid — Catalogue UI

- [x] 4.1 Add local `isCatalogueOpen: boolean` state to `DashboardGrid` (Addresses: UC1-S1, UC1-S6)
- [x] 4.2 Render an "Add widget" button in the dashboard header that toggles `isCatalogueOpen` (Addresses: UC1-S1)
- [x] 4.3 When `isCatalogueOpen` is true, render an inline catalogue panel that derives the available widget list as `WIDGET_REGISTRY.filter(w => !layout.some(l => l.id === w.id))` (Addresses: UC1-S2, UC1-E2a1, UC2-E2a2)
- [x] 4.4 When the available widget list is empty, display a message: "All widgets are already on the dashboard" (Addresses: UC1-E2a1)
- [x] 4.5 Render each available widget as a clickable entry in the catalogue; on click, call `addWidget(widgetId)` (Addresses: UC1-S3)
- [x] 4.6 If `addWidget` returns `false`, display an inline error: "Not enough space to add this widget" without closing the catalogue (Addresses: UC1-E4a1, UC1-E4a2)
- [x] 4.7 If `addWidget` returns `true`, close the catalogue by setting `isCatalogueOpen = false` (Addresses: UC1-S6)
- [x] 4.8 Pass `onRemove={() => removeWidget(widget.id)}` to each `Widget` rendered in the grid (Addresses: UC2-S2, UC2-S3)

---

## 5. Shrink Resize (widget-drag-drop delta)

- [x] 5.1 Verify that the existing resize logic in `Widget.tsx` / `DashboardGrid.tsx` does not clamp the new size to a minimum of the widget's current size — only the 1×1 absolute minimum should apply; remove any such clamp if found (Addresses: UC2-E4b1, UC2-E4b2)

---

## 6. Tests

- [x] 6.1 Unit test `findFirstAvailablePosition`: returns first free slot, returns `null` when grid is full (Addresses: UC1-S4, UC1-E4a2)
- [x] 6.2 Unit test `addWidget`: adds widget at correct position and saves to localStorage; returns `false` and does not mutate when full (Addresses: UC1-S5, UC1-S7, UC1-E4a1, UC1-E4a2)
- [x] 6.3 Unit test `removeWidget`: removes correct widget, preserves others, saves empty array when last widget removed (Addresses: UC2-S3, UC2-S4, UC2-S5, UC2-E3a1, UC2-E3a2)
- [x] 6.4 Component test `Widget`: remove button is in the DOM with opacity 0 at rest; `onRemove` is called on click (Addresses: UC2-S1, UC2-S2, UC2-E2a1)
- [x] 6.5 Component test `DashboardGrid`: "Add widget" button toggles catalogue; catalogue lists only absent widgets; selecting a widget calls `addWidget`; grid-full error message shown when `addWidget` returns false (Addresses: UC1-S1, UC1-S2, UC1-S3, UC1-E2a1, UC1-E4a1)
- [x] 6.6 Integration test: add a widget to a known layout — new entry appears at a non-overlapping position (Addresses: UC1-S4, UC1-S5)
- [x] 6.7 Integration test: remove a widget — remaining widgets retain their positions; removed widget id absent from layout (Addresses: UC2-S3, UC2-S4, UC2-E2a2)
