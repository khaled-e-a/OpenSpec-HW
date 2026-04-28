import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useDashboardLayout } from '@/hooks/useDashboardLayout'
import DashboardGrid from '@/components/DashboardGrid'
import AddWidgetDrawer from '@/components/AddWidgetDrawer'
import { notifyLayoutResetIfNeeded } from '@/persistence/layoutStorage'
import type { Layout } from 'react-grid-layout'
import './App.css'

export default function App() {
  const { layout, moveWidget, addWidget, removeWidget } = useDashboardLayout()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Show toast if layout was reset due to corruption or version mismatch
  useEffect(() => {
    notifyLayoutResetIfNeeded()
  }, [])

  const handleLayoutChange = (rglLayout: Layout) => {
    moveWidget(rglLayout)
  }

  const handleSelectWidget = (typeId: string) => {
    addWidget(typeId)
    setDrawerOpen(false)
  }

  return (
    <div className="app">
      {/* Toolbar */}
      <header className="app-toolbar">
        <div className="app-toolbar__brand">
          <span className="app-toolbar__logo">⊞</span>
          <span className="app-toolbar__name">Dashboard</span>
        </div>
        <div className="app-toolbar__actions">
          <button
            className="btn-add-widget"
            onClick={() => setDrawerOpen(true)}
            aria-label="Add Widget"
          >
            + Add Widget
          </button>
        </div>
      </header>

      {/* Main grid */}
      <main className="app-main">
        <DashboardGrid
          layout={layout}
          onLayoutChange={handleLayoutChange}
          onRemoveWidget={removeWidget}
        />
      </main>

      {/* Add Widget drawer */}
      <AddWidgetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={handleSelectWidget}
      />

      {/* Toast notifications */}
      <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
    </div>
  )
}
