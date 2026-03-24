import React, { useEffect, useState } from 'react';

interface UndoToastProps {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  timeoutMs?: number;
}

// Tasks 9.2–9.5
const UndoToast: React.FC<UndoToastProps> = ({ visible, onUndo, onDismiss, timeoutMs = 5000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!visible) { setProgress(100); return; }
    setProgress(100);
    const interval = 50;
    const decrement = (interval / timeoutMs) * 100;
    const timer = setInterval(() => {
      setProgress(p => {
        const next = p - decrement;
        if (next <= 0) { clearInterval(timer); return 0; }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [visible, timeoutMs]);

  if (!visible) return null;

  return (
    <div className="undo-toast">
      <span className="undo-toast__message">Widget removed</span>
      <button className="undo-toast__undo" onClick={onUndo} type="button">Undo</button>
      <button className="undo-toast__dismiss" onClick={onDismiss} type="button" aria-label="Dismiss">✕</button>
      <div className="undo-toast__progress" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default UndoToast;
