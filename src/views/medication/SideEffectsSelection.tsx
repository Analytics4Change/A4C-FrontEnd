import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { ChevronDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
// Removed FocusableField - using simplified approach
import * as Dialog from '@radix-ui/react-dialog';

interface SideEffectsSelectionProps {
  selectedEffects: string[];
  onEffectsChange: (effects: string[]) => void;
  error?: string;
}

const predefinedSideEffects = [
  'Nausea',
  'Dizziness',
  'Headache',
  'Fatigue',
  'Dry mouth',
  'Insomnia',
  'Weight gain',
  'Weight loss',
  'Anxiety',
  'Drowsiness'
];

export const SideEffectsSelection = observer(({
  selectedEffects,
  onEffectsChange,
  error
}: SideEffectsSelectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [customEffect, setCustomEffect] = useState('');

  // Filter side effects based on search term
  const filteredEffects = useMemo(() => {
    if (!searchTerm) return predefinedSideEffects;
    return predefinedSideEffects.filter(effect =>
      effect.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Handle toggling predefined side effects
  const handleToggleEffect = (effect: string) => {
    if (selectedEffects.includes(effect)) {
      onEffectsChange(selectedEffects.filter(e => e !== effect));
    } else {
      onEffectsChange([...selectedEffects, effect]);
    }
  };

  // Handle adding custom side effect
  const handleAddCustomEffect = () => {
    const trimmedEffect = customEffect.trim();
    if (trimmedEffect && !selectedEffects.includes(trimmedEffect)) {
      onEffectsChange([...selectedEffects, trimmedEffect]);
      setCustomEffect('');
      setShowOtherModal(false);
    }
  };

  // Handle "Other" checkbox click
  const handleOtherClick = () => {
    setShowOtherModal(true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Get display text for button
  const getButtonText = () => {
    if (selectedEffects.length === 0) {
      return 'Select Side Effects';
    }
    return `${selectedEffects.length} Side Effects`;
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-base font-medium">Side Effects</Label>
        
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button
              id="side-effects-button"
              type="button"
              variant={selectedEffects.length > 0 ? 'default' : 'outline'}
              className="w-full justify-between"
            >
              <span>{getButtonText()}</span>
              <ChevronDown size={20} />
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full">
              <Dialog.Title className="text-lg font-semibold mb-4">Side Effects Selection</Dialog.Title>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search side effects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </Button>
              )}
            </div>

            {/* Side Effects List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredEffects.map((effect) => (
                <label
                  key={effect}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <Checkbox
                    checked={selectedEffects.includes(effect)}
                    onCheckedChange={() => handleToggleEffect(effect)}
                    aria-label={effect}
                  />
                  <span>{effect}</span>
                </label>
              ))}
              
              {/* Other Option */}
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <Checkbox
                  checked={false}
                  onCheckedChange={handleOtherClick}
                  aria-label="Other"
                />
                <span>Other</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button>Done</Button>
              </Dialog.Close>
            </div>
          </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Nested "Other" Modal */}
      <Dialog.Root open={showOtherModal} onOpenChange={setShowOtherModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-semibold mb-4">Add Custom Side Effect</Dialog.Title>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter custom side effect..."
            value={customEffect}
            onChange={(e) => setCustomEffect(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomEffect();
              }
            }}
          />
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowOtherModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomEffect}
              disabled={!customEffect.trim()}
            >
              Add
            </Button>
          </div>
        </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});