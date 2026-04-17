# Spec-Test Mapping: rust-cli-calendar

Generated: 2026-04-16
Language: Rust
Example-based framework: built-in `#[test]` (unit) + `assert_cmd` (integration)
Property-based framework: `proptest` 1.x (in `[dev-dependencies]`; suite in `tests/pbt.rs`)

## Use Case ID Mapping
Source: `usecases.md` → "Use Case Traceability Mapping" table.

| UC ID | Description |
|-------|-------------|
| UC1 | View current month calendar (full flow) |
| UC1-S1 | Terminal User invokes the binary with no arguments |
| UC1-S2 | System resolves the current local date |
| UC1-S3 | System determines first weekday and total days in the month |
| UC1-S4 | System prints a centered month-name header line |
| UC1-S5 | System prints the weekday header row `Mo Tu We Th Fr Sa Su` offset for the week-number column |
| UC1-S6 | System prints one row per week with ISO week number and right-aligned day numbers, blanks for out-of-month days |
| UC1-S7 | System exits with status code 0 after flushing stdout |
| UC1-E2a | System cannot resolve local date; stderr + non-zero exit |
| UC1-E5a | Stdout is not a TTY; output stays plain text with no escape codes |
| UC1-E6a | Month begins on Monday; first row has no leading blank day cells |
| UC1-E6b | Month ends before Sunday; last row has trailing blank cells to preserve alignment |

## Requirement Traceability Matrix

