use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct GridSize {
    pub width: u32,
    pub height: u32,
}

impl GridSize {
    pub fn new(width: u32, height: u32) -> Self {
        Self { width, height }
    }

    pub fn area(&self) -> u32 {
        self.width * self.height
    }

    pub fn contains(&self, pos: &super::GridPosition) -> bool {
        pos.column < self.width && pos.row < self.height
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_grid_size_creation() {
        let size = GridSize::new(10, 20);
        assert_eq!(size.width, 10);
        assert_eq!(size.height, 20);
    }

    #[test]
    fn test_grid_size_area() {
        let size = GridSize::new(5, 10);
        assert_eq!(size.area(), 50);
    }

    #[test]
    fn test_grid_size_contains() {
        let size = GridSize::new(10, 10);
        assert!(size.contains(&super::super::GridPosition::new(5, 5)));
        assert!(!size.contains(&super::super::GridPosition::new(15, 5)));
        assert!(!size.contains(&super::super::GridPosition::new(5, 15)));
    }
}