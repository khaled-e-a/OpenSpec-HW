# Spec Blast Radius: highlight-today-and-weekends
Generated: 2026-04-17

## Summary
1 spec impacted by this change.

_Note_: `git diff` is unavailable (the demo directory is untracked). Blast radius was computed from the set of files touched by this change: `src/style.rs` (new), `src/render.rs`, `src/clock.rs`, `src/lib.rs`, `src/main.rs`, `tests/cli.rs`, `tests/pbt.rs`, `Cargo.toml`.

## Impacted Specs

### synergyspec/specs/current-month-calendar/spec.md
**Impact Level**: High
**Reason**:
- This change's delta spec (`synergyspec/changes/highlight-today-and-weekends/specs/current-month-calendar/spec.md`) directly targets this capability — one `MODIFIED` requirement and three `ADDED` requirements.
- `**Implements**` UC references in the delta (UC1-S3, UC1-S4, UC1-S5, UC2-S3, UC2-S4, UC2-S5) overlap with the main spec's existing UC1-S3, UC1-S4, UC1-S5 rows.
- Exported symbol additions / renames on the library surface affect this capability's API: `today_date` (renamed from `today_ymd`), new `render_month_styled`, new `decorate_day_cell`.

**Impacted Requirements**:
- **MODIFIED**: `Plain-text output for non-TTY stdout` — description relaxed from "no ANSI codes" (absolute) to "no ANSI codes WHEN stdout is not a terminal"; adds TTY-case allowance and the "non-interactive shell" scenario.
- **ADDED**: `Detect TTY stdout` — three scenarios (terminal / pipe / file).
- **ADDED**: `Highlight today's date on a TTY` — three scenarios (weekday today / today not in month / non-TTY).
- **ADDED**: `Highlight weekend days on a TTY` — three scenarios (normal weekend / today-on-weekend combined SGR / non-TTY).

**Affected Tests** (per the change's `spec-tests.md` once regenerated — currently mapped in-repo):
- `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` — regression guard: piped bytes match the archived plain-text golden.
- `tests/cli.rs:42` `stdout_is_plain_ascii_with_no_escape_codes` — regression guard: piped bytes contain no 0x1b.
- `src/render.rs` unit tests: `render_month_styled_with_no_styling_equals_plain_render`, `render_month_styled_jan_2024_today_15_highlights_today_and_weekends_only`, `render_month_styled_jan_2024_today_7_uses_combined_sgr_for_sunday`.
- `src/style.rs` unit test: `decorate_day_cell_covers_all_eight_combinations`.
- `tests/pbt.rs` properties: `pbt_styled_with_no_styling_equals_plain_render`, `pbt_non_tty_render_has_no_escape_bytes`, `pbt_tty_render_highlights_today`, `pbt_tty_render_highlights_weekends_only_when_today_none`.

## Unimpacted Specs

_(None — `synergyspec/specs/` currently holds a single capability, which is the one impacted above.)_