| ID | Requirement | Type | Test Type | Test Case | Status |
|----|-------------|------|-----------|-----------|--------|
| UC1 | View current month calendar — full flow | Flow | Integration | `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` | ✅ |
| UC1-S1 | Zero-arg invocation triggers render | Step | Integration | `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` | ✅ |
| UC1-S1 | Extra-arg rejection (negative case of S1) | Step | Integration | `tests/cli.rs:31` `extra_argument_is_rejected_with_usage_on_stderr` | ✅ |
| UC1-S1 | Zero-arg invocation triggers render | Step | PBT | `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` | ✅ |
| UC1-S1 | Extra-arg rejection | Step | PBT | `tests/pbt.rs:196` `uc1_s1_extra_arg_is_rejected` | ✅ |
| UC1-S2 | Resolve current local date | Step | Integration | `tests/cli.rs:14` (via `CAL_TEST_DATE` injection) | ✅ |
| UC1-S2 | Resolve current local date | Step | PBT | `tests/pbt.rs:209` `uc1_s2_output_contains_correct_month_name` | ✅ |
| UC1-S3 | Month geometry — 31-day Jan, Monday start | Step | Unit | `src/geometry.rs:35` `january_2024_has_31_days_starting_monday` | ✅ |
| UC1-S3 | Month geometry — leap Feb 2024 | Step | Unit | `src/geometry.rs:42` `february_2024_is_leap_year` | ✅ |
| UC1-S3 | Month geometry — non-leap Feb 2025 | Step | Unit | `src/geometry.rs:48` `february_2025_is_not_leap_year` | ✅ |
| UC1-S3 | Month geometry — 30-day Apr | Step | Unit | `src/geometry.rs:54` `april_2024_has_30_days` | ✅ |
| UC1-S3 | Month geometry — 31-day Dec | Step | Unit | `src/geometry.rs:60` `december_2024_has_31_days` | ✅ |
| UC1-S3 | Month geometry (non-leap Feb) | Step | PBT | `tests/pbt.rs:56` `uc1_s3_non_leap_feb_has_28_days` | ✅ |
| UC1-S3 | Month geometry (leap Feb) | Step | PBT | `tests/pbt.rs:65` `uc1_s3_leap_feb_has_29_days` | ✅ |
| UC1-S3 | Month geometry (30-day months) | Step | PBT | `tests/pbt.rs:74` `uc1_s3_thirty_day_months_have_30_days` | ✅ |
| UC1-S4 | Grid width constant | Step | Unit | `src/layout.rs:14` `grid_width_is_twenty_four` | ✅ |
| UC1-S4 | Centered month header (Jan) | Step | Unit | `src/layout.rs:19` `centering_january_produces_twenty_four_chars` | ✅ |
| UC1-S4 | Centered month header (May) | Step | Unit | `src/layout.rs:26` `centering_may_produces_twenty_four_chars` | ✅ |
| UC1-S4 | Month header — end-to-end row | Step | Component | `src/render.rs:106` `render_january_2024_matches_golden_layout` | ✅ |
| UC1-S4 | Month header layout invariant | Step | PBT | `tests/pbt.rs:85` `uc1_s4_header_is_24_chars_and_names_month` | ✅ |
| UC1-S5 | Weekday header row — end-to-end | Step | Component | `src/render.rs:106` `render_january_2024_matches_golden_layout` | ✅ |
| UC1-S5 | Weekday header row invariant | Step | PBT | `tests/pbt.rs:95` `uc1_s5_weekday_header_is_exact` | ✅ |
| UC1-S6 | Week grouping — typical 5-row month | Step | Unit | `src/render.rs:83` `weeks_for_january_2024_has_five_rows_starting_monday` | ✅ |
| UC1-S6 | Week grouping — trailing blanks | Step | Unit | `src/render.rs:96` `weeks_for_february_2025_ends_on_friday_with_trailing_blanks` | ✅ |
| UC1-S6 | Week rows — end-to-end layout | Step | Component | `src/render.rs:106` `render_january_2024_matches_golden_layout` | ✅ |
| UC1-S6 | Week rows — all days placed exactly once | Step | PBT | `tests/pbt.rs:104` `uc1_s6_every_day_appears_exactly_once_in_order` | ✅ |
| UC1-S6 | Week rows — first row leading blanks match weekday | Step | PBT | `tests/pbt.rs:124` `uc1_s6_first_row_leading_blanks_match_weekday` | ✅ |
| UC1-S7 | Successful render exits 0 (flushed stdout) | Step | Integration | `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` (`.success()`) | ✅ |
| UC1-S7 | Successful render exits 0 | Step | PBT | `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` (shared with UC1-S1) | ✅ |
| UC1-E2a | Date resolution failure → stderr + non-zero | Extension | Integration | `tests/cli.rs:62` `invalid_test_date_env_causes_non_zero_exit_and_stderr_message` | ✅ |
| UC1-E2a | Date resolution failure invariant | Extension | PBT | `tests/pbt.rs:231` `uc1_e2a_invalid_date_fails_with_stderr_message` | ✅ |
| UC1-E5a | Plain-text output (pure function) | Extension | Unit | `src/render.rs:120` `render_output_contains_no_escape_codes` | ✅ |
| UC1-E5a | Plain-text output (piped binary) | Extension | Integration | `tests/cli.rs:42` `stdout_is_plain_ascii_with_no_escape_codes` | ✅ |
| UC1-E5a | Plain-text output invariant | Extension | PBT | `tests/pbt.rs:139` `uc1_e5a_output_is_printable_ascii` | ✅ |
| UC1-E6a | Month begins Monday — no leading blanks (geometry) | Extension | Unit | `src/geometry.rs:35` `january_2024_has_31_days_starting_monday` | ✅ |
| UC1-E6a | Month begins Monday — no leading blanks (rows) | Extension | Unit | `src/render.rs:83` `weeks_for_january_2024_has_five_rows_starting_monday` | ✅ |
| UC1-E6a | Month begins Monday — end-to-end | Extension | Component | `src/render.rs:106` `render_january_2024_matches_golden_layout` | ✅ |
| UC1-E6a | Month begins Monday invariant | Extension | PBT | `tests/pbt.rs:152` `uc1_e6a_monday_start_has_no_leading_blanks` | ✅ |
| UC1-E6b | Month ends before Sunday — trailing blanks | Extension | Unit | `src/render.rs:96` `weeks_for_february_2025_ends_on_friday_with_trailing_blanks` | ✅ |
| UC1-E6b | Month ends before Sunday invariant | Extension | PBT | `tests/pbt.rs:163` `uc1_e6b_trailing_blanks_match_weekday` | ✅ |

