import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DashboardLayout, Widget, GridPosition } from '../types/widget';

interface DashboardState extends DashboardLayout {}

type DashboardAction =
  | { type: 'MOVE_WIDGET'; payload: { id: string; position: GridPosition } }
  | { type: 'SAVE_LAYOUT' }
  | { type: 'LOAD_LAYOUT'; payload: DashboardLayout }
  | { type: 'RESET_TO_DEFAULT' }
  | { type: 'SET_DIRTY'; payload: boolean };

const initialState: DashboardState = {
  widgets: {},
  isDirty: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'MOVE_WIDGET':
      return {
        ...state,
        widgets: {
          ...state.widgets,
          [action.payload.id]: {
            ...state.widgets[action.payload.id],
            position: action.payload.position,
          },
        },
        isDirty: true,
      };
    case 'SAVE_LAYOUT':
      return {
        ...state,
        isDirty: false,
        lastSaved: new Date(),
      };
    case 'LOAD_LAYOUT':
      return {
        ...action.payload,
      };
    case 'RESET_TO_DEFAULT':
      return {
        ...initialState,
        widgets: {},
      };
    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };
    default:
      return state;
  }
}

const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
} | null>(null);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};