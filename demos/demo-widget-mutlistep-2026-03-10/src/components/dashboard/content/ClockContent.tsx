import React, { useState, useEffect } from 'react';

export function ClockContent() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        fontWeight: 500,
        color: '#334155',
      }}
    >
      {time.toLocaleTimeString()}
    </div>
  );
}