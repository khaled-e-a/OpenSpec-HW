## Test Report: rust-cli-calendar

Generated: 2026-04-16
Runner: `cargo test` (stable 1.94.1)
Source: `spec-tests.md`

### Use Case Coverage Summary

| Use Case | Happy Steps | Extensions | Overall |
|----------|-------------|------------|---------|
| UC1 — View current month calendar | ✅ 7/7 | ✅ 4/4 | 100% |

Overall: **11/11 use-case steps covered (100%)** by example-based tests; **14/14 WHEN/THEN scenarios covered** by property-based tests.

### Covered Requirements

- ✅ **UC1** — View current month calendar (full flow) → `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero` (Integration)
- ✅ **UC1-S1** — Terminal User invokes the binary with no arguments → `tests/cli.rs:14` (happy) + `tests/cli.rs:31` `extra_argument_is_rejected_with_usage_on_stderr` (negative) + `tests/pbt.rs:184,196` (PBT pair)
- ✅ **UC1-S2** — System resolves the current local date → `tests/cli.rs:14` (via `CAL_TEST_DATE` injection) + `tests/pbt.rs:209` `uc1_s2_output_contains_correct_month_name` (PBT)
- ✅ **UC1-S3** — System determines first weekday and total days in the month → `src/geometry.rs:35,42,48,54,60` (5 Unit) + `tests/pbt.rs:56,65,74` (3 PBT covering non-leap/leap/30-day)
- ✅ **UC1-S4** — System prints a centered month-name header line → `src/layout.rs:14,19,26` (3 Unit) + `src/render.rs:106` (Component) + `tests/pbt.rs:85` (PBT)
- ✅ **UC1-S5** — System prints the weekday header row offset for the week-number column → `src/render.rs:106` (Component) + `tests/pbt.rs:95` (PBT)
- ✅ **UC1-S6** — System prints one row per week with ISO week number and right-aligned day numbers → `src/render.rs:83,96` (2 Unit) + `src/render.rs:106` (Component) + `tests/pbt.rs:104,124` (2 PBT)
- ✅ **UC1-S7** — System exits with status code 0 after flushing stdout → `tests/cli.rs:14` (`.success()`) + `tests/pbt.rs:184` (PBT, shared with S1)
- ✅ **UC1-E2a** — Date resolution failure → stderr + non-zero exit → `tests/cli.rs:62` (Integration) + `tests/pbt.rs:231` (PBT)
- ✅ **UC1-E5a** — Non-TTY stdout stays plain text → `src/render.rs:120` (Unit) + `tests/cli.rs:42` (Integration) + `tests/pbt.rs:139` (PBT)
- ✅ **UC1-E6a** — Month begins on Monday → no leading blank cells → `src/geometry.rs:35` + `src/render.rs:83,106` + `tests/pbt.rs:152` (PBT using `monday_start_year_month()` strategy)
- ✅ **UC1-E6b** — Month ends before Sunday → trailing blank cells → `src/render.rs:96` (Unit) + `tests/pbt.rs:163` (PBT)

### Uncovered Requirements

None — every UC step and extension has ≥ 1 passing example-based test AND ≥ 1 passing property-based test.

### PBT Results

| UC Step | Scenario | Outcome | Counterexample | Regression Test |
|---------|----------|---------|----------------|-----------------|
| UC1-S1 | WHEN no args THEN calendar + exit 0 | ✅ passed (16 runs) | — | — |
| UC1-S1 | WHEN ≥1 arg THEN non-zero + usage | ✅ passed (16 runs) | — | — |
| UC1-S2 | WHEN CAL_TEST_DATE=(y,m,d) THEN header contains month name | ✅ passed (16 runs) | — | — |
| UC1-S3 | Non-leap Feb → 28d | ✅ passed (256 runs) | — | — |
| UC1-S3 | Leap Feb → 29d | ✅ passed (256 runs) | — | — |
| UC1-S3 | {Apr, Jun, Sep, Nov} → 30d | ✅ passed (256 runs) | — | — |
| UC1-S4 | Header centered in 24-wide line, trims to month name | ✅ passed (256 runs) | — | — |
| UC1-S5 | Weekday header literal match | ✅ passed (256 runs) | — | — |
| UC1-S6 | Every day 1..=N placed exactly once, in order | ✅ passed (256 runs) | — | — |
| UC1-S6 | First-row leading blanks match weekday index | ✅ passed (256 runs) | — | — |
| UC1-S7 | Render → exit 0 (shared with UC1-S1) | ✅ passed (16 runs) | — | — |
| UC1-E2a | Clock unparseable → stderr + non-zero | ✅ passed (16 runs) | — | — |
| UC1-E5a | Output bytes ⊆ printable ASCII ∪ {\n} | ✅ passed (256 runs) | — | — |
| UC1-E6a | Monday start → zero leading blanks | ✅ passed (256 runs) | — | — |
| UC1-E6b | Pre-Sunday end → trailing blanks match weekday | ✅ passed (256 runs) | — | — |

**No counterexamples**. No `pbt-regressions.md` created (none needed).

### Test Run Results

```
     Running unittests src/lib.rs
running 12 tests ... test result: ok. 12 passed; 0 failed; 0 ignored

     Running unittests src/main.rs
running 0 tests ... test result: ok. 0 passed; 0 failed; 0 ignored

     Running tests/cli.rs
running 4 tests ... test result: ok. 4 passed; 0 failed; 0 ignored

     Running tests/pbt.rs
running 14 tests ... test result: ok. 14 passed; 0 failed; 0 ignored

     Doc-tests rust_cli_calendar
running 0 tests ... test result: ok. 0 passed; 0 failed; 0 ignored
```

**Totals**: **30 passed, 0 failed, 0 ignored**. Suite duration ~0.6 s.

### Conclusion

All 11 UC steps and 14 WHEN/THEN scenarios are covered by passing automated tests across Unit / Component / Integration / PBT layers. Coverage for this change is complete; no manual test plan is needed.

Suggested next step: run `/synspec:archive rust-cli-calendar` to close the change.
