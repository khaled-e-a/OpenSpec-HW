import React from 'react';
import { DashboardWidget } from '../types';

interface WeatherWidgetProps {
  widget: DashboardWidget;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ widget }) => {
  const { config } = widget;
  const location = config?.location || 'New York';
  const unit = config?.unit || 'F';

  return (
    <div className="weather-widget">
      <h3>Weather - {location}</h3>
      <div className="weather-info">
        <div className="temperature">72°{unit}</div>
        <div className="condition">Partly Cloudy</div>
        <div className="details">
          <span>Humidity: 65%</span>
          <span>Wind: 8 mph</span>
        </div>
      </div>
    </div>
  );
};