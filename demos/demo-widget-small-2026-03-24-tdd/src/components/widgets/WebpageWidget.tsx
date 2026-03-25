// WebpageWidget.tsx
// UC4-S1: Placeholder or iframe display
// UC4-S2/S3/S4/S5/S6/S7: Config panel with URL input, validation, iframe
// UC4-E4a1: Clear URL removes iframe
// UC4-E5a1: Malformed URL shows error
// UC4-E6a1: Static embedding restriction note
// UC4-E6b1: Prepend https:// to scheme-less URLs

import { useState, useEffect, useCallback } from 'react';
import type { WidgetConfig } from '../../utils/gridGeometry';

interface WebpageWidgetProps {
  config: WidgetConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

function normaliseUrl(raw: string): string {
  if (!raw.includes('://')) return 'https://' + raw;
  return raw;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function WebpageWidget({ config, onConfigChange }: WebpageWidgetProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [draft, setDraft] = useState(config.webpageUrl ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setDraft(config.webpageUrl ?? '');
    setError(null);
    setIsConfigOpen(true);
  }

  function handleLoad() {
    if (draft === '') {
      onConfigChange({ webpageUrl: '' });
      setIsConfigOpen(false);
      return;
    }
    const normalised = normaliseUrl(draft);
    if (!isValidUrl(normalised)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    setError(null);
    onConfigChange({ webpageUrl: normalised });
    setIsConfigOpen(false);
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

  const hasUrl = Boolean(config.webpageUrl);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Content */}
      {hasUrl ? (
        <>
          <iframe
            src={config.webpageUrl}
            title="Embedded page"
            sandbox="allow-scripts allow-same-origin allow-forms"
            style={{ flex: 1, border: 'none', width: '100%' }}
          />
          <div
            data-testid="embedding-note"
            style={{ fontSize: 10, color: '#9ca3af', padding: '2px 4px', background: '#1f2937' }}
          >
            Note: some sites may not allow embedding.
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', fontSize: 13 }}>
          Enter a URL to embed a webpage
        </div>
      )}

      {/* Settings icon — stopPropagation prevents @dnd-kit PointerSensor from capturing this click */}
      <button
        aria-label="Settings"
        onClick={handleOpen}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', padding: '2px 6px' }}
      >
        ⚙
      </button>

      {/* Config panel */}
      {isConfigOpen && (
        <div
          data-testid="webpage-config-panel"
          onPointerDown={(e) => e.stopPropagation()}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 }}
        >
          <input
            data-testid="webpage-url-input"
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #4b5563', background: '#1f2937', color: '#fff' }}
          />
          {error && <div role="alert" style={{ color: '#fca5a5', fontSize: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              aria-label="Load"
              onClick={handleLoad}
              style={{ background: '#4f46e5', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', padding: '4px 12px' }}
            >
              Load
            </button>
            <button
              aria-label="Close"
              onClick={handleClose}
              style={{ background: '#374151', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', padding: '4px 12px' }}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
