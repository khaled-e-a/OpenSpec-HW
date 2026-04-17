## Context

The `rust-cli-calendar` binary (archived change `2026-04-16-rust-cli-calendar`) already renders the current month to stdout with a hard "plain-ASCII only" contract. This change adds TTY-aware styling for (a) today's cell and (b) weekend cells, while keeping the piped/file output byte-identical to the pre-change render. The existing codebase is small — `src/lib.rs` + `{clock, geometry, layout, render}.rs` plus `src/main.rs`.

The TTY detection primitive `std::io::IsTerminal::is_terminal` is stable since Rust 1.70 and is already in scope (the project uses edition 2021 and toolchain 1.94.1). No new dependencies are required.

Constraints:
- Library function `render_month(year, month) -> String` must stay plain-ASCII (it is still used by the existing golden test and by property tests that assert printable-ASCII invariants).
- Non-TTY bytes MUST remain byte-identical to the archived behaviour; the integration test `stdout_is_plain_ascii_with_no_escape_codes` stays as a regression guard and must pass unchanged.
- The styling layer must be pure and testable without touching the process clock or stdout.

## Use Case Coverage

See `usecases.md` "Use Case Traceability Mapping" for the full list.

- UC1-S1: Terminal User invokes the binary → Decision 1 (main entry still parses argv the same way)
- UC1-S2: System resolves today's local date → Decision 2 (clock returns full `NaiveDate`, not just `(year, month)`)
- UC1-S3 / UC2-S3: System detects that stdout is a TTY → Decision 3 (`io::stdout().is_terminal()` in `main`)
- UC1-S4: System identifies today's cell → Decision 4 (render path receives `today_in_month: Option<u32>`)
- UC1-S5: Wrap today in reverse-video SGR → Decision 5 (cell-decorator function)
- UC1-E3a / UC2-E3a: Non-TTY → no styling → Decision 5 (decorator short-circuits when `is_tty == false`)
- UC1-E5a: Terminal doesn't interpret SGR → Decision 6 (no detection / no fallback — documented as accepted)
- UC2-S4: Wrap weekend cells in bold → Decision 5 (decorator consumes weekday index)
- UC2-S5 / UC2-E5a: Combined SGR when today is a weekend → Decision 5 (decorator builds one merged sequence rather than nesting)

### Unaddressed Use Case Steps
None — every mapped step is covered by one of the decisions below.

## Goals / Non-Goals

**Goals:**
- Byte-identical non-TTY output to the archived render (regression-safe).
- Deterministic, testable styling — a pure function `decorate_cell(day, today, weekday, is_tty) -> String` that can be unit-tested exhaustively.
- Minimal surface area: one new module (`src/style.rs`), one additional renderer entry point (`render_month_styled`), and a small change in `main.rs`. Existing `render_month(year, month)` is untouched.
- No new dependencies.

**Non-Goals:**
- `NO_COLOR` env-var handling, `--no-color` flag, `--force-color` flag, `FORCE_COLOR`, or any other override — out of scope.
- 256-color or truecolor themes; only the two monochrome SGR attributes (reverse, bold) are emitted.
- Detecting whether the terminal understands SGR. If the terminal is dumb, the escape bytes appear as garbage — this is accepted, per UC1-E5a.
- i18n of month names or weekday labels — untouched from the archived capability.
- Styling out-of-month blank cells, week numbers, the month header, or the weekday header row — only in-month day cells are styled.

## Decisions

### Decision 1: Keep `main` as the sole argv gatekeeper
**Addresses**: UC1-S1 - Terminal User invokes the binary
**Rationale**: No change in CLI surface. The argv contract stays "zero arguments → render; anything else → usage on stderr + non-zero exit".
**Approach**: `main` continues to reject extra args before any styling work. Only afterwards does it compute `is_tty`, resolve today, and call the styled renderer.

### Decision 2: Expand `today_ymd()` to `today_date() -> Result<NaiveDate, CalendarError>`
**Addresses**: UC1-S2 - System resolves today's local date
**Rationale**: The highlight requires today's day-of-month, not just the year and month. Returning a `NaiveDate` is more general and trivially yields `(year, month, day)` via `chrono::Datelike`. The `CAL_TEST_DATE` injection (already used by integration tests) parses into `NaiveDate` so the seam is already in the right shape.
**Approach**: Rename the lib export to `today_date`. `main` extracts `date.year()`, `date.month()`, `date.day()`. Integration tests that set `CAL_TEST_DATE=YYYY-MM-DD` continue to work unchanged.
**Alternative Considered**: Keep `today_ymd()` and add a sibling `today_day()`. Rejected — two calls into the same clock can race (`is_test_override` changing mid-run is not a real concern, but the two-call API is uglier than one call returning the full date).

