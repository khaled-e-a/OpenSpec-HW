## Implementation Overview
This task list implements the `highlight-today-and-weekends` change: a TTY-aware styling layer on top of the existing `current-month-calendar` capability. See `usecases.md` "Use Case Traceability Mapping" for the full list of use case steps. Each task below indicates which step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:
- UC1-S1 / UC2-S1: Terminal User invokes the binary with no arguments in an interactive shell
- UC1-S2 / UC2-S2: System resolves today's local date and the month to render
- UC1-S3 / UC2-S3: System detects that stdout is a TTY
- UC1-S4: System identifies today's cell (by day-of-month)
- UC1-S5: System wraps today's cell in the reverse-video SGR pair (`\x1b[7m` … `\x1b[0m`)
- UC1-S6 / UC2-S6: System prints the decorated calendar and exits 0
- UC1-E3a / UC2-E3a: Stdout is not a TTY — no SGR sequences emitted; output is plain ASCII
- UC1-E5a: Terminal does not interpret SGR — raw bytes are emitted (accepted fallback)
- UC2-S4: For every in-month Saturday or Sunday cell, wrap the day number in the bold SGR pair (`\x1b[1m` … `\x1b[0m`)
- UC2-S5 / UC2-E5a: Today is a weekend — a single combined SGR pair (`\x1b[1;7m` … `\x1b[0m`) is used

## 1. Library Surface

- [x] 1.1 In `src/clock.rs`, replace `today_ymd() -> Result<(i32, u32), CalendarError>` with `today_date() -> Result<chrono::NaiveDate, CalendarError>` (CAL_TEST_DATE parsing already produces a `NaiveDate`, so only the return type changes). Re-export the new symbol from `src/lib.rs`. (Addresses: UC1-S2, UC2-S2)
- [x] 1.2 In `src/lib.rs`, add `pub use style::decorate_day_cell;` and `pub use render::render_month_styled;` alongside the existing exports (keep `render_month` exported and unchanged).

## 2. Styling Core (`src/style.rs`)

- [x] 2.1 Create `src/style.rs` with SGR constants at module top: `const RESET: &str = "\x1b[0m";`, `const SGR_TODAY: &str = "7";`, `const SGR_WEEKEND: &str = "1";`, `const SGR_TODAY_WEEKEND: &str = "1;7";`.
- [x] 2.2 Add `pub fn decorate_day_cell(day: u32, today_in_month: Option<u32>, weekday: chrono::Weekday, is_tty: bool) -> String` that returns `format!("{day:>2}")` when `!is_tty` OR when neither today nor weekend applies, and otherwise returns `format!("\x1b[{attrs}m{cell}{RESET}", attrs = <matched>, cell = format!("{day:>2}"))`. (Addresses: UC1-S5, UC2-S4, UC2-S5, UC1-E3a, UC2-E3a)
- [x] 2.3 Wire `mod style;` into `src/lib.rs`.

## 3. Renderer Integration (`src/render.rs`)

- [x] 3.1 Add `pub fn render_month_styled(year: i32, month: u32, today_in_month: Option<u32>, is_tty: bool) -> String`. It mirrors `render_month` but calls `decorate_day_cell(d, today_in_month, weekday_of(year, month, d), is_tty)` for every `Some(d)` cell and keeps `None` cells as two spaces. Week-number column, month header, and weekday header row are NEVER styled. (Addresses: UC1-S4, UC1-S5, UC2-S4, UC2-S5)
- [x] 3.2 Refactor the existing `render_month(year, month)` to delegate to `render_month_styled(year, month, None, false)` so its byte output is unchanged and existing tests (golden + property) keep passing.
- [x] 3.3 Confirm trailing-whitespace trimming still operates on the PLAIN day-number content (i.e. happens before SGR wrapping), so SGR sequences never sit on the trimmed tail of a partial last row. (Addresses: UC1-E5a)

## 4. Entry Point (`src/main.rs`)

- [x] 4.1 Import `std::io::{self, IsTerminal, Write}`. After argv validation and before any stdout write, compute `let is_tty = io::stdout().is_terminal();`. (Addresses: UC1-S3, UC2-S3)
- [x] 4.2 Replace the `today_ymd()` call with `today_date()`. Derive `(year, month, day) = (date.year(), date.month(), date.day())`; compute `let today_in_month: Option<u32> = Some(day);` — this is always `Some` because we render today's month. (Addresses: UC1-S2, UC1-S4)
- [x] 4.3 Call `render_month_styled(year, month, today_in_month, is_tty)` and write to locked stdout (same flush/exit pattern as today). (Addresses: UC1-S6, UC2-S6)

