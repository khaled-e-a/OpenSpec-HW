import { useState, useEffect, useRef } from 'react'
import { useLayoutContext } from '../DashboardGrid/LayoutContext'
import { getWidget } from '../../registry/widgetRegistry'
import type { WidgetLayout } from '../../types/layout'

interface WidgetProps {
  item: WidgetLayout
  dragHandleProps?: Record<string, unknown>
  isDragging?: boolean
}

export function Widget({ item, dragHandleProps, isDragging }: WidgetProps) {
  const { removeWidget } = useLayoutContext()
  const [pendingRemove, setPendingRemove] = useState(false)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const def = getWidget(item.type)

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  const handleRemoveClick = () => {
    setPendingRemove(true)
    undoTimerRef.current = setTimeout(() => {
      removeWidget(item.id)
    }, 3000)
  }

  const handleUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setPendingRemove(false)
  }

  const WidgetComponent = def?.component

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        overflow: 'hidden',
        opacity: isDragging ? 0.3 : 1,
        transition: 'opacity 0.15s',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: '#0f172a',
          borderBottom: '1px solid #334155',
          cursor: 'grab',
          flexShrink: 0,
        }}
        {...dragHandleProps}
      >
        <span style={{ flex: 1, fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
          {def?.id ?? item.type}
        </span>
        <button
          onClick={handleRemoveClick}
          aria-label="Remove widget"
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '0 2px',
          }}
        >
          ×
        </button>
      </div>

      {/* Undo toast */}
      {pendingRemove && (
        <div
          style={{
            padding: '6px 12px',
            background: '#1d4ed8',
            fontSize: 12,
            color: '#e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span>Removing widget…</span>
          <button
            onClick={handleUndo}
            style={{
              background: 'none',
              border: 'none',
              color: '#bfdbfe',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Undo
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', padding: 8 }}>
        {WidgetComponent ? (
          <WidgetComponent id={item.id} x={item.x} y={item.y} w={item.w} h={item.h} />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            Unknown widget type: <strong style={{ marginLeft: 4 }}>{item.type}</strong>
          </div>
        )}
      </div>
    </div>
  )
}
