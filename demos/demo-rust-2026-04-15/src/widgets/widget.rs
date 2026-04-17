use crate::grid::{GridPosition, GridSize};
use serde::{Deserialize, Serialize};

/// Represents the state of a widget including whether it can be interacted with
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WidgetState {
    /// Whether the widget is locked and cannot be moved or resized
    pub locked: bool,
    /// Whether the widget can be dragged
    pub draggable: bool,
    /// Whether the widget can be resized
    pub resizable: bool,
}

impl Default for WidgetState {
    fn default() -> Self {
        Self {
            locked: false,
            draggable: true,
            resizable: true,
        }
    }
}

/// Core trait that all dashboard widgets must implement
/// Provides the interface for widget positioning, sizing, and interaction
pub trait Widget: Send + Sync {
    /// Unique identifier for this widget instance
    fn id(&self) -> &str;

    /// Current position of the widget on the grid
    fn position(&self) -> GridPosition;

    /// Current size of the widget in grid cells
    fn size(&self) -> GridSize;

    /// Update the position of the widget
    fn set_position(&mut self, position: GridPosition);

    /// Update the size of the widget
    fn set_size(&mut self, size: GridSize);

    /// Whether this widget can be resized
    fn can_resize(&self) -> bool;

    /// Get the current state of the widget
    fn state(&self) -> &WidgetState;

    /// Get mutable access to the widget state
    fn state_mut(&mut self) -> &mut WidgetState;

    /// Check if the widget is locked (cannot be moved or resized)
    fn is_locked(&self) -> bool {
        self.state().locked
    }

    /// Check if the widget can be dragged
    fn is_draggable(&self) -> bool {
        self.state().draggable && !self.state().locked
    }

    /// Lock or unlock the widget
    fn set_locked(&mut self, locked: bool) {
        self.state_mut().locked = locked;
    }
}