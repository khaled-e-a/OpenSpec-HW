import type { ComponentType } from 'react';

export interface LayoutItem {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  resizable?: boolean;
}

export interface WidgetProps {
  item: LayoutItem;
}

export interface RegistryEntry {
  component: ComponentType<WidgetProps>;
  displayName: string;
  defaultSize: { w: number; h: number };
}
