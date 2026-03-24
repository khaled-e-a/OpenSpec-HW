## Test Plan: widget-drag-drop

Generated: 2026-03-23
Source: test-report.md

### Summary

| ID | UC Step | Requirement | Reason | Tool |
|----|---------|-------------|--------|------|
| TP-1 | UC1-S1 | User presses and holds to initiate drag | BROWSER | Playwright |
| TP-2 | UC1-S2 | System lifts widget visually — drag preview | BROWSER | Playwright |
| TP-3 | UC1-S3 | System highlights valid drop zones | BROWSER | Playwright |
| TP-4 | UC1-S4 | User releases at desired location | BROWSER | Playwright |
| TP-5 | UC1-E4a | Pointer released outside grid — drag cancelled | BROWSER | Playwright |
| TP-6 | UC1-E6a2 | System highlights conflict on failed drop | BROWSER | Playwright |
| TP-7 | UC2-S1 | Resize handles revealed on widget hover | BROWSER | Playwright |
| TP-8 | UC2-S2 | User drags resize handle | BROWSER | Playwright |
| TP-9 | UC2-S3 | Live preview of new widget size | BROWSER | Playwright |
| TP-10 | UC2-S4 | User releases handle — size committed | BROWSER | Playwright |
| TP-11 | UC2-S5 | System applies new grid-unit dimensions | BROWSER | Playwright |
| TP-12 | UC2-E3a | Resize dragged below 1×1 — clamped | BROWSER | Playwright |
| TP-13 | UC3-S4 | Widget rendered at exact stored position | BROWSER | Playwright |
| TP-14 | UC3-S5 | Dashboard identical to last-left state | BROWSER | Playwright |
| TP-15 | UC4-S1 | User opens widget picker | BROWSER | Playwright |
| TP-16 | UC4-S2 | Picker displays widget types with size previews | BROWSER | Playwright |
| TP-17 | UC1 Flow | Full drag-to-move integration | BROWSER | Playwright |
| TP-18 | UC2 Flow | Full resize integration | BROWSER | Playwright |
| TP-19 | UC4 Flow | Full add-widget integration | BROWSER | Playwright |
| TP-20 | UC5 Flow | Full remove + undo integration | BROWSER | Playwright |

---

## TP-1: UC1-S1 — User presses and holds on a widget to initiate a drag

**Blocking reason**: BROWSER — jsdom does not dispatch realistic PointerEvents; dnd-kit requires real pointer sensor with a distance threshold
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Dashboard is loaded with at least one widget visible

**Test Steps**
1. Open `http://localhost:3000` in the browser
2. Locate the widget with text "Text Card" (or any visible widget)
3. Move the mouse cursor over the widget until the drag handle icon appears in the toolbar
4. Press and hold the primary mouse button on the drag handle icon
5. Move the mouse 10px in any direction (to exceed the 5px activation threshold)

**Expected Result**
The widget's opacity drops to approximately 35% (ghost effect). A full-opacity clone of the widget appears under the cursor and moves with the pointer (the DragOverlay).

**Failure indicators**
The widget does not become translucent. No drag clone appears. The widget stays fixed when the pointer moves.

**Automation path**
```
page.locator('[data-testid="widget-drag-handle"]').hover()
await page.mouse.down()
await page.mouse.move(x + 10, y + 10)
await expect(page.locator('[data-testid="drag-overlay"]')).toBeVisible()
```

---

## TP-2: UC1-S2 — System lifts the widget visually and displays a drag preview following the pointer

**Blocking reason**: BROWSER — DragOverlay is a React portal rendered outside the normal DOM tree; jsdom does not support `getBoundingClientRect` or pointer-tracking at real pixel coordinates
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- A drag has been initiated on a widget (TP-1 completed)

**Test Steps**
1. Complete TP-1 steps 1–5 (pointer held down, drag active)
2. Move the mouse to a different grid cell (e.g., 200px to the right and 100px down from original position)
3. Observe the drag clone position

