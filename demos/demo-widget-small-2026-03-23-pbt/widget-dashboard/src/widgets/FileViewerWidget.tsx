import React, { useState, useRef } from 'react';
import { WidgetContentProps } from './types';
import './FileViewerWidget.css';

const MAX_BYTES = 1_048_576; // 1 MiB

// Tasks 5.1–5.13
const FileViewerWidget: React.FC<WidgetContentProps> = ({ settings, onSettingsChange }) => {
  const savedFileName =
    settings && settings.type === 'file-viewer' ? settings.fileName : null;

  const [content, setContent] = useState<string | null>(null);
  const [displayedFileName, setDisplayedFileName] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = content !== null;

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Task 5.11 — cancel preserves state
    if (!file) return;

    setError(null);

    // Task 5.5 — size check (UC3-E6b1, UC3-E6b2)
    const isTruncated = file.size > MAX_BYTES;
    const blobToRead: Blob = isTruncated ? file.slice(0, MAX_BYTES) : file;

    const reader = new FileReader();

    // Task 5.7 — error handler (UC3-E6a1)
    reader.onerror = () => {
      setError('File is not readable as text');
      setContent(null);
      setDisplayedFileName(null);
      setTruncated(false);
    };

    // Task 5.6 / 5.8 — successful read (UC3-S5, UC3-S6, UC3-S7, UC3-S9)
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      // Detect binary: check for null bytes
      if (text.includes('\u0000')) {
        setError('File is not readable as text');
        setContent(null);
        setDisplayedFileName(null);
        setTruncated(false);
        return;
      }
      setContent(text);
      setDisplayedFileName(file.name);
      setTruncated(isTruncated);
      // Task 5.10 — persist file name (UC3-S8)
      onSettingsChange?.({ type: 'file-viewer', fileName: file.name });
    };

    reader.readAsText(blobToRead);

    // Reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="file-viewer">
      {/* Hidden file input (task 5.4 / UC3-S3, UC3-S4) */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Empty state (task 5.2 / UC3-S2) */}
      {!hasContent && (
        <div className="file-viewer__empty">
          <p className="file-viewer__empty-text">Select a file to display</p>

          {/* Task 5.3 — reload hint (UC3-E9b1, UC3-E9b2, UC3-E9b3, UC6-S7) */}
          {savedFileName && (
            <p className="file-viewer__hint">
              Re-select &lsquo;{savedFileName}&rsquo; to restore
            </p>
          )}

          {error && <p className="file-viewer__error">{error}</p>}

          <button className="file-viewer__btn" onClick={openPicker} type="button">
            Select file
          </button>
        </div>
      )}

      {/* File content (task 5.8 / UC3-S7, UC3-S9) */}
      {hasContent && (
        <div className="file-viewer__content-area">
          {/* Task 5.9 — truncation warning (UC3-E6b1, UC3-E6b2) */}
          {truncated && (
            <div className="file-viewer__warning">
              File is large — only the first 1 MB is shown
            </div>
          )}

          {/* Task 5.12 — re-select control (UC5-S1, UC5-S2, UC5-S3, UC5-S4) */}
          <div className="file-viewer__toolbar">
            <span className="file-viewer__filename">{displayedFileName}</span>
            <button className="file-viewer__btn file-viewer__btn--sm" onClick={openPicker} type="button">
              Select a different file
            </button>
          </div>

          {/* Scrollable text content */}
          <pre className="file-viewer__pre">{content}</pre>
        </div>
      )}
    </div>
  );
};

export default FileViewerWidget;
