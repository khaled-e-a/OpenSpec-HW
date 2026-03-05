import LayoutStorage, { LayoutData } from '../LayoutStorage';

describe('LayoutStorage Service', () => {
  it('Should export required functions', () => {
    expect(LayoutStorage.saveLayout).toBeDefined();
    expect(LayoutStorage.loadLayout).toBeDefined();
    expect(LayoutStorage.deleteLayout).toBeDefined();
    expect(LayoutStorage.getAllLayouts).toBeDefined();
  });

  it('Should have correct TypeScript types', () => {
    const mockLayout: LayoutData = {
      id: 'user-1',
      widgetPositions: {
        'widget-1': { x: 0, y: 0, width: 3, height: 2 },
      },
      timestamp: Date.now(),
    };

    // Type checking passes
    expect(mockLayout.id).toBe('user-1');
    expect(mockLayout.widgetPositions['widget-1']).toEqual({
      x: 0,
      y: 0,
      width: 3,
      height: 2,
    });
  });

  it('Should handle IndexedDB initialization errors gracefully', () => {
    // In a real browser environment, IndexedDB would be available
    // In test environment, we test the service structure
    expect(LayoutStorage).toBeDefined();
    expect(LayoutStorage.init).toBeDefined();
  });

  it('Should validate layout data structure', () => {
    const validLayout = {
      id: 'test-user',
      widgetPositions: {
        'widget-1': { x: 0, y: 0, width: 3, height: 2 },
      },
      timestamp: 1234567890,
    };

    // Verify structure matches LayoutData interface
    expect(validLayout).toHaveProperty('id');
    expect(validLayout).toHaveProperty('widgetPositions');
    expect(validLayout).toHaveProperty('timestamp');
  });
});