import React, { useRef, useState } from 'react';
import type { WidgetLayout } from '../types';

interface FileContentProps {
  fileText?: string;
  fileLabel?: string;
  onConfigChange: (updates: Partial<WidgetLayout>) => void;
}

export function FileContent({ fileText, fileLabel, onConfigChange }: FileContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return; // UC4-E3a: cancelled, no change

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onConfigChange({ fileText: text, fileLabel: file.name });
      setError(null);
    };
    reader.onerror = () => {
      setError('Cannot display file — check permissions or file type');
    };
    reader.readAsText(file);
  };

  if (error) {
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
        <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>
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
          Choose file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  if (!fileText) {
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
        <div style={{ color: '#64748b', fontSize: 13 }}>No file selected</div>
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
          Choose file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {fileLabel && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            fontSize: 13,
            fontWeight: 500,
            color: '#334155',
          }}
        >
          {fileLabel}
        </div>
      )}
      <pre
        style={{
          flex: 1,
          margin: 0,
          padding: 12,
          overflow: 'auto',
          fontSize: 12,
          lineHeight: 1.4,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {fileText}
      </pre>
      <button
        onClick={handleFileSelect}
        style={{
          padding: '4px 8px',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          fontSize: 12,
          margin: 8,
          alignSelf: 'flex-end',
        }}
      >
        Change file
      </button>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}