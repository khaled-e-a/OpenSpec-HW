## Context

This is a greenfield Rust crate with no existing code. The deliverable is a single-binary CLI that prints the current month's calendar to stdout in a fixed layout: centered month name, a Monday-first weekday row, and per-week rows prefixed by the ISO 8601 week number. The output must be identical whether stdout is a TTY or a pipe.

Constraints:
- Must run on stable Rust on macOS, Linux, and Windows.
- Cannot assume `cal(1)` or any other system utility is present.
- No network I/O, no filesystem writes, no environment mutation.
- Output layout is part of the contract — tests will assert exact strings for fixed reference dates.

## Use Case Coverage
See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.
This design addresses the following use case steps:
- UC1-S1: Terminal User invokes the binary with no arguments → Decision 1 (argv handling in `main`)
- UC1-S2: System resolves the current local date → Decision 2 (date provider abstraction over `chrono`)
- UC1-S3: System determines first weekday and total days of the month → Decision 3 (month-geometry computation)
- UC1-S4: System prints a centered month-name header line → Decision 4 (layout constants and centering helper)
- UC1-S5: System prints the weekday header row offset for the week-number column → Decision 4 (layout constants and centering helper)
- UC1-S6: System prints one row per week with ISO week number and right-aligned day numbers → Decision 5 (row iterator keyed by ISO week)
- UC1-S7: System exits with status code 0 after flushing stdout → Decision 6 (process exit + stdout flush)
- UC1-E2a: Date resolution failure → Decision 2 (date provider returns `Result`; `main` maps to stderr + non-zero exit)
- UC1-E5a: Stdout not a TTY → Decision 7 (no color/escape-code dependency; write plain bytes to `io::stdout()`)
- UC1-E6a: Month begins on Monday → Decision 5 (row iterator: zero leading blanks when weekday == Monday)
- UC1-E6b: Month ends before Sunday → Decision 5 (row iterator emits trailing blank cells)

### Unaddressed Use Case Steps
None. All eleven mapped steps are covered by the decisions below.

## Goals / Non-Goals

**Goals:**
- Deterministic, byte-exact output for a given input date.
- Correct ISO 8601 week numbering, including the edge cases where the first/last week of a month belongs to the neighbouring ISO year.
- Clean separation between "what date is it" (side effect) and "render a month" (pure function), so the renderer is unit-testable without touching the system clock.
- Minimal dependency surface.

**Non-Goals:**
- Flags for specific months/years, different start-of-week, year-at-a-glance views, or colorized output. These are deliberately excluded per the proposal.
- i18n of month names or weekday labels.
- Internationalized week-numbering systems other than ISO 8601.
- Interactive modes or TUI rendering.

## Decisions

### Decision 1: Zero-argument CLI contract in `main`
**Addresses**: UC1-S1 - Terminal User invokes the binary with no arguments
**Rationale**: The use case is exactly "no-argument invocation renders the current month". Keeping `main` as the sole arg checker avoids pulling in `clap` for a single zero-arity contract and keeps the binary small.
**Approach**: `main` reads `std::env::args()`, rejects anything beyond `argv[0]` with a usage message on stderr and a non-zero exit, then delegates to the renderer.
**Alternative Considered**: `clap` — rejected because the argument surface is a single empty set and `clap` adds compile time and binary size without payoff.

### Decision 2: Date provider abstraction over `chrono`
**Addresses**: UC1-S2 - System resolves the current local date; UC1-E2a - Local date unavailable
**Rationale**: Tests must not depend on "today". A narrow trait (`DateProvider` or a function pointer `fn() -> Result<NaiveDate, Error>`) lets `main` pass the real clock while tests inject fixed dates.
**Approach**: Use the `chrono` crate for `Local::now().date_naive()` and for weekday / ISO-week queries (`NaiveDate::weekday`, `NaiveDate::iso_week`). Wrap the clock call in a function that returns `Result<NaiveDate, CalendarError>` so `E2a` is handled as a plain error branch.
**Alternative Considered**: `time` crate — equivalent feature set, but `chrono` has more mature ISO-week helpers (`IsoWeek`) and is already ubiquitous; choosing it reduces surprise. Writing Zeller's-congruence-style math by hand — rejected as needless reinvention and an easy source of leap-year/ISO-week bugs.

