# Use Cases: rust-cli-calendar

Generated: 2026-04-16

## Overview

This document captures the use cases for the `rust-cli-calendar` change, following Cockburn's use case methodology. The change delivers a single Rust binary that prints the calendar of the current month to stdout.

## Actor-Goal List

| Actor | Goal |
|-------|------|
| Terminal User | See the calendar for the current month at a glance, with ISO week numbers, without leaving the terminal |

## Use Cases

### Use Case: View current month calendar
**Primary Actor**: Terminal User
**Goal**: Display the calendar grid for the current local-time month on stdout, showing weekday columns (Mo–Su) and ISO week numbers.

#### Stakeholders & Interests
- Terminal User: Wants a readable, consistent monthly calendar without installing `cal` or leaving the CLI.
- Operating System: Provides local date; expects the tool to exit cleanly and not alter system state.
- Downstream Tooling (pipes/scripts): Needs stable, line-oriented stdout so output can be captured or piped.

#### Preconditions
- The `rust-cli-calendar` binary is built and on the user's `PATH`.
- The host operating system provides a local date.

#### Trigger
The user invokes the binary from a shell with no arguments (e.g., `rust-cli-calendar`).

#### Main Success Scenario
1. Terminal User invokes the binary with no arguments.
2. System resolves the current local date (year, month, day).
3. System determines the first weekday of the month and the total number of days in that month.
4. System prints a centered month-name header line (full month name, no year).
5. System prints a weekday header row starting Monday (`Mo Tu We Th Fr Sa Su`), offset to leave a leading column for the ISO week number.
6. System prints one row per calendar week containing the month: each row starts with the ISO 8601 week number of that row, followed by day numbers right-aligned in two-character fields, with blank placeholders for days that fall outside the current month.
7. System exits with status code 0 after flushing stdout.

#### Extensions
2a. System local date cannot be resolved (e.g., environment lacks a usable clock):
  2a1. System prints a short error message to stderr.
  2a2. System exits with a non-zero status code.

5a. Stdout is not a TTY (output is piped or redirected):
  5a1. System prints the same plain-text grid (no colors, no escape codes) so piping remains lossless.

6a. Month begins on a Monday:
  6a1. System prints no leading blank day cells on the first row.

6b. Month ends on any weekday other than Sunday:
  6b1. System prints trailing blank day cells on the last row to preserve column alignment (trailing whitespace on the line is acceptable; the row is not padded with extra non-space characters).

#### Postconditions
- The calendar for the current month has been written to stdout in the documented format.
- The process has exited; no files, network connections, or environment changes remain.

---

## Notes
- This change covers only the zero-argument "current month" invocation. Flag-driven variants (specific month, different start-of-week, year view) are explicitly out of scope.
- Each scenario step is independently testable: date resolution, header layout, week-number column, and row-by-row day placement can each be asserted against a fixed reference date in tests.

## Use Case Traceability Mapping
This section provides a centralized mapping of all use case steps for reference by specs, design, and tasks.

| Use Case Step | Description |
|---------------|-------------|
| UC1-S1 | Terminal User invokes the binary with no arguments |
| UC1-S2 | System resolves the current local date (year, month, day) |
| UC1-S3 | System determines the first weekday of the month and total days in the month |
| UC1-S4 | System prints a centered month-name header line |
| UC1-S5 | System prints the weekday header row `Mo Tu We Th Fr Sa Su` offset for the week-number column |
| UC1-S6 | System prints one row per week with ISO week number and right-aligned day numbers, blanks for out-of-month days |
| UC1-S7 | System exits with status code 0 after flushing stdout |
| UC1-E2a | System cannot resolve local date; prints an error to stderr and exits non-zero |
| UC1-E5a | Stdout is not a TTY; output stays plain text with no escape codes |
| UC1-E6a | Month begins on Monday; first row has no leading blank day cells |
| UC1-E6b | Month ends before Sunday; last row has trailing blank cells to preserve alignment |

### Mapping Guidelines for Downstream Artifacts:
- **Specs**: Reference steps using "**Implements**: UC1-S1 - [description]"
- **Design**: Reference steps using "**Addresses**: UC1-S1 - [description]"
- **Tasks**: Reference steps using "(Addresses: UC1-S1)" or "(Addresses: UC1-S1, UC1-S2)"
