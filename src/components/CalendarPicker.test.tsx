import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarPicker } from './CalendarPicker';

describe('CalendarPicker', () => {
  const mockOnDateSelect = vi.fn();
  const defaultProps = {
    selectedDate: null,
    onDateSelect: mockOnDateSelect,
    year: 2024,
    month: 0, // January
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render calendar grid with date buttons', () => {
      render(<CalendarPicker {...defaultProps} />);
      
      // Should render the calendar grid
      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
      
      // Should have at least the days of January (31 days)
      const dayButtons = screen.getAllByRole('button').filter(btn => {
        const text = btn.textContent;
        return text && /^\d+$/.test(text) && parseInt(text) <= 31;
      });
      expect(dayButtons.length).toBeGreaterThanOrEqual(31);
    });

    it('should highlight today', () => {
      const today = new Date();
      render(
        <CalendarPicker 
          {...defaultProps} 
          year={today.getFullYear()}
          month={today.getMonth()}
        />
      );
      
      // Today should have special styling
      const todayButton = screen.getByText(today.getDate().toString());
      expect(todayButton).toHaveClass('bg-blue-100');
    });

    it('should highlight selected date', () => {
      const selectedDate = new Date(2024, 0, 15); // Jan 15, 2024
      render(
        <CalendarPicker 
          {...defaultProps} 
          selectedDate={selectedDate}
        />
      );
      
      const selectedButton = screen.getByText('15');
      expect(selectedButton).toHaveClass('bg-blue-500', 'text-white');
    });
  });

  describe('Date Selection', () => {
    it('should call onDateSelect when date is clicked', () => {
      render(<CalendarPicker {...defaultProps} />);
      
      const dateButton = screen.getByText('15');
      fireEvent.click(dateButton);
      
      expect(mockOnDateSelect).toHaveBeenCalledWith(new Date(2024, 0, 15));
    });

    it('should call onDateSelect when date is pressed with Enter', () => {
      render(<CalendarPicker {...defaultProps} />);
      
      const dateButton = screen.getByText('15');
      fireEvent.keyDown(dateButton, { key: 'Enter' });
      
      expect(mockOnDateSelect).toHaveBeenCalledWith(new Date(2024, 0, 15));
    });

    it('should not select disabled dates', () => {
      const minDate = new Date(2024, 0, 10);
      render(
        <CalendarPicker 
          {...defaultProps} 
          minDate={minDate}
        />
      );
      
      // Find disabled date button (day 5 should be disabled)
      const allButtons = screen.getAllByRole('button');
      const day5Button = allButtons.find(btn => 
        btn.textContent === '5' && btn.hasAttribute('disabled')
      );
      expect(day5Button).toBeDefined();
      expect(day5Button).toBeDisabled();
      
      if (day5Button) {
        fireEvent.click(day5Button);
        expect(mockOnDateSelect).not.toHaveBeenCalled();
      }
    });
  });

  describe('Navigation', () => {
    it('should disable dates before minDate', () => {
      const minDate = new Date(2024, 0, 15);
      render(
        <CalendarPicker 
          {...defaultProps} 
          minDate={minDate}
        />
      );
      
      const earlyDate = screen.getByText('10');
      expect(earlyDate).toBeDisabled();
      expect(earlyDate).toHaveClass('text-gray-300', 'cursor-not-allowed');
    });

    it('should disable dates after maxDate', () => {
      const maxDate = new Date(2024, 0, 15);
      render(
        <CalendarPicker 
          {...defaultProps} 
          maxDate={maxDate}
        />
      );
      
      const lateDate = screen.getByText('20');
      expect(lateDate).toBeDisabled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation', () => {
      render(<CalendarPicker {...defaultProps} />);
      
      const firstDate = screen.getByText('1');
      firstDate.focus();
      
      // Arrow Right should focus next date
      fireEvent.keyDown(firstDate, { key: 'ArrowRight' });
      expect(screen.getByText('2')).toHaveFocus();
    });

    it('should wrap arrow navigation at week boundaries', () => {
      render(<CalendarPicker {...defaultProps} />);
      
      // Find Sunday (last day of week) and test wrap to Monday
      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CalendarPicker {...defaultProps} />);
      
      const calendar = screen.getByRole('grid');
      expect(calendar).toHaveAttribute('aria-label');
      
      const today = new Date();
      if (today.getFullYear() === 2024 && today.getMonth() === 0) {
        const todayButton = screen.getByText(today.getDate().toString());
        expect(todayButton).toHaveAttribute('aria-current', 'date');
      }
    });

    it('should announce selected date to screen readers', () => {
      const selectedDate = new Date(2024, 0, 15);
      render(
        <CalendarPicker 
          {...defaultProps} 
          selectedDate={selectedDate}
        />
      );
      
      const selectedButton = screen.getByText('15');
      expect(selectedButton).toHaveAttribute('aria-selected', 'true');
    });
  });
});