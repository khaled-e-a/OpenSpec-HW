// Task 1.2 — LayoutItem type
export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Task 1.3 — DashboardProps interface
export interface DashboardProps {
  /** Controlled layout. Provide together with onLayoutChange. */
  layout?: LayoutItem[];
  /** Initial layout for uncontrolled usage. */
  initialLayout?: LayoutItem[];
  /** Called with the full updated layout after a move or resize. */
  onLayoutChange?: (layout: LayoutItem[]) => void;
  /** Number of columns in the grid. Default: 12 */
  cols?: number;
  /** Number of rows in the grid. Default: 12 */
  rows?: number;
  /** Pixel size of each grid cell (width and height). Default: 80 */
  cellSize?: number;
  children?: React.ReactNode;
}
