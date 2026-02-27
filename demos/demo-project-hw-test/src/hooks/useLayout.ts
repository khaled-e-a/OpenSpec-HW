import { useReducer, useCallback } from 'react'
import type { WidgetLayout } from '../types/layout'
import { getWidget } from '../registry/widgetRegistry'
import { hasCollision, findFirstAvailable } from './layoutUtils'

type Action =
  | { type: 'ADD_WIDGET'; widgetType: string; columns: number }
  | { type: 'MOVE_WIDGET'; id: string; x: number; y: number; columns: number }
  | { type: 'RESIZE_WIDGET'; id: string; w: number; h: number; columns: number }
  | { type: 'REMOVE_WIDGET'; id: string }
  | { type: 'SET_LAYOUT'; layout: WidgetLayout[] }

function layoutReducer(state: WidgetLayout[], action: Action): WidgetLayout[] {
  switch (action.type) {
    case 'ADD_WIDGET': {
      const def = getWidget(action.widgetType)
      if (!def) {
        console.error(`[DashboardGrid] Unknown widget type: "${action.widgetType}"`)
        return state
      }
      const { x, y } = findFirstAvailable(state, def.defaultW, def.defaultH, action.columns)
      const newWidget: WidgetLayout = {
        id: crypto.randomUUID(),
        type: action.widgetType,
        x,
        y,
        w: def.defaultW,
        h: def.defaultH,
      }
      return [...state, newWidget]
    }

    case 'MOVE_WIDGET': {
      const widget = state.find((w) => w.id === action.id)
      if (!widget) return state
      const candidate = { x: action.x, y: action.y, w: widget.w, h: widget.h }
      if (
        action.x < 0 ||
        action.y < 0 ||
        action.x + widget.w > action.columns ||
        hasCollision(state, candidate, action.id)
      ) {
        return state // reject — no move
      }
      return state.map((w) =>
        w.id === action.id ? { ...w, x: action.x, y: action.y } : w,
      )
    }

    case 'RESIZE_WIDGET': {
      const widget = state.find((w) => w.id === action.id)
      if (!widget) return state
      const def = getWidget(widget.type)
      const minW = def?.minW ?? 1
      const minH = def?.minH ?? 1
      const maxW = def?.maxW ?? action.columns
      const newW = Math.max(minW, Math.min(maxW, action.w))
      const newH = Math.max(minH, action.h)
      if (widget.x + newW > action.columns) return state
      const candidate = { x: widget.x, y: widget.y, w: newW, h: newH }
      if (hasCollision(state, candidate, action.id)) return state
      return state.map((w) =>
        w.id === action.id ? { ...w, w: newW, h: newH } : w,
      )
    }

    case 'REMOVE_WIDGET':
      return state.filter((w) => w.id !== action.id)

    case 'SET_LAYOUT':
      return action.layout

    default:
      return state
  }
}

export interface UseLayoutReturn {
  layout: WidgetLayout[]
  addWidget: (type: string, columns: number) => void
  moveWidget: (id: string, x: number, y: number, columns: number) => void
  resizeWidget: (id: string, w: number, h: number, columns: number) => void
  removeWidget: (id: string) => void
  setLayout: (layout: WidgetLayout[]) => void
}

export function useLayout(initialLayout: WidgetLayout[] = []): UseLayoutReturn {
  const [layout, dispatch] = useReducer(layoutReducer, initialLayout)

  const addWidget = useCallback(
    (type: string, columns: number) => dispatch({ type: 'ADD_WIDGET', widgetType: type, columns }),
    [],
  )
  const moveWidget = useCallback(
    (id: string, x: number, y: number, columns: number) =>
      dispatch({ type: 'MOVE_WIDGET', id, x, y, columns }),
    [],
  )
  const resizeWidget = useCallback(
    (id: string, w: number, h: number, columns: number) =>
      dispatch({ type: 'RESIZE_WIDGET', id, w, h, columns }),
    [],
  )
  const removeWidget = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_WIDGET', id }),
    [],
  )
  const setLayout = useCallback(
    (layout: WidgetLayout[]) => dispatch({ type: 'SET_LAYOUT', layout }),
    [],
  )

  return { layout, addWidget, moveWidget, resizeWidget, removeWidget, setLayout }
}
