import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchableDropdown } from '../searchable-dropdown';
import { FocusBehaviorProvider } from '@/contexts/FocusBehaviorContext';

describe('SearchableDropdown with useTabAsArrows', () => {
  const mockItems = [
    { id: 1, name: 'Aspirin 100mg' },
    { id: 2, name: 'Ibuprofen 200mg' },
    { id: 3, name: 'Paracetamol 500mg' }
  ];
  
  const defaultProps = {
    value: '',
    searchResults: mockItems,
    isLoading: false,
    showDropdown: true,
    onSearch: vi.fn(),
    onSelect: vi.fn(),
    onClear: vi.fn(),
    renderItem: (item: any) => <div>{item.name}</div>,
    getItemKey: (item: any) => item.id,
    getItemText: (item: any) => item.name,
    enableTabAsArrows: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate through items with Tab when enableTabAsArrows is true', async () => {
    const onSelect = vi.fn();
    
    const { container } = render(
      <FocusBehaviorProvider>
        <SearchableDropdown
          {...defaultProps}
          onSelect={onSelect}
        />
      </FocusBehaviorProvider>
    );

    const input = screen.getByRole('textbox');
    input.focus();

    // Tab should move to first item
    fireEvent.keyDown(input, { key: 'Tab' });
    await waitFor(() => {
      const firstItem = container.querySelector('[aria-selected="true"]');
      expect(firstItem?.textContent).toContain('Aspirin 100mg');
    });

    // Tab again should move to second item
    fireEvent.keyDown(input, { key: 'Tab' });
    await waitFor(() => {
      const selectedItem = container.querySelector('[aria-selected="true"]');
      expect(selectedItem?.textContent).toContain('Ibuprofen 200mg');
    });

    // Enter should select current item
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(mockItems[1], 'keyboard');
  });

  it('should navigate backward with Shift+Tab', async () => {
    const { container } = render(
      <FocusBehaviorProvider>
        <SearchableDropdown
          {...defaultProps}
        />
      </FocusBehaviorProvider>
    );

    const input = screen.getByRole('textbox');
    input.focus();

    // Move to second item first
    fireEvent.keyDown(input, { key: 'Tab' });
    fireEvent.keyDown(input, { key: 'Tab' });
    
    // Shift+Tab should move back
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    await waitFor(() => {
      const selectedItem = container.querySelector('[aria-selected="true"]');
      expect(selectedItem?.textContent).toContain('Aspirin 100mg');
    });
  });

  it('should allow natural Tab behavior when enableTabAsArrows is false', async () => {
    const onSelect = vi.fn();
    
    render(
      <FocusBehaviorProvider>
        <SearchableDropdown
          {...defaultProps}
          enableTabAsArrows={false}
          onSelect={onSelect}
        />
      </FocusBehaviorProvider>
    );

    const input = screen.getByRole('textbox');
    input.focus();
    
    // Type to filter results
    await userEvent.type(input, 'Aspirin');

    // Tab should blur and auto-select exact match
    fireEvent.keyDown(input, { key: 'Tab' });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(mockItems[0], 'keyboard');
    });
  });

  it('should close dropdown on Escape', async () => {
    const onSearch = vi.fn();
    
    render(
      <FocusBehaviorProvider>
        <SearchableDropdown
          {...defaultProps}
          onSearch={onSearch}
        />
      </FocusBehaviorProvider>
    );

    const input = screen.getByRole('textbox');
    input.focus();

    // Escape should clear search
    fireEvent.keyDown(input, { key: 'Escape' });
    
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('');
    });
  });

  it('should wrap around when navigating past boundaries', async () => {
    const { container } = render(
      <FocusBehaviorProvider>
        <SearchableDropdown
          {...defaultProps}
        />
      </FocusBehaviorProvider>
    );

    const input = screen.getByRole('textbox');
    input.focus();

    // Navigate to last item by going backward from first
    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    
    await waitFor(() => {
      const selectedItem = container.querySelector('[aria-selected="true"]');
      expect(selectedItem?.textContent).toContain('Paracetamol 500mg');
    });

    // Navigate forward from last should wrap to first
    fireEvent.keyDown(input, { key: 'Tab' });
    
    await waitFor(() => {
      const selectedItem = container.querySelector('[aria-selected="true"]');
      expect(selectedItem?.textContent).toContain('Aspirin 100mg');
    });
  });
});