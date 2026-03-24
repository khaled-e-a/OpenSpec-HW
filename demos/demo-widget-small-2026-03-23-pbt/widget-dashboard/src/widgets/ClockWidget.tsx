import React, { useState, useEffect } from 'react';
import { WidgetContentProps } from './types';
import './ClockWidget.css';

// Tasks 3.1–3.7
const ClockWidget: React.FC<WidgetContentProps> = () => {
  // Task 3.2
  const [time, setTime] = useState<Date>(new Date());

  // Task 3.3 — 1-second interval with cleanup (UC1-S3, UC1-S4, UC1-E5a1)
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="clock-widget">
      {/* Task 3.4 — time (UC1-S2, UC1-S5) */}
      <div className="clock-widget__time">
        {time.toLocaleTimeString()}
      </div>
      {/* Task 3.5 — date (UC1-S2, UC1-S5) */}
      <div className="clock-widget__date">
        {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

export default ClockWidget;
