import React from 'react';

interface GhostWidgetProps {
  col: number;
  row: number;
  w: number;
  h: number;
  /** Whether the target position is a valid drop target */
  isValid: boolean;
  /** Whether the pointer is inside the grid (hide ghost when outside) */
  visible: boolean;
}

/**
 * Renders a placeholder at the snapped grid position during a drag.
 *
 * Implements: UC1-S3  — ghost displayed at nearest valid snap position
 * Implements: UC1-S5  — ghost updates continuously within bounds
 * Implements: UC1-E3a — shows "cannot drop" indicator for invalid positions
 */
export function GhostWidget({ col, row, w, h, isValid, visible }: GhostWidgetProps) {
  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        gridColumn: `${col + 1} / span ${w}`,
        gridRow: `${row + 1} / span ${h}`,
        borderRadius: 8,
        border: `2px dashed ${isValid ? '#3b82f6' : '#ef4444'}`,
        backgroundColor: isValid ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
        pointerEvents: 'none',
        transition: 'background-color 100ms, border-color 100ms',
      }}
    />
  );
}
