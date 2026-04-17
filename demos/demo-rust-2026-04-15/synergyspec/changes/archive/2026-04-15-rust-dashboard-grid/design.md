## Context

This design addresses the implementation of a drag-and-drop dashboard grid system in Rust. The system must provide flexible widget arrangement with grid-based snapping, resize capabilities, and persistence. The implementation will use Rust's type system for safety and performance while providing an intuitive user interface.

## Use Case Coverage

See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:
- UC1-S1: User presses mouse button on widget → Mouse event handling system
- UC1-S2: System highlights widget and shows drag preview → Drag preview rendering
- UC1-S3: User moves mouse to desired position → Mouse tracking and position calculation
- UC1-S4: System displays grid overlay with valid drop zones → Grid rendering and validation
- UC1-S5: User releases mouse button → Mouse release event handling
- UC1-S6: System snaps widget to nearest grid position → Grid snapping algorithm
- UC1-S7: System updates layout state and persists configuration → State management and persistence
- UC1-E2a: Widget is locked or not draggable → Widget state management
- UC1-E4a: Target position conflicts with existing widget → Collision detection
- UC2-S1: User hovers over resize handle → Resize handle detection
- UC2-S2: System shows resize cursor indicator → Cursor management
- UC2-S4: System displays resize preview outline → Resize preview rendering
- UC2-S6: System snaps outline to grid increments → Grid-based resize constraints
- UC2-S9: System updates layout and saves configuration → Layout persistence
- UC3-S2: System serializes current widget positions and sizes → Serialization system
- UC3-S3: System writes configuration to storage → Storage interface
- UC4-S2: System validates widget definition → Widget validation
- UC4-S3: System registers widget in registry → Registry implementation
- UC5-S2: System validates configuration format → Configuration validation
- UC5-S4: System positions widgets according to saved layout → Layout restoration

### Unaddressed Use Case Steps
- UC1-E5a1 (animate widget back): Animation is marked as a future enhancement
- UC3-E3a1 (queue save): Offline handling is deferred to a future iteration

## Goals / Non-Goals

**Goals:**
- Provide smooth drag-and-drop interactions with grid snapping
- Support widget resizing with constraints
- Enable widget registration and discovery
- Persist dashboard configurations reliably
- Ensure responsive performance with multiple widgets

**Non-Goals:**
- Complex animations (basic transitions only)
- Offline queue management (basic error handling)
- Touch/mobile gestures (mouse events only for MVP)
- Real-time collaborative editing

## Decisions

### Decision 1: Use egui for Immediate Mode GUI
**Addresses**: UC1-S2 - System highlights widget and shows drag preview
**Rationale**: egui provides excellent immediate mode rendering with built-in drag detection, widget primitives, and cross-platform support. Its immediate mode architecture naturally supports our dynamic layout requirements.
**Alternative Considered**: iced - Rejected because its retained mode architecture would require more complex state synchronization for drag operations

### Decision 2: Grid-Based Coordinate System with (row, column) Positioning
**Addresses**: UC1-S6 - System snaps widget to nearest grid position
**Rationale**: Using integer grid coordinates simplifies collision detection, enables consistent snapping behavior, and makes persistence straightforward. Each widget occupies a rectangle defined by (row, column, width, height) in grid units.
**Alternative Considered**: Pixel-based positioning - Rejected because it complicates snapping logic and collision detection

### Decision 3: Centralized State Management with Rust Types
**Addresses**: UC1-S7 - System updates layout state and persists configuration
**Rationale**: A centralized DashboardState struct containing Vec<Widget> ensures type safety and simplifies state updates. Using serde for serialization provides robust persistence with multiple format support.
```rust
struct DashboardState {
    widgets: Vec<Widget>,
    grid_columns: u32,
    grid_rows: u32,
}
```

### Decision 4: Widget Trait System for Extensibility
**Addresses**: UC4-S3 - System registers widget in registry
**Rationale**: Defining a Widget trait allows developers to implement custom widgets while maintaining consistent behavior. The registry stores Box<dyn Widget> for type erasure while preserving vtable dispatch.
```rust
trait Widget {
    fn id(&self) -> &str;
    fn position(&self) -> GridPosition;
    fn size(&self) -> GridSize;
    fn render(&mut self, ui: &mut egui::Ui, ctx: &WidgetContext);
    fn can_resize(&self) -> bool;
}
```

### Decision 5: Event-Driven Architecture with State Transitions
**Addresses**: UC1-S4 - System displays grid overlay with valid drop zones
**Rationale**: Using an explicit state machine for drag operations (Idle -> Dragging -> Dropped) makes the UI responsive and predictable. Each state can render appropriate visual feedback.
```rust
enum DragState {
    Idle,
    Dragging { widget_id: String, offset: Vec2 },
    Dropping { target_pos: GridPosition },
}
```

### Decision 6: JSON Configuration Format with Versioning
**Addresses**: UC5-S2 - System validates configuration format
**Rationale**: JSON provides human-readable configuration files that can be version controlled. Adding a version field enables future format evolution without breaking existing saves.
```rust
struct DashboardConfig {
    version: u32,
    grid_size: (u32, u32),
    widgets: Vec<WidgetConfig>,
}
```

### Decision 7: Collision Detection with Rectangle Intersection
**Addresses**: UC1-E4a - Target position conflicts with existing widget
**Rationale**: Simple rectangle intersection tests using grid coordinates are efficient and reliable. Pre-calculation during drag operations provides immediate feedback.
```rust
fn check_collision(pos: GridPosition, size: GridSize, 
                  existing: &[Widget]) -> bool {
    // Check if rectangles overlap
}
```

### Decision 8: Resize Handle Detection with Hit Testing
**Addresses**: UC2-S1 - User hovers over resize handle
**Rationale**: Hit testing mouse position against resize handle rectangles provides precise control. Handles are positioned at widget corners and edges with configurable size.

## Risks / Trade-offs

**Performance with Many Widgets** → Mitigation: Use spatial partitioning (grid-based buckets) for collision detection when widget count exceeds 100

**Binary Size with Dynamic Dispatch** → Mitigation: Widget trait is object-safe but methods are minimized; consider compile-time registration for embedded targets

**Configuration Compatibility** → Mitigation: Version field in config format enables migration functions; maintain backward compatibility for at least 2 versions

**Memory Usage with Immediate Mode GUI** → Mitigation: egui efficiently handles per-frame allocations; state is minimal with centralized management

**Learning Curve for Widget Developers** → Mitigation: Provide clear trait documentation and example implementations; consider macro for boilerplate generation

## Migration Plan

Since this is a new system, no migration is needed. Deployment steps:
1. Integrate dashboard grid as a library dependency
2. Implement required Widget trait for application-specific widgets
3. Configure grid dimensions and styling
4. Add configuration persistence path
5. Test with sample widgets

Rollback strategy: Remove dashboard integration and fall back to previous UI layout system.

## Open Questions

1. Should we support widget nesting (widgets containing other widgets)?
2. What's the maximum grid size we should support?
3. Should we provide a default set of common widgets?
4. How should we handle high-DPI displays with grid rendering?
5. Should configuration support partial layouts for widget subsets?