**Example-based coverage**: 11/11 UC steps covered.
**PBT coverage**: 14/14 WHEN/THEN scenarios covered. All passing.

## PBT Coverage

| UC Step | Scenario (WHEN / THEN) | PBT Test | Framework | Status |
|---------|------------------------|----------|-----------|--------|
| UC1-S1 | WHEN no args THEN calendar output + exit 0 | `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` | proptest | ✅ |
| UC1-S1 | WHEN ≥1 arg THEN non-zero exit + usage on stderr | `tests/pbt.rs:196` `uc1_s1_extra_arg_is_rejected` | proptest | ✅ |
| UC1-S2 | WHEN CAL_TEST_DATE=(y,m,d) THEN header contains month name | `tests/pbt.rs:209` `uc1_s2_output_contains_correct_month_name` | proptest | ✅ |
| UC1-S3 | WHEN Feb non-leap THEN days_in_month = 28 | `tests/pbt.rs:56` `uc1_s3_non_leap_feb_has_28_days` | proptest | ✅ |
| UC1-S3 | WHEN Feb leap THEN days_in_month = 29 | `tests/pbt.rs:65` `uc1_s3_leap_feb_has_29_days` | proptest | ✅ |
| UC1-S3 | WHEN month ∈ {Apr, Jun, Sep, Nov} THEN days_in_month = 30 | `tests/pbt.rs:74` `uc1_s3_thirty_day_months_have_30_days` | proptest | ✅ |
| UC1-S4 | WHEN header printed THEN width = 24 and trims to month name | `tests/pbt.rs:85` `uc1_s4_header_is_24_chars_and_names_month` | proptest | ✅ |
| UC1-S5 | WHEN weekday row printed THEN equals `    Mo Tu We Th Fr Sa Su` | `tests/pbt.rs:95` `uc1_s5_weekday_header_is_exact` | proptest | ✅ |
| UC1-S6 | WHEN month rendered THEN every day 1..=N appears exactly once, in order | `tests/pbt.rs:104` `uc1_s6_every_day_appears_exactly_once_in_order` | proptest | ✅ |
| UC1-S6 | WHEN day 1 not Monday THEN first-row leading cells are None up to weekday index | `tests/pbt.rs:124` `uc1_s6_first_row_leading_blanks_match_weekday` | proptest | ✅ |
| UC1-S7 | WHEN calendar printed THEN exit 0 (shared invariant with UC1-S1 no-args test) | `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` | proptest | ✅ |
| UC1-E2a | WHEN date resolution fails THEN stderr + non-zero | `tests/pbt.rs:231` `uc1_e2a_invalid_date_fails_with_stderr_message` | proptest | ✅ |
| UC1-E5a | WHEN output captured THEN bytes ⊆ printable ASCII ∪ {\n} | `tests/pbt.rs:139` `uc1_e5a_output_is_printable_ascii` | proptest | ✅ |
| UC1-E6a | WHEN day 1 = Monday THEN first row has no leading None cells | `tests/pbt.rs:152` `uc1_e6a_monday_start_has_no_leading_blanks` | proptest | ✅ |
| UC1-E6b | WHEN last day ≠ Sunday THEN last row has (6 - weekday_index(last)) trailing None cells | `tests/pbt.rs:163` `uc1_e6b_trailing_blanks_match_weekday` | proptest | ✅ |

## Use Case Details: View current month calendar (ID: UC1)

### Main Scenario
- **UC1-S1**: Terminal User invokes the binary with no arguments
  - `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` (Integration)
  - `tests/cli.rs:31` `extra_argument_is_rejected_with_usage_on_stderr` (Integration, negative)
  - `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` (PBT)
  - `tests/pbt.rs:196` `uc1_s1_extra_arg_is_rejected` (PBT)
- **UC1-S2**: System resolves the current local date
  - `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` (Integration, via `CAL_TEST_DATE`)
  - `tests/pbt.rs:209` `uc1_s2_output_contains_correct_month_name` (PBT)
