# Pomodoro Timer

A minimal React-based Pomodoro timer: 25-minute work phases alternating with 5-minute rest phases. Start / Pause / Resume / Reset controls with an end-of-phase beep.

## Run

```bash
npm install
npm run dev      # start dev server
npm test         # run test suite (vitest)
npm run build    # production build
```

## Structure

- `src/state/timerState.ts` — reducer, actions, `TimerState`
- `src/state/usePomodoroTimer.ts` — hook wrapping the reducer with a `setInterval` tick loop and phase-end callback
- `src/components/Display.tsx` — renders `mm:ss` and phase label
- `src/components/Controls.tsx` — Start / Pause / Resume / Reset buttons
- `src/components/PomodoroTimer.tsx` — container wiring it together
- `src/utils/notify.ts` — short Web Audio beep on phase transitions

## Behaviour

- Starts in idle work phase (25:00)
- `Start` begins a running countdown; at 0 the work phase auto-transitions to a running rest phase (5:00)
- At the end of rest the timer returns to idle work (25:00), ready for the next cycle
- `Pause` halts the countdown and retains time; `Resume` continues from where it was
- `Reset` restores the current phase to its full duration and returns to idle
