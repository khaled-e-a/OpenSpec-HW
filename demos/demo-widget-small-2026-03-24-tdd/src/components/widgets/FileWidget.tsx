// FileWidget.tsx
// UC3-S1: Placeholder or file content display
// UC3-S2/S3/S4/S5/S6: Config panel with file picker, FileReader.readAsText
// UC3-E3a1: Cancel preserves existing content
// UC3-E5a1: FileReader error shown as alert
// UC3-E5b1: Truncation at 10 000 chars with notice

import { useState, useEffect, useCallback } from 'react';
import type { WidgetConfig } from '../../utils/gridGeometry';

const MAX_CHARS = 10_000;
const TRUNCATION_NOTICE = '\nShowing first 10 000 characters.';

interface FileWidgetProps {
  config: WidgetConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export function FileWidget({ config, onConfigChange }: FileWidgetProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      let text = (target as FileReader).result as string;
      if (text.length > MAX_CHARS) {
        text = text.slice(0, MAX_CHARS) + TRUNCATION_NOTICE;
      }
      onConfigChange({ fileText: text, fileName: file.name });
      setIsConfigOpen(false);
    };
    reader.onerror = () => {
      setError('File could not be read as text.');
    };
    reader.readAsText(file);
  }

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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Content */}
      {config.fileText ? (
        <pre
          data-testid="file-content"
          style={{ overflow: 'auto', fontFamily: 'monospace', fontSize: 12, margin: 0, padding: 8, height: '100%', boxSizing: 'border-box' }}
        >
          {config.fileText}
        </pre>
      ) : (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', fontSize: 13 }}
        >
          Click to choose file
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
          data-testid="file-config-panel"
          onPointerDown={(e) => e.stopPropagation()}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}
        >
          <input
            data-testid="file-file-input"
            type="file"
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
