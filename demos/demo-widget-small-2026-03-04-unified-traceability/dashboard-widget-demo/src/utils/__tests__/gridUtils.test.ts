import { isValidPosition, getGridPosition, snapToGrid } from '../gridUtils';

describe('gridUtils', () => {
  describe('isValidPosition', () => {
    it('should return true for non-overlapping positions', () => {
      const position = { x: 0, y: 0, width: 3, height: 2 };
      const occupiedPositions = [
        { x: 6, y: 0, width: 3, height: 2 },
        { x: 0, y: 3, width: 3, height: 2 },
      ];

      expect(isValidPosition(position, occupiedPositions)).toBe(true);
    });

    it('should return false for overlapping positions', () => {
      const position = { x: 0, y: 0, width: 3, height: 2 };
      const occupiedPositions = [
        { x: 2, y: 0, width: 3, height: 2 }, // Overlaps with position
      ];

      expect(isValidPosition(position, occupiedPositions)).toBe(false);
    });

    it('should return false for positions outside grid bounds', () => {
      const position = { x: 10, y: 0, width: 3, height: 2 }; // Would extend beyond 12 columns
      const occupiedPositions: any[] = [];

      expect(isValidPosition(position, occupiedPositions)).toBe(false);
    });

    it('should return true for adjacent positions', () => {
      const position = { x: 0, y: 0, width: 3, height: 2 };
      const occupiedPositions = [
        { x: 3, y: 0, width: 3, height: 2 }, // Adjacent, not overlapping
      ];

      expect(isValidPosition(position, occupiedPositions)).toBe(true);
    });
  });

  describe('getGridPosition', () => {
    it('should calculate correct grid position for small widget', () => {
      const position = getGridPosition(120, 160, 'small');
      expect(position).toEqual({ x: 2, y: 2, width: 3, height: 2 });
    });

    it('should calculate correct grid position for medium widget', () => {
      const position = getGridPosition(240, 240, 'medium');
      expect(position).toEqual({ x: 3, y: 3, width: 6, height: 3 });
    });

    it('should calculate correct grid position for large widget', () => {
      const position = getGridPosition(0, 0, 'large');
      expect(position).toEqual({ x: 0, y: 0, width: 9, height: 4 });
    });

    it('should not exceed grid bounds', () => {
      const position = getGridPosition(1000, 1000, 'large');
      expect(position.x + position.width).toBeLessThanOrEqual(12);
    });
  });

  describe('snapToGrid', () => {
    it('should snap coordinates to grid', () => {
      const snapped = snapToGrid(125, 165, 'small');
      expect(snapped.x).toBe(160);
      expect(snapped.y).toBe(160);
    });

    it('should maintain widget dimensions', () => {
      const snapped = snapToGrid(100, 100, 'medium');
      expect(snapped.width).toBe(6);
      expect(snapped.height).toBe(3);
    });
  });
});