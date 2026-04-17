# Use Cases: highlight-today-and-weekends

Generated: 2026-04-16

## Overview

This document captures the use cases for the `highlight-today-and-weekends` change, following Cockburn's use case methodology. The change extends the existing `current-month-calendar` capability: on interactive terminals the rendered grid visually emphasises today's date and weekend days; on non-TTY stdout the output stays plain ASCII.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Terminal User (interactive) | Spot today's date in the rendered calendar without counting rows or columns |
| Terminal User (interactive) | Spot Saturdays and Sundays in the rendered calendar at a glance |
| Downstream Script (pipe/file) | Continue to consume the plain-ASCII calendar unchanged |

## Use Cases

### Use Case: Identify today's date at a glance
**Primary Actor**: Terminal User (interactive)
**Goal**: Immediately locate today's cell in the rendered current-month calendar.

#### Stakeholders & Interests
- Terminal User: Wants today's cell to stand out against the other day cells without reading each number.
- Downstream Script: Needs the same rendered text to remain plain ASCII when stdout is a pipe/file so existing capture logic keeps working.

#### Preconditions
- The binary is on PATH and the host provides a usable local clock.
- Stdout is an interactive terminal (a TTY that understands ANSI SGR sequences).

#### Trigger
User invokes the binary with no arguments in an interactive shell.

#### Main Success Scenario
1. Terminal User invokes the binary with no arguments in an interactive shell.
2. System resolves today's local date and the month to render (same as base behaviour).
3. System detects that stdout is a TTY.
4. System identifies the cell whose day number equals today's day-of-month (guaranteed to exist since we render today's month).
5. System wraps that cell's printed two-character day number in the ANSI "reverse video" SGR pair (`\x1b[7m` … `\x1b[0m`), leaving neighbouring cells untouched.
6. System prints the full calendar including the decorated today-cell and exits 0.

#### Extensions
3a. Stdout is not a TTY (pipe, file, redirected):
  3a1. System skips the styling step for today's cell — the output remains plain ASCII, byte-identical to the pre-change render (inherits UC1-E5a semantics from the base capability).

5a. The terminal does not interpret ANSI SGR:
  5a1. The raw escape bytes appear in the output; this is accepted as the standard fallback — the user sees visible escape sequences but no data is lost. The tool makes no attempt to detect or suppress.

#### Postconditions
- Today's day cell is visually distinct in the TTY output; all other cells render unchanged.
- Piped/redirected output is byte-identical to the pre-change render.

---

### Use Case: Identify weekend days at a glance
**Primary Actor**: Terminal User (interactive)
**Goal**: Immediately distinguish Saturday and Sunday cells from weekday cells in the rendered calendar.

#### Stakeholders & Interests
- Terminal User: Wants Saturdays and Sundays to stand out so weekend anchors are obvious while scanning the month.
- Downstream Script: Same concern as above — piped output must remain plain ASCII.

#### Preconditions
- Binary is on PATH; host clock usable.
- Stdout is an interactive TTY.

#### Trigger
User invokes the binary with no arguments in an interactive shell (same trigger as UC1).

#### Main Success Scenario
1. Terminal User invokes the binary with no arguments in an interactive shell.
2. System resolves the month to render and computes each row's day cells (same as base behaviour).
3. System detects that stdout is a TTY.
4. For every in-month day cell whose weekday is Saturday or Sunday, the system wraps the printed two-character day number in the ANSI "bold" SGR pair (`\x1b[1m` … `\x1b[0m`).
5. When a weekend day also equals today, the system combines both attributes in a single SGR sequence (`\x1b[1;7m` … `\x1b[0m`) so both highlights are visible.
6. System prints the full calendar and exits 0.

#### Extensions
3a. Stdout is not a TTY:
  3a1. System emits no SGR sequences for weekend cells; the output is plain ASCII, identical to the pre-change render.

5a. Today is a weekend day:
  5a1. System emits a single combined SGR pair for that cell (bold + reverse) rather than nesting two separate pairs, so the escape sequence is minimal and the reset (`\x1b[0m`) cleanly restores defaults.

#### Postconditions
- Every Saturday and Sunday cell of the rendered month is visually emphasised on a TTY.
- Piped/redirected output contains no SGR sequences.

---

## Notes
- Both use cases share the TTY-detection step; a single implementation resolves `is_tty` once per run and passes it into the renderer.
- The change deliberately keeps `render_month(year, month)` (the plain-text pure function) unchanged for library callers; styling is an additive layer via a new `render_month_styled` entry point.
- Future extensions (a `--no-color` flag, `NO_COLOR` env var support, 256-color themes) are out of scope for this change.

## Use Case Traceability Mapping

This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | Terminal User invokes the binary with no arguments in an interactive shell |
| UC1-S2 | System resolves today's local date and the month to render |
| UC1-S3 | System detects that stdout is a TTY |
| UC1-S4 | System identifies the cell whose day number equals today's day-of-month |
| UC1-S5 | System wraps that cell's day number in the reverse-video SGR pair (`\x1b[7m` … `\x1b[0m`) |
| UC1-S6 | System prints the decorated calendar and exits 0 |
| UC1-E3a | Stdout is not a TTY: today-cell styling is skipped and output is plain ASCII |
| UC1-E5a | Terminal does not interpret ANSI SGR: raw bytes are emitted (accepted fallback) |
| UC2-S1 | Terminal User invokes the binary with no arguments in an interactive shell |
| UC2-S2 | System resolves the month to render and computes each row's day cells |
| UC2-S3 | System detects that stdout is a TTY |
| UC2-S4 | For every in-month Saturday or Sunday cell, the system wraps the day number in the bold SGR pair (`\x1b[1m` … `\x1b[0m`) |
| UC2-S5 | When a weekend day also equals today, system emits a combined SGR pair (`\x1b[1;7m` … `\x1b[0m`) |
| UC2-S6 | System prints the decorated calendar and exits 0 |
| UC2-E3a | Stdout is not a TTY: no SGR sequences are emitted for weekend cells |
| UC2-E5a | Today is a weekend day: a single combined SGR pair is used instead of nested pairs |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC2-S1)"