**Expected Result**
The drag clone (DragOverlay) follows the cursor position exactly. The original widget slot remains in its grid position with 35% opacity. The clone is rendered above all other widgets (z-index higher than grid content).

**Failure indicators**
The clone is frozen in place. The clone is not visible. The original widget has moved instead of showing a ghost. The clone appears behind other widgets.

---

## TP-3: UC1-S3 — System highlights valid drop zones on the grid as the user moves the pointer

**Blocking reason**: BROWSER — DropCellGrid renders 96 div elements (12×8) that respond to the live drag position; requires real pointer movement and `getBoundingClientRect` to compute hover cell
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- A drag has been initiated on a widget (TP-1 completed)

**Test Steps**
1. Complete TP-1 steps 1–5 (drag active)
2. Move the mouse to an empty area of the grid that is not occupied by any widget
3. Observe the cell background color under the cursor's grid position
4. Move the mouse over a cell that is occupied by a different widget
5. Observe the cell background color

**Expected Result**
Step 3: The grid cell(s) under the drag's footprint show a **green tint** (valid placement, no conflict).
Step 5: The grid cell(s) that would conflict show a **red tint** (invalid placement, occupied or out-of-bounds).

**Failure indicators**
All cells remain the same color during drag. No highlighting appears. Both occupied and empty cells show the same color.

---

## TP-4: UC1-S4 — User moves the pointer to the desired grid location and releases

**Blocking reason**: BROWSER — dnd-kit's `onDragEnd` fires on real `pointerup`; jsdom does not fire native pointer events that dnd-kit's sensor listens to
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Dashboard shows a widget at column 0, row 0 (default "Text Card" widget)

**Test Steps**
1. Record the initial grid position of the "Text Card" widget (column 0, row 0)
2. Press and hold the mouse on the widget's drag handle
3. Move the mouse to an empty grid area at approximately column 6, row 4
4. Release the mouse button

**Expected Result**
The widget snaps to the nearest valid grid cell near column 6, row 4. The drag overlay disappears. The widget is now rendered at its new position in the grid. The green/red highlighting disappears.

**Failure indicators**
The widget returns to its original position (column 0, row 0) after release. The drag overlay does not disappear. The widget appears at a non-grid-aligned position.

---

## TP-5: UC1-E4a — User releases the pointer outside the grid bounds — drag cancelled, widget returns to origin

**Blocking reason**: BROWSER — requires triggering `onDragCancel` by releasing pointer outside the `DndContext` drop area; jsdom cannot simulate this boundary condition
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Dashboard shows at least one widget

**Test Steps**
1. Note the grid position of a widget (e.g., "Metric Card" at column 3, row 0)
2. Press and hold the mouse on the widget's drag handle
3. Move the mouse outside the grid container (e.g., to the page header area above the grid, or below the grid entirely)
4. Release the mouse button while the cursor is outside the grid boundary

**Expected Result**
The widget returns to its original position (column 3, row 0). No layout change occurs. The drag overlay disappears. The localStorage `dashboard-layout` value is unchanged from before the drag.

**Failure indicators**
The widget disappears from the grid. The widget moves to a random position near the release point. The layout in localStorage changes.

---

## TP-6: UC1-E6a2 — System highlights the conflict to indicate why the drop failed

**Blocking reason**: BROWSER — `conflictFlash` is a React state flag that triggers a CSS animation on DropCellGrid; requires real drag interaction and timing
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Grid is completely full (all cells occupied by widgets, or use a 1-column grid with a full-width widget)

**Test Steps**
1. Fill the grid so no empty cells remain (add widgets until the picker says "Not enough space", or resize an existing widget to occupy all remaining space)
2. Press and hold the mouse on any widget's drag handle
3. Move the mouse to a cell that is clearly occupied by a different widget
4. Release the mouse button

**Expected Result**
The grid cells at the proposed drop position flash **red** briefly (CSS animation lasting ~300ms). The dragged widget returns to its original position. No layout change occurs.

