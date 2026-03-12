import React, { useEffect, useRef } from 'react';
import type { WidgetType, WidgetLayout } from './types';

interface WidgetSettingsProps {
  currentType: WidgetType;
  onConfigChange: (updates: Partial<WidgetLayout>) => void;
  onClose: () => void;
}

const WIDGET_TYPES: WidgetType[] = ['clock', 'image', 'file', 'webpage'];

export function WidgetSettings({ currentType, onConfigChange, onClose }: WidgetSettingsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', handle);
    return () => document.removeEventListener('pointerdown', handle);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      style={{
        position: 'absolute',
        top: 32,
        right: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: 16,
        zIndex: 20,
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Widget Type</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            padding: 0,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {WIDGET_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => {
              if (type !== currentType) {
                onConfigChange({ type });
              }
              onClose();
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              backgroundColor: type === currentType ? '#3b82f6' : '#f8fafc',
              color: type === currentType ? '#ffffff' : '#334155',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}