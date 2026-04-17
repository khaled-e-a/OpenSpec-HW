## CI Report

Generated: 2026-04-17
Runner: `cargo test` (stable 1.94.1)
Project: `rust-cli-calendar`

### Overall Verdict: ⚠️ **PARTIAL**

All 42 automated tests pass and no regressions were introduced, but line-coverage metrics are unavailable (no Rust coverage tool installed — per the spec's documented "coverage tooling not configured" graceful-degradation rule). No hard failures, regressions, or open PBT counterexamples.

### Changes Covered

| Change | spec-tests.md | test-report.md | test-plan.md | spec-blast-radius.md |
|--------|---------------|----------------|--------------|---------------------|
| highlight-today-and-weekends | ✅ | ✅ | ❌ no plan (all UC steps covered by automated tests — UC1-E5a is non-testable by design) | ✅ |

### Unit/Integration Test Results

| Suite | Tests | Pass | Fail | Skip |
|-------|-------|------|------|------|
| `src/lib.rs` unit tests | 16 | 16 | 0 | 0 |
| `src/main.rs` unit tests | 0 | 0 | 0 | 0 |
| `tests/cli.rs` integration (piped) | 4 | 4 | 0 | 0 |
| `tests/pbt.rs` property-based | 18 | 18 | 0 | 0 |
| `tests/pty.rs` integration (real PTY via `portable-pty`) | 4 | 4 | 0 | 0 |
| Doc-tests | 0 | 0 | 0 | 0 |
| **Total** | **42** | **42** | **0** | **0** |

Runtime: ~0.7 s.

### Spec Blast Radius Coverage

Read from `synergyspec/changes/highlight-today-and-weekends/spec-blast-radius.md`.

| Change | Impacted Spec | Impact | Affected Tests | Status |
|--------|---------------|--------|----------------|--------|
| highlight-today-and-weekends | `synergyspec/specs/current-month-calendar/spec.md` | High | `tests/cli.rs`, `src/render.rs` (unit), `src/style.rs` (unit), `tests/pbt.rs`, `tests/pty.rs` | ✅ PASS (all 42 tests green) |

✅ All blast-radius-impacted specs have passing test coverage.

### Code Coverage (Full Project)

| Metric | Coverage |
|--------|----------|
| Lines | ⚠️ not measured |
| Branches | ⚠️ not measured |
| Functions | ⚠️ not measured |
| Statements | ⚠️ not measured |

**Reason**: no Rust coverage tool installed (`cargo-tarpaulin`, `cargo-llvm-cov`, and `grcov` are all absent). Coverage tooling is not auto-installed by the CI flow for Rust projects.

**Gap suggestion** (optional):
```
rustup component add llvm-tools-preview
cargo install cargo-llvm-cov
cargo llvm-cov --summary-only
```

### E2E Test Plan Results

No `test-plan.md` files found across any change — e2e phase skipped. This is consistent with `test-report.md`: every automatable UC step has at least one automated test (Unit + Component + Integration + PBT + PTY). The only ⚠️ item (UC1-E5a "dumb terminal accepted fallback") is non-testable by design per Design Decision 6 — no manual test would meaningfully verify it either.

### PBT & Regression Tests

| Change | PBT Tests | Counterexamples Found | Regression Tests | Status |
|--------|-----------|----------------------|------------------|--------|
| highlight-today-and-weekends | 18 (14 archived-base + 4 new this change) | 0 | 0 | ✅ |

No `pbt-regressions.md` needed.

### Screenshot Comparison

No screenshots produced (no e2e phase ran) — skipped.

### Regressions

None. All tests pass; piped-bytes invariant preserved (`tests/cli.rs:42` unchanged and green); TTY-path now automated via `portable-pty` (4 new tests in `tests/pty.rs`).

### Artifacts

- Test report: `synergyspec/changes/highlight-today-and-weekends/test-report.md`
- Spec-test mapping: `synergyspec/changes/highlight-today-and-weekends/spec-tests.md`
- Spec blast radius: `synergyspec/changes/highlight-today-and-weekends/spec-blast-radius.md`
- CI report (this file): `synergyspec/ci-report.md`
- Coverage HTML: ⚠️ not generated (no coverage tool installed)
- E2E artifacts: none (no e2e phase)

### Actionable Follow-ups

1. **(Optional)** Install `cargo-llvm-cov` and re-run CI to capture line/branch coverage.
2. **(Ready)** Archive the change: `/synspec:archive highlight-today-and-weekends`. The archive flow will offer to sync the delta spec into `synergyspec/specs/current-month-calendar/spec.md`.
