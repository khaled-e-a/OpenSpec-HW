import { useState, type ReactNode } from 'react'
import './WidgetCard.css'

interface Props {
  instanceId: string
  title: string
  onRemove: (instanceId: string) => void
  children: ReactNode
}

export default function WidgetCard({ instanceId, title, onRemove, children }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmOpen(true)
  }

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmOpen(false)
    onRemove(instanceId)
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmOpen(false)
  }

  return (
    <div className="widget-card">
      {/* Card header */}
      <div className="widget-card__header">
        {/* Drag handle — only this region initiates a drag */}
        <span className="widget-drag-handle" title="Drag to reorder">
          <GripIcon />
        </span>
        <span className="widget-card__title">{title}</span>
        <div className="widget-card__actions">
          <button
            className="widget-card__remove-btn"
            onClick={handleRemoveClick}
            aria-label={`Remove ${title}`}
            title="Remove widget"
          >
            ×
          </button>
        </div>
      </div>

      {/* Confirmation popover */}
      {confirmOpen && (
        <div className="widget-confirm-popover" onClick={(e) => e.stopPropagation()}>
          <p>Remove this widget?</p>
          <div className="widget-confirm-popover__actions">
            <button className="btn btn--danger" onClick={handleConfirm}>Remove</button>
            <button className="btn btn--ghost" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Widget body — pointer events passed through, no drag initiated here */}
      <div className="widget-card__body">
        {children}
      </div>
    </div>
  )
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4.5" cy="3.5" r="1.25"/>
      <circle cx="9.5" cy="3.5" r="1.25"/>
      <circle cx="4.5" cy="7" r="1.25"/>
      <circle cx="9.5" cy="7" r="1.25"/>
      <circle cx="4.5" cy="10.5" r="1.25"/>
      <circle cx="9.5" cy="10.5" r="1.25"/>
    </svg>
  )
}