**Failure indicators**
No red flash animation occurs. The grid cells remain unhighlighted. The widget is placed on top of an existing widget (overlap).

---

## TP-7: UC2-S1 — User hovers over a widget; system reveals resize handles on edges/corners

**Blocking reason**: BROWSER — CSS `:hover` + opacity transition requires real mouse hover events; jsdom's JSDOM environment does not apply CSS hover pseudo-classes
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- At least one widget is visible on the dashboard

**Test Steps**
1. Open `http://localhost:3000`
2. Move the mouse cursor away from all widgets (no widget hovered)
3. Observe the SE corner of any widget for resize handles
4. Move the mouse cursor over the "Chart Placeholder" widget (the largest one, 4×2)
5. Observe the SE corner and edges of the widget

**Expected Result**
Step 3: No resize handles are visible (they are invisible when not hovered).
Step 5: A small resize handle appears at the SE corner of the widget. On touch devices (or when using touch emulation), the handles are visible without hover.

**Failure indicators**
Resize handles are always visible regardless of hover state. Resize handles never appear even on hover.

---

## TP-8: UC2-S2 — User clicks and drags a resize handle

**Blocking reason**: BROWSER — `useResizeDrag` attaches `pointermove` and `pointerup` to `window` on `pointerdown`; requires real pointer events and pixel-accurate delta tracking
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- A widget is visible and the resize handle is visible (TP-7 completed)

**Test Steps**
1. Hover over the "Chart Placeholder" widget to reveal the resize handle
2. Move the mouse cursor to the SE corner resize handle (the small square/triangle at the bottom-right)
3. Press and hold the primary mouse button on the resize handle
4. Move the mouse 80px to the right (one grid cell width at 80px/cell)

**Expected Result**
The resize drag is active (`isDragging` state = true). The widget's rendered size shows a live preview that has grown by one grid unit in width. The resize handle follows the cursor.

**Failure indicators**
Nothing happens when clicking the resize handle. The widget does not change size during drag. The browser performs a text selection or native drag instead.

---

## TP-9: UC2-S3 — System shows a live preview of the new widget size snapped to grid units

**Blocking reason**: BROWSER — `previewLayout` state drives the widget's CSS `grid-column: col / span previewW` — requires live DOM updates during pointer movement
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- A resize drag is in progress (TP-8 completed through step 4)

**Test Steps**
1. Continue from TP-8 step 4 (mouse held down, moved 80px right)
2. Check the widget's rendered width in the DOM
3. Move the mouse another 80px right
4. Check the widget's rendered width again

**Expected Result**
Step 2: Widget width spans `previewW` grid columns (original + 1 column).
Step 4: Widget width spans `previewW + 1` grid columns.
The preview snaps to discrete grid-unit increments (80px per cell) as the mouse moves — not continuous pixel-level resizing.

**Failure indicators**
The widget resizes continuously at the pixel level (not snapping to grid units). The widget does not change size during the drag. The widget size changes only on mouse release.

---

## TP-10: UC2-S4 — User releases the handle at the desired size

**Blocking reason**: BROWSER — `pointerup` on `window` commits the resize; requires real pointer event dispatch
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Resize drag in progress with a new preview size visible (TP-9 completed)

**Test Steps**
1. Continue from TP-9 (widget showing preview size of original + 1 column)
2. Release the mouse button

**Expected Result**
The widget's size is committed to the new dimensions. The `previewLayout` is cleared (widget renders from the committed layout, not the preview). The resize handle returns to its non-active appearance. No visual diff between preview and committed state.

**Failure indicators**
Widget snaps back to its original size on release. Widget size remains at the preview dimensions but the layout is not saved (refreshing the page reverts it).

---

## TP-11: UC2-S5 — System applies the new grid-unit dimensions to the widget

**Blocking reason**: BROWSER — verifying that `resizeWidget` was called with correct dimensions requires observing the actual rendered CSS or checking localStorage after the resize+debounce
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- A widget has been resized (TP-10 completed)

