import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  year: number;
  month: number;
  minDate?: Date;
  maxDate?: Date;
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
  className?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateSelect,
  year,
  month,
  minDate,
  maxDate,
  onYearChange,
  onMonthChange,
  className = ''
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();

  // Generate calendar cells (always 42 for consistent layout)
  const generateCalendarCells = () => {
    const cells = [];
    
    // Calculate previous month info for padding
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    // Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      cells.push(
        <div 
          key={`prev-${day}`} 
          className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm"
        >
          {day}
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
      
      cells.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && onDateSelect(date)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isDisabled) {
              onDateSelect(date);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              focusNextDate(e.currentTarget);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              focusPrevDate(e.currentTarget);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              focusDateBelow(e.currentTarget);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              focusDateAbove(e.currentTarget);
            }
          }}
          disabled={isDisabled}
          aria-current={isToday ? 'date' : undefined}
          aria-selected={isSelected}
          aria-label={`${date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}${isSelected ? ', selected' : ''}${isToday ? ', today' : ''}`}
          className={`w-8 h-8 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:outline-none ${
            isDisabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : isSelected
                ? 'bg-blue-500 text-white font-medium'
                : isToday 
                  ? 'bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 focus:bg-blue-200' 
                  : 'hover:bg-blue-50/80 text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    
    // Next month leading days to fill grid
    const totalCells = 42;
    const remainingCells = totalCells - cells.length;
    for (let day = 1; day <= remainingCells; day++) {
      cells.push(
        <div 
          key={`next-${day}`} 
          className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm"
        >
          {day}
        </div>
      );
    }
    
    return cells;
  };

  // Keyboard navigation helpers
  const focusNextDate = (current: HTMLElement) => {
    const allButtons = gridRef.current?.querySelectorAll('button:not(:disabled)');
    if (!allButtons) return;
    
    const currentIndex = Array.from(allButtons).indexOf(current);
    const nextIndex = (currentIndex + 1) % allButtons.length;
    (allButtons[nextIndex] as HTMLElement).focus();
  };

  const focusPrevDate = (current: HTMLElement) => {
    const allButtons = gridRef.current?.querySelectorAll('button:not(:disabled)');
    if (!allButtons) return;
    
    const currentIndex = Array.from(allButtons).indexOf(current);
    const prevIndex = currentIndex === 0 ? allButtons.length - 1 : currentIndex - 1;
    (allButtons[prevIndex] as HTMLElement).focus();
  };

  const focusDateBelow = (current: HTMLElement) => {
    const allButtons = gridRef.current?.querySelectorAll('button:not(:disabled)');
    if (!allButtons) return;
    
    const currentIndex = Array.from(allButtons).indexOf(current);
    const belowIndex = currentIndex + 7;
    if (belowIndex < allButtons.length) {
      (allButtons[belowIndex] as HTMLElement).focus();
    }
  };

  const focusDateAbove = (current: HTMLElement) => {
    const allButtons = gridRef.current?.querySelectorAll('button:not(:disabled)');
    if (!allButtons) return;
    
    const currentIndex = Array.from(allButtons).indexOf(current);
    const aboveIndex = currentIndex - 7;
    if (aboveIndex >= 0) {
      (allButtons[aboveIndex] as HTMLElement).focus();
    }
  };

  // Auto-focus selected date or today when calendar opens
  useEffect(() => {
    const targetDate = selectedDate || (
      year === today.getFullYear() && month === today.getMonth() ? today : null
    );
    
    if (targetDate && gridRef.current) {
      const day = targetDate.getDate();
      const button = gridRef.current.querySelector(`button[aria-label*="${day}"]`) as HTMLElement;
      if (button && !button.disabled) {
        requestAnimationFrame(() => button.focus());
      }
    }
  }, [selectedDate, year, month, today]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Month/Year Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => onYearChange?.(year - 1)}
            onKeyDown={(e) => e.key === 'Enter' && onYearChange?.(year - 1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-medium w-16 text-center">{year}</span>
          <button 
            type="button"
            onClick={() => onYearChange?.(year + 1)}
            onKeyDown={(e) => e.key === 'Enter' && onYearChange?.(year + 1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
            aria-label="Next year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => onMonthChange?.(month === 0 ? 11 : month - 1)}
            onKeyDown={(e) => e.key === 'Enter' && onMonthChange?.(month === 0 ? 11 : month - 1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-medium w-24 text-center">
            {new Date(year, month).toLocaleString('default', { month: 'long' })}
          </span>
          <button 
            type="button"
            onClick={() => onMonthChange?.(month === 11 ? 0 : month + 1)}
            onKeyDown={(e) => e.key === 'Enter' && onMonthChange?.(month === 11 ? 0 : month + 1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div 
              key={index} 
              className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Date grid */}
        <div 
          ref={gridRef}
          role="grid"
          aria-label={`Calendar for ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`}
          className="grid grid-cols-7 gap-1"
        >
          {generateCalendarCells()}
        </div>
      </div>
    </div>
  );
};