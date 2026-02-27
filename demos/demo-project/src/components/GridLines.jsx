import { CELL_SIZE, GAP, COLS, ROWS } from '../hooks/useDashboard';

export default function GridLines({ active }) {
  const cells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      cells.push(
        <div
          key={`${col}-${row}`}
          className={`grid-cell${active ? ' grid-cell--active' : ''}`}
          style={{
            left: col * (CELL_SIZE + GAP),
            top: row * (CELL_SIZE + GAP),
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />
      );
    }
  }
  return <div className="grid-lines">{cells}</div>;
}
