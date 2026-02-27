import React from 'react'
import type { GridConfig } from '../types'

interface GridLinesProps {
  config: GridConfig
  rows: number
}

export function GridLines({ config, rows }: GridLinesProps) {
  const { columns, rowHeight, gap } = config
  const cellWidth = `calc((100% - ${(columns - 1) * gap}px) / ${columns})`

  const cols = Array.from({ length: columns })
  const rowLines = Array.from({ length: rows })

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {cols.map((_, i) => (
        <div
          key={`col-${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `calc(${i} * (${cellWidth} + ${gap}px))`,
            width: cellWidth,
            borderRight: i < columns - 1 ? '1px dashed rgba(0,0,0,0.08)' : 'none',
          }}
        />
      ))}
      {rowLines.map((_, i) => (
        <div
          key={`row-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: i * (rowHeight + gap),
            height: rowHeight,
            borderBottom: '1px dashed rgba(0,0,0,0.08)',
          }}
        />
      ))}
    </div>
  )
}
