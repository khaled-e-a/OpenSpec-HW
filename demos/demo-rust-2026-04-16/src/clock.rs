use std::fmt;

use chrono::{Local, NaiveDate};

#[derive(Debug)]
pub struct CalendarError {
    pub message: String,
}

impl fmt::Display for CalendarError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for CalendarError {}

pub fn today_date() -> Result<NaiveDate, CalendarError> {
    if let Ok(raw) = std::env::var("CAL_TEST_DATE") {
        return parse_test_date(&raw);
    }
    Ok(Local::now().date_naive())
}

fn parse_test_date(s: &str) -> Result<NaiveDate, CalendarError> {
    NaiveDate::parse_from_str(s, "%Y-%m-%d").map_err(|e| CalendarError {
        message: format!("invalid CAL_TEST_DATE '{s}': {e}"),
    })
}
