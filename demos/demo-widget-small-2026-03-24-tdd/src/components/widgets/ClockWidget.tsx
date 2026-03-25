// ClockWidget.tsx
// UC1-S2: Displays current local time in HH:MM:SS
// UC1-S3: Updates every second; clears interval on unmount

import { useState, useEffect } from 'react';

export function ClockWidget() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-testid="clock-display"
      style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
    >
      {time.toLocaleTimeString('en-GB', { hour12: false })}
    </div>
  );
}
