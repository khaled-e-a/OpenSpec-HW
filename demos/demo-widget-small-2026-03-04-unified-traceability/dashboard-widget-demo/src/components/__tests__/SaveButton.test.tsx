import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SaveButton from '../SaveButton';

// Suppress console errors for expected test behavior
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('SaveButton Component', () => {
  it('Should trigger save on button click', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<SaveButton onSave={onSave} isDirty={true} />);

    const saveButton = screen.getByText('💾 Save Layout');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });

  it('Should show success notification', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<SaveButton onSave={onSave} isDirty={true} />);

    const saveButton = screen.getByText('💾 Save Layout');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('✓ Layout saved successfully!')).toBeInTheDocument();
    });
  });

  it('Should show validation error', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Invalid layout'));
    render(<SaveButton onSave={onSave} isDirty={true} />);

    const saveButton = screen.getByText('💾 Save Layout');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('✗ Failed to save layout')).toBeInTheDocument();
    });
  });

  it('Should show pending save status', async () => {
    const onSave = jest.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    render(<SaveButton onSave={onSave} isDirty={true} />);

    const saveButton = screen.getByText('💾 Save Layout');
    fireEvent.click(saveButton);

    expect(screen.getByText('⟳')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('Should allow retry on save failure', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<SaveButton onSave={onSave} isDirty={true} />);

    const saveButton = screen.getByText('💾 Save Layout');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('✗ Failed to save layout')).toBeInTheDocument();
    });

    // Should be able to retry
    expect(saveButton).not.toBeDisabled();
  });

  it('Should be disabled when not dirty', () => {
    const onSave = jest.fn();
    render(<SaveButton onSave={onSave} isDirty={false} />);

    const saveButton = screen.getByText('💾 Save Layout');
    expect(saveButton).toBeDisabled();
  });

  it('Should show validation error', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('Invalid layout configuration'));
    render(<SaveButton onSave={onSave} isDirty={true} />);

    const saveButton = screen.getByText('💾 Save Layout');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('✗ Failed to save layout')).toBeInTheDocument();
    });
  });

  it('Should show pending save status when offline', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<SaveButton onSave={onSave} isDirty={true} />);

    // Simulate offline notification
    window.dispatchEvent(new CustomEvent('layoutSaveFailed', { detail: { userId: 'user-1' } }));

    await waitFor(() => {
      expect(screen.getByText('✗ Failed to save layout')).toBeInTheDocument();
    });
  });

  it('Should show pending save notification', async () => {
    const onSave = jest.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );
    render(<SaveButton onSave={onSave} isDirty={true} />);

    // Click save button
    const saveButton = screen.getByText('💾 Save Layout');
    fireEvent.click(saveButton);

    // Should immediately show loading spinner
    expect(screen.getByText('⟳')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('✓ Layout saved successfully!')).toBeInTheDocument();
    });
  });
});