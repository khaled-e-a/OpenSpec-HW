import React, { useRef, useState } from 'react';
import type { WidgetLayout } from '../types';

interface ImageContentProps {
  imageDataUrl?: string;
  onConfigChange: (updates: Partial<WidgetLayout>) => void;
}

export function ImageContent({ imageDataUrl, onConfigChange }: ImageContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return; // UC3-E3a: cancelled, no change

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onConfigChange({ imageDataUrl: dataUrl });
      setImageError(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
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
        <div style={{ color: '#ef4444', fontSize: 13 }}>Cannot display file — not a valid image</div>
        <button
          onClick={handleFileSelect}
          style={{
            padding: '6px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Choose image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  if (!imageDataUrl) {
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
        <div style={{ color: '#64748b', fontSize: 13 }}>No image selected</div>
        <button
          onClick={handleFileSelect}
          style={{
            padding: '6px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Choose image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <img
        src={imageDataUrl}
        alt="Selected"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        onError={handleImageError}
      />
      <button
        onClick={handleFileSelect}
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          padding: '4px 8px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Change image
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}