export interface WidgetMetadata {
  type: string;
  name: string;
  description: string;
  version: string;
  category?: string;
  tags?: string[];
  icon?: string;
  author?: string;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  defaultSize?: { width: number; height: number };
  aspectRatio?: number;
  permissions?: string[];
  lifecycle?: 'active' | 'deprecated' | 'retired';
}

export interface WidgetConfig {
  component: React.ComponentType<any>;
  metadata: WidgetMetadata;
  configSchema?: Record<string, any>;
  defaultConfig?: Record<string, any>;
}