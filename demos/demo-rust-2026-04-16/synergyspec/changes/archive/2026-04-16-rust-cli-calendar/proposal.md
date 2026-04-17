## Why

Users working in the terminal need a quick way to view the current month as a calendar without leaving the CLI or relying on `cal` (which is not installed by default on all systems, and whose output format varies by platform). A small, purpose-built Rust binary gives a consistent, portable calendar view with ISO week numbers on every machine.

## What Changes

- Add a new Rust binary crate `rust-cli-calendar` that, when run with no arguments, prints the calendar for the current month to stdout.
- Output format:
  - A centered month header (full month name, no year).
  - A weekday header row starting Monday (`Mo Tu We Th Fr Sa Su`), indented two spaces to leave room for the week-number column.
  - Day rows prefixed by the ISO 8601 week number, with each day right-aligned in a two-character field.
  - Days from previous/next months are rendered as blank spaces, not shown.
- Determine "current month" from the system local date at invocation time.
- Ship a minimal `Cargo.toml` and a single `src/main.rs` entry point.

## Capabilities

### New Capabilities
- `current-month-calendar`: Render the current month as a weekday-and-week-numbered grid on stdout when the binary is invoked without arguments.

### Modified Capabilities
<!-- None — this is a greenfield project with no prior specs. -->

## Impact

- **Code**: New Rust crate at the repository root (`Cargo.toml`, `src/main.rs`).
- **Dependencies**: `chrono` (or `time`) for local date resolution and weekday/ISO-week arithmetic. No network, no filesystem writes.
- **APIs**: None — CLI-only, stdout output.
- **Build/tooling**: Requires a stable Rust toolchain (`cargo build --release`).
- **Runtime**: Reads system local time; no other side effects.

Created by Khaled@Huawei
