## Implementation Overview
This task list implements the `rust-cli-calendar` change: a Rust binary that prints the current month's calendar to stdout with ISO 8601 week numbers. See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps. Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:
- UC1-S1: Terminal User invokes the binary with no arguments
- UC1-S2: System resolves the current local date (year, month, day)
- UC1-S3: System determines the first weekday of the month and total days in the month
- UC1-S4: System prints a centered month-name header line
- UC1-S5: System prints the weekday header row `Mo Tu We Th Fr Sa Su` offset for the week-number column
- UC1-S6: System prints one row per week with ISO week number and right-aligned day numbers, blanks for out-of-month days
- UC1-S7: System exits with status code 0 after flushing stdout
- UC1-E2a: System cannot resolve local date; prints an error to stderr and exits non-zero
- UC1-E5a: Stdout is not a TTY; output stays plain text with no escape codes
- UC1-E6a: Month begins on Monday; first row has no leading blank day cells
- UC1-E6b: Month ends before Sunday; last row has trailing blank cells to preserve alignment

## 1. Project Scaffolding

- [x] 1.1 Run `cargo init --bin` at the project root to create `Cargo.toml` and `src/main.rs`, setting package name `rust-cli-calendar` and Rust edition `2021`
- [x] 1.2 Add `chrono = { version = "0.4", default-features = false, features = ["clock", "std"] }` to `Cargo.toml` (Addresses: UC1-S2, UC1-S3)
- [x] 1.3 Commit a `.gitignore` that excludes `target/` and `Cargo.lock` is kept for a binary crate (binary crates commit `Cargo.lock`)

## 2. Core Domain (pure, no I/O)

- [x] 2.1 In `src/geometry.rs`, define `struct MonthGeometry { year: i32, month: u32, first_weekday: chrono::Weekday, days_in_month: u32 }` and a constructor `MonthGeometry::for_year_month(year, month) -> MonthGeometry` that computes `days_in_month` via next-month-first-day arithmetic from `chrono::NaiveDate` (Addresses: UC1-S3)
- [x] 2.2 In `src/layout.rs`, define constants `WEEK_COL_WIDTH: usize = 3`, `DAY_CELL_WIDTH: usize = 3`, `GRID_WIDTH: usize = WEEK_COL_WIDTH + 7 * DAY_CELL_WIDTH` (= 24 chars, matching the proposal's example layout) and a pure `fn center_month_name(name: &str) -> String` (Addresses: UC1-S4, UC1-S5)
- [x] 2.3 In `src/render.rs`, define `struct Week { iso_week: u32, cells: [Option<u32>; 7] }` and `fn weeks_for_month(geom: &MonthGeometry) -> Vec<Week>` that walks every day of the month, groups by ISO week (`NaiveDate::iso_week().week()`), and places the day into `cells[weekday_index]` where Monday = 0 (Addresses: UC1-S6, UC1-E6a, UC1-E6b)
- [x] 2.4 In `src/render.rs`, add `fn render_month(year: i32, month: u32) -> String` that: (a) prints the centered month header line, (b) prints the weekday header row `"    Mo Tu We Th Fr Sa Su"`, (c) prints one line per `Week` using `format!("{:>3}", iso_week)` for the leading column and `format!("{:>3}", d)` (or three spaces for `None`) for each cell, trimming trailing spaces; each line ends with `\n` (Addresses: UC1-S4, UC1-S5, UC1-S6)

## 3. Date Provider + Entry Point

- [x] 3.1 In `src/clock.rs`, add `fn today_ymd() -> Result<(i32, u32), CalendarError>` that wraps `chrono::Local::now().date_naive()` (overridable via the hidden `CAL_TEST_DATE=YYYY-MM-DD` env var for integration tests) and maps any failure to a `CalendarError` with a human-readable message (Addresses: UC1-S2, UC1-E2a)
- [x] 3.2 In `src/main.rs`, parse `std::env::args()`: reject any invocation with more than one argument by writing `usage: rust-cli-calendar` to stderr and exiting non-zero (Addresses: UC1-S1)
- [x] 3.3 In `src/main.rs`, on the happy path: call `today_ymd()`, on `Err` write the error to stderr and exit with status `1` (Addresses: UC1-E2a); on `Ok((year, month))` build `render_month(year, month)`, write it via a locked `io::stdout()` handle, `flush()`, and return `ExitCode::SUCCESS` (Addresses: UC1-S7)
- [x] 3.4 Confirm the renderer never writes ANSI escape codes or invokes terminal-detection; output is the same bytes whether stdout is a TTY or a pipe (Addresses: UC1-E5a)

## 4. Tests

- [x] 4.1 Unit test `MonthGeometry::for_year_month` for February 2024 (29 days, leap), February 2025 (28 days, non-leap), April 2024 (30 days), and January 2024 (31 days, starts Monday) (Addresses: UC1-S3, UC1-E6a)
- [x] 4.2 Unit test `weeks_for_month` for a month that ends mid-week (February 2025 ends Friday → last row has two trailing `None` cells) (Addresses: UC1-E6b)
- [x] 4.3 Golden-string unit test for `render_month(2024, 1)` — centered `January`, weekday header with leading spaces, week-numbered rows for ISO weeks 1–5 (Addresses: UC1-S4, UC1-S5, UC1-S6, UC1-E6a)
- [x] 4.4 Integration test via `assert_cmd`: run the compiled binary with no arguments, inject `CAL_TEST_DATE=2024-01-15` to pin the clock, assert stdout matches the golden string and exit code is 0 (Addresses: UC1-S1, UC1-S7)
- [x] 4.5 Integration test: run the binary with an extra argument, assert a non-zero exit code and a usage message on stderr (Addresses: UC1-S1)
- [x] 4.6 Integration test: capture stdout through a pipe and assert the bytes contain only printable ASCII, spaces, and `\n` — no escape sequences (Addresses: UC1-E5a)

## 5. Manual Verification

- [x] 5.1 Run `cargo build --release` on macOS; confirm it compiles with no warnings
- [x] 5.2 Run `./target/release/rust-cli-calendar` in a terminal and visually confirm the layout matches the example in the proposal for the current month (Addresses: UC1-S1, UC1-S4, UC1-S5, UC1-S6, UC1-S7)
- [x] 5.3 Run `./target/release/rust-cli-calendar | cat` and confirm identical output to the TTY run (Addresses: UC1-E5a)