### Decision 3: Pure `MonthGeometry` computation
**Addresses**: UC1-S3 - Determine first weekday and total days in the month
**Rationale**: Isolates the only math that matters (first-weekday, days-in-month, leap-year) into a small pure struct that is trivially testable.
**Approach**: A struct `MonthGeometry { year: i32, month: u32, first_weekday: Weekday, days_in_month: u32 }` built via `MonthGeometry::for_year_month(year, month)`. `days_in_month` is derived from `chrono`'s month arithmetic (next-month-first-day minus one day) rather than a hand-coded table, so leap years are correct for free.

### Decision 4: Static layout constants and a centering helper
**Addresses**: UC1-S4 - Centered month header; UC1-S5 - Offset weekday header row
**Rationale**: The grid width is fully determined by the format: `WEEK_COL_WIDTH (2) + 7 * DAY_CELL_WIDTH (3) = 23` printable characters for the day grid, with the weekday header row starting at column 2. Treating these as named constants, and giving the centering a tiny helper, keeps the printing code declarative.
**Approach**: Constants `WEEK_COL_WIDTH: usize = 2`, `DAY_CELL_WIDTH: usize = 3` (`" DD"` — space + two-digit right-aligned day), `GRID_WIDTH: usize = WEEK_COL_WIDTH + 7 * DAY_CELL_WIDTH`. Weekday header row is the literal string `"   Mo Tu We Th Fr Sa Su"` (three leading spaces = week-column padding + the space that would precede Monday's two-digit day). The centering helper returns `format!("{:^width$}", name, width = GRID_WIDTH)`.

### Decision 5: Row iterator keyed by ISO week
**Addresses**: UC1-S6 - Per-week rows with ISO week number and right-aligned days; UC1-E6a - Month begins on Monday; UC1-E6b - Month ends before Sunday
**Rationale**: Printing is easiest if we walk every date in `[first_of_month, last_of_month]` and group by ISO week. Each group becomes one output row. This naturally handles both edge extensions: a Monday start produces no leading blanks; an early-in-the-week end produces trailing blanks.
**Approach**: Build a `Vec<Week>` where `Week { iso_week_number: u32, cells: [Option<u32>; 7] }`. Walk dates in order; for each date, resolve its `(iso_week, weekday)` and fill the cell at `weekday as usize` (Monday = 0). Any `None` cell renders as two spaces; a `Some(d)` cell renders as `format!("{:>2}", d)`. Cells are joined with a single space. Rows are emitted in insertion order, so the first row's ISO week is the week containing day 1, and the last row's ISO week is the week containing the last day of the month.

### Decision 6: Explicit flush and zero exit on success
**Addresses**: UC1-S7 - Exit 0 after flushing stdout
**Rationale**: Rust's `println!` buffers in line-buffered mode for TTYs but block-buffered for pipes; an explicit flush removes that difference so piped callers see complete output before the process exits.
**Approach**: Acquire `io::stdout().lock()`, write all lines through `writeln!`, call `flush()`, then fall out of `main` (implicit exit 0). Errors writing to stdout propagate via `?` and are mapped to a non-zero exit by `main`.

### Decision 7: Plain-text output only
**Addresses**: UC1-E5a - Stdout is not a TTY
**Rationale**: Keeping the output pure ASCII plus `\n` makes the piped-capture scenario indistinguishable from the TTY scenario, which is what the spec requires.
**Approach**: Never detect TTY; never emit ANSI codes; never color. This is a simplifying non-choice, captured explicitly so it is not revisited without changing the spec.

## Risks / Trade-offs

- [ISO week number at month boundaries may belong to the previous/next ISO year] → Accept this as correct ISO 8601 behaviour. The row shows the week number, not a `yyyy-Www` string, so the ambiguity never surfaces in output. Tested explicitly for January (first row may show week 52/53 of the prior year) and December (last row may show week 1 of the next year).
- [Centering a month name with odd-length strings depends on `format!`'s rounding direction] → Lock down exact expected strings in unit tests for every month name so the rounding is pinned.
- [`chrono` being superseded by `time` or `jiff`] → Mitigated by the narrow date-provider abstraction; swapping the backing crate is a local change in one module.
- [Windows vs. Unix line endings] → Always write `\n`. The shell/Pager normalizes for display; tests assert `\n` endings explicitly.
- [Locale-dependent `Local::now()` in unusual timezones] → Accepted; the user asked for "current month" from the user's local time, which is what `Local` provides.

## Migration Plan

Greenfield change, no migration. Rollback = delete the binary.

## Open Questions

- None. The layout example in the proposal is treated as the binding contract for spacing.
