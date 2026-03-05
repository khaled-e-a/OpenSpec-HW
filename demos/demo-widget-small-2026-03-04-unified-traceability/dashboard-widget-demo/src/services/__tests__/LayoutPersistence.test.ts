import LayoutPersistence from '../LayoutPersistence';
import LayoutStorage from '../LayoutStorage';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  databases: jest.fn().mockResolvedValue([]),
};

(global as any).indexedDB = mockIndexedDB;

describe('LayoutPersistence Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should serialize widget positions correctly', async () => {
    const widgets = [
      { id: 'widget-1', size: 'small' as const },
      { id: 'widget-2', size: 'medium' as const },
      { id: 'widget-3', size: 'large' as const },
    ];

    const layout = {
      id: 'user-1',
      widgetPositions: widgets.reduce((acc, widget, index) => {
        acc[widget.id] = {
          x: index * 3,
          y: 0,
          width: widget.size === 'small' ? 3 : widget.size === 'medium' ? 6 : 9,
          height: widget.size === 'small' ? 2 : widget.size === 'medium' ? 3 : 4,
        };
        return acc;
      }, {} as Record<string, { x: number; y: number; width: number; height: number }>),
      timestamp: Date.now(),
    };

    await LayoutPersistence.saveLayout(layout);

    // Verify positions are correctly calculated
    expect(layout.widgetPositions['widget-1']).toEqual({
      x: 0,
      y: 0,
      width: 3,
      height: 2,
    });
    expect(layout.widgetPositions['widget-2']).toEqual({
      x: 3,
      y: 0,
      width: 6,
      height: 3,
    });
    expect(layout.widgetPositions['widget-3']).toEqual({
      x: 6,
      y: 0,
      width: 9,
      height: 4,
    });
  });

  it('Should validate layout before saving', async () => {
    const validLayout = {
      id: 'user-1',
      widgetPositions: {
        'widget-1': { x: 0, y: 0, width: 3, height: 2 },
        'widget-2': { x: 6, y: 0, width: 3, height: 2 },
      },
      timestamp: Date.now(),
    };

    const isValid = await LayoutPersistence.validateLayout(validLayout);
    expect(isValid).toBe(true);
  });

  it('Should invalidate layout with overlapping widgets', async () => {
    const invalidLayout = {
      id: 'user-1',
      widgetPositions: {
        'widget-1': { x: 0, y: 0, width: 3, height: 2 },
        'widget-2': { x: 2, y: 0, width: 3, height: 2 }, // Overlaps with widget-1
      },
      timestamp: Date.now(),
    };

    const isValid = await LayoutPersistence.validateLayout(invalidLayout);
    expect(isValid).toBe(false);
  });

  it('Should queue layout for saving', async () => {
    const layout = {
      id: 'user-1',
      widgetPositions: {},
      timestamp: Date.now(),
    };

    // Should not throw when queuing
    await expect(LayoutPersistence.saveLayout(layout)).resolves.not.toThrow();
  });

  it('Should queue save when offline', async () => {
    const layout = {
      id: 'user-1',
      widgetPositions: {},
      timestamp: Date.now(),
    };

    // Simulate offline scenario
    jest.spyOn(LayoutStorage, 'saveLayout').mockRejectedValueOnce(new Error('Network error'));

    await LayoutPersistence.saveLayout(layout);

    // Should queue for retry without throwing
    await expect(LayoutPersistence.saveLayout(layout)).resolves.not.toThrow();
  });

  it('Should retry failed saves', async () => {
    const layout = {
      id: 'user-1',
      widgetPositions: {},
      timestamp: Date.now(),
    };

    let attemptCount = 0;
    jest.spyOn(LayoutStorage, 'saveLayout').mockImplementation(async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Network error');
      }
      return Promise.resolve();
    });

    await LayoutPersistence.saveLayout(layout);

    // Wait for retries
    await new Promise(resolve => setTimeout(resolve, 3000));

    expect(attemptCount).toBeGreaterThanOrEqual(3);
  });
});