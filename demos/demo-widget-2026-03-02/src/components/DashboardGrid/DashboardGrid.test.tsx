import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardGrid } from './DashboardGrid';
import { DndContext } from '@dnd-kit/core';
import { DashboardProvider } from '../../context';

const mockWidgets = [
  {
    id: 'widget-1',
    type: 'test',
    position: { x: 0, y: 0 },
    size: { width: 2, height: 2 },
  },
];

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndContext>
    <DashboardProvider initialWidgets={mockWidgets}>
      {children}
    </DashboardProvider>
  </DndContext>
);

describe('DashboardGrid', () => {
  it('renders without crashing', () => {
    render(
      <Wrapper>
        <DashboardGrid widgets={mockWidgets} />
      </Wrapper>
    );
  });

  it('applies custom grid configuration', () => {
    const { container } = render(
      <Wrapper>
        <DashboardGrid
          widgets={mockWidgets}
          config={{ columns: 6, rows: 4, gap: 8, margin: 12 }}
        />
      </Wrapper>
    );

    const grid = container.querySelector('.dashboard-grid');
    expect(grid).toHaveStyle({
      gridTemplateColumns: 'repeat(6, 1fr)',
      gridTemplateRows: 'repeat(4, minmax(100px, auto))',
      gap: '8px',
      padding: '12px',
    });
  });

  it('shows grid cells in edit mode', () => {
    render(
      <Wrapper>
        <DashboardGrid widgets={mockWidgets} isEditMode={true} />
      </Wrapper>
    );

    const gridCells = screen.getAllByRole('button', { name: /Resize widget/ });
    expect(gridCells.length).toBeGreaterThan(0);
  });
});