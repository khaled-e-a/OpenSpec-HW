use crate::grid::{GridPosition, GridSize};
use super::{Widget, WidgetState};
use serde::{Deserialize, Serialize};

/// A simple example widget for testing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExampleWidget {
    id: String,
    position: GridPosition,
    size: GridSize,
    state: WidgetState,
    content: String,
}

impl ExampleWidget {
    pub fn new(id: String, position: GridPosition, size: GridSize) -> Self {
        Self {
            id,
            position,
            size,
            state: WidgetState::default(),
            content: "Example Widget".to_string(),
        }
    }
}

impl Widget for ExampleWidget {
    fn id(&self) -> &str {
        &self.id
    }

    fn position(&self) -> GridPosition {
        self.position
    }

    fn size(&self) -> GridSize {
        self.size
    }

    fn set_position(&mut self, position: GridPosition) {
        self.position = position;
    }

    fn set_size(&mut self, size: GridSize) {
        self.size = size;
    }

    fn can_resize(&self) -> bool {
        self.state.resizable
    }

    fn state(&self) -> &WidgetState {
        &self.state
    }

    fn state_mut(&mut self) -> &mut WidgetState {
        &mut self.state
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_widget_creation() {
        let widget = ExampleWidget::new(
            "test-1".to_string(),
            GridPosition::new(1, 2),
            GridSize::new(3, 4),
        );

        assert_eq!(widget.id(), "test-1");
        assert_eq!(widget.position(), GridPosition::new(1, 2));
        assert_eq!(widget.size(), GridSize::new(3, 4));
        assert!(widget.is_draggable());
        assert!(widget.can_resize());
        assert!(!widget.is_locked());
    }

    #[test]
    fn test_widget_locking() {
        let mut widget = ExampleWidget::new(
            "test-2".to_string(),
            GridPosition::new(0, 0),
            GridSize::new(1, 1),
        );

        assert!(widget.is_draggable());
        widget.set_locked(true);
        assert!(!widget.is_draggable());
        assert!(widget.is_locked());
    }
}