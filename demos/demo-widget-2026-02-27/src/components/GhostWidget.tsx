import React from 'react'
import type { PixelRect } from '../types'
import './GhostWidget.css'

interface GhostWidgetProps {
  rect: PixelRect
  mode: 'drag' | 'resize'
  valid: boolean
  shake: boolean
}

export function GhostWidget({ rect, mode, valid, shake }: GhostWidgetProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'ghost-widget',
        `ghost-widget--${mode}`,
        !valid ? 'ghost-widget--invalid' : '',
        shake ? 'ghost-widget--shake' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        position: 'absolute',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  )
}
