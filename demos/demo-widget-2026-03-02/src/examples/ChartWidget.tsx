import React from 'react';
import { DashboardWidget } from '../types';

interface ChartWidgetProps {
  widget: DashboardWidget;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  const { config } = widget;
  const chartType = config?.type || 'line';

  // Simple placeholder chart
  const data = [30, 45, 60, 40, 55, 70, 50];

  return (
    <div className="chart-widget">
      <h3>Chart - {chartType}</h3>
      <div className="chart-container">
        <svg width="100%" height="120" viewBox="0 0 200 120">
          <polyline
            fill="none"
            stroke="#2196F3"
            strokeWidth="2"
            points={data.map((value, index) =>
              `${(index * 200) / (data.length - 1)},${120 - (value * 120) / 100}`
            ).join(' ')}
          />
          {data.map((value, index) => (
            <circle
              key={index}
              cx={(index * 200) / (data.length - 1)}
              cy={120 - (value * 120) / 100}
              r="4"
              fill="#2196F3"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};