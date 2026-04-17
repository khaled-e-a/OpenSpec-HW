pub const WEEK_COL_WIDTH: usize = 3;
pub const DAY_CELL_WIDTH: usize = 3;
pub const GRID_WIDTH: usize = WEEK_COL_WIDTH + 7 * DAY_CELL_WIDTH;

pub fn center_month_name(name: &str) -> String {
    format!("{:^width$}", name, width = GRID_WIDTH)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn grid_width_is_twenty_four() {
        assert_eq!(GRID_WIDTH, 24);
    }

    #[test]
    fn centering_january_produces_twenty_four_chars() {
        let s = center_month_name("January");
        assert_eq!(s.len(), GRID_WIDTH);
        assert_eq!(s, "        January         ");
    }

    #[test]
    fn centering_may_produces_twenty_four_chars() {
        let s = center_month_name("May");
        assert_eq!(s.len(), GRID_WIDTH);
    }
}
