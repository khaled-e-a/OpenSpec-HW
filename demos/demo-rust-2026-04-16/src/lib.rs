mod clock;
mod geometry;
mod layout;
mod render;
mod style;

pub use clock::{today_date, CalendarError};
pub use geometry::MonthGeometry;
pub use layout::{center_month_name, DAY_CELL_WIDTH, GRID_WIDTH, WEEK_COL_WIDTH};
pub use render::{render_month, render_month_styled, weeks_for_month, Week};
pub use style::decorate_day_cell;
