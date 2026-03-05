import React from 'react';
import './Widget.css';

export interface WidgetProps {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ id, title, size, children }) => {
  const sizeClass = `widget--${size}`;

  return (
    <div className={`widget ${sizeClass}`} data-widget-id={id}>
      <div className="widget__header">
        <h3 className="widget__title">{title}</h3>
      </div>
      <div className="widget__content">
        {children}
      </div>
    </div>
  );
};

export default Widget;