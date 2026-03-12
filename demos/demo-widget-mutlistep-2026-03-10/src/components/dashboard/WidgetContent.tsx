import React from 'react';
import type { WidgetLayout } from './types';
import { ClockContent } from './content/ClockContent';
import { ImageContent } from './content/ImageContent';
import { FileContent } from './content/FileContent';
import { WebpageContent } from './content/WebpageContent';

interface WidgetContentProps {
  layout: WidgetLayout;
  onConfigChange: (updates: Partial<WidgetLayout>) => void;
}

export function WidgetContent({ layout, onConfigChange }: WidgetContentProps) {
  switch (layout.type) {
    case 'clock':
      return <ClockContent />;
    case 'image':
      return (
        <ImageContent
          imageDataUrl={layout.imageDataUrl}
          onConfigChange={onConfigChange}
        />
      );
    case 'file':
      return (
        <FileContent
          fileText={layout.fileText}
          fileLabel={layout.fileLabel}
          onConfigChange={onConfigChange}
        />
      );
    case 'webpage':
      return (
        <WebpageContent
          webpageUrl={layout.webpageUrl}
          onConfigChange={onConfigChange}
        />
      );
    default:
      return <div>Unknown widget type</div>;
  }
}