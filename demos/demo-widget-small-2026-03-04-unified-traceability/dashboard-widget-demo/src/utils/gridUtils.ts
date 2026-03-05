export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetSize {
  columns: number;
  rows: number;
}

const GRID_SIZE = 12;
const CELL_WIDTH = 80;
const CELL_HEIGHT = 80;

export const sizeMap: Record<string, WidgetSize> = {
  small: { columns: 3, rows: 2 },
  medium: { columns: 6, rows: 3 },
  large: { columns: 9, rows: 4 },
};

export const getGridPosition = (x: number, y: number, size: string): GridPosition => {
  const widgetSize = sizeMap[size];
  const gridX = Math.round(x / CELL_WIDTH);
  const gridY = Math.round(y / CELL_HEIGHT);

  return {
    x: Math.max(0, Math.min(gridX, GRID_SIZE - widgetSize.columns)),
    y: Math.max(0, gridY),
    width: widgetSize.columns,
    height: widgetSize.rows,
  };
};

export const pixelToGrid = (pixelX: number, pixelY: number): { x: number; y: number } => {
  return {
    x: Math.floor(pixelX / CELL_WIDTH),
    y: Math.floor(pixelY / CELL_HEIGHT),
  };
};

export const gridToPixel = (gridX: number, gridY: number): { x: number; y: number } => {
  return {
    x: gridX * CELL_WIDTH,
    y: gridY * CELL_HEIGHT,
  };
};

export const isValidPosition = (
  position: GridPosition,
  occupiedPositions: GridPosition[]
): boolean => {
  // Check bounds
  if (position.x + position.width > GRID_SIZE) {
    return false;
  }

  // Check collisions
  for (const occupied of occupiedPositions) {
    if (
      position.x < occupied.x + occupied.width &&
      position.x + position.width > occupied.x &&
      position.y < occupied.y + occupied.height &&
      position.y + position.height > occupied.y
    ) {
      return false;
    }
  }

  return true;
};

export const snapToGrid = (x: number, y: number, size: string): GridPosition => {
  const position = getGridPosition(x, y, size);
  const pixelPos = gridToPixel(position.x, position.y);

  return {
    ...position,
    x: pixelPos.x,
    y: pixelPos.y,
  };
};