use chrono::{Datelike, NaiveDate, Weekday};

use crate::geometry::MonthGeometry;
use crate::layout::center_month_name;
use crate::style::decorate_day_cell;

const MONTH_NAMES: [&str; 12] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const WEEKDAY_HEADER: &str = "    Mo Tu We Th Fr Sa Su";

pub struct Week {
    pub iso_week: u32,
    pub cells: [Option<u32>; 7],
}

fn weekday_index(w: Weekday) -> usize {
    w.num_days_from_monday() as usize
}

pub fn weeks_for_month(geom: &MonthGeometry) -> Vec<Week> {
    let mut weeks: Vec<Week> = Vec::new();
    for day in 1..=geom.days_in_month {
        let date = NaiveDate::from_ymd_opt(geom.year, geom.month, day)
            .expect("valid date within the month");
        let iso_week = date.iso_week().week();
        let start_new_row = weeks.last().map_or(true, |w| w.iso_week != iso_week);
        if start_new_row {
            weeks.push(Week {
                iso_week,
                cells: [None; 7],
            });
        }
        let row = weeks.last_mut().expect("row just pushed or already present");
        row.cells[weekday_index(date.weekday())] = Some(day);
    }
    weeks
}

pub fn render_month(year: i32, month: u32) -> String {
    render_month_styled(year, month, None, false)
}

pub fn render_month_styled(
    year: i32,
    month: u32,
    today_in_month: Option<u32>,
    is_tty: bool,
) -> String {
    let geom = MonthGeometry::for_year_month(year, month);
    let mut out = String::new();

    let name = MONTH_NAMES[(month - 1) as usize];
    out.push_str(&center_month_name(name));
    out.push('\n');

    out.push_str(WEEKDAY_HEADER);
    out.push('\n');

    for week in weeks_for_month(&geom) {
        let mut line = format!("{:>3}", week.iso_week);
        for cell in week.cells.iter() {
            match cell {
                Some(d) => {
                    line.push(' ');
                    let weekday = NaiveDate::from_ymd_opt(year, month, *d)
                        .expect("valid date within the month")
                        .weekday();
                    line.push_str(&decorate_day_cell(*d, today_in_month, weekday, is_tty));
                }
                None => line.push_str("   "),
            }
        }
        let trimmed = line.trim_end_matches(' ');
        out.push_str(trimmed);
        out.push('\n');
    }

    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn weeks_for_january_2024_has_five_rows_starting_monday() {
        let g = MonthGeometry::for_year_month(2024, 1);
        let weeks = weeks_for_month(&g);
        assert_eq!(weeks.len(), 5);
        assert_eq!(weeks[0].iso_week, 1);
        assert_eq!(weeks[0].cells[0], Some(1));
        assert_eq!(weeks[0].cells[6], Some(7));
        assert_eq!(weeks[4].cells[0], Some(29));
        assert_eq!(weeks[4].cells[2], Some(31));
        assert_eq!(weeks[4].cells[3], None);
    }

    #[test]
    fn weeks_for_february_2025_ends_on_friday_with_trailing_blanks() {
        let g = MonthGeometry::for_year_month(2025, 2);
        let weeks = weeks_for_month(&g);
        let last = weeks.last().expect("at least one week");
        assert_eq!(last.cells[4], Some(28));
        assert_eq!(last.cells[5], None);
        assert_eq!(last.cells[6], None);
    }

    #[test]
    fn render_january_2024_matches_golden_layout() {
        let expected = concat!(
            "        January         \n",
            "    Mo Tu We Th Fr Sa Su\n",
            "  1  1  2  3  4  5  6  7\n",
            "  2  8  9 10 11 12 13 14\n",
            "  3 15 16 17 18 19 20 21\n",
            "  4 22 23 24 25 26 27 28\n",
            "  5 29 30 31\n",
        );
        assert_eq!(render_month(2024, 1), expected);
    }

    #[test]
    fn render_output_contains_no_escape_codes() {
        let output = render_month(2024, 1);
        assert!(!output.contains('\x1b'));
        for b in output.bytes() {
            assert!(
                b == b'\n' || (b' '..=b'~').contains(&b),
                "non-printable byte in output: {:#x}",
                b
            );
        }
    }

    #[test]
    fn render_month_styled_with_no_styling_equals_plain_render() {
        // Task 5.2: delegation regression — styling-off output must match existing golden byte-for-byte.
        let plain = render_month(2024, 1);
        let styled_off = render_month_styled(2024, 1, None, false);
        assert_eq!(styled_off, plain);
    }

    #[test]
    fn render_month_styled_jan_2024_today_15_highlights_today_and_weekends_only() {
        // Task 5.3: today=Jan 15 (a Monday), weekends Jan 6 (Sat) and Jan 7 (Sun) get bold;
        // today gets reverse video (not combined since Jan 15 is not a weekend).
        let out = render_month_styled(2024, 1, Some(15), true);
        let today_matches: Vec<_> = out.match_indices("\x1b[7m15\x1b[0m").collect();
        assert_eq!(
            today_matches.len(),
            1,
            "expected today cell '\\x1b[7m15\\x1b[0m' exactly once; got {} in:\n{out}",
            today_matches.len()
        );
        assert!(
            out.contains("\x1b[1m 6\x1b[0m"),
            "expected Saturday Jan 6 wrapped in bold; got:\n{out}"
        );
        assert!(
            out.contains("\x1b[1m 7\x1b[0m"),
            "expected Sunday Jan 7 wrapped in bold; got:\n{out}"
        );
        assert!(
            !out.contains("\x1b[1;7m"),
            "expected NO combined SGR (today 15 is a Monday, not a weekend); got:\n{out}"
        );
    }

    #[test]
    fn render_month_styled_jan_2024_today_7_uses_combined_sgr_for_sunday() {
        // Task 5.4: today=Jan 7 (a Sunday); cell must use combined SGR "1;7" — no nesting.
        let out = render_month_styled(2024, 1, Some(7), true);
        let combined_matches: Vec<_> = out.match_indices("\x1b[1;7m 7\x1b[0m").collect();
        assert_eq!(
            combined_matches.len(),
            1,
            "expected combined '\\x1b[1;7m 7\\x1b[0m' exactly once; got {} in:\n{out}",
            combined_matches.len()
        );
        assert!(
            !out.contains("\x1b[7m 7\x1b[0m"),
            "expected NO standalone reverse-video today cell; got:\n{out}"
        );
        assert!(
            !out.contains("\x1b[1m 7\x1b[0m"),
            "expected NO standalone bold today cell; got:\n{out}"
        );
    }
}
