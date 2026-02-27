import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GridLines } from './GridLines'

const config = { columns: 4, rowHeight: 100, gap: 8 }

describe('GridLines', () => {
  // R1-UC2-S1: Grid lines are visible on render
  it('renders column and row guide elements', () => {
    const { container } = render(<GridLines config={config} rows={3} />)
    const wrapper = container.firstChild as HTMLElement
    // 4 column dividers + 3 row dividers = 7 children
    expect(wrapper.children.length).toBe(config.columns + 3)
  })

  it('renders the correct number of row guides for the given row count', () => {
    const { container } = render(<GridLines config={config} rows={6} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children.length).toBe(config.columns + 6)
  })

  // R1-UC2-S2: Grid lines do not intercept pointer events
  it('the grid lines container has pointer-events: none', () => {
    const { container } = render(<GridLines config={config} rows={2} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.pointerEvents).toBe('none')
  })
})