**Test Steps**
1. After completing TP-10 (resize committed), wait 400ms (debounce period is 300ms)
2. Read `localStorage.getItem('dashboard-layout')` from the browser console
3. Parse the JSON and find the widget entry that was resized
4. Check the `w` (width) field of that widget entry

**Expected Result**
The widget's `w` field in localStorage equals the new grid-unit width applied by the resize (original width + number of columns dragged). The widget is visually rendered at that new width in the grid.

**Failure indicators**
The `w` field in localStorage still shows the original value. The widget renders at the new visual size but refreshing the page reverts it.

---

## TP-12: UC2-E3a — User drags resize handle below minimum size (1×1) — system clamps and shows indicator

**Blocking reason**: BROWSER — `useResizeDrag` clamps to minimum 1×1 and shows a CSS pulse animation on the handle; requires real pointer events
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- A 2×1 or larger widget is visible (e.g., "Text Card" at 2×1)

**Test Steps**
1. Hover over the "Text Card" widget to reveal the resize handle
2. Press and hold the mouse on the SE resize handle
3. Move the mouse 200px to the left (far beyond the 1-cell minimum — 2 cells to the left would be 160px, going 200px ensures exceeding the floor)
4. Observe the widget's preview width and the resize handle appearance

**Expected Result**
The widget's preview width does not go below 1 grid unit (80px minimum). The resize handle shows a brief pulse/flash CSS animation to indicate the floor was hit. The widget does not disappear or collapse to zero width.

**Failure indicators**
The widget collapses to zero width or becomes invisible. No pulse animation on the handle. The widget width goes below 1 grid unit.

---

## TP-13: UC3-S4 — System renders each widget at its stored position and size

**Blocking reason**: BROWSER — verifying that widgets render at exact pixel/grid positions requires `getBoundingClientRect` or computed CSS `grid-column` / `grid-row` values; jsdom does not apply CSS Grid layout
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- localStorage has been pre-seeded with a known layout:
  ```json
  {"w1": {"id":"w1","col":0,"row":0,"w":2,"h":1}, "w2": {"id":"w2","col":3,"row":2,"w":1,"h":1}}
  ```
  and widget types: `{"w1":"text-card","w2":"metric-card"}`

**Test Steps**
1. Set localStorage via browser console: `localStorage.setItem('dashboard-layout', '{"w1":{"id":"w1","col":0,"row":0,"w":2,"h":1},"w2":{"id":"w2","col":3,"row":2,"w":1,"h":1}}')` and `localStorage.setItem('dashboard-widget-types', '{"w1":"text-card","w2":"metric-card"}')`
2. Navigate to `http://localhost:3000` (or reload)
3. Inspect the DOM element for widget `w1` and read its CSS `grid-column` property
4. Inspect the DOM element for widget `w2` and read its CSS `grid-column` and `grid-row` properties

**Expected Result**
`w1` has `grid-column: 1 / span 2` and `grid-row: 1 / span 1`.
`w2` has `grid-column: 4 / span 1` and `grid-row: 3 / span 1`.
(CSS grid is 1-indexed; col=0 → column 1, col=3 → column 4, row=2 → row 3)

**Failure indicators**
Widgets appear at wrong grid positions. Widgets use default positions instead of stored positions. The page renders no widgets at all.

---

## TP-14: UC3-S5 — Dashboard appears identical to how the user last left it

**Blocking reason**: BROWSER / MANUAL_UX — full visual fidelity check (same widgets, same positions, same sizes) requires screenshot comparison or visual inspection in a real browser
**Recommended tool**: Playwright (screenshot diff) or manual inspection

**Preconditions**
- App is running at `http://localhost:3000`
- A known layout has been saved by performing drag, resize, and add operations in a previous session

**Test Steps**
1. Open `http://localhost:3000`, perform the following layout changes, and take a screenshot:
   - Move "Text Card" to column 6, row 0
   - Resize "Chart Placeholder" to 6×2
   - Add a second "Metric Card"
