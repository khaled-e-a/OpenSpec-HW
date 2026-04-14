## ADDED Requirements

### Requirement: Each widget exposes a resize handle
The system SHALL render a resize handle in the bottom-right corner of every widget whose layout item does not set `resizable: false`. The handle SHALL be a visually distinct draggable element implemented using `@dnd-kit/core`. Resize SHALL work on both mouse and touch devices.

#### Scenario: Resize handle rendered by default
- **WHEN** a widget is rendered on the dashboard without `resizable: false`
- **THEN** a resize handle element is visible in the bottom-right corner of the widget

#### Scenario: Resize handle not rendered when disabled
- **WHEN** a widget's layout item has `resizable: false`
- **THEN** no resize handle is rendered for that widget

---

### Requirement: Resize drag maps to snapped grid size
During a resize drag, the system SHALL compute a candidate `{ w, h }` by mapping the pointer offset from the widget's top-left corner to grid coordinates using the snap algorithm:

```
candidateW = clamp(round((pointerX - widget.left) / colWidth),  minW, maxW)
candidateH = clamp(round((pointerY - widget.top)  / rowHeight), minH, maxH)
```

The resize preview border SHALL update in real time to reflect the clamped candidate size.

#### Scenario: Resize preview snaps to cell boundary
- **WHEN** the user drags the resize handle so the pointer is at a pixel offset corresponding to 2.6 columns
- **THEN** the preview shows `w = 3` (rounded to nearest column)

#### Scenario: Resize preview updates continuously
- **WHEN** the user moves the pointer during an active resize drag
- **THEN** the resize preview border updates on every pointer-move event to reflect the current snapped candidate size

---

### Requirement: Widget size constraints are enforced during resize
Each layout item MAY define `minW`, `minH`, `maxW`, and `maxH`. Defaults are `minW=1`, `minH=1`, `maxW=columns`, `maxH` unbounded. The system SHALL clamp the candidate `{ w, h }` to these bounds before updating the preview and before committing.

#### Scenario: Candidate size below minimum clamped
- **WHEN** the resize candidate `w` is smaller than the widget's `minW`
- **THEN** the preview and committed size use `minW` instead

#### Scenario: Candidate size above maximum clamped
- **WHEN** the resize candidate `h` exceeds the widget's `maxH`
- **THEN** the preview and committed size use `maxH` instead

#### Scenario: Pointer outside grid boundary clamped
- **WHEN** the pointer moves beyond the right or bottom edge of the grid during resize
- **THEN** the candidate `w` or `h` is clamped to the maximum value that keeps the widget within the grid

---

### Requirement: Resize Widget — successful resize commits layout change
When the user releases the resize handle, the system SHALL apply the confirmed `{ w, h }` to the widget's layout entry, re-flow any displaced widgets, and invoke `onLayoutChange` with the full updated layout array.

#### Scenario: Resize Widget — happy path
- **WHEN** the user releases the resize handle over a valid candidate size
- **THEN** the widget's `w` and `h` update to the snapped values, `onLayoutChange` is invoked with the updated layout, and the dashboard returns to interactive state

#### Scenario: No two widgets overlap after resize
- **WHEN** a resize completes successfully
- **THEN** every widget in the updated layout occupies a unique, non-overlapping set of grid cells

---

### Requirement: Displaced widgets are pushed downward on resize
When a resize causes a widget to grow into space occupied by another widget, the system SHALL push displaced widgets downward by the minimum number of rows needed to eliminate the overlap. Displaced widgets MAY in turn push further widgets downward (cascade). The system SHALL apply the push recursively up to a depth of 10.

#### Scenario: Overlapping widget pushed down
- **WHEN** a widget is resized to occupy rows that another widget currently occupies
- **THEN** the overlapping widget's `y` increases by the minimum offset needed to eliminate the overlap

#### Scenario: Cascade push resolves secondary overlaps
- **WHEN** pushing a widget down causes it to overlap a third widget
- **THEN** the third widget is also pushed down to resolve the new overlap

#### Scenario: Resize refused when push would exceed grid boundary
- **WHEN** pushing displaced widgets downward would move any widget off the right column boundary (horizontal extent exceeded)
- **THEN** the resize is refused, all positions revert to pre-resize values, and `onLayoutChange` is not called

#### Scenario: Resize refused when recursion depth exceeded
- **WHEN** the cascade push reaches a depth of 10 without resolving all overlaps
- **THEN** the resize is refused and all positions revert to pre-resize values

---

### Requirement: Escape key cancels an active resize
The system SHALL cancel the current resize interaction when the user presses the Escape key, restoring the widget to its original `{ w, h }`. `onLayoutChange` SHALL NOT be called on cancellation.

#### Scenario: Escape cancels resize
- **WHEN** the user presses Escape during an active resize drag
- **THEN** the resize is cancelled, the widget restores its original size, and `onLayoutChange` is not invoked
