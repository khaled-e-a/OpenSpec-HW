import React from 'react';
import { CELL_WIDTH_PX, CELL_HEIGHT_PX } from '../constants';

interface DropPreviewProps {
  col: number;
  row: number;
  w: number;
  h: number;
  isValid: boolean;
}

/**
 * Absolutely-positioned overlay that highlights the grid cells
 * the dragged/resized widget would occupy.
 *
 * UC1-S3: highlights grid cells (snap preview)
 * UC1-S5: updated continuously as pointer moves
 * UC1-E3a1: red highlight when target is invalid/occupied
 * UC2-S3: shows live size preview during resize
 * UC2-E4a2: preview reflects capped size
 */
export const DropPreview: React.FC<DropPreviewProps> = ({ col, row, w, h, isValid }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: col * CELL_WIDTH_PX,
    top: row * CELL_HEIGHT_PX,
    width: w * CELL_WIDTH_PX,
    height: h * CELL_HEIGHT_PX,
    backgroundColor: isValid ? 'rgba(59, 130, 246, 0.25)' : 'rgba(239, 68, 68, 0.25)',
    border: `2px dashed ${isValid ? '#3b82f6' : '#ef4444'}`,
    borderRadius: 8,
    pointerEvents: 'none',
    zIndex: 10,
    transition: 'left 60ms, top 60ms, width 60ms, height 60ms',
  };

  return <div style={style} aria-hidden />;
};
