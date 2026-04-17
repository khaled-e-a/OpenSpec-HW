## Why

When scanning the `rust-cli-calendar` output, the user currently has to count rows and columns to locate today's date, and weekends blend visually with weekdays. A TTY-aware highlight for today's cell and for Saturday/Sunday cells makes the most important information (today) and a common planning anchor (weekends) identifiable at a glance, with zero extra typing. Piped or redirected output stays byte-identical to pre-change behaviour so existing scripts are unaffected.

## What Changes

- The renderer detects whether stdout is a TTY (via `std::io::IsTerminal`, stable since Rust 1.70) and, when it is:
  - Wraps today's day cell in ANSI reverse-video (`\x1b[7m` … `\x1b[0m`).
  - Wraps every Saturday and Sunday day cell in ANSI bold (`\x1b[1m` … `\x1b[0m`).
  - When today happens to be a weekend, combines both attributes in a single SGR sequence (`\x1b[1;7m` … `\x1b[0m`).
- When stdout is NOT a TTY (pipe, file, non-interactive shell), the renderer emits the same plain-ASCII output as today — no ANSI codes, byte-for-byte unchanged.
- **BREAKING** only in the narrow sense that the existing absolute requirement "no ANSI escape sequences shall be emitted" becomes conditional on "stdout is not a TTY". Piped output behaviour is preserved; TTY output changes visibly.
- Tests: add unit tests for the styling helpers, a component test for the end-to-end rendered frame with TTY styling forced on, and an integration test that captures piped output and asserts the pre-change plain-ASCII bytes.

## Capabilities

### New Capabilities
<!-- None — this change extends the existing capability rather than introducing a new one. -->

### Modified Capabilities
- `current-month-calendar`: modifies `Plain-text output for non-TTY stdout` to gate plain-text on non-TTY only; adds three new requirements — `Detect TTY stdout`, `Highlight today's date on a TTY`, and `Highlight weekend days on a TTY`.

## Impact

- **Code**: `src/render.rs` grows a styling layer that takes `(day, today, weekday, is_tty) → String`. `src/main.rs` calls `io::stdout().is_terminal()` and threads the flag into the renderer. A new pure helper module `src/style.rs` may host the SGR constants and cell-decorator function.
- **APIs**: `rust_cli_calendar::render_month(year, month)` stays plain-text-only (back-compat). A new function `render_month_styled(year, month, today, stdout_is_tty)` is added for callers that need styling; the binary uses the styled variant when appropriate.
- **Dependencies**: none. `std::io::IsTerminal` covers TTY detection; ANSI codes are plain strings.
- **Tests**: unit tests for the decorator; integration tests that (a) force `is_tty=true` to assert ANSI bytes are present, and (b) run the real binary piped and assert the captured bytes are ANSI-free (as today).
- **Specs**: one delta spec at `synergyspec/changes/highlight-today-and-weekends/specs/current-month-calendar/spec.md` containing the MODIFIED + ADDED requirements.

Created by Khaled@Huawei
