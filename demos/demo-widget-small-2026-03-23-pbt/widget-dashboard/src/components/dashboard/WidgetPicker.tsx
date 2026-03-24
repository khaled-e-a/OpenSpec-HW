import React, { useEffect, useRef, useState } from 'react';
import { WIDGET_REGISTRY } from '../../widgets/registry';

interface WidgetPickerProps {
  onAdd: (type: string) => boolean;  // returns false when no space
  onClose: () => void;
}

// Tasks 8.1–8.5
const WidgetPicker: React.FC<WidgetPickerProps> = ({ onAdd, onClose }) => {
  const [noSpace, setNoSpace] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Task 8.5 — close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Task 8.5 — close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSelect = (type: string) => {
    const placed = onAdd(type);
    if (!placed) {
      // Task 8.4 — no space feedback
      setNoSpace(true);
      setTimeout(() => setNoSpace(false), 3000);
    } else {
      onClose();
    }
  };

  return (
    <div className="widget-picker" ref={panelRef}>
      <div className="widget-picker__header">
        <span>Add Widget</span>
        <button onClick={onClose} className="widget-picker__close" type="button">✕</button>
      </div>
      {noSpace && (
        <div className="widget-picker__no-space">
          Not enough space — try removing or resizing a widget
        </div>
      )}
      <div className="widget-picker__list">
        {Object.values(WIDGET_REGISTRY).map(def => (
          <button
            key={def.type}
            className="widget-picker__card"
            onClick={() => handleSelect(def.type)}
            type="button"
          >
            <span className="widget-picker__name">{def.displayName}</span>
            <span className="widget-picker__size">{def.defaultSize.w} × {def.defaultSize.h} cells</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WidgetPicker;
