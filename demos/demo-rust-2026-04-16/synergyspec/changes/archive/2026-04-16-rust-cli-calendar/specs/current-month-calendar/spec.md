# Spec: current-month-calendar

Generated: 2026-04-16

## Overview
This spec implements requirements for the `current-month-calendar` capability: rendering the current local-time month as a weekday-columned grid with ISO 8601 week numbers, written to stdout when the binary is invoked with no arguments.

See `usecases.md` "Use Case Traceability Mapping" section for the complete list of use case steps.

## Use Case Traceability
This spec implements the following use case steps:
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

## ADDED Requirements

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
**Implements**: UC1-E5a - Stdout is not a TTY; output stays plain text with no escape codes
The system SHALL emit the same plain-text grid regardless of whether stdout is a terminal, a pipe, or a file. No ANSI color codes or other escape sequences shall be emitted.

#### Scenario: Output piped to another program
- **WHEN** the binary's stdout is redirected to a pipe or file
- **THEN** the captured output contains only printable ASCII and newline characters, byte-for-byte identical to the TTY output
