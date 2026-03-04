import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { WidgetRegistryProvider, useWidgetRegistry } from './WidgetRegistry';
import { WidgetConfig } from '../types/widget';

const mockWidgetConfigs: WidgetConfig[] = [
  {
    component: () => <div>Weather Widget</div>,
    metadata: {
      type: 'weather',
      name: 'Weather Widget',
      description: 'Display current weather information',
      version: '1.0.0',
      category: 'utilities',
      tags: ['weather', 'forecast'],
      minSize: { width: 2, height: 2 },
      defaultSize: { width: 3, height: 2 },
      lifecycle: 'active',
    },
  },
  {
    component: () => <div>Chart Widget</div>,
    metadata: {
      type: 'chart',
      name: 'Chart Widget',
      description: 'Display data in various chart formats',
      version: '1.0.0',
      category: 'analytics',
      tags: ['chart', 'data', 'visualization'],
      minSize: { width: 3, height: 2 },
      defaultSize: { width: 4, height: 3 },
      lifecycle: 'active',
    },
  },
];

describe('WidgetRegistry - R1-UC3, R1-UC5', () => {
  describe('R1-UC3-S1: System displays widget registry with available widget types', () => {
    it('should get all widgets from registry', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const allWidgets = result.current.getAllWidgets();
      expect(allWidgets).toHaveLength(2);
      expect(allWidgets[0].metadata.type).toBe('weather');
      expect(allWidgets[1].metadata.type).toBe('chart');
    });

    it('should get widget by type', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const weatherWidget = result.current.getWidget('weather');
      expect(weatherWidget).toBeDefined();
      expect(weatherWidget?.metadata.name).toBe('Weather Widget');

      const nonExistentWidget = result.current.getWidget('non-existent');
      expect(nonExistentWidget).toBeUndefined();
    });
  });

  describe('R1-UC3-S2: User browses or searches for desired widget', () => {
    it('should search widgets by name', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const searchResults = result.current.searchWidgets('weather');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].metadata.type).toBe('weather');
    });

    it('should search widgets by description', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const searchResults = result.current.searchWidgets('chart');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].metadata.type).toBe('chart');
    });

    it('should search widgets by tags', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const searchResults = result.current.searchWidgets('forecast');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].metadata.type).toBe('weather');
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const searchResults = result.current.searchWidgets('nonexistent');
      expect(searchResults).toHaveLength(0);
    });

    it('should handle case-insensitive search', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const upperCaseResults = result.current.searchWidgets('WEATHER');
      const lowerCaseResults = result.current.searchWidgets('weather');
      expect(upperCaseResults).toEqual(lowerCaseResults);
    });
  });

  describe('R1-UC3: Add Widget from Registry', () => {
    it('should get widgets by category', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const utilities = result.current.getWidgetsByCategory('utilities');
      expect(utilities).toHaveLength(1);
      expect(utilities[0].metadata.type).toBe('weather');

      const analytics = result.current.getWidgetsByCategory('analytics');
      expect(analytics).toHaveLength(1);
      expect(analytics[0].metadata.type).toBe('chart');

      const emptyCategory = result.current.getWidgetsByCategory('nonexistent');
      expect(emptyCategory).toHaveLength(0);
    });
  });

  describe('R1-UC5: Register New Widget Type', () => {
    it('should register new widget', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const newWidget: WidgetConfig = {
        component: () => <div>Notes Widget</div>,
        metadata: {
          type: 'notes',
          name: 'Notes Widget',
          description: 'Display and edit notes',
          version: '1.0.0',
          category: 'productivity',
          tags: ['notes', 'text'],
          lifecycle: 'active',
        },
      };

      act(() => {
        result.current.registerWidget(newWidget);
      });

      const registeredWidget = result.current.getWidget('notes');
      expect(registeredWidget).toBeDefined();
      expect(registeredWidget?.metadata.name).toBe('Notes Widget');
      expect(result.current.getAllWidgets()).toHaveLength(3);
    });

    it('should unregister widget', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      act(() => {
        result.current.unregisterWidget('weather');
      });

      expect(result.current.getWidget('weather')).toBeUndefined();
      expect(result.current.getAllWidgets()).toHaveLength(1);
    });

    it('should handle unregistering non-existent widget', () => {
      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={mockWidgetConfigs}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const initialCount = result.current.getAllWidgets().length;

      act(() => {
        result.current.unregisterWidget('non-existent');
      });

      expect(result.current.getAllWidgets()).toHaveLength(initialCount);
    });
  });

  describe('Widget Lifecycle States', () => {
    it('should handle deprecated widgets', () => {
      const deprecatedWidget: WidgetConfig = {
        component: () => <div>Deprecated Widget</div>,
        metadata: {
          type: 'deprecated',
          name: 'Deprecated Widget',
          description: 'Old widget',
          version: '1.0.0',
          lifecycle: 'deprecated',
        },
      };

      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={[deprecatedWidget]}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const widget = result.current.getWidget('deprecated');
      expect(widget?.metadata.lifecycle).toBe('deprecated');
    });

    it('should handle retired widgets', () => {
      const retiredWidget: WidgetConfig = {
        component: () => <div>Retired Widget</div>,
        metadata: {
          type: 'retired',
          name: 'Retired Widget',
          description: 'No longer available',
          version: '1.0.0',
          lifecycle: 'retired',
        },
      };

      const { result } = renderHook(() => useWidgetRegistry(), {
        wrapper: ({ children }) => (
          <WidgetRegistryProvider initialWidgets={[retiredWidget]}>
            {children}
          </WidgetRegistryProvider>
        ),
      });

      const widget = result.current.getWidget('retired');
      expect(widget?.metadata.lifecycle).toBe('retired');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useWidgetRegistry is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useWidgetRegistry());
      }).toThrow('useWidgetRegistry must be used within a WidgetRegistryProvider');

      consoleSpy.mockRestore();
    });
  });
});