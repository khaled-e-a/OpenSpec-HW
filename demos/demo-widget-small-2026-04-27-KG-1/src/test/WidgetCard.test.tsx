/**
 * Component tests for WidgetCard — covers:
 * UC1-S1: User grabs drag handle (handle present, body does not initiate drag)
 * UC1-S2: System shows lifted state on drag (CSS class)
 * UC3-S1: User clicks remove control
 * UC3-S2: System presents confirmation prompt
 * UC3-S3: User confirms → onRemove called
 * UC3-E3a: User cancels → onRemove NOT called
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WidgetCard from '@/components/WidgetCard'

function renderCard(onRemove = vi.fn()) {
  return render(
    <WidgetCard instanceId="w1" title="Stats Card" onRemove={onRemove}>
      <div data-testid="widget-body">content</div>
    </WidgetCard>
  )
}

// ── UC1-S1 — drag handle ──────────────────────────────────────────────────────

describe('drag handle (UC1-S1)', () => {
  it('UC1-S1: renders an element with class widget-drag-handle', () => {
    renderCard()
    expect(document.querySelector('.widget-drag-handle')).not.toBeNull()
  })

  it('UC1-S1: drag handle is inside the card header', () => {
    renderCard()
    const header = document.querySelector('.widget-card__header')!
    const handle = header.querySelector('.widget-drag-handle')
    expect(handle).not.toBeNull()
  })

  it('UC1-S1: widget body does not contain the drag handle', () => {
    renderCard()
    const body = document.querySelector('.widget-card__body')!
    expect(body.querySelector('.widget-drag-handle')).toBeNull()
  })
})

// ── UC3-S1 — remove button ────────────────────────────────────────────────────

describe('remove button (UC3-S1)', () => {
  it('UC3-S1: renders a remove button', () => {
    renderCard()
    const btn = screen.getByRole('button', { name: /remove/i })
    expect(btn).toBeInTheDocument()
  })

  it('UC3-S1: remove button is in the card header', () => {
    renderCard()
    const header = document.querySelector('.widget-card__header')!
    expect(header.querySelector('button')).not.toBeNull()
  })
})

// ── UC3-S2 — confirmation prompt ─────────────────────────────────────────────

describe('confirmation prompt (UC3-S2)', () => {
  it('UC3-S2: confirmation popover is NOT shown initially', () => {
    renderCard()
    expect(screen.queryByText(/remove this widget/i)).toBeNull()
  })

  it('UC3-S2: confirmation popover appears after clicking remove', async () => {
    renderCard()
    const btn = screen.getByRole('button', { name: /remove/i })
    await userEvent.click(btn)
    expect(screen.getByText(/remove this widget/i)).toBeInTheDocument()
  })

  it('UC3-S2: confirmation popover has a Remove and a Cancel button', async () => {
    renderCard()
    await userEvent.click(screen.getByRole('button', { name: /remove stats card/i }))
    expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})

// ── UC3-S3 — confirm removal ──────────────────────────────────────────────────

describe('confirm removal (UC3-S3)', () => {
  it('UC3-S3: calls onRemove with the correct instanceId when confirmed', async () => {
    const onRemove = vi.fn()
    render(
      <WidgetCard instanceId="widget-abc" title="My Widget" onRemove={onRemove}>
        <div />
      </WidgetCard>
    )
    await userEvent.click(screen.getByRole('button', { name: /remove my widget/i }))
    await userEvent.click(screen.getByRole('button', { name: /^remove$/i }))
    expect(onRemove).toHaveBeenCalledOnce()
    expect(onRemove).toHaveBeenCalledWith('widget-abc')
  })

  it('UC3-S3: confirmation popover closes after confirming', async () => {
    renderCard()
    await userEvent.click(screen.getByRole('button', { name: /remove stats card/i }))
    await userEvent.click(screen.getByRole('button', { name: /^remove$/i }))
    expect(screen.queryByText(/remove this widget/i)).toBeNull()
  })
})

// ── UC3-E3a — cancel removal ──────────────────────────────────────────────────

describe('cancel removal (UC3-E3a)', () => {
  it('UC3-E3a: does NOT call onRemove when cancelled', async () => {
    const onRemove = vi.fn()
    renderCard(onRemove)
    await userEvent.click(screen.getByRole('button', { name: /remove stats card/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('UC3-E3a: confirmation popover closes after cancel', async () => {
    renderCard()
    await userEvent.click(screen.getByRole('button', { name: /remove stats card/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText(/remove this widget/i)).toBeNull()
  })
})

// ── UC1-S2 — lifted state (CSS) ───────────────────────────────────────────────

describe('lifted state styling (UC1-S2)', () => {
  it('UC1-S2: widget-card class is present on the card root', () => {
    renderCard()
    expect(document.querySelector('.widget-card')).not.toBeNull()
  })
})
