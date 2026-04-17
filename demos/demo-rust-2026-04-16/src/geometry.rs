use chrono::{Datelike, NaiveDate, Weekday};

pub struct MonthGeometry {
    pub year: i32,
    pub month: u32,
    pub first_weekday: Weekday,
    pub days_in_month: u32,
}

impl MonthGeometry {
    pub fn for_year_month(year: i32, month: u32) -> Self {
        assert!((1..=12).contains(&month), "month must be in 1..=12");
        let first = NaiveDate::from_ymd_opt(year, month, 1).expect("valid year/month");
        let next = if month == 12 {
            NaiveDate::from_ymd_opt(year + 1, 1, 1)
        } else {
            NaiveDate::from_ymd_opt(year, month + 1, 1)
        }
        .expect("valid next month");
        let days = next.signed_duration_since(first).num_days() as u32;
        Self {
            year,
            month,
            first_weekday: first.weekday(),
            days_in_month: days,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn january_2024_has_31_days_starting_monday() {
        let g = MonthGeometry::for_year_month(2024, 1);
        assert_eq!(g.days_in_month, 31);
        assert_eq!(g.first_weekday, Weekday::Mon);
    }

    #[test]
    fn february_2024_is_leap_year() {
        let g = MonthGeometry::for_year_month(2024, 2);
        assert_eq!(g.days_in_month, 29);
    }

    #[test]
    fn february_2025_is_not_leap_year() {
        let g = MonthGeometry::for_year_month(2025, 2);
        assert_eq!(g.days_in_month, 28);
    }

    #[test]
    fn april_2024_has_30_days() {
        let g = MonthGeometry::for_year_month(2024, 4);
        assert_eq!(g.days_in_month, 30);
    }

    #[test]
    fn december_2024_has_31_days() {
        let g = MonthGeometry::for_year_month(2024, 12);
        assert_eq!(g.days_in_month, 31);
    }
}
