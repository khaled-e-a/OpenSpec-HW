/**
 * Component tests for WidgetSettings.
 *
 * Covers:
 *   UC1-S2 — System opens a settings panel showing the current type and the four available types
 *   UC1-S3 — User selects a content type
 *   UC1-S4 — System updates the widget to the selected type
 *   UC1-E3a — User selects the same type already active — system makes no change
 *   UC1-E3b — User dismisses the settings panel without selecting — widget type unchanged
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WidgetSettings } from '../WidgetSettings';
import type { WidgetType } from '../types';

describe('WidgetSettings', () => {
  const mockOnConfigChange = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UC1-S2 — settings panel display', () => {
    it('renders all four widget type options', () => {
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Clock')).toBeTruthy();
      expect(screen.getByText('Image')).toBeTruthy();
      expect(screen.getByText('File')).toBeTruthy();
      expect(screen.getByText('Webpage')).toBeTruthy();
    });

    it('highlights the current type', () => {
      render(
        <WidgetSettings
          currentType="image"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      const imageButton = screen.getByText('Image').closest('button');
      expect(imageButton?.style.backgroundColor).toBe('rgb(59, 130, 246)');
    });

    it('positions panel absolutely at top-right of viewport', () => {
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      const panel = screen.getByRole('dialog');
      expect(panel.style.position).toBe('absolute');
      expect(panel.style.top).toBe('32px');
      expect(panel.style.right).toBe('8px');
    });
  });

  describe('UC1-S3 — type selection', () => {
    it('calls onConfigChange with selected type when user clicks a different type', async () => {
      const user = userEvent.setup();
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Image'));
      expect(mockOnConfigChange).toHaveBeenCalledWith({ type: 'image' });
    });

    it('calls onConfigChange with correct type for each option', async () => {
      const user = userEvent.setup();
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('File'));
      expect(mockOnConfigChange).toHaveBeenCalledWith({ type: 'file' });

      await user.click(screen.getByText('Webpage'));
      expect(mockOnConfigChange).toHaveBeenCalledWith({ type: 'webpage' });
    });
  });

  describe('UC1-S4 — panel closure after selection', () => {
    it('calls onClose after type selection', async () => {
      const user = userEvent.setup();
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Image'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('UC1-E3a — selecting same type', () => {
    it('does not call onConfigChange when selecting current type', async () => {
      const user = userEvent.setup();
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      await user.click(screen.getByText('Clock'));
      expect(mockOnConfigChange).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('UC1-E3b — dismiss without selection', () => {
    it('calls onClose when clicking outside panel', () => {
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      fireEvent.pointerDown(document.body);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not call onConfigChange when dismissed', () => {
      render(
        <WidgetSettings
          currentType="clock"
          onConfigChange={mockOnConfigChange}
          onClose={mockOnClose}
        />
      );

      fireEvent.pointerDown(document.body);
      expect(mockOnConfigChange).not.toHaveBeenCalled();
    });
  });

  describe('event propagation', () => {
    it('stops pointerDown propagation to prevent drag initiation', () => {
      const parentPointerDown = vi.fn();
      render(
        <div onPointerDown={parentPointerDown}>
          <WidgetSettings
            currentType="clock"
            onConfigChange={mockOnConfigChange}
            onClose={mockOnClose}
          />
        </div>
      );

      fireEvent.pointerDown(screen.getByRole('dialog'));
      expect(parentPointerDown).not.toHaveBeenCalled();
    });
  });
});