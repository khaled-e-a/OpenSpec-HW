import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface WidgetPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutState {
  positions: Record<string, WidgetPosition>;
  isDragging: boolean;
  draggedWidgetId: string | null;
}

type LayoutAction =
  | { type: 'START_DRAG'; widgetId: string }
  | { type: 'END_DRAG' }
  | { type: 'UPDATE_POSITION'; widgetId: string; position: WidgetPosition }
  | { type: 'SET_LAYOUT'; positions: Record<string, WidgetPosition> };

const initialState: LayoutState = {
  positions: {},
  isDragging: false,
  draggedWidgetId: null,
};

const layoutReducer = (state: LayoutState, action: LayoutAction): LayoutState => {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        draggedWidgetId: action.widgetId,
      };
    case 'END_DRAG':
      return {
        ...state,
        isDragging: false,
        draggedWidgetId: null,
      };
    case 'UPDATE_POSITION':
      return {
        ...state,
        positions: {
          ...state.positions,
          [action.widgetId]: action.position,
        },
      };
    case 'SET_LAYOUT':
      return {
        ...state,
        positions: action.positions,
      };
    default:
      return state;
  }
};

const LayoutContext = createContext<{
  state: LayoutState;
  dispatch: React.Dispatch<LayoutAction>;
} | null>(null);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  return (
    <LayoutContext.Provider value={{ state, dispatch }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};