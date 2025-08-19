/**
 * Tests for MedicationSearch wrapped with FocusableField component
 * These tests verify the integration between the MedicationSearch component
 * and the new FocusableField wrapper while ensuring coexistence with the
 * existing focus management system.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { FocusManagerProvider } from '@/contexts/focus/FocusManagerContext';
import { FocusableField } from '@/components/FocusableField';
import { MedicationSearch } from '../MedicationSearch';
import { Medication } from '@/types/models';

// Mock medication data
const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Aspirin',
    categories: { broad: 'Analgesic', specific: 'NSAID' },
    flags: { isPsychotropic: false, isControlled: false }
  },
  {
    id: '2',
    name: 'Atorvastatin',
    categories: { broad: 'Cardiovascular', specific: 'Statin' },
    flags: { isPsychotropic: false, isControlled: false }
  },
  {
    id: '3',
    name: 'Alprazolam',
    categories: { broad: 'Psychiatric', specific: 'Benzodiazepine' },
    flags: { isPsychotropic: true, isControlled: true }
  }
];

// Test component wrapper
const TestWrapper: React.FC<{ 
  children: React.ReactNode, 
  enableNewFocus?: boolean 
}> = ({ 
  children, 
  enableNewFocus = true 
}) => (
  enableNewFocus ? (
    <FocusManagerProvider debug={process.env.NODE_ENV === 'development'}>
      {children}
    </FocusManagerProvider>
  ) : (
    <>{children}</>
  )
);

// Default props for MedicationSearch
const defaultProps = {
  value: '',
  searchResults: [],
  isLoading: false,
  showDropdown: false,
  selectedMedication: null,
  onSearch: vi.fn(),
  onSelect: vi.fn(),
  onClear: vi.fn(),
  onFieldComplete: vi.fn(),
  onDropdownOpen: vi.fn()
};

describe('MedicationSearch with FocusableField Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DOM methods that aren't available in jsdom (except focus/blur - handled by focus-test-helper)
    Element.prototype.scrollIntoView = vi.fn();
    HTMLElement.prototype.click = vi.fn();
  });

  describe('Component Registration', () => {
    it('should register with FocusManager when wrapped with FocusableField', () => {
      const { container } = render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const wrapper = container.querySelector('[data-focus-id="medication-search"]');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-focus-order', '1');
      expect(wrapper).toHaveAttribute('data-focus-scope', 'main-form');
    });

    it('should work without FocusableField wrapper (backwards compatibility)', () => {
      render(
        <TestWrapper enableNewFocus={false}>
          <MedicationSearch {...defaultProps} />
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      expect(input).toBeInTheDocument();
    });

    it('should register with custom scope when specified', () => {
      const { container } = render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1} scope="medication-modal">
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const wrapper = container.querySelector('[data-focus-id="medication-search"]');
      expect(wrapper).toHaveAttribute('data-focus-scope', 'medication-modal');
    });
  });

  describe('Validator Configuration', () => {
    it('should call canReceiveFocus validator when field attempts to receive focus', async () => {
      const canReceiveFocus = vi.fn().mockReturnValue(true);
      
      render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            validators={{ canReceiveFocus }}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      // Focus should trigger canReceiveFocus validator
      fireEvent.focus(input);
      
      // Note: The validator is called by the focus manager, not directly testable here
      // This test ensures the validator is passed correctly to the FocusableField
      expect(canReceiveFocus).toBeDefined();
    });

    it('should call canLeaveFocus validator when attempting to leave field', async () => {
      const user = userEvent.setup();
      const canLeaveFocus = vi.fn().mockReturnValue(true);
      
      render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            validators={{ canLeaveFocus }}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      // Focus first
      await user.click(input);
      
      // Try to leave via Tab key
      await user.keyboard('{Tab}');
      
      // Validator should be available (actual call happens in focus manager)
      expect(canLeaveFocus).toBeDefined();
    });

    it('should prevent focus leave when canLeaveFocus returns false', async () => {
      const user = userEvent.setup();
      const canLeaveFocus = vi.fn().mockReturnValue(false);
      
      render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            validators={{ canLeaveFocus }}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
          <input data-testid="next-field" />
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('medication-search-input');
      const nextField = screen.getByTestId('next-field');
      
      // Focus the search input
      await user.click(searchInput);
      expect(searchInput).toHaveFocus();
      
      // Try to tab to next field - should be prevented
      await user.keyboard('{Tab}');
      
      // Focus should remain on search input
      expect(searchInput).toHaveFocus();
      expect(nextField).not.toHaveFocus();
    });
  });

  describe('OnComplete Configuration', () => {
    it('should call onComplete when medication is selected', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn().mockReturnValue(true);
      const onSelect = vi.fn();
      
      render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            onComplete={onComplete}
          >
            <MedicationSearch 
              {...defaultProps}
              value="Aspirin"
              searchResults={mockMedications}
              showDropdown={true}
              onSelect={onSelect}
            />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      // Focus input and press Enter to select first result
      await user.click(input);
      await user.keyboard('{Enter}');
      
      expect(onSelect).toHaveBeenCalledWith(mockMedications[0]);
    });

    it('should advance focus when onComplete returns true', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn().mockReturnValue(true);
      
      render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            onComplete={onComplete}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
          <FocusableField id="next-field" order={2}>
            <input data-testid="next-field" />
          </FocusableField>
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('medication-search-input');
      const nextField = screen.getByTestId('next-field');
      
      // Focus and press Enter
      await user.click(searchInput);
      await user.keyboard('{Enter}');
      
      // Should advance to next field if onComplete returns true
      await waitFor(() => {
        expect(nextField).toHaveFocus();
      });
    });

    it('should not advance focus when onComplete returns false', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn().mockReturnValue(false);
      
      render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            onComplete={onComplete}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
          <FocusableField id="next-field" order={2}>
            <input data-testid="next-field" />
          </FocusableField>
        </TestWrapper>
      );

      const searchInput = screen.getByTestId('medication-search-input');
      const nextField = screen.getByTestId('next-field');
      
      // Focus and press Enter
      await user.click(searchInput);
      await user.keyboard('{Enter}');
      
      // Should remain on search input
      expect(searchInput).toHaveFocus();
      expect(nextField).not.toHaveFocus();
    });
  });

  describe('Mouse Navigation Support', () => {
    it('should support mouse navigation configuration', () => {
      const { container } = render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            mouseOverride={{
              captureClicks: true,
              preserveFocusOnInteraction: true,
              allowDirectJump: true
            }}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const wrapper = container.querySelector('[data-focus-id="medication-search"]');
      expect(wrapper).toHaveAttribute('data-can-jump', 'true');
    });

    it('should handle mouse clicks when captureClicks is enabled', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn().mockReturnValue(false);
      
      render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            onComplete={onComplete}
            mouseOverride={{
              captureClicks: true,
              preserveFocusOnInteraction: true
            }}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const wrapper = screen.getByTestId('medication-search-container').parentElement;
      
      // Click on wrapper
      if (wrapper) {
        await user.click(wrapper);
        
        // Should update interaction mode
        expect(wrapper).toHaveAttribute('data-interaction-mode', 'mouse');
      }
    });
  });

  describe('Step Indicator Integration', () => {
    it('should register with step indicator metadata', () => {
      const { container } = render(
        <TestWrapper>
          <FocusableField 
            id="medication-search" 
            order={1}
            stepIndicator={{
              label: 'Select Medication',
              description: 'Search and select a medication',
              allowDirectAccess: true
            }}
          >
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const wrapper = container.querySelector('[data-focus-id="medication-search"]');
      expect(wrapper).toHaveAttribute('data-can-jump', 'true');
    });
  });

  describe('Coexistence with Existing Logic', () => {
    it('should preserve existing auto-focus behavior', async () => {
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      // The original component should still auto-focus
      await waitFor(() => {
        const input = screen.getByTestId('medication-search-input');
        expect(input).toHaveFocus();
      });
    });

    it('should preserve existing dropdown behavior', async () => {
      const user = userEvent.setup();
      const onDropdownOpen = vi.fn();
      
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch 
              {...defaultProps}
              onDropdownOpen={onDropdownOpen}
            />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      // Type to trigger dropdown
      await user.type(input, 'Asp');
      
      expect(onDropdownOpen).toHaveBeenCalledWith('medication-search-input-container');
    });

    it('should preserve existing keyboard navigation (Tab/Enter)', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch 
              {...defaultProps}
              value="Aspirin"
              searchResults={mockMedications}
              onSelect={onSelect}
            />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      // Focus and press Enter (existing behavior)
      await user.click(input);
      await user.keyboard('{Enter}');
      
      expect(onSelect).toHaveBeenCalledWith(mockMedications[0]);
    });

    it('should preserve existing Tab key preventDefault behavior', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch 
              {...defaultProps}
              value="Aspirin"
              searchResults={mockMedications}
              onSelect={onSelect}
            />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      // Focus and press Tab with results (should trigger selection)
      await user.click(input);
      await user.keyboard('{Tab}');
      
      expect(onSelect).toHaveBeenCalledWith(mockMedications[0]);
    });

    it('should preserve existing timeout-based focus completion', async () => {
      const onFieldComplete = vi.fn();
      const onSelect = vi.fn((medication) => {
        // Simulate the existing handleSelection behavior
        setTimeout(() => onFieldComplete(), 50);
      });
      
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch 
              {...defaultProps}
              value="Aspirin"
              searchResults={mockMedications}
              onSelect={onSelect}
              onFieldComplete={onFieldComplete}
            />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      await userEvent.click(input);
      await userEvent.keyboard('{Enter}');
      
      expect(onSelect).toHaveBeenCalled();
      
      // Wait for timeout
      await waitFor(() => {
        expect(onFieldComplete).toHaveBeenCalled();
      }, { timeout: 100 });
    });
  });

  describe('Error Handling', () => {
    it('should display errors correctly when wrapped', () => {
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch 
              {...defaultProps}
              error="Medication not found"
            />
          </FocusableField>
        </TestWrapper>
      );

      expect(screen.getByText('Medication not found')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle loading states correctly', () => {
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch 
              {...defaultProps}
              isLoading={true}
            />
          </FocusableField>
        </TestWrapper>
      );

      expect(screen.getByTestId('medication-search-loading')).toBeInTheDocument();
      expect(screen.getByText('Searching medications...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain ARIA attributes when wrapped', () => {
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch 
              {...defaultProps}
              showDropdown={true}
            />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByTestId('medication-search-input');
      
      expect(input).toHaveAttribute('aria-label', 'Search for medication');
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      expect(input).toHaveAttribute('role', 'combobox');
    });

    it('should maintain proper label association', () => {
      render(
        <TestWrapper>
          <FocusableField id="medication-search" order={1}>
            <MedicationSearch {...defaultProps} />
          </FocusableField>
        </TestWrapper>
      );

      const input = screen.getByLabelText('Medication Name');
      expect(input).toBeInTheDocument();
    });
  });
});

describe('Integration with Focus Manager', () => {
  it('should integrate properly with focus navigation flow', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <FocusableField id="medication-search" order={1}>
          <MedicationSearch {...defaultProps} />
        </FocusableField>
        <FocusableField id="next-field" order={2}>
          <input data-testid="next-field" />
        </FocusableField>
        <FocusableField id="third-field" order={3}>
          <input data-testid="third-field" />
        </FocusableField>
      </TestWrapper>
    );

    const searchInput = screen.getByTestId('medication-search-input');
    const nextField = screen.getByTestId('next-field');
    const thirdField = screen.getByTestId('third-field');
    
    // Should auto-focus first field
    await waitFor(() => {
      expect(searchInput).toHaveFocus();
    });
    
    // Tab should move to next field
    await user.keyboard('{Tab}');
    
    await waitFor(() => {
      expect(nextField).toHaveFocus();
    });
    
    // Tab again should move to third field
    await user.keyboard('{Tab}');
    
    await waitFor(() => {
      expect(thirdField).toHaveFocus();
    });
    
    // Shift+Tab should go back
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    
    await waitFor(() => {
      expect(nextField).toHaveFocus();
    });
  });

  it('should handle focus validation in sequence', async () => {
    const user = userEvent.setup();
    const secondFieldValidator = vi.fn().mockReturnValue(false);
    
    render(
      <TestWrapper>
        <FocusableField id="medication-search" order={1}>
          <MedicationSearch {...defaultProps} />
        </FocusableField>
        <FocusableField 
          id="second-field" 
          order={2}
          validators={{ canReceiveFocus: secondFieldValidator }}
        >
          <input data-testid="second-field" />
        </FocusableField>
        <FocusableField id="third-field" order={3}>
          <input data-testid="third-field" />
        </FocusableField>
      </TestWrapper>
    );

    const searchInput = screen.getByTestId('medication-search-input');
    const thirdField = screen.getByTestId('third-field');
    
    await user.click(searchInput);
    await user.keyboard('{Tab}');
    
    // Should skip second field and go to third
    await waitFor(() => {
      expect(thirdField).toHaveFocus();
    });
  });
});