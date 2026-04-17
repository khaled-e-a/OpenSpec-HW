use egui::{Color32, Painter, Pos2, Rect, Stroke};
use super::GridPosition;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum CellState {
    Valid,
    Invalid,
    Occupied,
}

pub struct GridRenderer {
    cell_size: f32,
    columns: u32,
    rows: u32,
}

impl GridRenderer {
    pub fn new(cell_size: f32, columns: u32, rows: u32) -> Self {
        Self {
            cell_size,
            columns,
            rows,
        }
    }

    pub fn render(&self, painter: &Painter, rect: Rect) {
        let stroke = Stroke::new(1.0, Color32::GRAY);

        // Draw vertical lines
        for col in 0..=self.columns {
            let x = rect.left() + (col as f32 * self.cell_size);
            if x <= rect.right() {
                painter.line_segment(
                    [Pos2::new(x, rect.top()), Pos2::new(x, rect.bottom())],
                    stroke,
                );
            }
        }

        // Draw horizontal lines
        for row in 0..=self.rows {
            let y = rect.top() + (row as f32 * self.cell_size);
            if y <= rect.bottom() {
                painter.line_segment(
                    [Pos2::new(rect.left(), y), Pos2::new(rect.right(), y)],
                    stroke,
                );
            }
        }
    }

    pub fn render_cell_overlay(&self, painter: &Painter, position: GridPosition, state: CellState) {
        let rect = self.cell_rect(position);
        let color = match state {
            CellState::Valid => Color32::from_rgba_premultiplied(0, 255, 0, 30),
            CellState::Invalid => Color32::from_rgba_premultiplied(255, 0, 0, 30),
            CellState::Occupied => Color32::from_rgba_premultiplied(255, 255, 0, 30),
        };

        painter.rect_filled(rect, 0.0, color);
    }

    pub fn render_preview_outline(&self, painter: &Painter, position: GridPosition, size: (u32, u32)) {
        let top_left = Pos2::new(
            position.column as f32 * self.cell_size,
            position.row as f32 * self.cell_size,
        );
        let bottom_right = Pos2::new(
            (position.column + size.0) as f32 * self.cell_size,
            (position.row + size.1) as f32 * self.cell_size,
        );

        let rect = Rect::from_two_pos(top_left, bottom_right);
        painter.rect_stroke(rect, 0.0, Stroke::new(2.0, Color32::BLUE), egui::StrokeKind::Inside);
    }

    pub fn cell_rect(&self, position: GridPosition) -> Rect {
        let x = position.column as f32 * self.cell_size;
        let y = position.row as f32 * self.cell_size;
        Rect::from_min_size(
            Pos2::new(x, y),
            egui::Vec2::new(self.cell_size, self.cell_size),
        )
    }

    pub fn snap_to_grid(&self, pos: Pos2) -> GridPosition {
        GridPosition::new(
            ((pos.y / self.cell_size).round() as u32).min(self.rows - 1),
            ((pos.x / self.cell_size).round() as u32).min(self.columns - 1),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::grid::GridPosition;

    #[test]
    fn test_snap_to_grid() {
        let renderer = GridRenderer::new(20.0, 10, 10);

        // Test exact grid positions
        assert_eq!(renderer.snap_to_grid(Pos2::new(0.0, 0.0)), GridPosition::new(0, 0));
        assert_eq!(renderer.snap_to_grid(Pos2::new(20.0, 20.0)), GridPosition::new(1, 1));

        // Test rounding
        assert_eq!(renderer.snap_to_grid(Pos2::new(15.0, 15.0)), GridPosition::new(1, 1));
        assert_eq!(renderer.snap_to_grid(Pos2::new(25.0, 25.0)), GridPosition::new(1, 1));
    }

    #[test]
    fn test_cell_rect() {
        let renderer = GridRenderer::new(20.0, 10, 10);
        let rect = renderer.cell_rect(GridPosition::new(2, 3));

        assert_eq!(rect.left(), 60.0);  // 3 * 20
        assert_eq!(rect.top(), 40.0);   // 2 * 20
        assert_eq!(rect.width(), 20.0);
        assert_eq!(rect.height(), 20.0);
    }

    #[test]
    fn test_cell_state_colors() {
        // Test that different cell states have different colors
        let valid_color = match CellState::Valid {
            CellState::Valid => Color32::from_rgba_premultiplied(0, 255, 0, 30),
            _ => unreachable!(),
        };
        assert_eq!(valid_color, Color32::from_rgba_premultiplied(0, 255, 0, 30));

        let invalid_color = match CellState::Invalid {
            CellState::Invalid => Color32::from_rgba_premultiplied(255, 0, 0, 30),
            _ => unreachable!(),
        };
        assert_eq!(invalid_color, Color32::from_rgba_premultiplied(255, 0, 0, 30));
    }
}