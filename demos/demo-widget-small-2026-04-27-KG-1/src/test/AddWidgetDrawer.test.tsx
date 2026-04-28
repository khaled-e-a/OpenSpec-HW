/**
 * Component tests for AddWidgetDrawer — covers:
 * UC2-S1: User opens the Add Widget panel
 * UC2-S2: System displays available widget types with names and descriptions
 * UC2-S3: User selects a widget type → onSelect called
 * UC2-E3a: User cancels panel (Escape / backdrop) → no selection
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddWidgetDrawer from '@/components/AddWidgetDrawer'
import { WIDGET_REGISTRY } from '@/registry/widgetRegistry'

function renderDrawer(open = true, onClose = vi.fn(), onSelect = vi.fn()) {
  return render(
    <AddWidgetDrawer open={open} onClose={onClose} onSelect={onSelect} />
  )
}

// ── UC2-S1 — open state ───────────────────────────────────────────────────────

describe('drawer open state (UC2-S1)', () => {
  it('UC2-S1: drawer is visible when open=true', () => {
    renderDrawer(true)
    expect(document.querySelector('.add-widget-drawer--open')).not.toBeNull()
  })

  it('UC2-S1: drawer is NOT open when open=false', () => {
    renderDrawer(false)
    expect(document.querySelector('.add-widget-drawer--open')).toBeNull()
  })
})

// ── UC2-S2 — catalogue display ────────────────────────────────────────────────

describe('catalogue display (UC2-S2)', () => {
  it('UC2-S2: lists all registered widget types by displayName', () => {
    renderDrawer()
    for (const entry of WIDGET_REGISTRY) {
      expect(screen.getByText(entry.displayName)).toBeInTheDocument()
    }
  })

  it('UC2-S2: shows description for each widget type', () => {
    renderDrawer()
    for (const entry of WIDGET_REGISTRY) {
      expect(screen.getByText(entry.description)).toBeInTheDocument()
    }
  })

  it('UC2-S2: displays at least one widget type', () => {
    renderDrawer()
    const items = document.querySelectorAll('.add-widget-drawer__item')
    expect(items.length).toBeGreaterThanOrEqual(1)
  })
})

// ── UC2-S3 — widget selection ────────────────────────────────────────────────

describe('widget selection (UC2-S3)', () => {
  it('UC2-S3: calls onSelect with typeId when a widget item is clicked', async () => {
    const onSelect = vi.fn()
    renderDrawer(true, vi.fn(), onSelect)
    const firstEntry = WIDGET_REGISTRY[0]
    await userEvent.click(screen.getByText(firstEntry.displayName))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(firstEntry.id)
  })

  it('UC2-S3: calls onSelect with the correct typeId for each widget type', async () => {
    for (const entry of WIDGET_REGISTRY) {
      const onSelect = vi.fn()
      const { unmount } = renderDrawer(true, vi.fn(), onSelect)
      await userEvent.click(screen.getByText(entry.displayName))
      expect(onSelect).toHaveBeenCalledWith(entry.id)
      unmount()
    }
  })
})

// ── UC2-E3a — cancel / dismiss ───────────────────────────────────────────────

describe('cancel / dismiss (UC2-E3a)', () => {
  it('UC2-E3a: calls onClose when the × close button is clicked', async () => {
    const onClose = vi.fn()
    renderDrawer(true, onClose)
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('UC2-E3a: calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn()
    renderDrawer(true, onClose)
    const backdrop = document.querySelector('.drawer-backdrop')!
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('UC2-E3a: calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn()
    renderDrawer(true, onClose)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('UC2-E3a: does NOT call onSelect when closed via backdrop', async () => {
    const onSelect = vi.fn()
    renderDrawer(true, vi.fn(), onSelect)
    const backdrop = document.querySelector('.drawer-backdrop')!
    await userEvent.click(backdrop)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
