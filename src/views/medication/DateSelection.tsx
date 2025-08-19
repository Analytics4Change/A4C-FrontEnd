import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import * as Dialog from '@radix-ui/react-dialog';
import { FocusableField } from '@/components/FocusableField';
import { ManagedDialog, ManagedDialogClose } from '@/components/focus/ManagedDialog';
import { CalendarPicker } from '@/components/CalendarPicker';

interface DateSelectionProps {
  startDate: Date | null;
  discontinueDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onDiscontinueDateChange: (date: Date | null) => void;
  error?: string;
  onStartDateComplete?: () => void;
  onDiscontinueDateComplete?: () => void;
}

export const DateSelection = observer(({
  startDate,
  discontinueDate,
  onStartDateChange,
  onDiscontinueDateChange,
  error,
  onStartDateComplete,
  onDiscontinueDateComplete
}: DateSelectionProps) => {
  // Calendar state for navigation
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  
  // Temp date state management (preserved from original)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempDiscontinueDate, setTempDiscontinueDate] = useState<Date | null>(discontinueDate);

  // Format date for display (preserved function)
  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calendar action handlers (preserving Skip/Cancel/Done functionality)
  const handleStartDateSkip = () => {
    onStartDateChange(null);
    onStartDateComplete?.();
  };

  const handleStartDateDone = () => {
    onStartDateChange(tempStartDate);
    onStartDateComplete?.();
  };

  const handleDiscontinueDateSkip = () => {
    onDiscontinueDateChange(null);
    onDiscontinueDateComplete?.();
  };

  const handleDiscontinueDateDone = () => {
    onDiscontinueDateChange(tempDiscontinueDate);
    onDiscontinueDateComplete?.();
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Medication Dates</Label>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date Field */}
        <FocusableField
          id="start-date"
          order={13}
          scope="medication-entry"
          validators={{
            canLeaveFocus: () => true // Always can leave, field is optional
          }}
        >
          <div className="relative">
            <Label htmlFor="start-date" className="text-sm text-gray-600">
              Start Date
            </Label>
            <ManagedDialog
              id="start-date-calendar"
              focusRestorationId="discontinue-date"
              onOpenChange={(open) => {
                if (open) {
                  setTempStartDate(startDate);
                  // Set calendar to current date or selected date
                  const dateToShow = startDate || new Date();
                  setCalendarYear(dateToShow.getFullYear());
                  setCalendarMonth(dateToShow.getMonth());
                }
              }}
              trigger={
                <Button
                  id="start-date"
                  type="button"
                  variant={startDate ? 'default' : 'outline'}
                  className="w-full justify-between mt-1"
                >
                  <span>{formatDate(startDate)}</span>
                  <CalendarIcon size={20} />
                </Button>
              }
            >
              <Dialog.Title className="text-lg font-semibold text-center mb-4">
                Select Start Date
              </Dialog.Title>
              
              <CalendarPicker
                selectedDate={tempStartDate}
                onDateSelect={setTempStartDate}
                year={calendarYear}
                month={calendarMonth}
                maxDate={new Date()} // Can't select future dates
                onYearChange={setCalendarYear}
                onMonthChange={setCalendarMonth}
              />
              
              <div className="flex gap-3 mt-6">
                <ManagedDialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleStartDateSkip}
                  >
                    Skip
                  </Button>
                </ManagedDialogClose>
                
                <ManagedDialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </ManagedDialogClose>
                
                <ManagedDialogClose asChild>
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleStartDateDone}
                  >
                    Done
                  </Button>
                </ManagedDialogClose>
              </div>
            </ManagedDialog>
          </div>
        </FocusableField>

        {/* Discontinue Date Field */}
        <FocusableField
          id="discontinue-date"
          order={14}
          scope="medication-entry"
          validators={{
            canReceiveFocus: () => true, // Optional field, always can receive focus
            canLeaveFocus: () => true
          }}
        >
          <div className="relative">
            <Label htmlFor="discontinue-date" className="text-sm text-gray-600">
              Discontinue Date (Optional)
            </Label>
            <ManagedDialog
              id="discontinue-date-calendar"
              focusRestorationId="save-button"
              onOpenChange={(open) => {
                if (open) {
                  setTempDiscontinueDate(discontinueDate);
                  // Set calendar to current date, selected date, or start date
                  const dateToShow = discontinueDate || startDate || new Date();
                  setCalendarYear(dateToShow.getFullYear());
                  setCalendarMonth(dateToShow.getMonth());
                }
              }}
              trigger={
                <Button
                  id="discontinue-date"
                  type="button"
                  variant={discontinueDate ? 'default' : 'outline'}
                  className="w-full justify-between mt-1"
                >
                  <span>{formatDate(discontinueDate)}</span>
                  <CalendarIcon size={20} />
                </Button>
              }
            >
              <Dialog.Title className="text-lg font-semibold text-center mb-4">
                Select Discontinuation Date
              </Dialog.Title>
              
              <CalendarPicker
                selectedDate={tempDiscontinueDate}
                onDateSelect={setTempDiscontinueDate}
                year={calendarYear}
                month={calendarMonth}
                minDate={startDate || undefined} // Must be after start date
                onYearChange={setCalendarYear}
                onMonthChange={setCalendarMonth}
              />
              
              <div className="flex gap-3 mt-6">
                <ManagedDialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDiscontinueDateSkip}
                  >
                    Skip
                  </Button>
                </ManagedDialogClose>
                
                <ManagedDialogClose asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </ManagedDialogClose>
                
                <ManagedDialogClose asChild>
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleDiscontinueDateDone}
                  >
                    Done
                  </Button>
                </ManagedDialogClose>
              </div>
            </ManagedDialog>
            
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        </FocusableField>
      </div>
    </div>
  );
});