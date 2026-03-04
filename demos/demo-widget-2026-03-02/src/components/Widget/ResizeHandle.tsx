import React, { useState, useRef, useEffect } from 'react';
import { GridConfig } from '../../types';

interface ResizeHandleProps {
  position: 'bottom-right' | 'bottom' | 'right';
  gridConfig: GridConfig;
  currentSize: { width: number; height: number };
  onResize: (newSize: { width: number; height: number }) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  gridConfig,
  currentSize,
  onResize,
  onResizeStart,
  onResizeEnd,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState(currentSize);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ ...currentSize });
    onResizeStart?.();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    const cellWidth = 100; // This should be calculated based on actual grid
    const cellHeight = 100; // This should be calculated based on actual grid

    let newWidth = startSize.width;
    let newHeight = startSize.height;

    if (position === 'right' || position === 'bottom-right') {
      const widthDelta = Math.round(deltaX / (cellWidth + gridConfig.gap));
      newWidth = Math.max(1, startSize.width + widthDelta);
    }

    if (position === 'bottom' || position === 'bottom-right') {
      const heightDelta = Math.round(deltaY / (cellHeight + gridConfig.gap));
      newHeight = Math.max(1, startSize.height + heightDelta);
    }

    onResize({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    onResizeEnd?.();

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onResize(startSize);
      handleMouseUp();
    }
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClass = `resize-handle resize-handle--${position} ${
    isResizing ? 'resize-handle--active' : ''
  }`;

  return (
    <div
      ref={handleRef}
      className={handleClass}
      onMouseDown={handleMouseDown}
      role="button"
      aria-label={`Resize widget ${position}`}
      tabIndex={0}
    />
  );
};