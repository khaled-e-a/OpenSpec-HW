import React, { useState, useEffect, useRef } from 'react';
import { WidgetContentProps } from './types';
import './ImageViewerWidget.css';

type PickerMode = 'closed' | 'select-mode' | 'enter-url';

// Tasks 4.1–4.15
const ImageViewerWidget: React.FC<WidgetContentProps> = ({ settings, onSettingsChange }) => {
  // Derive initial imgSrc from settings (task 4.14 / UC6-S5)
  const initialSrc =
    settings && settings.type === 'image-viewer' && settings.source === 'url'
      ? settings.url
      : null;

  const [imgSrc, setImgSrc] = useState<string | null>(initialSrc);
  const [pickerMode, setPickerMode] = useState<PickerMode>('closed');
  const [urlInput, setUrlInput] = useState<string>(
    settings && settings.type === 'image-viewer' && settings.source === 'url'
      ? settings.url
      : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Task 4.15 — revoke blob URL on replace/unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const revokePreviousBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  // Task 4.5 + 4.6 — handle file chosen from picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return; // task 4.13 — cancel preserves state

    // Task 4.5 — validate MIME type
    if (!file.type.startsWith('image/')) {
      setError('Not a supported image format');
      setPickerMode('closed');
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    setLoadError(false);
    revokePreviousBlob();

    // Task 4.6 — create blob URL
    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setImgSrc(blobUrl);
    setPickerMode('closed');

    // Task 4.7 — persist settings (source: 'file', no URL)
    onSettingsChange?.({ type: 'image-viewer', source: 'file' });

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Task 4.9 — handle URL confirmation
  const handleUrlConfirm = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setError(null);
    setLoadError(false);
    revokePreviousBlob();
    setImgSrc(trimmed);
    setPickerMode('closed');
    // Task 4.9 — persist URL settings
    onSettingsChange?.({ type: 'image-viewer', source: 'url', url: trimmed });
  };

  // Task 4.10 — image load error handler
  const handleImgError = () => {
    setLoadError(true);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const hasImage = imgSrc !== null;

  return (
    <div className="image-viewer">
      {/* Hidden file input (task 4.4) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Empty state (task 4.2 / UC2-S2) */}
      {!hasImage && pickerMode === 'closed' && (
        <div className="image-viewer__empty">
          <p className="image-viewer__empty-text">Choose an image</p>
          {error && <p className="image-viewer__error">{error}</p>}
          <button
            className="image-viewer__btn"
            onClick={() => { setError(null); setPickerMode('select-mode'); }}
            type="button"
          >
            Choose image
          </button>
        </div>
      )}

      {/* Source picker — mode selection (task 4.3 / UC2-S3, UC2-S4) */}
      {pickerMode === 'select-mode' && (
        <div className="image-viewer__picker">
          <p className="image-viewer__picker-title">Choose source</p>
          <button
            className="image-viewer__btn"
            onClick={openFilePicker}
            type="button"
          >
            Select file
          </button>
          <button
            className="image-viewer__btn"
            onClick={() => setPickerMode('enter-url')}
            type="button"
          >
            Enter URL
          </button>
          <button
            className="image-viewer__btn image-viewer__btn--secondary"
            onClick={() => setPickerMode('closed')}
            type="button"
          >
            Cancel
          </button>
        </div>
      )}

      {/* URL entry (task 4.8 / UC2-E4a1, UC2-E4a2) */}
      {pickerMode === 'enter-url' && (
        <div className="image-viewer__url-entry">
          <input
            className="image-viewer__url-input"
            type="text"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleUrlConfirm(); }}
            autoFocus
          />
          <div className="image-viewer__url-actions">
            <button className="image-viewer__btn" onClick={handleUrlConfirm} type="button">
              Load
            </button>
            <button
              className="image-viewer__btn image-viewer__btn--secondary"
              onClick={() => setPickerMode('closed')}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image display (task 4.11 / UC2-S8) */}
      {hasImage && pickerMode === 'closed' && (
        <div className="image-viewer__image-container">
          {loadError ? (
            <div className="image-viewer__load-error">
              {/* Task 4.10 / UC2-E8a1 */}
              <p className="image-viewer__error">Image could not be loaded</p>
              <button
                className="image-viewer__btn"
                onClick={() => { setLoadError(false); setPickerMode('select-mode'); }}
                type="button"
              >
                Choose image
              </button>
            </div>
          ) : (
            <img
              src={imgSrc!}
              alt="Widget content"
              className="image-viewer__img"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              onError={handleImgError}
            />
          )}
          {/* Task 4.12 / UC2-E8b1, UC5-S1, UC5-S2 — change image control */}
          {!loadError && (
            <div className="image-viewer__change-overlay">
              <button
                className="image-viewer__change-btn"
                onClick={() => setPickerMode('select-mode')}
                type="button"
              >
                Change image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageViewerWidget;
