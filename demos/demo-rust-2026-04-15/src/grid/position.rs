use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct GridPosition {
    pub row: u32,
    pub column: u32,
}

impl GridPosition {
    pub fn new(row: u32, column: u32) -> Self {
        Self { row, column }
    }

    pub fn distance_to(&self, other: &GridPosition) -> f32 {
        let dr = (self.row as f32 - other.row as f32).abs();
        let dc = (self.column as f32 - other.column as f32).abs();
        (dr * dr + dc * dc).sqrt()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_grid_position_creation() {
        let pos = GridPosition::new(5, 10);
        assert_eq!(pos.row, 5);
        assert_eq!(pos.column, 10);
    }

    #[test]
    fn test_grid_position_distance() {
        let pos1 = GridPosition::new(0, 0);
        let pos2 = GridPosition::new(3, 4);
        assert_eq!(pos1.distance_to(&pos2), 5.0);
    }
}