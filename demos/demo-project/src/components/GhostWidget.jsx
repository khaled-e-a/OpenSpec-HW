import { CELL_SIZE, GAP } from '../hooks/useDashboard';

function cellToPixel(col, row) {
  return {
    left: col * (CELL_SIZE + GAP),
    top: row * (CELL_SIZE + GAP),
  };
}

function sizeToPixel(w, h) {
  return {
    width: w * CELL_SIZE + (w - 1) * GAP,
    height: h * CELL_SIZE + (h - 1) * GAP,
  };
}

export default function GhostWidget({ ghost }) {
  if (!ghost) return null;
  const { left, top } = cellToPixel(ghost.x, ghost.y);
  const { width, height } = sizeToPixel(ghost.w, ghost.h);

  return (
    <div
      className={`ghost-widget${ghost.valid ? ' ghost-widget--valid' : ' ghost-widget--invalid'}`}
      style={{ left, top, width, height }}
    />
  );
}
