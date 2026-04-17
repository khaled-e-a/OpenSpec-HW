use chrono::Weekday;

const RESET: &str = "\x1b[0m";
const SGR_TODAY: &str = "7";
const SGR_WEEKEND: &str = "1";
const SGR_TODAY_WEEKEND: &str = "1;7";

pub fn decorate_day_cell(
    day: u32,
    today_in_month: Option<u32>,
    weekday: Weekday,
    is_tty: bool,
) -> String {
    let plain = format!("{day:>2}");
    if !is_tty {
        return plain;
    }
    let is_today = today_in_month == Some(day);
    let is_weekend = matches!(weekday, Weekday::Sat | Weekday::Sun);
    let attrs = match (is_today, is_weekend) {
        (true, true) => SGR_TODAY_WEEKEND,
        (true, false) => SGR_TODAY,
        (false, true) => SGR_WEEKEND,
        (false, false) => return plain,
    };
    format!("\x1b[{attrs}m{plain}{RESET}")
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Case {
        name: &'static str,
        day: u32,
        today: Option<u32>,
        weekday: Weekday,
        is_tty: bool,
        expected: &'static str,
    }

    #[test]
    fn decorate_day_cell_covers_all_eight_combinations() {
        let cases = [
            Case {
                name: "non-tty, plain weekday",
                day: 5,
                today: None,
                weekday: Weekday::Mon,
                is_tty: false,
                expected: " 5",
            },
            Case {
                name: "non-tty, today weekday",
                day: 8,
                today: Some(8),
                weekday: Weekday::Wed,
                is_tty: false,
                expected: " 8",
            },
            Case {
                name: "non-tty, weekend",
                day: 4,
                today: None,
                weekday: Weekday::Sat,
                is_tty: false,
                expected: " 4",
            },
            Case {
                name: "non-tty, today on weekend",
                day: 7,
                today: Some(7),
                weekday: Weekday::Sun,
                is_tty: false,
                expected: " 7",
            },
            Case {
                name: "tty, plain weekday",
                day: 5,
                today: None,
                weekday: Weekday::Mon,
                is_tty: true,
                expected: " 5",
            },
            Case {
                name: "tty, today weekday",
                day: 8,
                today: Some(8),
                weekday: Weekday::Wed,
                is_tty: true,
                expected: "\x1b[7m 8\x1b[0m",
            },
            Case {
                name: "tty, weekend Saturday",
                day: 4,
                today: None,
                weekday: Weekday::Sat,
                is_tty: true,
                expected: "\x1b[1m 4\x1b[0m",
            },
            Case {
                name: "tty, today on Sunday (weekend)",
                day: 7,
                today: Some(7),
                weekday: Weekday::Sun,
                is_tty: true,
                expected: "\x1b[1;7m 7\x1b[0m",
            },
        ];

        for c in &cases {
            let got = decorate_day_cell(c.day, c.today, c.weekday, c.is_tty);
            assert_eq!(got, c.expected, "case: {}", c.name);
        }
    }
}
