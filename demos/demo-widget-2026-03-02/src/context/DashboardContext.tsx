import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DashboardState, DashboardWidget, GridConfig } from '../types';

interface DashboardContextType extends DashboardState {
  moveWidget: (widgetId: string, position: { x: number; y: number }) => void;
  resizeWidget: (widgetId: string, size: { width: number; height: number }) => void;
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  setEditMode: (isEditMode: boolean) => void;
  getWidgetComponent: (type: string) => React.ComponentType<any> | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

type DashboardAction =
  | { type: 'MOVE_WIDGET'; payload: { widgetId: string; position: { x: number; y: number } } }
  | { type: 'RESIZE_WIDGET'; payload: { widgetId: string; size: { width: number; height: number } } }
  | { type: 'ADD_WIDGET'; payload: DashboardWidget }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SET_WIDGETS'; payload: DashboardWidget[] };

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'MOVE_WIDGET': {
      const { widgetId, position } = action.payload;
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === widgetId ? { ...widget, position } : widget
        ),
      };
    }
    case 'RESIZE_WIDGET': {
      const { widgetId, size } = action.payload;
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === widgetId ? { ...widget, size } : widget
        ),
      };
    }
    case 'ADD_WIDGET':
      return {
        ...state,
        widgets: [...state.widgets, action.payload],
      };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter(widget => widget.id !== action.payload),
      };
    case 'SET_EDIT_MODE':
      return {
        ...state,
        isEditMode: action.payload,
      };
    case 'SET_WIDGETS':
      return {
        ...state,
        widgets: action.payload,
      };
    default:
      return state;
  }
};

const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 12,
  rows: 8,
  gap: 16,
  margin: 24,
};

interface DashboardProviderProps {
  children: ReactNode;
  initialWidgets?: DashboardWidget[];
  gridConfig?: Partial<GridConfig>;
  getWidgetComponent?: (type: string) => React.ComponentType<any> | null;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  initialWidgets = [],
  gridConfig = {},
  getWidgetComponent: externalGetWidgetComponent,
}) => {
  const [state, dispatch] = useReducer(dashboardReducer, {
    widgets: initialWidgets,
    config: { ...DEFAULT_GRID_CONFIG, ...gridConfig },
    isEditMode: false,
  });

  const moveWidget = (widgetId: string, position: { x: number; y: number }) => {
    dispatch({ type: 'MOVE_WIDGET', payload: { widgetId, position } });
  };

  const resizeWidget = (widgetId: string, size: { width: number; height: number }) => {
    dispatch({ type: 'RESIZE_WIDGET', payload: { widgetId, size } });
  };

  const addWidget = (widget: DashboardWidget) => {
    dispatch({ type: 'ADD_WIDGET', payload: widget });
  };

  const removeWidget = (widgetId: string) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId });
  };

  const setEditMode = (isEditMode: boolean) => {
    dispatch({ type: 'SET_EDIT_MODE', payload: isEditMode });
  };

  const getWidgetComponent = (type: string) => {
    if (externalGetWidgetComponent) {
      return externalGetWidgetComponent(type);
    }
    return null;
  };

  const value: DashboardContextType = {
    ...state,
    moveWidget,
    resizeWidget,
    addWidget,
    removeWidget,
    setEditMode,
    getWidgetComponent,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};