2. Close the browser tab
3. Open `http://localhost:3000` again in a fresh browser tab
4. Take a screenshot of the dashboard

**Expected Result**
The screenshot from step 4 is pixel-identical (or visually indistinguishable) to the screenshot from step 1. All three widgets appear at the exact same positions and sizes as when the tab was closed.

**Failure indicators**
Widgets appear at different positions or sizes after reload. Some widgets are missing. The dashboard shows the default layout instead of the customized layout.

---

## TP-15: UC4-S1 — User opens the widget picker

**Blocking reason**: BROWSER — WidgetPicker is a slide-in panel triggered by a button click; requires real click events and CSS transition rendering
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Dashboard is visible with the toolbar

**Test Steps**
1. Open `http://localhost:3000`
2. Locate the "Add Widget" button in the dashboard toolbar (top of the page)
3. Click the "Add Widget" button
4. Observe the right side of the screen

**Expected Result**
A slide-in panel appears from the right side of the screen. The panel is titled "Add Widget". The panel animation completes within 300ms.

**Failure indicators**
Nothing happens when clicking "Add Widget". The panel appears but without a slide animation. The page navigates away or throws an error.

**Automation path**
```
await page.getByRole('button', { name: 'Add Widget' }).click()
await expect(page.getByRole('heading', { name: 'Add Widget' })).toBeVisible()
```

---

## TP-16: UC4-S2 — System displays available widget types with size previews

**Blocking reason**: BROWSER — WidgetPicker renders cards from WIDGET_REGISTRY; requires the panel to be open and the DOM to be queryable
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Widget picker is open (TP-15 completed)

**Test Steps**
1. Complete TP-15 (picker open)
2. Count the number of widget cards shown in the picker
3. Read the text on each card — it should show the widget name and its default size
4. Verify the "Text Card" entry shows "2 × 1 cells" (or equivalent size label)
5. Verify the "Metric Card" entry shows "1 × 1 cells"
6. Verify the "Chart Placeholder" entry shows "4 × 2 cells"

**Expected Result**
3 widget cards are visible. Each card shows a name and a grid-size label. The sizes match the registry defaults: Text Card = 2×1, Metric Card = 1×1, Chart Placeholder = 4×2.

**Failure indicators**
0 or fewer than 3 cards are shown. Cards show no size information. The sizes shown do not match the registry (e.g., "Text Card" showing "1 × 1" instead of "2 × 1").

---

## TP-17: UC1 Flow — Full drag-to-move integration test

**Blocking reason**: BROWSER — end-to-end flow requires real pointer events, dnd-kit sensor, CSS Grid layout, and localStorage persistence all working together
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Dashboard shows default layout (clear localStorage before test)

**Test Steps**
1. Open `http://localhost:3000` with cleared localStorage
2. Record the initial `grid-column` and `grid-row` CSS of the "Text Card" widget (should be column 1, row 1)
3. Hover over "Text Card" to reveal the drag handle
4. Press and hold the mouse on the drag handle
5. Move the mouse 5px to activate the drag (exceed threshold)
6. Verify: widget becomes 35% opaque, drag overlay appears
7. Hover over an empty cell at column 8, row 4 — verify green cell highlight
8. Hover over a cell occupied by "Metric Card" — verify red cell highlight
9. Move mouse to empty cell at column 8, row 4
10. Release the mouse button
11. Verify: overlay disappears, "Text Card" renders at new position (approximately column 8, row 4)
12. Wait 400ms
13. Read `localStorage.getItem('dashboard-layout')` and verify `w1.col` ≈ 7 (0-indexed column 7)

**Expected Result**
All 13 steps succeed as described. The widget moves from column 0 to approximately column 7 (display column 8). localStorage reflects the new position within 400ms of the drop.

**Failure indicators**
Any step fails as described above. The widget returns to its original position. localStorage is not updated.

---

## TP-18: UC2 Flow — Full resize integration test

**Blocking reason**: BROWSER — end-to-end resize requires hover detection, `useResizeDrag` pointer event chain, gravityReflow, and localStorage persistence
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Clear localStorage and reload to start from default layout

