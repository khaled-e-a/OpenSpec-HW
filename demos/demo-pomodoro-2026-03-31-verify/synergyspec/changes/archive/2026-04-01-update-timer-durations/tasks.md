## Implementation Overview
This task list implements the update-timer-durations change.
See usecases.md "Use Case Traceability Mapping" section for the complete list of use case steps.
Each task below indicates which use case step(s) it implements.

## Use Case Traceability
This implementation addresses the following use case steps:

- UC1-S2: System begins a 30-minute countdown in work mode
- UC1-S3: System displays remaining time starting from 30:00, updating every second
- UC1-S5: System detects that the 30-minute session has ended
- UC1-S7: System transitions automatically to rest mode with 15-minute timer ready
- UC1-E1a1: System displays "30:00" on load in idle work mode
- UC2-S2: System begins a 15-minute countdown in rest mode
- UC2-S3: System displays remaining rest time starting from 15:00, updating every second
- UC2-S5: System detects that the 15-minute rest period has ended
- UC2-S7: System transitions automatically to work mode with 30-minute timer ready
- UC2-E1a1: System displays "15:00" in idle rest mode after a work session ends

---

## 1. Code Change

- [x] 1.1 In `index.html`, update the `DURATIONS` constant: change `work: 1500` to `work: 1800` and `rest: 300` to `rest: 900` (Addresses: UC1-S2, UC1-S5, UC1-S7, UC2-S2, UC2-S5, UC2-S7)

---

## 2. Verification

- [ ] 2.1 Open `index.html` in a browser; verify the timer displays "30:00" on load in work mode (Addresses: UC1-E1a1, UC1-S2)
- [ ] 2.2 Start the timer; verify it counts down from 30:00 (Addresses: UC1-S3)
- [ ] 2.3 Reset the timer; verify it returns to "30:00" (Addresses: UC1-S2)
- [ ] 2.4 Let a short test session expire (temporarily set `work: 5`); verify auto-transition switches to rest mode showing "15:00" (Addresses: UC1-S5, UC1-S7, UC2-E1a1)
- [ ] 2.5 Start the rest timer; verify it counts down from 15:00 (Addresses: UC2-S2, UC2-S3)
- [ ] 2.6 Restore full durations (`work: 1800`, `rest: 900`) and verify both are correct on load (Addresses: UC1-S2, UC2-S2)
