# Spec Blast Radius: timer-adjustments-and-task-notes
Generated: 2026-04-02T14:45:00Z

## Summary
2 spec(s) impacted by this change.

## Impacted Specs

### openspec/specs/session-manager/spec.md
**Impact Level**: High
**Reason**: Delta spec `openspec/changes/timer-adjustments-and-task-notes/specs/session-manager/spec.md` directly modifies requirements in this spec. Changed file `src/types/timer.ts` modifies `LONG_REST_DURATION` (600→1500) and `WORK_DURATION` (1500→1800), which are directly asserted in session-manager requirements. Delta spec shares UC step references (UC2-S1, UC2-S5, UC2-E3a) with this existing spec.
**Impacted Requirements**:
- Requirement: Advance to long rest after 4th completed work session — asserts `remainingSeconds === 600` (now 1500)
- Requirement: Advance from short rest to next work session — asserts `remainingSeconds === 1500` (now 1800)
- Requirement: Advance from long rest to new cycle — asserts `remainingSeconds === 1500` (now 1800)
- Requirement: Allow skipping a rest session — asserts `remainingSeconds === 1500` (now 1800)
- Requirement: Reset session state to defaults — asserts `remainingSeconds === 1500` (now 1800)
**Affected Tests**: `src/test/sessionManager.property.test.ts`, `src/test/sessionUtils.test.ts`

---

### openspec/specs/timer-display/spec.md
**Impact Level**: High
**Reason**: Delta spec `openspec/changes/timer-adjustments-and-task-notes/specs/timer-display/spec.md` directly modifies requirements in this spec. Changed files include `src/components/TimerDisplay.tsx` and `src/App.tsx`. Delta spec shares UC step references (UC1-S2, UC2-S1, UC3-S1) with this existing spec. The "Full-duration display at start" scenario in the existing spec references `25:00` (now `30:00`). The "Reflect reset in display" scenario references `25:00` (now `30:00`). A new ADDED requirement (task-notes panel visibility) extends this spec's scope.
**Impacted Requirements**:
- Requirement: Display countdown in MM:SS format — "Full-duration display at start" scenario references `25:00`
- Requirement: Reflect reset in display — scenario references `25:00`, label "Work", and Pomodoro count 0
- Requirement: Display current session type label — long rest reference updated to 25 min
**Affected Tests**: `src/test/timerDisplay.test.tsx`, `src/test/timerDisplay.property.test.tsx`

---

### openspec/specs/timer-engine/spec.md
**Impact Level**: Medium
**Reason**: Changed file `src/types/timer.ts` modifies `WORK_DURATION` which is referenced in timer-engine's "Start countdown" scenario (`1500 s for Work` → now 1800 s). Delta spec shares UC step references (UC1-S1, UC1-S2, UC1-S4) with this existing spec.
**Impacted Requirements**:
- Requirement: Start countdown — scenario example references `1500 s for Work` (now 1800 s)
- Requirement: Tick countdown every second — wording references 30:00 countdown target
**Affected Tests**: `src/test/timerEngine.property.test.ts`

## Unimpacted Specs
- (No specs outside the three above exist in `openspec/specs/`)
