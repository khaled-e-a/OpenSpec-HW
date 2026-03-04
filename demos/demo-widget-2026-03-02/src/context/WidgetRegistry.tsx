import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WidgetConfig, WidgetMetadata } from '../types/widget';

interface WidgetRegistryContextType {
  widgets: Map<string, WidgetConfig>;
  registerWidget: (config: WidgetConfig) => void;
  unregisterWidget: (type: string) => void;
  getWidget: (type: string) => WidgetConfig | undefined;
  getAllWidgets: () => WidgetConfig[];
  getWidgetsByCategory: (category: string) => WidgetConfig[];
  searchWidgets: (query: string) => WidgetConfig[];
}

const WidgetRegistryContext = createContext<WidgetRegistryContextType | undefined>(undefined);

interface WidgetRegistryProviderProps {
  children: ReactNode;
  initialWidgets?: WidgetConfig[];
}

export const WidgetRegistryProvider: React.FC<WidgetRegistryProviderProps> = ({
  children,
  initialWidgets = [],
}) => {
  const [widgets, setWidgets] = useState<Map<string, WidgetConfig>>(() => {
    const map = new Map<string, WidgetConfig>();
    initialWidgets.forEach(widget => {
      map.set(widget.metadata.type, widget);
    });
    return map;
  });

  const registerWidget = (config: WidgetConfig) => {
    setWidgets(prev => new Map(prev).set(config.metadata.type, config));
  };

  const unregisterWidget = (type: string) => {
    setWidgets(prev => {
      const newMap = new Map(prev);
      newMap.delete(type);
      return newMap;
    });
  };

  const getWidget = (type: string): WidgetConfig | undefined => {
    return widgets.get(type);
  };

  const getAllWidgets = (): WidgetConfig[] => {
    return Array.from(widgets.values());
  };

  const getWidgetsByCategory = (category: string): WidgetConfig[] => {
    return Array.from(widgets.values()).filter(widget =>
      widget.metadata.category === category
    );
  };

  const searchWidgets = (query: string): WidgetConfig[] => {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(widgets.values()).filter(widget =>
      widget.metadata.name.toLowerCase().includes(lowercaseQuery) ||
      widget.metadata.description.toLowerCase().includes(lowercaseQuery) ||
      widget.metadata.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const value: WidgetRegistryContextType = {
    widgets,
    registerWidget,
    unregisterWidget,
    getWidget,
    getAllWidgets,
    getWidgetsByCategory,
    searchWidgets,
  };

  return <WidgetRegistryContext.Provider value={value}>{children}</WidgetRegistryContext.Provider>;
};

export const useWidgetRegistry = () => {
  const context = useContext(WidgetRegistryContext);
  if (context === undefined) {
    throw new Error('useWidgetRegistry must be used within a WidgetRegistryProvider');
  }
  return context;
};