- **UC1-S3**: System determines first weekday and total days in the month
  - `src/geometry.rs:35` `january_2024_has_31_days_starting_monday` (Unit)
  - `src/geometry.rs:42` `february_2024_is_leap_year` (Unit)
  - `src/geometry.rs:48` `february_2025_is_not_leap_year` (Unit)
  - `src/geometry.rs:54` `april_2024_has_30_days` (Unit)
  - `src/geometry.rs:60` `december_2024_has_31_days` (Unit)
  - `tests/pbt.rs:56` `uc1_s3_non_leap_feb_has_28_days` (PBT)
  - `tests/pbt.rs:65` `uc1_s3_leap_feb_has_29_days` (PBT)
  - `tests/pbt.rs:74` `uc1_s3_thirty_day_months_have_30_days` (PBT)
- **UC1-S4**: System prints a centered month-name header line
  - `src/layout.rs:14` `grid_width_is_twenty_four` (Unit)
  - `src/layout.rs:19` `centering_january_produces_twenty_four_chars` (Unit)
  - `src/layout.rs:26` `centering_may_produces_twenty_four_chars` (Unit)
  - `src/render.rs:106` `render_january_2024_matches_golden_layout` (Component)
  - `tests/pbt.rs:85` `uc1_s4_header_is_24_chars_and_names_month` (PBT)
- **UC1-S5**: System prints the weekday header row offset for the week-number column
  - `src/render.rs:106` `render_january_2024_matches_golden_layout` (Component)
  - `tests/pbt.rs:95` `uc1_s5_weekday_header_is_exact` (PBT)
- **UC1-S6**: System prints one row per week with ISO week number and right-aligned day numbers
  - `src/render.rs:83` `weeks_for_january_2024_has_five_rows_starting_monday` (Unit)
  - `src/render.rs:96` `weeks_for_february_2025_ends_on_friday_with_trailing_blanks` (Unit)
  - `src/render.rs:106` `render_january_2024_matches_golden_layout` (Component)
  - `tests/pbt.rs:104` `uc1_s6_every_day_appears_exactly_once_in_order` (PBT)
  - `tests/pbt.rs:124` `uc1_s6_first_row_leading_blanks_match_weekday` (PBT)
- **UC1-S7**: System exits with status code 0 after flushing stdout
  - `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` (Integration, `.success()`)
  - `tests/pbt.rs:184` `uc1_s1_no_args_exits_zero_for_any_valid_date` (PBT, shared with S1)

### Extensions
- **UC1-E2a**: Local date unavailable → stderr + non-zero exit
  - `tests/cli.rs:62` `invalid_test_date_env_causes_non_zero_exit_and_stderr_message` (Integration)
  - `tests/pbt.rs:231` `uc1_e2a_invalid_date_fails_with_stderr_message` (PBT)
- **UC1-E5a**: Stdout not a TTY → plain-text output
  - `src/render.rs:120` `render_output_contains_no_escape_codes` (Unit)
  - `tests/cli.rs:42` `stdout_is_plain_ascii_with_no_escape_codes` (Integration)
  - `tests/pbt.rs:139` `uc1_e5a_output_is_printable_ascii` (PBT)
- **UC1-E6a**: Month begins on Monday → no leading blanks in first row
  - `src/geometry.rs:35` `january_2024_has_31_days_starting_monday` (Unit)
  - `src/render.rs:83` `weeks_for_january_2024_has_five_rows_starting_monday` (Unit)
  - `src/render.rs:106` `render_january_2024_matches_golden_layout` (Component)
  - `tests/pbt.rs:152` `uc1_e6a_monday_start_has_no_leading_blanks` (PBT)
- **UC1-E6b**: Month ends before Sunday → trailing blanks in last row
  - `src/render.rs:96` `weeks_for_february_2025_ends_on_friday_with_trailing_blanks` (Unit)
  - `tests/pbt.rs:163` `uc1_e6b_trailing_blanks_match_weekday` (PBT)

### Full Flow Tests
- `UC1` — "View current month calendar" → `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` (Integration) ✅
