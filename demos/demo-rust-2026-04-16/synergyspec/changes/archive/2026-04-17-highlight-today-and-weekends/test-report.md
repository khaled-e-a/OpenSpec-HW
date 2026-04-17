## Test Report: highlight-today-and-weekends

Generated: 2026-04-17
Runner: `cargo test` (stable 1.94.1)
Source: `spec-tests.md`

### Use Case Coverage Summary

| Use Case | Happy Steps | Extensions | Overall |
|----------|-------------|------------|---------|
| UC1 — Identify today's date at a glance | ✅ 6/6 | ✅ 1/2 (UC1-E3a ✅; UC1-E5a non-testable by design) | ~95% |
| UC2 — Identify weekend days at a glance | ✅ 6/6 | ✅ 2/2 | 100% |

**Overall automatable coverage**: 16/16 automatable steps+extensions covered (100% of the automatable scope).
**Non-testable by design**: 1 extension (UC1-E5a, "dumb terminal" accepted fallback per Design Decision 6).
**PBT scenarios**: 12/12 WHEN/THEN scenarios covered.

### Covered Requirements

- ✅ **UC1** (full flow, piped) → `tests/cli.rs:14` `no_args_renders_current_month_and_exits_zero`
- ✅ **UC1** (full flow, TTY) → `tests/pty.rs:56` `pty_run_wraps_today_cell_in_reverse_video_when_today_is_a_weekday`
- ✅ **UC1-S1** → `tests/cli.rs:14` (happy) + `tests/cli.rs:31` (extra-arg negative) + `tests/pbt.rs:184` (PBT)
- ✅ **UC1-S2** → `tests/cli.rs:14` (Integration) — `today_date()` rename exercised
- ✅ **UC1-S3** (detect TTY) → `tests/pty.rs:44` `pty_run_emits_sgr_sequences_when_stdout_is_a_tty` (automated via `portable-pty`)
- ✅ **UC1-S4** (identify today cell) → `src/render.rs:157`
- ✅ **UC1-S5** (reverse-video wrap) → `src/style.rs:43` (Unit, 8 combos) + `src/render.rs:157` (Unit) + `tests/pbt.rs:194` (PBT) + `tests/pty.rs:56` (PTY)
- ✅ **UC1-S6** (print + exit 0) → `tests/cli.rs:14` `.success()`
- ✅ **UC1-E3a** (non-TTY plain) → `tests/cli.rs:42` + `src/render.rs:149` + `tests/pbt.rs:178`/`:185` + `tests/pty.rs` absence-of-escape-codes implicit via piped `cli.rs:42`
- ✅ **UC2** (full flow, piped) → `tests/cli.rs:42` `stdout_is_plain_ascii_with_no_escape_codes`
- ✅ **UC2** (full flow, TTY) → `tests/pty.rs:87` `pty_run_wraps_every_weekend_day_in_bold` + `tests/pty.rs:71` `pty_run_uses_combined_sgr_when_today_is_a_weekend`
- ✅ **UC2-S1/S2/S3/S6** → shared / covered per UC1 and archived base tests
- ✅ **UC2-S4** (weekend bold) → `src/style.rs:43` + `src/render.rs:157` + `tests/pbt.rs:214` (PBT) + `tests/pty.rs:87` (PTY, all 8 Jan-2024 weekend days)
- ✅ **UC2-S5** (today-on-weekend combined SGR) → `src/style.rs:43` + `src/render.rs:183` + `tests/pbt.rs:194` + `tests/pty.rs:71`
- ✅ **UC2-E3a** (non-TTY no weekend SGR) → `src/style.rs:43` (non-TTY cases) + `src/render.rs:149` + `tests/pbt.rs:185`
- ✅ **UC2-E5a** (single combined pair, no nesting) → `src/render.rs:183` (asserts exactly one combined pair AND absence of standalone variants) + `tests/pbt.rs:194` + `tests/pty.rs:71`

### Partially Covered / Non-Testable Requirements

- ⚠️ **UC1-E5a** (Terminal does not interpret ANSI SGR — raw bytes emitted, accepted fallback)
  - **Reason**: non-testable by design. Per Design Decision 6, the tool does not detect whether the TTY supports SGR; raw escape bytes are emitted and accepted as the fallback behaviour. There is no observable property to assert (no escape-stripping, no `TERM` probing, no `NO_COLOR` handling — all explicitly out of scope).
  - **Decision**: no test plan entry. The behaviour is documented in the delta spec's `Highlight today's date on a TTY` requirement and the use-case extension text. Users on dumb terminals who want plain output can pipe through `| cat`, which is already covered by `tests/cli.rs:42`.

### Uncovered Requirements

None.

### PBT Results

All 18 proptest properties passed. Breakdown of the 4 new ones for this change (prior 14 are archived-base regressions):

| UC Step / Requirement | Scenario | Outcome | Counterexample | Regression Test |
|-----------------------|----------|---------|----------------|-----------------|
| UC1-E3a / MOD Plain-text S1-S2 | `pbt_styled_with_no_styling_equals_plain_render` | ✅ passed (256 runs) | — | — |
| UC1-E3a / UC2-E3a | `pbt_non_tty_render_has_no_escape_bytes` | ✅ passed (256 runs) | — | — |
| UC1-S5 / UC2-S5 | `pbt_tty_render_highlights_today` (reverse for weekday, combined for weekend) | ✅ passed (256 runs) | — | — |
| UC2-S4 | `pbt_tty_render_highlights_weekends_only_when_today_none` | ✅ passed (256 runs) | — | — |

**No counterexamples**. `pbt-regressions.md` not needed.

### PTY Results (new)

| UC Step | Test | Outcome |
|---------|------|---------|
| UC1-S3 / UC2-S3 | `tests/pty.rs:44` `pty_run_emits_sgr_sequences_when_stdout_is_a_tty` | ✅ passed |
| UC1-S5 | `tests/pty.rs:56` `pty_run_wraps_today_cell_in_reverse_video_when_today_is_a_weekday` (CAL_TEST_DATE=2024-01-15) | ✅ passed |
| UC2-S5 / UC2-E5a | `tests/pty.rs:71` `pty_run_uses_combined_sgr_when_today_is_a_weekend` (CAL_TEST_DATE=2024-01-07) | ✅ passed |
| UC2-S4 | `tests/pty.rs:87` `pty_run_wraps_every_weekend_day_in_bold` (asserts all 8 weekend days of Jan 2024) | ✅ passed |

### Test Run Results

```
     Running unittests src/lib.rs         → 16 passed; 0 failed
     Running unittests src/main.rs        →  0 passed; 0 failed
     Running tests/cli.rs                 →  4 passed; 0 failed
     Running tests/pbt.rs                 → 18 passed; 0 failed
     Running tests/pty.rs                 →  4 passed; 0 failed
     Doc-tests rust_cli_calendar          →  0 passed; 0 failed
```

**Totals**: **42 passed, 0 failed, 0 ignored**. Suite duration: ~0.7 s.

### Conclusion

Every automatable UC step and WHEN/THEN scenario is covered by at least one passing test; the only ⚠️ item (UC1-E5a) is non-testable by design. No manual test plan generated — all requirements that can be automated are automated.

Suggested next step: run `/synspec:ci` for the full CI pipeline (coverage + e2e aggregation) or `/synspec:archive highlight-today-and-weekends` to close the change.
