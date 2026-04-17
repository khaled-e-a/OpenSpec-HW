# Delta Spec: current-month-calendar

Generated: 2026-04-16

## Overview
This delta modifies the `current-month-calendar` main spec to add TTY-aware styling: today's cell is highlighted with ANSI reverse video, and Saturday/Sunday cells are rendered in ANSI bold when stdout is an interactive terminal. Non-TTY stdout (pipe, file, redirection) continues to produce plain ASCII byte-identical to the pre-change behaviour.

See `usecases.md` "Use Case Traceability Mapping" for the full step list.

## Use Case Traceability
This delta implements the following use case steps:
- UC1-S3: System detects that stdout is a TTY
- UC1-S4: System identifies the cell whose day number equals today's day-of-month
- UC1-S5: System wraps that cell's day number in the reverse-video SGR pair
- UC1-E3a: Stdout is not a TTY: today-cell styling is skipped
- UC2-S3: System detects that stdout is a TTY (shared with UC1-S3)
- UC2-S4: For every in-month Saturday or Sunday cell, system wraps the day number in the bold SGR pair
- UC2-E3a: Stdout is not a TTY: no SGR sequences are emitted for weekend cells
- UC2-E5a: Today is a weekend day: single combined SGR pair is used

## MODIFIED Requirements

### Requirement: Plain-text output for non-TTY stdout
**Implements**: UC1-E3a - Stdout not a TTY: styling is skipped (this change); UC1-E5a from the original capability - piped output stays plain text
The system SHALL emit plain-ASCII output with NO ANSI color codes, SGR attributes, or other escape sequences WHEN stdout is not a terminal (i.e. the binary's stdout is redirected to a pipe, a file, or any other non-TTY sink). The plain-ASCII output MUST be byte-identical to the pre-highlighting render — capturing it with `| cat`, `> file.txt`, or inside a non-interactive shell MUST produce the exact same bytes that the capability produced before this change.

When stdout IS a terminal, the renderer MAY emit ANSI SGR sequences as defined by the new `Highlight today's date on a TTY` and `Highlight weekend days on a TTY` requirements; the restriction to plain ASCII does not apply in the TTY case.

#### Scenario: Output piped to another program
- **WHEN** the binary's stdout is redirected to a pipe or file
- **THEN** the captured output contains only printable ASCII and newline characters, byte-for-byte identical to the pre-change plain-text render

#### Scenario: Output in a non-interactive shell
- **WHEN** the binary is invoked from a non-interactive shell or any context where stdout is not a terminal
- **THEN** the output contains no SGR/escape sequences, even though the underlying capability is capable of emitting them

#### Scenario: Output to an interactive terminal (TTY)
- **WHEN** the binary's stdout is an interactive terminal
- **THEN** the output MAY contain ANSI SGR sequences as specified by the `Highlight today's date on a TTY` and `Highlight weekend days on a TTY` requirements; the "plain ASCII only" restriction does not apply

## ADDED Requirements

### Requirement: Detect TTY stdout
**Implements**: UC1-S3 - System detects that stdout is a TTY
The system SHALL determine whether its stdout is connected to an interactive terminal at process start, using a stable platform-neutral mechanism (e.g. `std::io::IsTerminal::is_terminal` on stable Rust). The resulting boolean SHALL be the sole gate for whether ANSI SGR sequences are emitted by the renderer.

#### Scenario: Stdout connected to a terminal
- **WHEN** the binary is run in an interactive shell with stdout attached to the user's terminal
- **THEN** the system computes `is_tty = true` and threads it into the renderer, enabling SGR emission

#### Scenario: Stdout is a pipe
- **WHEN** stdout is piped to another process
- **THEN** the system computes `is_tty = false`; the renderer emits no SGR sequences

#### Scenario: Stdout is a file
- **WHEN** stdout is redirected to a file
- **THEN** the system computes `is_tty = false`; the renderer emits no SGR sequences

### Requirement: Highlight today's date on a TTY
**Implements**: UC1-S4 - System identifies today's cell; UC1-S5 - System wraps that cell in reverse-video SGR
WHEN `is_tty` is true AND the rendered month equals the month of the system's local "today", the system SHALL wrap the printed two-character day number of today's cell with the ANSI SGR sequences `\x1b[7m` (reverse video) before the number and `\x1b[0m` (reset all attributes) after the number. The surrounding separator space and every other cell on the row remain untouched.

#### Scenario: Today is a weekday in the rendered month
- **WHEN** `is_tty` is true and today is, say, 2026-04-16 (a Thursday)
- **THEN** the row for the week containing April 16 contains the substring `\x1b[7m16\x1b[0m` exactly once; all other day cells in the grid contain their plain two-character numbers

#### Scenario: Today is NOT in the rendered month
- **WHEN** the rendered month differs from today's month (e.g. via `CAL_TEST_DATE`)
- **THEN** no cell carries the reverse-video pair; the render is visually identical to the unhighlighted version (apart from any weekend bolding from the companion requirement)

#### Scenario: Stdout is not a TTY
- **WHEN** `is_tty` is false
- **THEN** today's cell is printed as its plain two-character day number with no SGR wrapping

### Requirement: Highlight weekend days on a TTY
**Implements**: UC2-S4 - Wrap each Saturday/Sunday cell in bold SGR; UC2-S5 - Combine with reverse when today is a weekend
WHEN `is_tty` is true, the system SHALL wrap every in-month Saturday and Sunday day cell's two-character day number in the ANSI SGR pair `\x1b[1m` (bold) … `\x1b[0m` (reset). Out-of-month blank cells (which print as spaces) SHALL NOT be wrapped. When a weekend cell also equals today, the system SHALL emit a single combined SGR pair `\x1b[1;7m` … `\x1b[0m` instead of nesting `\x1b[7m` inside `\x1b[1m` or vice versa.

#### Scenario: Saturday and Sunday of a normal week
- **WHEN** `is_tty` is true and the row contains both Saturday and Sunday of the current month
- **THEN** both day cells in that row appear wrapped as `\x1b[1m<DD>\x1b[0m`; the five weekday cells are plain

#### Scenario: Today is a Saturday or Sunday
- **WHEN** `is_tty` is true and today equals a Saturday or Sunday in the rendered month
- **THEN** that single cell is wrapped as `\x1b[1;7m<DD>\x1b[0m` — one opening sequence, one closing sequence, not nested

#### Scenario: Stdout is not a TTY
- **WHEN** `is_tty` is false
- **THEN** weekend cells print as plain two-character day numbers with no SGR wrapping; the full output contains zero escape sequences