### Decision 3: Resolve `is_tty` once, at the top of `main`
**Addresses**: UC1-S3, UC2-S3 - System detects TTY stdout
**Rationale**: TTY-ness is a property of the process, not of individual cells. Resolving it once and threading a `bool` through the renderer is the cleanest dependency direction.
**Approach**: In `main`, call `io::stdout().is_terminal()` immediately after argv validation and before any stdout writes. Pass the resulting `bool` to `render_month_styled`. Library users can pick whichever boolean they want; tests can force true/false without touching any real TTY.

### Decision 4: Renderer receives `today_in_month: Option<u32>`
**Addresses**: UC1-S4 - Identify today's cell
**Rationale**: The renderer only needs to know "which day (if any) is today, in the month being rendered". Passing `Option<u32>` (the day-of-month, 1..=31, or `None` when the rendered month is not today's month) keeps the styling decision local to the cell-decoration step and removes any year/month math from the decorator.
**Approach**: Add `pub fn render_month_styled(year: u32_or_i32, month: u32, today_in_month: Option<u32>, is_tty: bool) -> String` to `src/render.rs`. `main` computes `today_in_month` as `if today.year() == year && today.month() == month { Some(today.day()) } else { None }`. The existing `render_month(year, month)` delegates to `render_month_styled(year, month, None, false)` so the golden tests remain byte-exact.

### Decision 5: Pure cell decorator in `src/style.rs`
**Addresses**: UC1-S5 - Wrap today in reverse; UC1-E3a/UC2-E3a - Skip styling when non-TTY; UC2-S4 - Wrap weekends in bold; UC2-S5/UC2-E5a - Combined SGR when today is a weekend
**Rationale**: Centralising the SGR logic in one pure function gives us exhaustive, fast unit tests and keeps the renderer code free of escape-code string-splicing.
**Approach**:
```rust
pub fn decorate_day_cell(
    day: u32,
    today_in_month: Option<u32>,
    weekday: chrono::Weekday,
    is_tty: bool,
) -> String {
    let is_today  = Some(day) == today_in_month;
    let is_weekend = matches!(weekday, chrono::Weekday::Sat | chrono::Weekday::Sun);
    let plain = format!("{day:>2}");
    if !is_tty || (!is_today && !is_weekend) {
        return plain;
    }
    let attrs: &str = match (is_today, is_weekend) {
        (true,  true)  => "1;7",
        (true,  false) => "7",
        (false, true)  => "1",
        (false, false) => unreachable!(),
    };
    format!("\x1b[{attrs}m{plain}\x1b[0m")
}
```
Constants for the SGR codes (`"7"`, `"1"`, `"1;7"`, `"\x1b[0m"`) live at module top for readability. `render::render_month_styled` calls this helper for every in-month cell (i.e. every `Some(d)` in a week row), leaving `None` cells as two spaces exactly as today.

**Alternative Considered**: External crates (`ansi_term`, `colored`, `owo-colors`) — rejected to avoid any new dependency for what is effectively four string constants and one match.

### Decision 6: No "does the terminal understand SGR?" detection
**Addresses**: UC1-E5a - Terminal doesn't interpret SGR
**Rationale**: The only reliable proxy for SGR support is `is_terminal()`, which we already rely on. Going further (checking `TERM=dumb`, probing with an escape/response cycle, etc.) is out of scope and would add surface area with no meaningful win for the expected audience (modern terminals).
**Approach**: If a user somehow pipes us into a TTY that truncates or mis-renders SGR, they see raw escape bytes. This is documented in the spec's UC1-E5a scenario as the accepted fallback.

## Risks / Trade-offs

- [Weekend-bold plus reverse-video may render identically to reverse-alone on terminals that don't support the "bold" attribute] → Acknowledged — still better than nothing; the reverse-video already conveys "today" and the bold is a best-effort hint for weekends. Not worth a config flag.
- [Users who `| less` without `-R` will see raw escape bytes because `less` is a TTY but `less -R` is needed for SGR] → Out of scope; documented. Users can pipe through `| cat | less` or set `LESS=-R` on their end.
- [`CAL_TEST_DATE` now must be a full date `YYYY-MM-DD` (already the case) — no API break, but worth re-asserting in the test seam] → Retained; existing integration tests already supply a full date.
- [Snapshot test for the styled render must be exact: any drift in escape-sequence ordering or reset placement will fail noisily] → Chosen deliberately as the regression-detection mechanism.
- [Combining bold with reverse in a single `\x1b[1;7m` requires we build the attrs string from the (is_today, is_weekend) pair rather than nesting] → Easy, one-line match; documented in Decision 5 code sketch so there is no ambiguity.

## Migration Plan

- The archived `current-month-calendar` main spec is updated via this change's delta spec — one MODIFIED requirement, three ADDED requirements.
- Runtime behaviour for non-TTY consumers is unchanged; no migration needed for scripts that already pipe this binary.
- Library callers using `render_month(year, month)` continue to see plain ASCII with zero behavioural change. New callers that want styling use `render_month_styled`.

Rollback = revert this change's commit; the binary returns to the archived plain-text-only behaviour.

## Open Questions

- None. Styling choices (reverse for today, bold for weekends, combined `\x1b[1;7m` when both) are locked in by the delta spec.
