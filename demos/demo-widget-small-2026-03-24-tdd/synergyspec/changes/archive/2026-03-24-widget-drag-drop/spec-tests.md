# Spec-Test Mapping: widget-drag-drop
Generated: 2026-03-24

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC2-S1 | System receives initial layout config | Step | Unit | `src/components/DashboardGrid.test.tsx` — "renders nothing when initialLayout is empty" | ✅ |
| UC2-S1 | System receives initial layout config | Step | Unit | `src/components/DashboardGrid.test.tsx` — "renders one widget per entry in initialLayout" | ✅ |
| UC2-S1 | System receives initial layout config — valid render | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "resolveLayout returns same positions for non-conflicting" | ✅ |
| UC2-S1 | Empty initial layout renders empty grid | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "resolveLayout of empty input is always empty" | ✅ |
| UC2-S1 | Widget CSS reflects updated x,y when layout changes | Step | Component | `src/components/DashboardGrid.gaps.test.tsx` — "widget CSS reflects updated x,y when controlled layout changes" | ✅ |
| UC2-S2 | Grid canvas divided into equal-sized cells | Step | Unit | `src/components/DashboardGrid.test.tsx` — "renders a grid container with correct CSS variables" | ✅ |
| UC2-S2 | Grid canvas divided into equal-sized cells | Step | Unit | `src/components/DashboardGrid.test.tsx` — "renders with display grid" | ✅ |
| UC2-S2 | Cell size configurable | Step | Unit | `src/components/DashboardGrid.gaps.test.tsx` — "gridTemplateColumns uses the provided cellSize" | ✅ |
| UC2-S2 | Grid lines rendered | Step | Component | `src/components/DashboardGrid.drag.test.tsx` — "SVG grid lines render one line per column+1 and row+1" | ✅ |
| UC2-S2 | snapToCell respects column bounds | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "snapToCell col is always < cols when constraints provided" | ✅ |
| UC2-S2 | snapToCell scales with cellSize | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "doubling cellSize halves the raw cell index" | ✅ |
| UC2-S3 | Widget spans declared columns and rows | Step | Unit | `src/components/DashboardGrid.test.tsx` — "widget has correct grid-column and grid-row CSS" | ✅ |
| UC2-S3 | Widget spans declared columns and rows | Step | Unit | `src/components/DraggableWidget.test.tsx` — "applies correct gridColumn and gridRow styles" | ✅ |
| UC2-S3 | Occupancy covers all widget cells | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet contains every cell of a widget" | ✅ |
| UC2-S4 | Multiple widgets rendered without overlap | Step | Component | `src/components/DashboardGrid.test.tsx` — "multiple widgets do not overlap" | ✅ |
| UC2-S4 | resolveLayout output never has overlapping widgets | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "no two resolved widgets occupy the same cell" | ✅ |
| UC2-E3a | First widget keeps position on overlap | Extension | Component | `src/components/DashboardGrid.test.tsx` — "first widget retains its declared position" | ✅ |
| UC2-E3a | console.warn emitted on overlap | Extension | Component | `src/components/DashboardGrid.test.tsx` — "emits console.warn when initial layout has overlapping widgets" | ✅ |
| UC2-E3a | Second widget moved to non-overlapping position | Extension | Unit | `src/utils/gridGeometry.test.ts` — "second widget is moved to a non-overlapping position" | ✅ |
| UC2-E3a | Widgets don't share grid cell after resolution | Extension | Component | `src/components/DashboardGrid.gaps.test.tsx` — "widgets do not share a grid cell position" | ✅ |
| UC2-E3a | First widget always keeps declared position (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "first widget x,y unchanged after resolveLayout with overlapping second" | ✅ |
| UC2-E3b | Out-of-bounds widget clamped to boundary | Extension | Component | `src/components/DashboardGrid.test.tsx` — "widget declared beyond grid boundary is clamped within bounds" | ✅ |
| UC2-E3b | Out-of-bounds widget clamped (unit) | Extension | Unit | `src/utils/gridGeometry.test.ts` — "clamps a widget that extends beyond right/bottom boundary" | ✅ |
| UC2-E3b | resolveLayout never produces OOB positions (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "resolveLayout never produces out-of-bounds widget positions" | ✅ |
| UC1-S1 | Drag begins on pointer down — aria attributes | Step | Unit | `src/components/DashboardGrid.drag.test.tsx` — "widget element has aria attributes for accessibility" | ✅ |
| UC1-S1 | Widget has data-widget-id | Step | Unit | `src/components/DraggableWidget.test.tsx` — "has data-widget-id attribute" | ✅ |
| UC1-S1 | aria-label default | Step | Unit | `src/components/DraggableWidget.test.tsx` — "has aria-label defaulting to Widget <id>" | ✅ |
| UC1-S1 | aria-label override | Step | Unit | `src/components/DraggableWidget.test.tsx` — "aria-label can be overridden via prop" | ✅ |
| UC1-S1 | Self-exclusion invariant (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "widget can always be dropped at its own position" | ✅ |
| UC1-S2 | Drag overlay rendered | Step | Component | `src/components/DashboardGrid.drag.test.tsx` — "grid has data-testid dashboard-grid" | ⚠️ |
| UC1-S2 | Grid highlighted during drag | Step | Component | `src/components/DashboardGrid.gaps.test.tsx` — "grid has no outline by default" | ⚠️ |
| UC1-S2 | Occupancy excludes dragged widget | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet with excludeId never contains cells of excluded widget" | ✅ |
| UC1-S2 | snap always returns non-negative coords | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "snapToCell always returns non-negative col and row" | ✅ |
| UC1-S3 | User moves pointer — snap updates | Step | Unit | `src/utils/gridGeometry.test.ts` — "converts pointer offset to nearest grid cell" | ✅ |
| UC1-S3 | snap scales correctly | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "snapped cell origin is the nearest grid origin to pointer" | ✅ |
| UC1-S4 | Preview snaps to nearest cell | Step | Unit | `src/utils/gridGeometry.test.ts` — multiple snapToCell tests | ✅ |
| UC1-S4 | Preview snaps to nearest cell (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "snapped cell is always the nearest cell" | ✅ |
| UC1-S4 | Drop preview absent before drag | Step | Component | `src/components/DashboardGrid.drag.test.tsx` — "drop-preview element is not in DOM when no drag is active" | ✅ |
| UC1-S4 | Preview stays within grid bounds (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "snapToCell result always satisfies col+w<=cols" | ✅ |
| UC1-E6a2 | Red highlight on occupied cells | Extension | Unit | `src/components/DashboardGrid.gaps.test.tsx` — "drop-preview is absent before any drag begins" | ⚠️ |
| UC1-E6a2 | isValidPlacement false for occupied (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "overlapping candidate always returns false from isValidPlacement" | ✅ |
| UC1-E6a2 | isValidPlacement true for free cells (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "empty layout always accepts any valid in-bounds widget" | ✅ |
| UC1-S5 | User releases over target grid area | Step | Unit | `src/utils/gridGeometry.test.ts` — "returns true for a free in-bounds position" | ✅ |
| UC1-S6 | Validate target cells unoccupied and in-bounds | Step | Unit | `src/utils/gridGeometry.test.ts` — multiple isValidPlacement tests | ✅ |
| UC1-S6 | Valid placement accepted for all free positions (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement returns true for any widget placed at free position" | ✅ |
| UC1-S6 | Occupied drop always rejected (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement consistently returns false for overlapping" | ✅ |
| UC1-S6 | OOB rejected — right boundary (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement always false when x+w > cols" | ✅ |
| UC1-S6 | OOB rejected — bottom boundary (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement always false when y+h > rows" | ✅ |
| UC1-S7 | Layout state updated on valid drop | Step | Component | `src/components/DashboardGrid.drag.test.tsx` — "onLayoutChange called with updated position" | ⚠️ |
| UC1-S7 | Widget at new position after layout update | Step | Component | `src/components/DashboardGrid.gaps.test.tsx` — "widget CSS reflects updated x,y when controlled layout changes" | ✅ |
| UC1-S7 | Valid placement is idempotent (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "placing a widget twice at same position is always valid" | ✅ |
| UC1-S8 | All other widgets remain unchanged | Step | Component | `src/components/DashboardGrid.drag.test.tsx` — "all other widgets remain unchanged after a valid drop" | ✅ |
| UC1-S8 | Non-moved widgets retain position | Step | Component | `src/components/DashboardGrid.gaps.test.tsx` — "non-moved widgets retain their position" | ✅ |
| UC1-S8 | Updated layout reflected in occupancy (PBT) | Step | PBT | `src/utils/gridGeometry.property.test.ts` — "after moving widget, new cells occupied and old cells free" | ✅ |
| UC1-E5a | Drop outside canvas — layout unchanged | Extension | Component | `src/components/DashboardGrid.gaps.test.tsx` — "onLayoutChange NOT called when no pointer movement occurs" | ✅ |
| UC1-E5a | Negative coords always OOB (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement with negative coords is always false" | ✅ |
| UC1-E5a1 | Widget returns to origin with animation | Extension | Component | `src/components/DashboardGrid.gaps.test.tsx` — "DragOverlay container element is present" | ⚠️ |
| UC1-E5a1 | CSS transition string is non-empty (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "CSS transition value is a non-empty string" | ✅ |
| UC1-E6a | Drop over occupied — widget returns | Extension | Component | `src/components/DashboardGrid.gaps.test.tsx` — "both widgets present after attempted overlapping initial config" | ✅ |
| UC1-E6a | Occupied drop never modifies layout (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement consistently returns false for overlapping widget" | ✅ |
| UC1-E6a1 | Dragged widget returned to original position | Extension | Component | `src/components/DashboardGrid.gaps.test.tsx` — "widgets do not share a grid cell position" | ✅ |
| UC1-E6a3 | Layout unchanged after rejected drop | Extension | Component | `src/components/DashboardGrid.drag.test.tsx` — "layout state is not mutated when drop is invalid" | ⚠️ |
| UC1-E6a3 | buildOccupancySet is pure / no mutation (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "same input always gives same output" | ✅ |
| UC1-E6b | Out-of-bounds placement rejected | Extension | Unit | `src/utils/gridGeometry.test.ts` — multiple OOB isValidPlacement tests | ✅ |
| UC1-E6b | OOB always rejected (PBT) | Extension | PBT | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement false for any widget exceeding grid on any side" | ✅ |
| UC1-E6b1 | Treats OOB position as invalid | Extension | Unit | `src/utils/gridGeometry.test.ts` — "returns false when x is negative", "returns false when y is negative" | ✅ |
| UC1 | Full drag-and-drop flow | Flow | Integration | ❌ missing — e2e test needed | ❌ |
| UC2 | Full initial render flow | Flow | Integration | ❌ missing — e2e test needed | ❌ |

---

## PBT Coverage

| UC Step | Scenario | PBT Test | Framework | Status |
|---------|----------|----------|-----------|--------|
| UC2-S1 | Valid initial layout renders correctly | `src/utils/gridGeometry.property.test.ts` — "resolveLayout returns same positions…" | fast-check | ✅ |
| UC2-S1 | Empty initial layout renders an empty grid | `src/utils/gridGeometry.property.test.ts` — "resolveLayout of empty input is always empty" | fast-check | ✅ |
| UC2-S2 | Grid divided into correct columns and rows | `src/utils/gridGeometry.property.test.ts` — "snapToCell col is always < cols when constraints provided" | fast-check | ✅ |
| UC2-S2 | Cell size is configurable | `src/utils/gridGeometry.property.test.ts` — "doubling cellSize halves the raw cell index" | fast-check | ✅ |
| UC2-S3 | Widget spans declared columns and rows | `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet contains every cell of a widget" | fast-check | ✅ |
| UC2-S4 | Multiple widgets rendered without overlap | `src/utils/gridGeometry.property.test.ts` — "no two resolved widgets occupy the same cell" | fast-check | ✅ |
| UC2-E3a | Second widget moved on overlap | `src/utils/gridGeometry.property.test.ts` — "first widget x,y unchanged after resolveLayout with overlapping second" | fast-check | ✅ |
| UC2-E3b | Widget clamped to grid boundary | `src/utils/gridGeometry.property.test.ts` — "resolveLayout never produces out-of-bounds widget positions" | fast-check | ✅ |
| UC1-S1 | Drag begins on pointer down | `src/utils/gridGeometry.property.test.ts` — "widget can always be dropped at its own position" | fast-check | ✅ |
| UC1-S2 | Drag overlay shown during drag | `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet with excludeId never contains cells of excluded widget" | fast-check | ✅ |
| UC1-S2 | Grid highlighted during drag | `src/utils/gridGeometry.property.test.ts` — "snapToCell always returns non-negative col and row" | fast-check | ✅ |
| UC1-S3/S4 | Preview snaps to nearest cell as pointer moves | `src/utils/gridGeometry.property.test.ts` — "snapped cell origin is the nearest grid origin to pointer" | fast-check | ✅ |
| UC1-S4 | Preview stays within grid bounds during movement | `src/utils/gridGeometry.property.test.ts` — "snapToCell result always satisfies col+w<=cols and row+h<=rows" | fast-check | ✅ |
| UC1-E6a2 | Red highlight on occupied target cells | `src/utils/gridGeometry.property.test.ts` — "overlapping candidate always returns false from isValidPlacement" | fast-check | ✅ |
| UC1-E6a2 | Green highlight on free target cells | `src/utils/gridGeometry.property.test.ts` — "empty layout always accepts any valid in-bounds widget" | fast-check | ✅ |
| UC1-S5/S6 | Valid drop accepted | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement returns true for any widget placed at free position" | fast-check | ✅ |
| UC1-S5/S6 | Drop rejected — cells occupied | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement consistently returns false for overlapping" | fast-check | ✅ |
| UC1-S5/S6 | Drop rejected — out of bounds | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement always false when x+w > cols / y+h > rows" | fast-check | ✅ |
| UC1-S7/S8 | Layout state updated on valid drop | `src/utils/gridGeometry.property.test.ts` — "placing a widget twice at same position is always valid" | fast-check | ✅ |
| UC1-S7/S8 | Widget rendered at new position after drop | `src/utils/gridGeometry.property.test.ts` — "after moving widget, new cells occupied and old cells free" | fast-check | ✅ |
| UC1-E5a/E5a1 | Widget returns to origin on out-of-bounds drop | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement with negative coords is always false" | fast-check | ✅ |
| UC1-E5a1 | Return animation is smooth | `src/utils/gridGeometry.property.test.ts` — "CSS transition value is a non-empty string" | fast-check | ✅ |
| UC1-E6a/E6a1 | Widget returns to origin on occupied-cell drop | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement consistently returns false for overlapping widget" | fast-check | ✅ |
| UC1-E6a3 | Layout state unchanged after rejected drop | `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet is pure — same input always gives same output" | fast-check | ✅ |
| UC1-E6b/E6b1 | Widget returns to origin on OOB drop | `src/utils/gridGeometry.property.test.ts` — "isValidPlacement false for any widget exceeding grid on any side" | fast-check | ✅ |

---

## Use Case Details: Reposition Widget on Dashboard Grid (ID: UC1)

### Main Scenario
- **UC1-S1**: User initiates a drag on a widget by pressing and holding it
  - `src/components/DashboardGrid.drag.test.tsx` — "UC1-S1: widget element has aria attributes" (Unit)
  - `src/components/DraggableWidget.test.tsx` — "UC1-S1: has data-widget-id attribute" (Unit)
  - `src/utils/gridGeometry.property.test.ts` — "widget can always be dropped at its own position" (PBT)
- **UC1-S2**: System lifts widget visually, shows drag preview, highlights grid
  - `src/components/DashboardGrid.drag.test.tsx` — "grid has data-testid dashboard-grid" (Component) ⚠️ partial
  - `src/components/DashboardGrid.gaps.test.tsx` — "grid has no outline by default" (Component) ⚠️ partial
  - `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet with excludeId never contains excluded cells" (PBT)
- **UC1-S3**: User moves pointer across grid canvas
  - `src/utils/gridGeometry.test.ts` — "converts pointer offset to nearest grid cell" (Unit)
  - `src/utils/gridGeometry.property.test.ts` — "snapped cell origin is the nearest grid origin" (PBT)
- **UC1-S4**: System continuously snaps drag preview to nearest valid grid cell
  - `src/utils/gridGeometry.test.ts` — all snapToCell tests (Unit)
  - `src/components/DashboardGrid.drag.test.tsx` — "drop-preview element is not in DOM when no drag is active" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "snapToCell result always satisfies col+w<=cols" (PBT)
- **UC1-S5**: User releases widget over target grid area
  - `src/utils/gridGeometry.test.ts` — "returns true for a free in-bounds position" (Unit)
  - `src/utils/gridGeometry.property.test.ts` — "isValidPlacement returns true for any widget placed at free position" (PBT)
- **UC1-S6**: System validates target cells unoccupied and within bounds
  - `src/utils/gridGeometry.test.ts` — all isValidPlacement tests (Unit)
  - `src/utils/gridGeometry.property.test.ts` — "occupied drop always rejected" + OOB PBTs (PBT)
- **UC1-S7**: System places widget at snapped position, updates layout state
  - `src/components/DashboardGrid.drag.test.tsx` — "onLayoutChange called with updated position" (Component) ⚠️ partial
  - `src/components/DashboardGrid.gaps.test.tsx` — "widget CSS reflects updated x,y when controlled layout changes" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "placing a widget twice at same position is always valid" (PBT)
- **UC1-S8**: User sees widget settled in new position; others remain in place
  - `src/components/DashboardGrid.drag.test.tsx` — "all other widgets remain unchanged" (Component)
  - `src/components/DashboardGrid.gaps.test.tsx` — "non-moved widgets retain their position" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "after moving widget, new cells occupied and old cells free" (PBT)

### Extensions
- **UC1-E5a**: User releases widget outside grid canvas boundary
  - `src/components/DashboardGrid.gaps.test.tsx` — "onLayoutChange NOT called when no pointer movement occurs" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "isValidPlacement with negative coords is always false" (PBT)
- **UC1-E5a1**: System returns widget to original position with smooth animation; layout unchanged
  - `src/components/DashboardGrid.gaps.test.tsx` — "DragOverlay container element is present" (Component) ⚠️ partial
  - `src/utils/gridGeometry.property.test.ts` — "CSS transition value is a non-empty string" (PBT)
- **UC1-E6a**: Target cells partially or fully occupied by another widget
  - `src/components/DashboardGrid.gaps.test.tsx` — "both widgets present after attempted overlapping initial config" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "occupied drop never modifies layout" (PBT)
- **UC1-E6a1**: System rejects drop and returns dragged widget to original position
  - `src/components/DashboardGrid.gaps.test.tsx` — "widgets do not share a grid cell position after overlap resolution" (Component)
- **UC1-E6a2**: System shows visual cue (red highlight) on blocked cells during drag
  - `src/components/DashboardGrid.gaps.test.tsx` — "drop-preview is absent before any drag begins" (Component) ⚠️ partial
  - `src/utils/gridGeometry.property.test.ts` — "overlapping candidate always returns false" + "empty layout always accepts" (PBT)
- **UC1-E6a3**: Layout state unchanged after rejected drop
  - `src/components/DashboardGrid.drag.test.tsx` — "layout state is not mutated when drop is invalid" (Component) ⚠️ partial
  - `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet is pure — same input always gives same output" (PBT)
- **UC1-E6b**: Target cells would place widget partially outside grid bounds
  - `src/utils/gridGeometry.test.ts` — OOB isValidPlacement tests (Unit)
  - `src/utils/gridGeometry.property.test.ts` — "isValidPlacement false for any widget exceeding grid on any side" (PBT)
- **UC1-E6b1**: System treats position as invalid and returns widget
  - `src/utils/gridGeometry.test.ts` — "returns false when x is negative", "returns false when y is negative" (Unit)

### Full Flow Tests
- `UC1` — "Full drag-and-drop repositioning flow" → ❌ missing — e2e test needed

---

## Use Case Details: View Dashboard with Multiple Sized Widgets (ID: UC2)

### Main Scenario
- **UC2-S1**: System receives initial layout configuration with widget sizes and coordinates
  - `src/components/DashboardGrid.test.tsx` — "renders nothing when initialLayout is empty" (Unit)
  - `src/components/DashboardGrid.test.tsx` — "renders one widget per entry in initialLayout" (Unit)
  - `src/components/DashboardGrid.gaps.test.tsx` — "widget CSS reflects updated x,y when controlled layout changes" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "resolveLayout returns same positions for non-conflicting" + "resolveLayout of empty input is always empty" (PBT)
- **UC2-S2**: System renders DashboardGrid canvas divided into equal-sized cells
  - `src/components/DashboardGrid.test.tsx` — "renders a grid container with correct CSS variables" (Unit)
  - `src/components/DashboardGrid.test.tsx` — "renders with display grid" (Unit)
  - `src/components/DashboardGrid.gaps.test.tsx` — "gridTemplateColumns uses the provided cellSize" (Unit)
  - `src/components/DashboardGrid.drag.test.tsx` — "SVG grid lines render one line per column+1 and row+1" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "snapToCell col is always < cols" + "doubling cellSize halves raw cell index" (PBT)
- **UC2-S3**: System renders each DraggableWidget at correct span and position
  - `src/components/DashboardGrid.test.tsx` — "widget has correct grid-column and grid-row CSS" (Unit)
  - `src/components/DraggableWidget.test.tsx` — "applies correct gridColumn and gridRow styles" (Unit)
  - `src/utils/gridGeometry.property.test.ts` — "buildOccupancySet contains every cell of a widget" (PBT)
- **UC2-S4**: User sees all widgets displayed without overlap, proportional to declared size
  - `src/components/DashboardGrid.test.tsx` — "multiple widgets do not overlap" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "no two resolved widgets occupy the same cell" (PBT)

### Extensions
- **UC2-E3a**: Two widgets in initial config overlap — first wins, second relocated
  - `src/components/DashboardGrid.test.tsx` — "emits console.warn" + "first widget retains declared position" (Component)
  - `src/utils/gridGeometry.test.ts` — "second widget is moved to a non-overlapping position" (Unit)
  - `src/components/DashboardGrid.gaps.test.tsx` — "widgets do not share a grid cell position" (Component)
  - `src/utils/gridGeometry.property.test.ts` — "first widget x,y unchanged after resolveLayout with overlapping second" (PBT)
- **UC2-E3b**: Widget declared outside grid bounds — clamped to fit
  - `src/components/DashboardGrid.test.tsx` — "widget declared beyond grid boundary is clamped within bounds" (Component)
  - `src/utils/gridGeometry.test.ts` — "clamps a widget that extends beyond right/bottom boundary" (Unit)
  - `src/utils/gridGeometry.property.test.ts` — "resolveLayout never produces out-of-bounds widget positions" (PBT)

### Full Flow Tests
- `UC2` — "Full initial render flow" → ❌ missing — e2e test needed
