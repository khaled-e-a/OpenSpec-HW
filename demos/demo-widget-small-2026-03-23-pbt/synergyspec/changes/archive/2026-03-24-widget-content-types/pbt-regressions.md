## PBT Regressions: widget-content-types

Generated: 2026-03-24

| # | UC Step | Framework | Counterexample | Regression Test | Status |
|---|---------|-----------|----------------|-----------------|--------|
| 1 | UC1-S5 | fast-check | `col=Number.NaN, row=0` | `src/utils/pbt-regression-uc1-s5-1.test.ts` | ✅ fixed |

### Details

**Regression #1 — UC1-S5: snapAndClamp NaN input**

- **Discovered by**: `src/utils/gridUtils.property.test.ts` — "UC1-S5: snapAndClamp result is closest integer cell to raw input"
- **Seed**: 565570752, path "88:31"
- **Shrunk counterexample**: `[Number.NaN, 0]`
- **Failure**: `Math.round(NaN) = NaN`; `Math.max(0, Math.min(NaN, 11)) = NaN`; assertion `Math.abs(NaN - NaN) <= 1` failed because `NaN <= 1` is `false`
- **Root cause**: `snapAndClamp` passed `NaN` directly to `Math.round()` without guarding. `fc.float()` in fast-check v3 includes special IEEE 754 values (`NaN`, `Infinity`, `-Infinity`) in its range by default.
- **Fix**: Added `Number.isFinite()` guard at top of `snapAndClamp` — `NaN` and `±Infinity` inputs are treated as `0` (clamp to grid start).
- **Fixed in**: `src/utils/gridUtils.ts` — `snapAndClamp` function
- **Regression tests**: `src/utils/pbt-regression-uc1-s5-1.test.ts` (2 tests: NaN col, NaN row)
- **Status**: ✅ fixed — both regression tests pass
