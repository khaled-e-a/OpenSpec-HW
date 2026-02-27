import type { GridConfig, PixelRect } from '../types'

export function cellWidth(config: GridConfig, containerWidth: number): number {
  return (containerWidth - (config.columns - 1) * config.gap) / config.columns
}

export function toPixelRect(
  x: number,
  y: number,
  w: number,
  h: number,
  config: GridConfig,
  cw: number
): PixelRect {
  const { gap, rowHeight } = config
  return {
    left: x * (cw + gap),
    top: y * (rowHeight + gap),
    width: w * cw + (w - 1) * gap,
    height: h * rowHeight + (h - 1) * gap,
  }
}

export function toGridCoords(
  pixelX: number,
  pixelY: number,
  config: GridConfig,
  cw: number
): { col: number; row: number } {
  const col = Math.round(pixelX / (cw + config.gap))
  const row = Math.round(pixelY / (config.rowHeight + config.gap))
  return { col, row }
}

export function clampPosition(
  x: number,
  y: number,
  w: number,
  h: number,
  columns: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(x, columns - w)),
    y: Math.max(0, y),
  }
}

export function clampSpan(
  col: number,
  newW: number,
  newH: number,
  columns: number
): { w: number; h: number } {
  return {
    w: Math.max(1, Math.min(newW, columns - col)),
    h: Math.max(1, newH),
  }
}