## 5. Unit Tests

- [x] 5.1 In `src/style.rs`, table-driven unit tests for `decorate_day_cell` covering all 8 combinations of (is_tty ∈ {false, true}) × (is_today ∈ {false, true}) × (is_weekend ∈ {false, true}): plain Monday 5, TTY-today Wed 8, TTY-weekend Sat 4, TTY today+weekend Sun 7, non-TTY variants always plain. Each case asserts the exact output string. (Addresses: UC1-S5, UC2-S4, UC2-S5, UC1-E3a, UC2-E3a)
- [x] 5.2 In `src/render.rs`, add a unit test that `render_month_styled(2024, 1, None, false)` equals the existing January 2024 golden string (regression: the delegation in 3.2 must preserve byte output). (Addresses: UC1-E3a)
- [x] 5.3 In `src/render.rs`, add a unit test that `render_month_styled(2024, 1, Some(15), true)` produces a string in which the substring `\x1b[7m15\x1b[0m` appears exactly once AND `\x1b[1m` appears wrapping `" 6"` (Sat Jan 6) and `" 7"` (Sun Jan 7) AND `\x1b[1;7m` does NOT appear (today 15 is a Monday in Jan 2024). (Addresses: UC1-S5, UC2-S4)
- [x] 5.4 In `src/render.rs`, add a unit test that `render_month_styled(2024, 1, Some(7), true)` (Jan 7 2024 is a Sunday) produces a string containing `\x1b[1;7m 7\x1b[0m` exactly once AND does NOT contain a standalone `\x1b[7m 7\x1b[0m` or `\x1b[1m 7\x1b[0m`. (Addresses: UC2-S5, UC2-E5a)

## 6. Integration Tests (`tests/cli.rs`)

- [x] 6.1 Add an integration test `piped_stdout_has_no_escape_codes_when_today_is_in_month` that invokes the binary with `CAL_TEST_DATE=2024-01-15` (so today IS in the rendered month) and asserts the captured stdout bytes are byte-identical to the archived January-2024 plain-text golden. This is the regression guard for UC1-E3a / UC2-E3a and protects the existing `| cat` test too. (Addresses: UC1-E3a, UC2-E3a)
- [x] 6.2 Keep the existing `stdout_is_plain_ascii_with_no_escape_codes` test unchanged — it still asserts no 0x1b bytes when stdout is a pipe. (Addresses: UC1-E3a, UC2-E3a)

## 7. Property-Based Tests (`tests/pbt.rs`)

- [x] 7.1 Add a proptest that for any valid `(year, month)` in [1970, 2100]: `render_month_styled(year, month, None, false) == render_month(year, month)`. (Addresses: UC1-E3a)
- [x] 7.2 Add a proptest that for any valid `(year, month, day)` with `day ∈ 1..=days_in_month`: when `is_tty=false`, `render_month_styled(year, month, Some(day), false)` contains no `0x1b` bytes. (Addresses: UC1-E3a, UC2-E3a)
- [x] 7.3 Add a proptest that for any valid `(year, month, day)`: when `is_tty=true`, the rendered string contains `\x1b[7m{:>2}\x1b[0m` OR `\x1b[1;7m{:>2}\x1b[0m` for the given `day` (i.e. today is highlighted whether or not it's a weekend). (Addresses: UC1-S5, UC2-S5)
- [x] 7.4 Add a proptest that for any valid `(year, month)`: when `is_tty=true` and `today_in_month = None`, every in-month Saturday and Sunday day number appears wrapped in `\x1b[1m…\x1b[0m` and no `\x1b[7m` pair appears. (Addresses: UC2-S4)

## 8. Manual Verification

- [x] 8.1 `cargo build --release` succeeds with no warnings.
- [x] 8.2 Run `./target/release/rust-cli-calendar` in an interactive terminal: today's cell renders as reverse-video; Saturday and Sunday cells render bold; if today is a weekend, that cell is both. (Addresses: UC1-S5, UC2-S4, UC2-S5)
- [x] 8.3 Run `./target/release/rust-cli-calendar | cat` and `./target/release/rust-cli-calendar > /tmp/cal.txt && cat /tmp/cal.txt` — both outputs must be byte-identical to the archived plain-text render. (Addresses: UC1-E3a, UC2-E3a)
- [x] 8.4 Use the `CAL_TEST_DATE` env var to force a weekend day (e.g. `CAL_TEST_DATE=2024-01-07`) in an interactive terminal and confirm the combined bold+reverse styling renders as expected. (Addresses: UC2-S5, UC2-E5a)