**Test Steps**
1. Open `http://localhost:3000` with cleared localStorage
2. Locate the "Chart Placeholder" widget (default: 4×2 at column 5, row 0)
3. Hover over it to reveal the SE resize handle
4. Click and hold the SE resize handle
5. Move the mouse 80px to the right (one cell width)
6. Verify: widget preview shows 5-column width
7. Release the mouse button
8. Verify: widget renders at 5 columns wide
9. Wait 400ms
10. Read localStorage and verify the chart placeholder widget entry has `w: 5`

**Expected Result**
After step 8, the widget is visually 5 columns wide. After step 10, localStorage confirms `w: 5`.

**Failure indicators**
Widget stays at 4 columns after release. localStorage still shows `w: 4`. Preview does not show 5-column width during drag.

---

## TP-19: UC4 Flow — Full add-widget integration test

**Blocking reason**: BROWSER — requires WidgetPicker interaction, auto-placement, and localStorage persistence
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Default layout loaded (3 widgets)

**Test Steps**
1. Open `http://localhost:3000`
2. Count widgets on the grid — expect 3
3. Click "Add Widget" to open the picker
4. Click the "Metric Card" card in the picker
5. Observe the grid
6. Count widgets on the grid
7. Verify the picker is closed
8. Wait 400ms
9. Read `localStorage.getItem('dashboard-layout')` and count entries

**Expected Result**
Step 6: 4 widgets are on the grid. The new "Metric Card" appears at the first available grid position without overlapping any existing widget.
Step 7: The picker slide-in panel is no longer visible.
Step 9: localStorage contains 4 entries, including the new metric card.

**Failure indicators**
Widget count stays at 3. Picker stays open after selection. New widget overlaps an existing widget. localStorage shows only 3 entries.

---

## TP-20: UC5 Flow — Full remove + undo integration test

**Blocking reason**: BROWSER — requires Widget toolbar hover, ✕ button click, UndoToast interaction, and real 5-second timer
**Recommended tool**: Playwright

**Preconditions**
- App is running at `http://localhost:3000`
- Default layout loaded (3 widgets)

**Test Steps**
1. Open `http://localhost:3000`
2. Count widgets on the grid — expect 3
3. Hover over the "Metric Card" widget to reveal the WidgetToolbar
4. Click the ✕ remove button in the toolbar
5. Verify: "Metric Card" is no longer visible on the grid (2 widgets remain)
6. Verify: An "Undo" toast notification appears at the bottom of the screen with text "Widget removed — Undo"
7. Verify: The toast has a countdown progress bar that decreases over 5 seconds
8. Click the "Undo" button in the toast
9. Verify: "Metric Card" reappears at its original position
10. Count widgets — expect 3

**Sub-test: Undo timeout**
11. Repeat steps 3–6 to remove "Metric Card" again
12. Wait 6 seconds without clicking Undo
13. Verify: Toast has disappeared after 5 seconds
14. Verify: "Metric Card" is still absent from the grid (removal is permanent)

**Expected Result**
Steps 3–10: Widget is removed, toast appears, undo restores the widget at its exact original position.
Steps 11–14: After 5 seconds the toast auto-dismisses and the removal cannot be undone.

**Failure indicators**
The ✕ button is not visible even on hover. Widget is not removed on click. Toast does not appear. Undo does not restore the widget. Toast does not auto-dismiss after 5 seconds.

---

## How to Run These Tests

For **BROWSER** tests:
```bash
cd widget-dashboard
npx playwright install --with-deps
npm run build
npx serve -s build &
npx playwright test
```

Or against the dev server:
```bash
npm start &          # starts CRA dev server on http://localhost:3000
npx playwright test
```

All TP-* entries above are BROWSER tests requiring a real Chromium/Firefox/WebKit context. They cannot be run in jsdom.

For a quick smoke-check of automated tests (52 passing unit + PBT tests):
```bash
npm test -- --watchAll=false
```
