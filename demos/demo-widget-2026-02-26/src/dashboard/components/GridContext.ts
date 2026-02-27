import { createContext, useContext } from 'react';

export interface GridContextValue {
  colWidth: number;
  rowHeight: number;
  columns: number;
}

export const GridContext = createContext<GridContextValue>({
  colWidth: 0,
  rowHeight: 80,
  columns: 12,
});

export function useGridContext(): GridContextValue {
  return useContext(GridContext);
}
