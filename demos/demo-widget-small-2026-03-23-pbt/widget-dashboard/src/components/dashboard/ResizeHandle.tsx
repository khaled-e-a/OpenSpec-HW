import React from 'react';

interface ResizeHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  isFloorHit?: boolean;
}

// Tasks 7.1–7.2
const ResizeHandle: React.FC<ResizeHandleProps> = ({ onPointerDown, isFloorHit }) => (
  <div
    className={`resize-handle${isFloorHit ? ' resize-handle--pulse' : ''}`}
    onPointerDown={onPointerDown}
    title="Resize widget"
    style={{
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      cursor: 'se-resize',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20,
      opacity: 0,       // revealed by .widget:hover via CSS (task 7.2)
      transition: 'opacity 150ms',
      background: 'rgba(99,102,241,0.15)',
      borderRadius: '3px 0 4px 0',
    }}
  >
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M1 7L7 1M4 7L7 4M7 7V7" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </div>
);

export default ResizeHandle;
