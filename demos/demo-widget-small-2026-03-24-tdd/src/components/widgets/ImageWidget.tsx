// ImageWidget.tsx
// UC2-S1: Placeholder or image display
// UC2-S2/S3/S4/S5/S6: Config panel with file picker, object URL creation
// UC2-E3a1: Cancel preserves existing image
// UC2-E4a1: Non-image file rejected with inline error

import { useState, useEffect, useRef, useCallback } from 'react';
import type { WidgetConfig } from '../../utils/gridGeometry';

interface ImageWidgetProps {
  config: WidgetConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export function ImageWidget({ config, onConfigChange }: ImageWidgetProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevUrlRef = useRef<string | undefined>(config.imageUrl);

  // Escape key closes config panel (UC2-S7, UC5-S7)
  const handleClose = useCallback(() => {
    setError(null);
    setIsConfigOpen(false);
  }, []);

  useEffect(() => {
    if (!isConfigOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isConfigOpen, handleClose]);

  // Revoke old object URL when imageUrl changes (UC2-S5 memory cleanup)
  useEffect(() => {
    const prev = prevUrlRef.current;
    prevUrlRef.current = config.imageUrl;
    if (prev && prev !== config.imageUrl && prev.startsWith('blob:')) {
      URL.revokeObjectURL(prev);
    }
  }, [config.imageUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    onConfigChange({ imageUrl: url });
    setIsConfigOpen(false);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Content */}
      {config.imageUrl ? (
        <img
          src={config.imageUrl}
          alt="Widget image"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: '#6b7280', fontSize: 13,
          }}
        >
          Click to choose image
        </div>
      )}

      {/* Settings icon — stopPropagation prevents @dnd-kit PointerSensor from capturing this click */}
      <button
        aria-label="Settings"
        onClick={() => setIsConfigOpen(true)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', padding: '2px 6px' }}
      >
        ⚙
      </button>

      {/* Config panel */}
      {isConfigOpen && (
        <div
          data-testid="image-config-panel"
          onPointerDown={(e) => e.stopPropagation()}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}
        >
          <input
            data-testid="image-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ color: '#fff' }}
          />
          {error && <div role="alert" style={{ color: '#fca5a5', fontSize: 12 }}>{error}</div>}
          <button
            aria-label="Close"
            onClick={handleClose}
            style={{ background: '#374151', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', padding: '4px 12px' }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
