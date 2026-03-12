import React, { useState } from 'react';
import type { WidgetLayout } from '../types';

interface WebpageContentProps {
  webpageUrl?: string;
  onConfigChange: (updates: Partial<WidgetLayout>) => void;
}

export function WebpageContent({ webpageUrl, onConfigChange }: WebpageContentProps) {
  const [urlInput, setUrlInput] = useState(webpageUrl || '');
  const [showInput, setShowInput] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleConfirm = () => {
    onConfigChange({ webpageUrl: urlInput });
    setShowInput(false);
    setIframeError(false);
  };

  // UC5-E3a: User confirms without entering a URL
  const handleEmptyConfirm = () => {
    onConfigChange({ webpageUrl: '' });
    setShowInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowInput(false);
      setUrlInput(webpageUrl || '');
    } else if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const handleBlur = () => {
    if (!urlInput && !webpageUrl) {
      setShowInput(false);
    }
  };

  if (!webpageUrl && !showInput && !iframeError) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <div style={{ color: '#64748b', fontSize: 13 }}>No URL set</div>
        <button
          onClick={() => setShowInput(true)}
          style={{
            padding: '6px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Enter URL
        </button>
      </div>
    );
  }

  if (showInput) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 8,
        }}
      >
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Enter URL (e.g., https://example.com)"
          style={{
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            fontSize: 13,
          }}
          autoFocus
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={urlInput ? handleConfirm : handleEmptyConfirm}
            style={{
              padding: '6px 12px',
              border: '1px solid #3b82f6',
              borderRadius: 6,
              backgroundColor: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {urlInput ? 'Load' : 'Clear'}
          </button>
          <button
            onClick={() => {
              setShowInput(false);
              setUrlInput(webpageUrl || '');
            }}
            style={{
              padding: '6px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (iframeError) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: 16,
        }}
      >
        <div style={{ color: '#ef4444', fontSize: 13 }}>
          Page could not be loaded
        </div>
        <button
          onClick={() => setShowInput(true)}
          style={{
            padding: '6px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Try different URL
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <input
          type="text"
          value={webpageUrl}
          readOnly
          style={{
            flex: 1,
            padding: '4px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            fontSize: 12,
            backgroundColor: 'white',
          }}
        />
        <button
          onClick={() => setShowInput(true)}
          style={{
            padding: '4px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Change
        </button>
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <iframe
          title="Embedded webpage"
          src={webpageUrl}
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          onLoad={(e) => {
            // Try to detect if iframe loaded successfully
            try {
              const iframe = e.currentTarget;
              // If we can access contentDocument, it loaded
              if (iframe.contentDocument) {
                setIframeError(false);
              }
            } catch {
              // Cross-origin restriction - can't detect, assume success
              setIframeError(false);
            }
          }}
          onError={handleIframeError}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            padding: '4px 8px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            fontSize: 11,
            color: '#64748b',
          }}
        >
          If the page appears blank, it may not allow embedding
        </div>
      </div>
    </div>
  );
}