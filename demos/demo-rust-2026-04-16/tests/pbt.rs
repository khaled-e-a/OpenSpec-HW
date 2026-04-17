use assert_cmd::Command;
use chrono::{Datelike, NaiveDate, Weekday};
use proptest::prelude::*;
use proptest::sample::select;

use rust_cli_calendar::{render_month, render_month_styled, weeks_for_month, MonthGeometry};

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

fn is_leap_year(year: i32) -> bool {
    (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
}

fn year_month() -> impl Strategy<Value = (i32, u32)> {
    (1970i32..=2100i32, 1u32..=12u32)
}

fn valid_date() -> impl Strategy<Value = (i32, u32, u32)> {
    year_month().prop_flat_map(|(y, m)| {
        let g = MonthGeometry::for_year_month(y, m);
        (Just(y), Just(m), 1u32..=g.days_in_month)
    })
}

fn monday_start_year_month() -> impl Strategy<Value = (i32, u32)> {
    let mut entries: Vec<(i32, u32)> = Vec::new();
    for y in 1970i32..=2100 {
        for m in 1u32..=12 {
            if NaiveDate::from_ymd_opt(y, m, 1).unwrap().weekday() == Weekday::Mon {
                entries.push((y, m));
            }
        }
    }
    select(entries)
}

// --- Library-level properties (fast) --------------------------------------

proptest! {
    // UC1-S3 (non-leap February): WHEN the month is February of a non-leap year
    //                             THEN days_in_month = 28
    #[test]
    fn uc1_s3_non_leap_feb_has_28_days(year in 1970i32..=2100) {
        prop_assume!(!is_leap_year(year));
        let g = MonthGeometry::for_year_month(year, 2);
        prop_assert_eq!(g.days_in_month, 28);
    }

    // UC1-S3 (leap February): WHEN the month is February of a leap year
    //                         THEN days_in_month = 29
    #[test]
    fn uc1_s3_leap_feb_has_29_days(year in 1970i32..=2100) {
        prop_assume!(is_leap_year(year));
        let g = MonthGeometry::for_year_month(year, 2);
        prop_assert_eq!(g.days_in_month, 29);
    }

    // UC1-S3 (30-day months): WHEN the month is April, June, September, or November
    //                         THEN days_in_month = 30
    #[test]
    fn uc1_s3_thirty_day_months_have_30_days(
        year in 1970i32..=2100,
        month in prop_oneof![Just(4u32), Just(6u32), Just(9u32), Just(11u32)],
    ) {
        let g = MonthGeometry::for_year_month(year, month);
        prop_assert_eq!(g.days_in_month, 30);
    }

    // UC1-S4 (header layout): WHEN render_month prints the header
    //                         THEN the header line is 24 chars and trims to the full month name
    #[test]
    fn uc1_s4_header_is_24_chars_and_names_month((year, month) in year_month()) {
        let out = render_month(year, month);
        let first = out.lines().next().expect("header line present");
        prop_assert_eq!(first.chars().count(), 24);
        prop_assert_eq!(first.trim(), MONTH_NAMES[(month - 1) as usize]);
    }

    // UC1-S5 (weekday header): WHEN render_month prints the weekday row
    //                          THEN it equals "    Mo Tu We Th Fr Sa Su" exactly
    #[test]
    fn uc1_s5_weekday_header_is_exact((year, month) in year_month()) {
        let out = render_month(year, month);
        let second = out.lines().nth(1).expect("weekday line present");
        prop_assert_eq!(second, "    Mo Tu We Th Fr Sa Su");
    }

    // UC1-S6 (every day once): WHEN the month is rendered
    //                          THEN every day 1..=days_in_month appears exactly once, in order
    #[test]
    fn uc1_s6_every_day_appears_exactly_once_in_order((year, month) in year_month()) {
        let g = MonthGeometry::for_year_month(year, month);
        let weeks = weeks_for_month(&g);
        let mut collected: Vec<u32> = Vec::new();
        for week in &weeks {
            for cell in week.cells.iter() {
                if let Some(d) = cell {
                    collected.push(*d);
                }
            }
        }
        prop_assert_eq!(collected.len() as u32, g.days_in_month);
        for (i, d) in collected.iter().enumerate() {
            prop_assert_eq!(*d, (i as u32) + 1);
        }
    }

    // UC1-S6 (first-row leading blanks): WHEN day 1 is not Monday
    //                                    THEN the first row has leading None cells matching the weekday index
    #[test]
    fn uc1_s6_first_row_leading_blanks_match_weekday((year, month) in year_month()) {
        let first = NaiveDate::from_ymd_opt(year, month, 1).expect("valid first-of-month");
        let idx = first.weekday().num_days_from_monday() as usize;
        let g = MonthGeometry::for_year_month(year, month);
        let weeks = weeks_for_month(&g);
        let row = &weeks[0];
        for i in 0..idx {
            prop_assert!(row.cells[i].is_none(), "cell {} should be None, was {:?}", i, row.cells[i]);
        }
        prop_assert_eq!(row.cells[idx], Some(1));
    }

    // UC1-E5a (printable ASCII): WHEN render_month produces output
    //                            THEN every byte is printable ASCII or a newline
    #[test]
    fn uc1_e5a_output_is_printable_ascii((year, month) in year_month()) {
        let out = render_month(year, month);
        for (i, b) in out.bytes().enumerate() {
            prop_assert!(
                b == b'\n' || (b' '..=b'~').contains(&b),
                "byte {i} is {b:#x}, not printable ASCII or \\n",
            );
        }
    }

    // UC1-E6a (Monday start): WHEN day 1 is Monday
    //                         THEN the first row has no leading None cells and day 1 is at index 0
    #[test]
    fn uc1_e6a_monday_start_has_no_leading_blanks((year, month) in monday_start_year_month()) {
        let first = NaiveDate::from_ymd_opt(year, month, 1).unwrap();
        prop_assert_eq!(first.weekday(), Weekday::Mon);
        let g = MonthGeometry::for_year_month(year, month);
        let weeks = weeks_for_month(&g);
        prop_assert_eq!(weeks[0].cells[0], Some(1));
    }

    // UC1-E6b (trailing blanks): WHEN the last day of the month is not Sunday
    //                            THEN the last row has (6 - weekday_index(last)) trailing None cells
    #[test]
    fn uc1_e6b_trailing_blanks_match_weekday((year, month) in year_month()) {
        let g = MonthGeometry::for_year_month(year, month);
        let last = NaiveDate::from_ymd_opt(year, month, g.days_in_month).unwrap();
        let last_idx = last.weekday().num_days_from_monday() as usize;
        prop_assume!(last_idx < 6); // not Sunday
        let weeks = weeks_for_month(&g);
        let row = weeks.last().expect("at least one row");
        for i in (last_idx + 1)..7 {
            prop_assert!(row.cells[i].is_none(), "cell {i} should be None, was {:?}", row.cells[i]);
        }
    }

    // Task 7.1: WHEN rendered with today=None and is_tty=false
    //           THEN render_month_styled matches render_month byte-for-byte
    #[test]
    fn pbt_styled_with_no_styling_equals_plain_render((year, month) in year_month()) {
        prop_assert_eq!(render_month_styled(year, month, None, false), render_month(year, month));
    }

    // Task 7.2: WHEN is_tty=false for any (year, month, today_in_month)
    //           THEN the output contains zero escape bytes (0x1b)
    #[test]
    fn pbt_non_tty_render_has_no_escape_bytes((y, m, d) in valid_date()) {
        let out = render_month_styled(y, m, Some(d), false);
        prop_assert!(!out.as_bytes().contains(&0x1b));
    }

    // Task 7.3: WHEN is_tty=true and today_in_month=Some(day)
    //           THEN today's cell is wrapped in either "\x1b[7m{:>2}\x1b[0m" (non-weekend)
    //                or "\x1b[1;7m{:>2}\x1b[0m" (weekend)
    #[test]
    fn pbt_tty_render_highlights_today((y, m, d) in valid_date()) {
        let out = render_month_styled(y, m, Some(d), true);
        let cell = format!("{d:>2}");
        let weekday = NaiveDate::from_ymd_opt(y, m, d).unwrap().weekday();
        let is_weekend = matches!(weekday, Weekday::Sat | Weekday::Sun);
        let expected = if is_weekend {
            format!("\x1b[1;7m{cell}\x1b[0m")
        } else {
            format!("\x1b[7m{cell}\x1b[0m")
        };
        prop_assert!(
            out.contains(&expected),
            "expected today cell {expected:?} in output:\n{out}"
        );
    }

    // Task 7.4: WHEN is_tty=true and today_in_month=None
    //           THEN every in-month Saturday and Sunday cell is wrapped in "\x1b[1m{:>2}\x1b[0m"
    //                and no "\x1b[7m" (reverse-video) sequence appears anywhere
    #[test]
    fn pbt_tty_render_highlights_weekends_only_when_today_none((year, month) in year_month()) {
        let out = render_month_styled(year, month, None, true);
        prop_assert!(!out.contains("\x1b[7m"), "reverse-video appeared despite today=None");
        prop_assert!(!out.contains("\x1b[1;7m"), "combined SGR appeared despite today=None");
        let g = MonthGeometry::for_year_month(year, month);
        for day in 1..=g.days_in_month {
            let wd = NaiveDate::from_ymd_opt(year, month, day).unwrap().weekday();
            if matches!(wd, Weekday::Sat | Weekday::Sun) {
                let expected = format!("\x1b[1m{day:>2}\x1b[0m");
                prop_assert!(
                    out.contains(&expected),
                    "expected weekend cell {expected:?} in output for {year}-{month:02}-{day:02}:\n{out}"
                );
            }
        }
    }
}

// --- CLI-level properties (slow, small case count) -------------------------

proptest! {
    #![proptest_config(ProptestConfig { cases: 16, ..ProptestConfig::default() })]

    // UC1-S1 / UC1-S7: WHEN binary invoked with no args (fixed valid date)
    //                  THEN process exits 0
    #[test]
    fn uc1_s1_no_args_exits_zero_for_any_valid_date((y, m, d) in valid_date()) {
        let date_str = format!("{y:04}-{m:02}-{d:02}");
        Command::cargo_bin("rust-cli-calendar")
            .expect("binary built")
            .env("CAL_TEST_DATE", &date_str)
            .assert()
            .success();
    }

    // UC1-S1 (negative): WHEN an extra argument is supplied
    //                    THEN exit is non-zero and stderr contains "usage"
    #[test]
    fn uc1_s1_extra_arg_is_rejected(extra in "[a-zA-Z0-9\\-_]{1,10}") {
        Command::cargo_bin("rust-cli-calendar")
            .expect("binary built")
            .env("CAL_TEST_DATE", "2024-01-15")
            .arg(&extra)
            .assert()
            .failure()
            .stderr(predicates::str::contains("usage"));
    }

    // UC1-S2: WHEN CAL_TEST_DATE resolves to (year, month)
    //         THEN the rendered header contains the corresponding month name
    #[test]
    fn uc1_s2_output_contains_correct_month_name((y, m, d) in valid_date()) {
        let date_str = format!("{y:04}-{m:02}-{d:02}");
        let out = Command::cargo_bin("rust-cli-calendar")
            .expect("binary built")
            .env("CAL_TEST_DATE", &date_str)
            .assert()
            .success()
            .get_output()
            .stdout
            .clone();
        let text = String::from_utf8(out).expect("utf-8 output");
        let name = MONTH_NAMES[(m - 1) as usize];
        prop_assert!(
            text.lines().next().map(|l| l.contains(name)).unwrap_or(false),
            "expected first line to contain {name}, got: {:?}",
            text.lines().next()
        );
    }

    // UC1-E2a: WHEN CAL_TEST_DATE is not parseable as a date
    //          THEN exit is non-zero and stderr contains "invalid CAL_TEST_DATE"
    #[test]
    fn uc1_e2a_invalid_date_fails_with_stderr_message(bogus in "[a-zA-Z][a-zA-Z0-9_]{1,20}") {
        prop_assume!(NaiveDate::parse_from_str(&bogus, "%Y-%m-%d").is_err());
        Command::cargo_bin("rust-cli-calendar")
            .expect("binary built")
            .env("CAL_TEST_DATE", &bogus)
            .assert()
            .failure()
            .stderr(predicates::str::contains("invalid CAL_TEST_DATE"));
    }
}
