import { useEffect } from 'react'
import { WIDGET_REGISTRY } from '@/registry/widgetRegistry'
import './AddWidgetDrawer.css'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (typeId: string) => void
}

export default function AddWidgetDrawer({ open, onClose, onSelect }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop — click outside closes drawer */}
      {open && (
        <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`add-widget-drawer${open ? ' add-widget-drawer--open' : ''}`} role="dialog" aria-label="Add Widget">
        <div className="add-widget-drawer__header">
          <h2 className="add-widget-drawer__title">Add Widget</h2>
          <button className="add-widget-drawer__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <ul className="add-widget-drawer__list">
          {WIDGET_REGISTRY.map((entry) => (
            <li key={entry.id}>
              <button
                className="add-widget-drawer__item"
                onClick={() => onSelect(entry.id)}
              >
                <div className="add-widget-drawer__item-icon">
                  {entry.displayName.charAt(0)}
                </div>
                <div className="add-widget-drawer__item-info">
                  <span className="add-widget-drawer__item-name">{entry.displayName}</span>
                  <span className="add-widget-drawer__item-desc">{entry.description}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
