import React, { useState, useRef, useEffect } from 'react';
import { WidgetContentProps } from './types';
import './WebpageViewerWidget.css';

// Tasks 6.1–6.12
const WebpageViewerWidget: React.FC<WidgetContentProps> = ({ settings, onSettingsChange }) => {
  const savedUrl =
    settings && settings.type === 'webpage-viewer' ? settings.url : null;

  // Task 6.3 — pre-populate from saved settings (UC4-E4a1)
  const [urlInput, setUrlInput] = useState<string>(savedUrl ?? '');
  const [iframeSrc, setIframeSrc] = useState<string | null>(savedUrl ?? null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Task 6.3 — auto-load on mount if saved URL exists (UC4-E4a2, UC6-S6)
  useEffect(() => {
    if (savedUrl) {
      setIframeSrc(savedUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Task 6.5 — validate and submit URL
  const submitUrl = () => {
    const trimmed = urlInput.trim();
    try {
      new URL(trimmed); // throws if invalid
      setUrlError(null);
      setEmbedBlocked(false);
      setIframeSrc(trimmed);
      // Task 6.10 — persist (UC4-S7, UC5-S5)
      onSettingsChange?.({ type: 'webpage-viewer', url: trimmed });
    } catch {
      // UC4-E5a1
      setUrlError('Please enter a valid URL (include https://)');
    }
  };

  // Task 6.4 — handle Enter key (UC4-S3, UC4-S4)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitUrl();
  };

  // Task 6.8 — embed-blocked detection (UC4-E8a1, UC4-E8a2)
  const handleIframeLoad = () => {
    try {
      // If same-origin or if load succeeded without X-Frame-Options blocking,
      // accessing contentDocument won't throw. For cross-origin blocked embeds
      // the browser typically loads a blank page or throws a SecurityError.
      const doc = iframeRef.current?.contentDocument;
      // If contentDocument is accessible and body is empty, treat as potentially blocked.
      // (Note: cross-origin iframes that ARE embedded won't throw here — they just
      // return null for contentDocument due to same-origin policy, which is normal.)
      if (doc !== null && doc !== undefined && doc.body && doc.body.childNodes.length === 0) {
        // blank page — may be an X-Frame-Options block
        setEmbedBlocked(true);
      }
    } catch (e) {
      // SecurityError: cross-origin, but that's normal for embedded pages — NOT blocked
      // Only blank-document case above indicates blocking
    }
  };

  const hasUrl = iframeSrc !== null;

  return (
    <div className="webpage-viewer">
      {/* Task 6.2 / 6.11 — URL input always visible (UC4-S2, UC5-S1–S4) */}
      <div className="webpage-viewer__url-bar">
        <input
          className="webpage-viewer__url-input"
          type="text"
          placeholder="Enter a URL to embed"
          value={urlInput}
          onChange={e => {
            setUrlInput(e.target.value);
            if (urlError) setUrlError(null);
          }}
          onKeyDown={handleKeyDown}
          aria-label="URL to embed"
        />
        {/* Task 6.4 — Go button (UC4-S4) */}
        <button
          className="webpage-viewer__go-btn"
          onClick={submitUrl}
          type="button"
        >
          Go
        </button>
      </div>

      {/* Task 6.5 — inline validation error (UC4-E5a1) */}
      {urlError && (
        <div className="webpage-viewer__url-error">{urlError}</div>
      )}

      {/* Empty state prompt */}
      {!hasUrl && !urlError && (
        <div className="webpage-viewer__empty">
          <p className="webpage-viewer__empty-text">Enter a URL to embed</p>
        </div>
      )}

      {/* Task 6.6 / 6.7 — sandboxed iframe (UC4-S6, UC4-S8, UC4-S9) */}
      {hasUrl && (
        <div className="webpage-viewer__iframe-container">
          <iframe
            ref={iframeRef}
            className="webpage-viewer__iframe"
            src={iframeSrc!}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Embedded webpage"
            onLoad={handleIframeLoad}
          />

          {/* Task 6.8 / 6.9 — fallback overlay (UC4-E8a1–E8a4) */}
          {embedBlocked && (
            <div className="webpage-viewer__blocked-overlay">
              <p className="webpage-viewer__blocked-text">This page cannot be embedded</p>
              <a
                href={iframeSrc!}
                target="_blank"
                rel="noopener noreferrer"
                className="webpage-viewer__open-link"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebpageViewerWidget;
