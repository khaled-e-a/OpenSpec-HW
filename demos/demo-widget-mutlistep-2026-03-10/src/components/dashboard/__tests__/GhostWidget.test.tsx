/**
 * Component tests for GhostWidget.
 *
 * Covers:
 *   UC1-S3  — System displays a ghost/shadow overlay at the nearest valid
 *             snap-to-grid position as the user moves the pointer
 *   UC1-E3a — No valid snap position near pointer — system shows no ghost
 *             or a "cannot drop" indicator
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GhostWidget } from '../GhostWidget';

describe('GhostWidget', () => {
  describe('UC1-S3 — ghost renders at correct grid cell', () => {
    it('renders nothing when visible=false', () => {
      const { container } = render(
        <GhostWidget col={0} row={0} w={1} h={1} isValid={true} visible={false} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders a div when visible=true', () => {
      render(
        <div style={{ display: 'grid' }}>
          <GhostWidget col={1} row={2} w={2} h={1} isValid={true} visible={true} />
        </div>,
      );
      // GhostWidget renders a div with aria-hidden
      const ghost = document.querySelector('[aria-hidden="true"]');
      expect(ghost).toBeTruthy();
    });

    it('sets gridColumn using col and w props', () => {
      render(
        <div style={{ display: 'grid' }}>
          <GhostWidget col={2} row={1} w={3} h={2} isValid={true} visible={true} />
        </div>,
      );
      const ghost = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(ghost.style.gridColumn).toBe('3 / span 3');
    });

    it('sets gridRow using row and h props', () => {
      render(
        <div style={{ display: 'grid' }}>
          <GhostWidget col={0} row={2} w={1} h={2} isValid={true} visible={true} />
        </div>,
      );
      const ghost = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(ghost.style.gridRow).toBe('3 / span 2');
    });
  });

  describe('UC1-E3a — visual indicator for invalid/valid positions', () => {
    it('applies blue border and background when isValid=true (valid drop target)', () => {
      render(
        <div style={{ display: 'grid' }}>
          <GhostWidget col={0} row={0} w={1} h={1} isValid={true} visible={true} />
        </div>,
      );
      const ghost = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(ghost.style.borderColor).toContain('59'); // rgb for blue #3b82f6
      expect(ghost.style.backgroundColor).toContain('59');
    });

    it('applies red border and background when isValid=false (invalid drop target)', () => {
      render(
        <div style={{ display: 'grid' }}>
          <GhostWidget col={0} row={0} w={1} h={1} isValid={false} visible={true} />
        </div>,
      );
      const ghost = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(ghost.style.borderColor).toContain('239'); // rgb for red #ef4444
      expect(ghost.style.backgroundColor).toContain('239');
    });

    it('is hidden (returns null) when visible=false regardless of isValid', () => {
      const { container: c1 } = render(
        <GhostWidget col={0} row={0} w={1} h={1} isValid={true} visible={false} />,
      );
      const { container: c2 } = render(
        <GhostWidget col={0} row={0} w={1} h={1} isValid={false} visible={false} />,
      );
      expect(c1.firstChild).toBeNull();
      expect(c2.firstChild).toBeNull();
    });

    it('has pointer-events none so it does not interfere with drag events', () => {
      render(
        <div style={{ display: 'grid' }}>
          <GhostWidget col={0} row={0} w={1} h={1} isValid={true} visible={true} />
        </div>,
      );
      const ghost = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(ghost.style.pointerEvents).toBe('none');
    });
  });
});
