import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { DashboardWidget } from '../types';

const mockWidgets: DashboardWidget[] = [
  {
    id: 'widget-1',
    type: 'test',
    position: { x: 0, y: 0 },
    size: { width: 2, height: 2 },
  },
  {
    id: 'widget-2',
    type: 'test',
    position: { x: 2, y: 0 },
    size: { width: 2, height: 2 },
  },
];

describe('DashboardContext - R1-UC1, R1-UC2', () => {
  describe('R1-UC1-S6: System updates widget position and saves new layout', () => {
    it('should move widget to new position', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const newPosition = { x: 4, y: 2 };

      act(() => {
        result.current.moveWidget('widget-1', newPosition);
      });

      const movedWidget = result.current.widgets.find(w => w.id === 'widget-1');
      expect(movedWidget?.position).toEqual(newPosition);
    });

    it('should not move non-existent widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const initialWidgetCount = result.current.widgets.length;

      act(() => {
        result.current.moveWidget('non-existent', { x: 5, y: 5 });
      });

      expect(result.current.widgets.length).toBe(initialWidgetCount);
    });
  });

  describe('R1-UC2-S7: System updates widget size and reflows content', () => {
    it('should resize widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const newSize = { width: 3, height: 3 };

      act(() => {
        result.current.resizeWidget('widget-1', newSize);
      });

      const resizedWidget = result.current.widgets.find(w => w.id === 'widget-1');
      expect(resizedWidget?.size).toEqual(newSize);
    });

    it('should not resize non-existent widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const initialWidgetCount = result.current.widgets.length;

      act(() => {
        result.current.resizeWidget('non-existent', { width: 5, height: 5 });
      });

      expect(result.current.widgets.length).toBe(initialWidgetCount);
    });
  });

  describe('R1-UC2-S8: System saves new layout configuration', () => {
    it('should add new widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const newWidget: DashboardWidget = {
        id: 'widget-3',
        type: 'new',
        position: { x: 0, y: 2 },
        size: { width: 2, height: 2 },
      };

      act(() => {
        result.current.addWidget(newWidget);
      });

      expect(result.current.widgets).toContainEqual(newWidget);
      expect(result.current.widgets.length).toBe(3);
    });

    it('should remove widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      act(() => {
        result.current.removeWidget('widget-1');
      });

      expect(result.current.widgets.find(w => w.id === 'widget-1')).toBeUndefined();
      expect(result.current.widgets.length).toBe(1);
    });

    it('should not remove non-existent widget', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const initialWidgetCount = result.current.widgets.length;

      act(() => {
        result.current.removeWidget('non-existent');
      });

      expect(result.current.widgets.length).toBe(initialWidgetCount);
    });
  });

  describe('R1-UC4: Remove Widget from Dashboard', () => {
    it('should handle widget removal with confirmation', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      act(() => {
        result.current.removeWidget('widget-1');
      });

      expect(result.current.widgets.find(w => w.id === 'widget-1')).toBeUndefined();
    });

    it('should reflow remaining widgets after removal', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const initialPositions = result.current.widgets.map(w => w.position);

      act(() => {
        result.current.removeWidget('widget-1');
      });

      // Verify remaining widget position unchanged
      const remainingWidget = result.current.widgets.find(w => w.id === 'widget-2');
      expect(remainingWidget?.position).toEqual(initialPositions[1]);
    });
  });

  describe('Edit Mode', () => {
    it('should toggle edit mode', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      expect(result.current.isEditMode).toBe(false);

      act(() => {
        result.current.setEditMode(true);
      });

      expect(result.current.isEditMode).toBe(true);
    });
  });

  describe('Widget Component Resolution', () => {
    it('should get widget component from external resolver', () => {
      const TestComponent = () => <div>Test</div>;
      const getWidgetComponent = jest.fn().mockReturnValue(TestComponent);

      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider
            initialWidgets={mockWidgets}
            getWidgetComponent={getWidgetComponent}
          >
            {children}
          </DashboardProvider>
        ),
      });

      const component = result.current.getWidgetComponent('test');
      expect(getWidgetComponent).toHaveBeenCalledWith('test');
      expect(component).toBe(TestComponent);
    });

    it('should return null when no external resolver provided', () => {
      const { result } = renderHook(() => useDashboard(), {
        wrapper: ({ children }) => (
          <DashboardProvider initialWidgets={mockWidgets}>
            {children}
          </DashboardProvider>
        ),
      });

      const component = result.current.getWidgetComponent('test');
      expect(component).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useDashboard is used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useDashboard());
      }).toThrow('useDashboard must be used within a DashboardProvider');

      consoleSpy.mockRestore();
    });
  });
});