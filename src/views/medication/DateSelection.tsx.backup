import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DateSelectionProps {
  startDate: Date | null;
  discontinueDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onDiscontinueDateChange: (date: Date | null) => void;
  showStartDateCalendar: boolean;
  showDiscontinueDateCalendar: boolean;
  onToggleStartDateCalendar: () => void;
  onToggleDiscontinueDateCalendar: () => void;
  error?: string;
  onCalendarOpen?: (elementId: string) => void;
  onStartDateComplete?: () => void;
  onDiscontinueDateComplete?: () => void;
}

export const DateSelection = observer(({
  startDate,
  discontinueDate,
  onStartDateChange,
  onDiscontinueDateChange,
  showStartDateCalendar,
  showDiscontinueDateCalendar,
  onToggleStartDateCalendar,
  onToggleDiscontinueDateCalendar,
  error,
  onCalendarOpen,
  onStartDateComplete,
  onDiscontinueDateComplete
}: DateSelectionProps) => {
  const startDateRef = useRef<HTMLDivElement>(null);
  const discontinueDateRef = useRef<HTMLDivElement>(null);
  const startDateButtonRef = useRef<HTMLButtonElement>(null);
  const discontinueDateButtonRef = useRef<HTMLButtonElement>(null);
  
  // Calendar state for custom implementation
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempDiscontinueDate, setTempDiscontinueDate] = useState<Date | null>(discontinueDate);
  
  // Reset temp dates when calendars open
  useEffect(() => {
    if (showStartDateCalendar) {
      setTempStartDate(startDate);
    }
  }, [showStartDateCalendar, startDate]);
  
  useEffect(() => {
    if (showDiscontinueDateCalendar) {
      setTempDiscontinueDate(discontinueDate);
    }
  }, [showDiscontinueDateCalendar, discontinueDate]);
  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render custom calendar (A4C-figma style)
  const renderCalendar = (
    year: number,
    month: number,
    onDateSelect: (date: Date | null) => void,
    onClose: () => void,
    calendarTitle: string,
    minDate?: Date,
    onComplete?: () => void,
    selectedDate?: Date | null,
    isStartDateCalendar?: boolean,
    tempSelectedDate?: Date | null,
    setTempSelectedDate?: (date: Date | null) => void
  ) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const today = new Date();
    
    const days = [];
    
    // Always generate exactly 42 cells (6 rows × 7 days) for consistent calendar size
    for (let i = 0; i < 42; i++) {
      if (i < firstDayOfMonth) {
        // Empty cells before the month starts
        days.push(<div key={`empty-before-${i}`} className="w-8 h-8"></div>);
      } else if (i < firstDayOfMonth + daysInMonth) {
        // Days of the current month
        const day = i - firstDayOfMonth + 1;
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const isDisabled = minDate && date < minDate;
        const isSelected = tempSelectedDate && date.toDateString() === tempSelectedDate.toDateString();
        
        days.push(
          <button
            key={day}
            onClick={() => {
              if (!isDisabled && setTempSelectedDate) {
                setTempSelectedDate(date);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isDisabled && setTempSelectedDate) {
                setTempSelectedDate(date);
              }
            }}
            disabled={isDisabled}
            className={`w-8 h-8 rounded-xl transition-all duration-200 ${
              isDisabled 
                ? 'text-gray-300 cursor-not-allowed' 
                : isSelected
                  ? 'bg-blue-500 text-white font-medium'
                  : isToday 
                    ? 'bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 focus:bg-blue-200' 
                    : 'hover:bg-blue-50/80 text-gray-900 hover:bg-gray-100 focus:bg-gray-100'
            } focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:outline-none`}
          >
            {day}
          </button>
        );
      } else {
        // Empty cells after the month ends
        days.push(<div key={`empty-after-${i}`} className="w-8 h-8"></div>);
      }
    }

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-96 animate-in zoom-in-95 duration-200">
          {/* Calendar Title Header */}
          <h3 className="text-lg font-semibold text-center mb-4">{calendarTitle}</h3>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCalendarYear(prev => prev - 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarYear(prev => prev - 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-16 text-center">{year}</span>
                <button 
                  onClick={() => setCalendarYear(prev => prev + 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarYear(prev => prev + 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCalendarMonth(prev => prev === 0 ? 11 : prev - 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarMonth(prev => prev === 0 ? 11 : prev - 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-24 text-center">
                  {new Date(year, month).toLocaleString('default', { month: 'long' })}
                </span>
                <button 
                  onClick={() => setCalendarMonth(prev => prev === 11 ? 0 : prev + 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarMonth(prev => prev === 11 ? 0 : prev + 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-6">
            {days}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Skip - Clear the date field
                onDateSelect(null);
                onClose();
                if (onComplete) {
                  setTimeout(() => onComplete(), 50);
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Skip
            </button>
            <button
              onClick={() => {
                // Cancel - Just close without changes
                onClose();
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Done - Apply the selected date
                if (tempSelectedDate) {
                  onDateSelect(tempSelectedDate);
                  if (onComplete) {
                    setTimeout(() => onComplete(), 50);
                  }
                }
                onClose();
              }}
              className="flex-1 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Medication Dates</Label>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="relative" ref={startDateRef} id="start-date-container">
          <Label htmlFor="start-date" className="text-sm text-gray-600">
            Start Date
          </Label>
          <Button
            id="start-date"
            ref={startDateButtonRef}
            type="button"
            variant={startDate ? 'default' : 'outline'}
            className="w-full justify-between mt-1"
            onClick={() => {
              onToggleStartDateCalendar();
              onCalendarOpen?.('start-date-container');
            }}
            onFocus={() => {
              // Auto-open calendar when button receives focus
              if (!showStartDateCalendar) {
                onToggleStartDateCalendar();
                onCalendarOpen?.('start-date-container');
              }
            }}
          >
            <span>{formatDate(startDate)}</span>
            <CalendarIcon size={20} />
          </Button>
          
          {/* Render custom calendar modal */}
        </div>

        <div className="relative" ref={discontinueDateRef} id="discontinue-date-container">
          <Label htmlFor="discontinue-date" className="text-sm text-gray-600">
            Discontinue Date (Optional)
          </Label>
          <Button
            id="discontinue-date"
            ref={discontinueDateButtonRef}
            type="button"
            variant={discontinueDate ? 'default' : 'outline'}
            className="w-full justify-between mt-1"
            onClick={() => {
              onToggleDiscontinueDateCalendar();
              onCalendarOpen?.('discontinue-date-container');
            }}
            onFocus={() => {
              // Auto-open calendar when button receives focus
              if (!showDiscontinueDateCalendar) {
                onToggleDiscontinueDateCalendar();
                onCalendarOpen?.('discontinue-date-container');
              }
            }}
          >
            <span>{formatDate(discontinueDate)}</span>
            <CalendarIcon size={20} />
          </Button>
          
          {/* Render custom calendar modal for discontinue date */}
          
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
      
      {/* Render calendar modals outside of the grid */}
      {showStartDateCalendar && renderCalendar(
        calendarYear,
        calendarMonth,
        (date) => {
          onStartDateChange(date);
        },
        onToggleStartDateCalendar,
        "Start Date",
        undefined,
        onStartDateComplete,
        startDate,
        true,
        tempStartDate,
        setTempStartDate
      )}
      
      {showDiscontinueDateCalendar && renderCalendar(
        calendarYear,
        calendarMonth,
        (date) => {
          onDiscontinueDateChange(date);
        },
        onToggleDiscontinueDateCalendar,
        "Discontinuation Date",
        startDate || undefined,
        onDiscontinueDateComplete,
        discontinueDate,
        false,
        tempDiscontinueDate,
        setTempDiscontinueDate
      )}
    </div>
  );
});