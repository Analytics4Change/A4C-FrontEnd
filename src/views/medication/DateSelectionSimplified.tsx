import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface DateSelectionProps {
  startDate: string;
  discontinueDate: string;
  onStartDateChange: (date: string) => void;
  onDiscontinueDateChange: (date: string) => void;
  showStartDateCalendar: boolean;
  showDiscontinueDateCalendar: boolean;
  onToggleStartDateCalendar: () => void;
  onToggleDiscontinueDateCalendar: () => void;
  error?: string;
  onCalendarOpen?: (elementId: string) => void;
}

export const DateSelection: React.FC<DateSelectionProps> = ({
  startDate,
  discontinueDate,
  onStartDateChange,
  onDiscontinueDateChange,
  showStartDateCalendar,
  showDiscontinueDateCalendar,
  onToggleStartDateCalendar,
  onToggleDiscontinueDateCalendar,
  error,
  onCalendarOpen
}) => {
  const handleDateSelect = (date: Date | null, isStartDate: boolean) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      if (isStartDate) {
        onStartDateChange(formattedDate);
        onToggleStartDateCalendar();
      } else {
        onDiscontinueDateChange(formattedDate);
        onToggleDiscontinueDateCalendar();
      }
    }
  };

  const handleStartDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStartDateChange(e.target.value);
  };

  const handleDiscontinueDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDiscontinueDateChange(e.target.value);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2 relative">
        <Label htmlFor="start-date" className="text-sm font-medium">
          Start Date
        </Label>
        <div className="relative">
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateInputChange}
            onClick={() => {
              onToggleStartDateCalendar();
              if (!showStartDateCalendar && onCalendarOpen) {
                onCalendarOpen('start-date-calendar');
              }
            }}
            className="cursor-pointer"
            aria-label="Start date"
            aria-describedby="start-date-format"
          />
        </div>
        <span id="start-date-format" className="text-xs text-gray-500">
          YYYY-MM-DD
        </span>
        
        {showStartDateCalendar && (
          <div 
            id="start-date-calendar"
            data-modal-id="start-date-calendar"
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4 border"
            role="dialog"
            aria-modal="true"
            aria-label="Start date calendar"
          >
            <div className="mb-2 font-medium text-sm">Select Start Date</div>
            <CalendarComponent
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date: Date | undefined) => handleDateSelect(date || null, true)}
              mode="single"
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleStartDateCalendar}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="discontinue-date" className="text-sm font-medium">
          Discontinue Date (Optional)
        </Label>
        <div className="relative">
          <Input
            id="discontinue-date"
            type="date"
            value={discontinueDate}
            onChange={handleDiscontinueDateInputChange}
            onClick={() => {
              onToggleDiscontinueDateCalendar();
              if (!showDiscontinueDateCalendar && onCalendarOpen) {
                onCalendarOpen('discontinue-date-calendar');
              }
            }}
            className={`cursor-pointer ${error ? 'border-red-500' : ''}`}
            aria-label="Discontinue date"
            aria-describedby={error ? 'discontinue-date-error' : 'discontinue-date-format'}
            aria-invalid={!!error}
          />
        </div>
        
        {error ? (
          <div id="discontinue-date-error" className="flex items-center gap-1 text-red-600 text-xs">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        ) : (
          <span id="discontinue-date-format" className="text-xs text-gray-500">
            YYYY-MM-DD
          </span>
        )}
        
        {showDiscontinueDateCalendar && (
          <div 
            id="discontinue-date-calendar"
            data-modal-id="discontinue-date-calendar"
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-50 p-4 border"
            role="dialog"
            aria-modal="true"
            aria-label="Discontinue date calendar"
          >
            <div className="mb-2 font-medium text-sm">Select Discontinue Date</div>
            <CalendarComponent
              selected={discontinueDate ? new Date(discontinueDate) : undefined}
              onSelect={(date: Date | undefined) => handleDateSelect(date || null, false)}
              fromDate={startDate ? new Date(startDate) : undefined}
              mode="single"
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDiscontinueDateCalendar}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};