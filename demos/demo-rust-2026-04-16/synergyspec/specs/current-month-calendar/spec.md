# Capability: current-month-calendar

## Purpose

Render the current local-time month as a weekday-columned grid with ISO 8601 week numbers, written to stdout when the `rust-cli-calendar` binary is invoked with no arguments. When stdout is an interactive terminal, today's cell is highlighted with reverse-video and weekend cells are rendered in bold; when stdout is a pipe, file, or any other non-terminal sink, the output is plain ASCII byte-identical to the original pre-highlighting render.

## Use Case Traceability

This capability implements the following use case steps (see the originating change's `usecases.md` for full scenarios):

- UC1-S1: Terminal User invokes the binary with no arguments
- UC1-S2: System resolves the current local date (year, month, day)
- UC1-S3: System determines the first weekday of the month and total days in the month
- UC1-S4: System prints a centered month-name header line
- UC1-S5: System prints the weekday header row `Mo Tu We Th Fr Sa Su` offset for the week-number column
- UC1-S6: System prints one row per week with ISO week number and right-aligned day numbers, blanks for out-of-month days
- UC1-S7: System exits with status code 0 after flushing stdout
- UC1-E2a: System cannot resolve local date; prints an error to stderr and exits non-zero
- UC1-E3a: Stdout is not a TTY; today-cell and weekend styling are skipped, output plain ASCII
- UC1-E5a: Terminal does not interpret ANSI SGR; raw bytes emitted (accepted fallback)
- UC1-E6a: Month begins on Monday; first row has no leading blank day cells
- UC1-E6b: Month ends before Sunday; last row has trailing blank cells to preserve alignment
- UC2-S3: System detects that stdout is a TTY
- UC2-S4: For every in-month Sat/Sun cell, system wraps the day number in bold SGR
- UC2-S5: When a weekend cell equals today, system emits the combined SGR pair `\x1b[1;7m` … `\x1b[0m`
- UC2-E5a: Today is a weekend — single combined SGR pair (no nesting)

## Requirements

### Requirement: Zero-argument invocation triggers current-month render
**Implements**: UC1-S1 - Terminal User invokes the binary with no arguments
The system SHALL render the current month's calendar to stdout when invoked with no command-line arguments other than the program name itself.

#### Scenario: No arguments provided
- **WHEN** the user runs the binary with no arguments
- **THEN** the system produces the calendar output described in the remaining requirements and exits 0

#### Scenario: Extra arguments provided
- **WHEN** the user runs the binary with one or more arguments
- **THEN** the system exits with a non-zero status and writes a usage message to stderr (the happy-path render is reserved for the no-argument case)

### Requirement: Resolve current local date
**Implements**: UC1-S2 - System resolves the current local date (year, month, day)
The system SHALL obtain the current date in the host's local timezone at process start and use that date to select the month to render.

#### Scenario: Local date is available
- **WHEN** the host provides a valid local clock
- **THEN** the system uses that year and month (1–12) as the render target

#### Scenario: Local date cannot be obtained
- **WHEN** the local date resolution fails
- **THEN** the system writes a short error message to stderr and exits with a non-zero status (see UC1-E2a)

### Requirement: Compute month geometry
**Implements**: UC1-S3 - System determines the first weekday of the month and total days in the month
The system SHALL compute, for the target month: the weekday of day 1 (Monday–Sunday) and the total number of days in the month (28–31), including correct leap-year handling.

#### Scenario: Non-leap February
- **WHEN** the target month is February of a non-leap year
- **THEN** the system reports 28 days

#### Scenario: Leap February
- **WHEN** the target month is February of a leap year
- **THEN** the system reports 29 days

#### Scenario: 30-day month
- **WHEN** the target month is April, June, September, or November
- **THEN** the system reports 30 days

### Requirement: Print month header
**Implements**: UC1-S4 - System prints a centered month-name header line
The system SHALL print a header line containing the full English month name, centered within the grid's total printable width (week-number column plus seven day columns).

#### Scenario: Header layout
- **WHEN** the system prints the header line
- **THEN** the line contains only the month name and leading/trailing spaces, with no year, no punctuation, and no trailing non-space characters beyond the name

### Requirement: Print weekday header row
**Implements**: UC1-S5 - System prints the weekday header row offset for the week-number column
The system SHALL print the weekday header row `Mo Tu We Th Fr Sa Su`, preceded by enough blank characters to align each label above its corresponding day column (i.e., leaving the leftmost week-number column blank).

#### Scenario: Weekday header alignment
- **WHEN** the system prints the weekday header row
- **THEN** the row reads (with two leading spaces aligning the week-number column) `  Mo Tu We Th Fr Sa Su`

### Requirement: Print week rows with ISO week number
**Implements**: UC1-S6 - System prints one row per week with ISO week number and right-aligned day numbers, blanks for out-of-month days
The system SHALL print one row per calendar week that contains at least one day of the target month. Each row SHALL begin with the ISO 8601 week number (right-aligned in a two-character field), followed by seven day cells (each right-aligned in a two-character field, separated by a single space). Cells for days outside the target month SHALL be rendered as two blank spaces.

#### Scenario: Typical month rendering
- **WHEN** the target month is a month that spans six ISO weeks (e.g., a 31-day month starting late in the week)
- **THEN** the system prints six rows, each beginning with that row's ISO week number and containing day numbers for the in-month days and blank cells for out-of-month days

#### Scenario: First week partially out of month (UC1-E6b inverse)
- **WHEN** day 1 of the month falls on a weekday other than Monday
- **THEN** the leading cells of the first row (before day 1) are blank

#### Scenario: Last week partially out of month (UC1-E6b)
- **WHEN** the last day of the month falls on a weekday other than Sunday
- **THEN** the trailing cells of the last row (after the last day) are blank

#### Scenario: Month begins on Monday (UC1-E6a)
- **WHEN** day 1 of the month falls on a Monday
- **THEN** the first row has no leading blank cells; day 1 appears in the Monday column

### Requirement: Exit cleanly on success
**Implements**: UC1-S7 - System exits with status code 0 after flushing stdout
The system SHALL flush stdout and exit with status code 0 after printing the complete calendar.

#### Scenario: Successful render
- **WHEN** the calendar has been printed in full
- **THEN** the process exits with status 0 and all output has been flushed to stdout

### Requirement: Report date-resolution failure on stderr
**Implements**: UC1-E2a - System cannot resolve local date; prints error to stderr and exits non-zero
The system SHALL write a short human-readable error message to stderr and exit with a non-zero status when the local date cannot be obtained.

#### Scenario: Local clock unavailable
- **WHEN** the local date resolution returns an error or is otherwise unavailable
- **THEN** the system writes a one-line error message to stderr and exits with a non-zero status (no partial calendar is written to stdout)

### Requirement: Plain-text output for non-TTY stdout
**Implements**: UC1-E3a - Stdout is not a TTY: styling is skipped; also UC1-E5a "dumb terminal" accepted fallback for the terminal case
The system SHALL emit plain-ASCII output with NO ANSI color codes, SGR attributes, or other escape sequences WHEN stdout is not a terminal (i.e. the binary's stdout is redirected to a pipe, a file, or any other non-TTY sink). The plain-ASCII output MUST be byte-identical to the pre-highlighting render — capturing it with `| cat`, `> file.txt`, or inside a non-interactive shell MUST produce the exact same bytes the capability produced before the TTY-highlight requirements were added.

When stdout IS a terminal, the renderer MAY emit ANSI SGR sequences as defined by the `Highlight today's date on a TTY` and `Highlight weekend days on a TTY` requirements; the restriction to plain ASCII does not apply in the TTY case.

#### Scenario: Output piped to another program
- **WHEN** the binary's stdout is redirected to a pipe or file
- **THEN** the captured output contains only printable ASCII and newline characters, byte-for-byte identical to the pre-TTY-highlighting plain-text render

#### Scenario: Output in a non-interactive shell
- **WHEN** the binary is invoked from a non-interactive shell or any context where stdout is not a terminal
- **THEN** the output contains no SGR/escape sequences, even though the underlying capability is capable of emitting them

#### Scenario: Output to an interactive terminal (TTY)
- **WHEN** the binary's stdout is an interactive terminal
- **THEN** the output MAY contain ANSI SGR sequences as specified by the `Highlight today's date on a TTY` and `Highlight weekend days on a TTY` requirements; the "plain ASCII only" restriction does not apply

### Requirement: Detect TTY stdout
**Implements**: UC1-S3 / UC2-S3 - System detects that stdout is a TTY
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
