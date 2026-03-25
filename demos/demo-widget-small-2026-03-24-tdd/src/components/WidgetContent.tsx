// WidgetContent.tsx
// UC1-S2, UC2-S1, UC3-S1, UC4-S1: Dispatches to the correct widget content component.
// UC5-S5, UC5-S6: Passes onConfigChange through to leaf component.

import type { WidgetType, WidgetConfig } from '../utils/gridGeometry';
import { ClockWidget } from './widgets/ClockWidget';
import { ImageWidget } from './widgets/ImageWidget';
import { FileWidget } from './widgets/FileWidget';
import { WebpageWidget } from './widgets/WebpageWidget';

interface WidgetContentProps {
  type: WidgetType | undefined;
  config: WidgetConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export function WidgetContent({ type, config, onConfigChange }: WidgetContentProps) {
  switch (type) {
    case 'image':
      return <ImageWidget config={config} onConfigChange={onConfigChange} />;
    case 'file':
      return <FileWidget config={config} onConfigChange={onConfigChange} />;
    case 'webpage':
      return <WebpageWidget config={config} onConfigChange={onConfigChange} />;
    case 'clock':
    default:
      return <ClockWidget />;
  }
}
