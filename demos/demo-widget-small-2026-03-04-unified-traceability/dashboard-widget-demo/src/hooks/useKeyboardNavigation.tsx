import React, { useEffect, useState } from 'react';

interface UseKeyboardNavigationProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onCancel: () => void;
  onConfirm: () => void;
  isDragging: boolean;
}

export const useKeyboardNavigation = ({
  onMove,
  onCancel,
  onConfirm,
  isDragging,
}: UseKeyboardNavigationProps) => {
  const [focusedWidgetId, setFocusedWidgetId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isDragging) {
        switch (event.key) {
          case 'Escape':
            event.preventDefault();
            onCancel();
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            onConfirm();
            break;
          case 'ArrowUp':
            event.preventDefault();
            onMove('up');
            break;
          case 'ArrowDown':
            event.preventDefault();
            onMove('down');
            break;
          case 'ArrowLeft':
            event.preventDefault();
            onMove('left');
            break;
          case 'ArrowRight':
            event.preventDefault();
            onMove('right');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDragging, onMove, onCancel, onConfirm]);

  const handleWidgetFocus = (widgetId: string) => {
    setFocusedWidgetId(widgetId);
  };

  const handleWidgetBlur = () => {
    setFocusedWidgetId(null);
  };

  return {
    handleWidgetFocus,
    handleWidgetBlur,
    focusedWidgetId,
  };
};

export const KeyboardInstructions: React.FC = () => {
  return (
    <div className="keyboard-instructions" role="status" aria-live="polite">
      <h3>Keyboard Navigation</h3>
      <ul>
        <li><kbd>Tab</kbd> - Navigate between widgets</li>
        <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Start dragging focused widget</li>
        <li><kbd>Arrow Keys</kbd> - Move widget during drag</li>
        <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Drop widget</li>
        <li><kbd>Escape</kbd> - Cancel drag operation</li>
      </ul>
    </div>
  );
};
