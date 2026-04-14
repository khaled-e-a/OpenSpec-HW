import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import { Display } from './Display';
import { WORK_SECONDS } from '../state/timerState';

describe('<Display /> — property-based', () => {
  test('UC1-S2 (Work phase label visible): Display always shows "Work" for phase=work and "Rest" for phase=rest across any remainingSeconds within a single phase duration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('work', 'rest' as const),
        fc.integer({ min: 0, max: WORK_SECONDS }),
        (phase, remainingSeconds) => {
          const { getByTestId, unmount } = render(
            <Display phase={phase} remainingSeconds={remainingSeconds} />,
          );
          const expectedLabel = phase === 'work' ? /work/i : /rest/i;
          const labelOk = expectedLabel.test(getByTestId('phase').textContent ?? '');

          const timeText = getByTestId('time').textContent ?? '';
          const formatOk = /^\d{2}:\d{2}$/.test(timeText);

          const [mmStr, ssStr] = timeText.split(':');
          const mm = Number(mmStr);
          const ss = Number(ssStr);
          const valueOk =
            Number.isInteger(mm) &&
            Number.isInteger(ss) &&
            ss >= 0 &&
            ss < 60 &&
            mm * 60 + ss === remainingSeconds;

          unmount();
          return labelOk && formatOk && valueOk;
        },
      ),
      { numRuns: 50 },
    );
  });
});
