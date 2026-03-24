import React from 'react';

interface WidgetToolbarProps {
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  onRemove: () => void;
}

// Task 6.4 — toolbar with drag handle + remove button
const WidgetToolbar: React.FC<WidgetToolbarProps> = ({ dragHandleProps, onRemove }) => (
  <div className="widget-toolbar">
    {/* Drag handle affordance */}
    <div className="widget-toolbar__drag-handle" {...dragHandleProps} title="Drag to move">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="4" cy="4" r="1.2" fill="#aaa"/>
        <circle cx="4" cy="7" r="1.2" fill="#aaa"/>
        <circle cx="4" cy="10" r="1.2" fill="#aaa"/>
        <circle cx="10" cy="4" r="1.2" fill="#aaa"/>
        <circle cx="10" cy="7" r="1.2" fill="#aaa"/>
        <circle cx="10" cy="10" r="1.2" fill="#aaa"/>
      </svg>
    </div>
    {/* Remove button — task 6.5 */}
    <button
      className="widget-toolbar__remove"
      onClick={onRemove}
      title="Remove widget"
      type="button"
    >
      ✕
    </button>
  </div>
);

export default WidgetToolbar;
