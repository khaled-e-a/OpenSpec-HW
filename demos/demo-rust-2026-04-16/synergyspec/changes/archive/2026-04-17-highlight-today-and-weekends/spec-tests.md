# Spec-Test Mapping: highlight-today-and-weekends

Generated: 2026-04-17
Language: Rust
Example-based framework: built-in `#[test]` (unit) + `assert_cmd` (integration, piped stdout) + `portable-pty` (integration, real TTY)
Property-based framework: `proptest` 1.x (already in `[dev-dependencies]`; new properties appended to `tests/pbt.rs`)

## Use Case ID Mapping
Source: `usecases.md` → "Use Case Traceability Mapping" table.

| UC ID | Description |
|-------|-------------|
| UC1 | Identify today's date at a glance |
| UC1-S1 | Terminal User invokes the binary with no arguments in an interactive shell |
| UC1-S2 | System resolves today's local date and the month to render |
| UC1-S3 | System detects that stdout is a TTY |
| UC1-S4 | System identifies the cell whose day number equals today's day-of-month |
| UC1-S5 | System wraps that cell's day number in the reverse-video SGR pair (`\x1b[7m` … `\x1b[0m`) |
| UC1-S6 | System prints the decorated calendar and exits 0 |
| UC1-E3a | Stdout is not a TTY — today-cell styling skipped, output plain ASCII |
| UC1-E5a | Terminal does not interpret ANSI SGR — raw bytes emitted (accepted fallback) |
| UC2 | Identify weekend days at a glance |
| UC2-S1 | Terminal User invokes the binary with no arguments in an interactive shell |
| UC2-S2 | System resolves the month to render and computes each row's day cells |
| UC2-S3 | System detects that stdout is a TTY |
| UC2-S4 | For every in-month Sat/Sun cell, system wraps the day number in bold SGR (`\x1b[1m` … `\x1b[0m`) |
| UC2-S5 | When a weekend cell equals today, system emits the combined SGR pair (`\x1b[1;7m` … `\x1b[0m`) |
| UC2-S6 | System prints the decorated calendar and exits 0 |
| UC2-E3a | Stdout is not a TTY — no SGR for weekend cells |
| UC2-E5a | Today is a weekend — single combined SGR pair (no nesting) |

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | Identify today's date at a glance — full flow (piped) | Flow | Integration | `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` | ✅ |
| UC1 | Identify today's date at a glance — full flow (TTY) | Flow | Integration | `tests/pty.rs:56` `pty_run_wraps_today_cell_in_reverse_video_when_today_is_a_weekday` | ✅ |
| UC1-S1 | Zero-arg invocation triggers styled render | Step | Integration | `tests/cli.rs:14` (happy) + `tests/cli.rs:31` `extra_argument_is_rejected_with_usage_on_stderr` (negative) | ✅ |
| UC1-S1 | Zero-arg invocation | Step | PBT | `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` (archived base) | ✅ |
| UC1-S2 | Resolve today's local date | Step | Integration | `tests/cli.rs:14` (via `CAL_TEST_DATE` injection; rename `today_ymd`→`today_date` exercised) | ✅ |
| UC1-S2 | Resolve today's local date | Step | PBT | `tests/pbt.rs:209` `uc1_s2_output_contains_correct_month_name` (archived base) | ✅ |
| UC1-S3 | Detect that stdout is a TTY | Step | Integration | `tests/pty.rs:44` `pty_run_emits_sgr_sequences_when_stdout_is_a_tty` (spawns binary under `portable-pty`; asserts `\x1b[` introducer present) | ✅ |
| UC1-S4 | Identify today's cell | Step | Unit | `src/render.rs:157` `render_month_styled_jan_2024_today_15_highlights_today_and_weekends_only` | ✅ |
| UC1-S5 | Wrap today's cell in reverse-video SGR | Step | Unit | `src/style.rs:43` `decorate_day_cell_covers_all_eight_combinations` + `src/render.rs:157` | ✅ |
| UC1-S5 | Wrap today's cell in reverse-video SGR | Step | PBT | `tests/pbt.rs:194` `pbt_tty_render_highlights_today` | ✅ |
| UC1-S5 | Wrap today's cell in reverse-video SGR (under real PTY) | Step | Integration | `tests/pty.rs:56` `pty_run_wraps_today_cell_in_reverse_video_when_today_is_a_weekday` | ✅ |
| UC1-S6 | Print decorated calendar and exit 0 | Step | Integration | `tests/cli.rs:14` (`.success()` assertion) | ✅ |
| UC1-E3a | Non-TTY → plain ASCII, no styling | Extension | Integration | `tests/cli.rs:42` `stdout_is_plain_ascii_with_no_escape_codes` | ✅ |
| UC1-E3a | Non-TTY → plain ASCII | Extension | Unit | `src/render.rs:149` `render_month_styled_with_no_styling_equals_plain_render` | ✅ |
| UC1-E3a | Non-TTY → plain ASCII | Extension | PBT | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` + `tests/pbt.rs:178` `pbt_styled_with_no_styling_equals_plain_render` | ✅ |
| UC1-E5a | Dumb terminal — raw bytes emitted (accepted fallback) | Extension | Design | Not asserted by any test (by design — no detection logic). Documented accepted fallback. | ⚠️ non-testable by design |
| UC2 | Identify weekend days — full flow (piped) | Flow | Integration | `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` | ✅ |
| UC2 | Identify weekend days — full flow (TTY) | Flow | Integration | `tests/pty.rs:87` `pty_run_wraps_every_weekend_day_in_bold` | ✅ |
| UC2-S1 | Zero-arg invocation (shared trigger with UC1-S1) | Step | Integration | `tests/cli.rs:14` | ✅ |
| UC2-S2 | Compute each row's day cells | Step | Unit | `src/render.rs:83` `weeks_for_january_2024_has_five_rows_starting_monday` (archived base) | ✅ |
| UC2-S3 | Detect that stdout is a TTY (shared with UC1-S3) | Step | Integration | `tests/pty.rs:44` `pty_run_emits_sgr_sequences_when_stdout_is_a_tty` | ✅ |
| UC2-S4 | Wrap Sat/Sun cells in bold SGR | Step | Unit | `src/style.rs:43` (covers weekend cases) + `src/render.rs:157` (asserts Jan 6 Sat + Jan 7 Sun wrapped in `\x1b[1m`) | ✅ |
| UC2-S4 | Wrap Sat/Sun cells in bold SGR | Step | PBT | `tests/pbt.rs:214` `pbt_tty_render_highlights_weekends_only_when_today_none` | ✅ |
| UC2-S4 | Wrap Sat/Sun cells in bold SGR (under real PTY) | Step | Integration | `tests/pty.rs:87` `pty_run_wraps_every_weekend_day_in_bold` (asserts all 8 weekend days of Jan 2024) | ✅ |
| UC2-S5 | Today-on-weekend → combined `\x1b[1;7m` | Step | Unit | `src/style.rs:43` (TTY today+weekend case) + `src/render.rs:183` `render_month_styled_jan_2024_today_7_uses_combined_sgr_for_sunday` | ✅ |
| UC2-S5 | Today-on-weekend → combined SGR | Step | PBT | `tests/pbt.rs:194` `pbt_tty_render_highlights_today` (asserts combined SGR when today is Sat/Sun) | ✅ |
| UC2-S5 | Today-on-weekend → combined SGR (under real PTY) | Step | Integration | `tests/pty.rs:71` `pty_run_uses_combined_sgr_when_today_is_a_weekend` (CAL_TEST_DATE=2024-01-07) | ✅ |
| UC2-S6 | Print decorated calendar and exit 0 (shared with UC1-S6) | Step | Integration | `tests/cli.rs:14` | ✅ |
| UC2-E3a | Non-TTY → no SGR for weekend cells | Extension | Unit | `src/style.rs:43` non-TTY weekend cases + `src/render.rs:149` | ✅ |
| UC2-E3a | Non-TTY → no SGR for weekend cells | Extension | PBT | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` | ✅ |
| UC2-E5a | Today-on-weekend → single combined pair (no nesting) | Extension | Unit | `src/render.rs:183` asserts `\x1b[1;7m 7\x1b[0m` exactly once AND no standalone `\x1b[7m 7\x1b[0m` or `\x1b[1m 7\x1b[0m` | ✅ |
| UC2-E5a | Today-on-weekend → single combined pair | Extension | PBT | `tests/pbt.rs:194` `pbt_tty_render_highlights_today` | ✅ |
| UC2-E5a | Today-on-weekend → single combined pair (under real PTY) | Extension | Integration | `tests/pty.rs:71` `pty_run_uses_combined_sgr_when_today_is_a_weekend` (asserts no standalone `\x1b[7m 7\x1b[0m` or `\x1b[1m 7\x1b[0m`) | ✅ |

**Example-based coverage**: 16/17 UC steps+extensions fully covered by automated tests after adding the PTY suite (UC1-S3 and UC2-S3 are now automated via `tests/pty.rs`). Only UC1-E5a ("dumb terminal" accepted fallback per design decision 6) remains non-testable by design.
**PBT coverage**: 12/12 WHEN/THEN scenarios covered.
**PTY coverage**: 4 PTY-based integration tests in `tests/pty.rs` (added via `portable-pty = "0.8"` dev-dep) exercise the real-TTY code path end-to-end.

## PBT Coverage

| UC Step / Requirement | Scenario (WHEN / THEN) | PBT Test | Framework | Status |
|-----------------------|------------------------|----------|-----------|--------|
| MODIFIED `Plain-text output for non-TTY stdout` (scenario 1) | WHEN stdout redirected to pipe THEN output is plain ASCII byte-identical to pre-change | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` | proptest | ✅ |
| MODIFIED `Plain-text output for non-TTY stdout` (scenario 2) | WHEN invoked from non-interactive shell THEN output contains no SGR | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` | proptest | ✅ |
| MODIFIED `Plain-text output for non-TTY stdout` (scenario 3) | WHEN stdout IS a terminal THEN output MAY contain SGR as defined by highlight requirements | `tests/pbt.rs:194` `pbt_tty_render_highlights_today` + `tests/pbt.rs:214` `pbt_tty_render_highlights_weekends_only_when_today_none` | proptest | ✅ |
| ADDED `Detect TTY stdout` (scenario 1) | WHEN stdout connected to terminal THEN is_tty=true, SGR enabled | (library accepts is_tty as input; exercised via `pbt_tty_render_highlights_today`) | proptest | ✅ |
| ADDED `Detect TTY stdout` (scenario 2) | WHEN stdout is a pipe THEN is_tty=false, no SGR | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` | proptest | ✅ |
| ADDED `Detect TTY stdout` (scenario 3) | WHEN stdout is a file THEN is_tty=false, no SGR | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` (same library path) | proptest | ✅ |
| ADDED `Highlight today's date on a TTY` (scenario 1) | WHEN is_tty=true and today is a weekday in month THEN `\x1b[7m<DD>\x1b[0m` appears exactly once | `tests/pbt.rs:194` `pbt_tty_render_highlights_today` | proptest | ✅ |
| ADDED `Highlight today's date on a TTY` (scenario 2) | WHEN rendered month ≠ today's month THEN no reverse-video cell | `tests/pbt.rs:214` `pbt_tty_render_highlights_weekends_only_when_today_none` (asserts no `\x1b[7m` when today_in_month=None) | proptest | ✅ |
| ADDED `Highlight today's date on a TTY` (scenario 3) | WHEN is_tty=false THEN today cell is plain | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` + `tests/pbt.rs:178` `pbt_styled_with_no_styling_equals_plain_render` | proptest | ✅ |
| ADDED `Highlight weekend days on a TTY` (scenario 1) | WHEN is_tty=true and row contains Sat/Sun THEN each is wrapped in `\x1b[1m<DD>\x1b[0m` | `tests/pbt.rs:214` `pbt_tty_render_highlights_weekends_only_when_today_none` | proptest | ✅ |
| ADDED `Highlight weekend days on a TTY` (scenario 2) | WHEN today is Sat or Sun THEN that cell is `\x1b[1;7m<DD>\x1b[0m` (combined, not nested) | `tests/pbt.rs:194` `pbt_tty_render_highlights_today` (weekend branch) | proptest | ✅ |
| ADDED `Highlight weekend days on a TTY` (scenario 3) | WHEN is_tty=false THEN weekend cells are plain | `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` | proptest | ✅ |

## Use Case Details: Identify today's date at a glance (ID: UC1)

### Main Scenario
- **UC1-S1**: Terminal User invokes the binary with no arguments in an interactive shell
  - `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` (Integration)
  - `tests/cli.rs:31` `extra_argument_is_rejected_with_usage_on_stderr` (Integration, negative)
  - `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` (PBT, archived base)
- **UC1-S2**: System resolves today's local date and the month to render
  - `tests/cli.rs:14` via `CAL_TEST_DATE=2024-01-15` (Integration; exercises `today_date()` rename)
- **UC1-S3**: System detects that stdout is a TTY
  - `tests/pty.rs:44` `pty_run_emits_sgr_sequences_when_stdout_is_a_tty` (Integration, automated via `portable-pty`)
  - Task 8.2 manual: run under `script -q /dev/null` → SGR present (Manual, kept as smoke check)
  - Task 8.3 manual: redirect to file / `| cat` → output byte-identical (Manual)
- **UC1-S4**: System identifies today's cell
  - `src/render.rs:157` `render_month_styled_jan_2024_today_15_highlights_today_and_weekends_only` (Unit)
- **UC1-S5**: System wraps that cell's day number in reverse-video SGR
  - `src/style.rs:43` `decorate_day_cell_covers_all_eight_combinations` (Unit, 8 combos)
  - `src/render.rs:157` (Unit, end-to-end wrap in rendered frame)
  - `tests/pbt.rs:194` `pbt_tty_render_highlights_today` (PBT)
  - `tests/pty.rs:56` `pty_run_wraps_today_cell_in_reverse_video_when_today_is_a_weekday` (Integration, real PTY)
- **UC1-S6**: System prints the decorated calendar and exits 0
  - `tests/cli.rs:14` (`.success()` assertion) (Integration)

### Extensions
- **UC1-E3a**: Stdout is not a TTY — today-cell styling skipped, output plain ASCII
  - `tests/cli.rs:42` `stdout_is_plain_ascii_with_no_escape_codes` (Integration)
  - `src/render.rs:149` `render_month_styled_with_no_styling_equals_plain_render` (Unit)
  - `tests/pbt.rs:178` `pbt_styled_with_no_styling_equals_plain_render` (PBT)
  - `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` (PBT)
- **UC1-E5a**: Terminal does not interpret ANSI SGR — raw bytes emitted (accepted fallback per Design Decision 6)
  - Non-testable by design — no detection logic exists; documented behaviour.

### Full Flow Tests
- `UC1` — piped path byte-identical to archived golden: `tests/cli.rs:14` (Integration) ✅
- `UC1` — TTY path: `tests/pty.rs:56` `pty_run_wraps_today_cell_in_reverse_video_when_today_is_a_weekday` (Integration, real PTY) ✅

## Use Case Details: Identify weekend days at a glance (ID: UC2)

### Main Scenario
- **UC2-S1**: Terminal User invokes the binary with no arguments (shared trigger with UC1-S1)
  - `tests/cli.rs:14` (Integration)
- **UC2-S2**: System resolves the month to render and computes each row's day cells
  - `src/render.rs:83` `weeks_for_january_2024_has_five_rows_starting_monday` (Unit, archived base)
  - `src/render.rs:96` `weeks_for_february_2025_ends_on_friday_with_trailing_blanks` (Unit, archived base)
- **UC2-S3**: System detects that stdout is a TTY (shared with UC1-S3)
  - `tests/pty.rs:44` `pty_run_emits_sgr_sequences_when_stdout_is_a_tty` (Integration, automated via `portable-pty`)
  - Tasks 8.2 / 8.3 (Manual, kept as smoke check)
- **UC2-S4**: For every in-month Sat/Sun cell, wrap day number in bold SGR
  - `src/style.rs:43` (Unit, covers TTY Sat case)
  - `src/render.rs:157` (Unit, asserts Jan 6 Sat + Jan 7 Sun wrapped in `\x1b[1m`)
  - `tests/pbt.rs:214` `pbt_tty_render_highlights_weekends_only_when_today_none` (PBT)
  - `tests/pty.rs:87` `pty_run_wraps_every_weekend_day_in_bold` (Integration, real PTY, asserts all 8 weekend days of Jan 2024)
- **UC2-S5**: Today-on-weekend → combined SGR `\x1b[1;7m` … `\x1b[0m`
  - `src/style.rs:43` (Unit, TTY today+weekend case)
  - `src/render.rs:183` `render_month_styled_jan_2024_today_7_uses_combined_sgr_for_sunday` (Unit)
  - `tests/pbt.rs:194` `pbt_tty_render_highlights_today` (PBT, weekend branch)
  - `tests/pty.rs:71` `pty_run_uses_combined_sgr_when_today_is_a_weekend` (Integration, real PTY, `CAL_TEST_DATE=2024-01-07`)
- **UC2-S6**: Print decorated calendar and exit 0 (shared with UC1-S6)
  - `tests/cli.rs:14` (Integration)

### Extensions
- **UC2-E3a**: Stdout is not a TTY — no SGR for weekend cells
  - `src/style.rs:43` non-TTY weekend cases (Unit)
  - `src/render.rs:149` `render_month_styled_with_no_styling_equals_plain_render` (Unit)
  - `tests/pbt.rs:185` `pbt_non_tty_render_has_no_escape_bytes` (PBT)
- **UC2-E5a**: Today is a weekend — single combined SGR pair (no nesting)
  - `src/render.rs:183` asserts `\x1b[1;7m 7\x1b[0m` exactly once AND no standalone `\x1b[7m 7\x1b[0m` or `\x1b[1m 7\x1b[0m` (Unit)
  - `tests/pbt.rs:194` `pbt_tty_render_highlights_today` (PBT)
  - `tests/pty.rs:71` `pty_run_uses_combined_sgr_when_today_is_a_weekend` (Integration, real PTY; asserts the same "no standalone" invariant)
  - Manual verify task 8.4 retained as smoke check.

### Full Flow Tests
- `UC2` — piped path via `tests/cli.rs:42` (Integration) ✅
- `UC2` — TTY path via `tests/pty.rs:87` `pty_run_wraps_every_weekend_day_in_bold` + `tests/pty.rs:71` `pty_run_uses_combined_sgr_when_today_is_a_weekend` (Integration, real PTY) ✅
