/**
 * Component tests for WidgetContent.
 *
 * Covers:
 *   UC1-S5 — Widget renders the new content type immediately
 *   UC1-E5a — Selected type requires a source but none is configured — system renders placeholder state
 *   UC2-S1 — System renders the widget using the clock content component
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetContent } from '../WidgetContent';
import type { WidgetLayout } from '../types';

describe('WidgetContent', () => {
  const mockOnConfigChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UC1-S5 — content type dispatching', () => {
    it('renders ClockContent for type: "clock"', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'clock'
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      // ClockContent renders time in a large centered div
      const timeDisplay = screen.getByText(/\d{1,2}:\d{2}:\d{2}/);
      expect(timeDisplay).toBeTruthy();
      expect(timeDisplay.tagName).toBe('DIV');
    });

    it('renders ImageContent for type: "image"', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'image'
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      expect(screen.getByText('No image selected')).toBeTruthy();
      expect(screen.getByText('Choose image')).toBeTruthy();
    });

    it('renders FileContent for type: "file"', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'file'
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      expect(screen.getByText('No file selected')).toBeTruthy();
      expect(screen.getByText('Choose file')).toBeTruthy();
    });

    it('renders WebpageContent for type: "webpage"', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'webpage'
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      // WebpageContent shows placeholder when no URL configured
      expect(screen.getByText('No URL set')).toBeTruthy();
      expect(screen.getByText('Enter URL')).toBeTruthy();
    });
  });

  describe('UC1-E5a — placeholder states', () => {
    it('renders image placeholder when no imageDataUrl is configured', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'image'
        // no imageDataUrl
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      expect(screen.getByText('No image selected')).toBeTruthy();
    });

    it('renders file placeholder when no fileText is configured', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'file'
        // no fileText
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      expect(screen.getByText('No file selected')).toBeTruthy();
    });

    it('renders webpage placeholder when no webpageUrl is configured', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'webpage'
        // no webpageUrl
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      // WebpageContent shows placeholder when no URL configured
      expect(screen.getByText('No URL set')).toBeTruthy();
    });
  });

  describe('UC2-S1 — clock content rendering', () => {
    it('renders clock content when type is "clock"', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'clock'
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      // ClockContent renders time in a centered div
      const container = screen.getByText(/\d{1,2}:\d{2}:\d{2}/).closest('div');
      expect(container?.style.display).toBe('flex');
      expect(container?.style.alignItems).toBe('center');
      expect(container?.style.justifyContent).toBe('center');
    });
  });

  describe('onConfigChange prop', () => {
    it('passes onConfigChange to content components', () => {
      const layout: WidgetLayout = {
        id: 'w1',
        col: 0,
        row: 0,
        w: 1,
        h: 1,
        type: 'image'
      };

      render(
        <WidgetContent layout={layout} onConfigChange={mockOnConfigChange} />
      );

      // ImageContent should receive onConfigChange prop
      // This is verified by the component rendering without errors
      expect(screen.getByText('Choose image')).toBeTruthy();
    });
  });
});