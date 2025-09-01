import React, { useState, useEffect, useRef } from 'react';
import { ClientSelector } from '@/views/client/ClientSelector';
// Use the refactored modal with simplified focus
import { MedicationEntryModal } from '@/views/medication/MedicationEntryModalRefactored';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Plus, Pill } from 'lucide-react';
import { DebugControlPanel } from '@/components/debug/DebugControlPanel';
import './index.css';

// Development utilities removed - using simplified components

function App() {
  // Clean mount effect
  useEffect(() => {
    // App initialization
  }, []);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showMedicationTypeSelection, setShowMedicationTypeSelection] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleAddMedication = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMedicationTypeSelection(!showMedicationTypeSelection);
    if (!showMedicationTypeSelection) {
      setFocusedIndex(0); // Reset to first item when opening
    }
  };

  const handleMedicationType = (type: string) => {
    if (type === 'Prescribed Medication') {
      setShowMedicationModal(true);
      setShowMedicationTypeSelection(false);
    }
    setShowMedicationTypeSelection(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const options = ['Prescribed Medication', 'Over-the-Counter', 'Supplement'];
    
    switch(e.key) {
      case 'Escape':
        e.preventDefault();
        setShowMedicationTypeSelection(false);
        document.getElementById('add-medication-button')?.focus();
        break;
        
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : 2);
        } else {
          setFocusedIndex(prev => prev < 2 ? prev + 1 : 0);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => prev < 2 ? prev + 1 : 0);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : 2);
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleMedicationType(options[focusedIndex]);
        break;
    }
  };

  // Click outside handler
  useEffect(() => {
    if (showMedicationTypeSelection) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-testid="select-medication-type-dropdown"]')) {
          setShowMedicationTypeSelection(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMedicationTypeSelection]);

  return (
    <>
      {/* Debug Control Panel */}
      <DebugControlPanel />
      
      {!selectedClientId ? (
        <ClientSelector onClientSelect={handleClientSelect} />
      ) : (
      <div className="min-h-screen bg-gray-50" data-testid="app-container">
        <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Medication Management</h1>
          <p className="text-gray-600 mt-2" data-testid="selected-client-id">Client ID: {selectedClientId}</p>
        </div>

        <Card data-testid="medications-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Current Medications
            </CardTitle>
            <CardAction className="relative">
              <Button 
                id="add-medication-button"
                onClick={handleAddMedication}
                data-testid="add-medication-button"
                aria-label="Add new medication"
                aria-expanded={showMedicationTypeSelection}
                aria-haspopup="menu"
                aria-controls="medication-type-menu"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
              
              {showMedicationTypeSelection && (
                <div 
                  ref={dropdownRef}
                  id="medication-type-menu"
                  className="absolute top-full mt-2 right-0 z-50 min-w-[240px]"
                  role="menu"
                  aria-labelledby="add-medication-button"
                  aria-orientation="vertical"
                  data-testid="select-medication-type-dropdown"
                  data-modal-id="select-medication-type"
                  onKeyDown={handleKeyDown}
                >
                  <Card className="shadow-lg border">
                    <CardContent className="p-1">
                      <Button
                        id="menu-item-prescribed"
                        role="menuitem"
                        variant="ghost"
                        className={`w-full justify-start ${
                          focusedIndex === 0 ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        }`}
                        onClick={() => handleMedicationType('Prescribed Medication')}
                        data-testid="prescribed-medication-button"
                        tabIndex={focusedIndex === 0 ? 0 : -1}
                        ref={focusedIndex === 0 ? (el) => el?.focus() : undefined}
                        aria-selected={focusedIndex === 0}
                        aria-disabled="false"
                        aria-label="Add prescribed medication"
                      >
                        <Pill className="h-4 w-4 mr-2" />
                        Prescribed Medication
                      </Button>
                      
                      <Button
                        id="menu-item-otc"
                        role="menuitem"
                        variant="ghost"
                        className={`w-full justify-start ${
                          focusedIndex === 1 ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        }`}
                        onClick={() => handleMedicationType('Over-the-Counter')}
                        data-testid="otc-medication-button"
                        tabIndex={focusedIndex === 1 ? 0 : -1}
                        ref={focusedIndex === 1 ? (el) => el?.focus() : undefined}
                        aria-selected={focusedIndex === 1}
                        aria-disabled="false"
                        aria-label="Add over-the-counter medication"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Over-the-Counter Medication
                      </Button>
                      
                      <Button
                        id="menu-item-supplement"
                        role="menuitem"
                        variant="ghost"
                        className={`w-full justify-start ${
                          focusedIndex === 2 ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        }`}
                        onClick={() => handleMedicationType('Supplement')}
                        data-testid="supplement-button"
                        tabIndex={focusedIndex === 2 ? 0 : -1}
                        ref={focusedIndex === 2 ? (el) => el?.focus() : undefined}
                        aria-selected={focusedIndex === 2}
                        aria-disabled="false"
                        aria-label="Add dietary supplement"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Dietary Supplement
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Screen reader announcements */}
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {showMedicationTypeSelection && 
                  `Medication type menu open. ${focusedIndex === 0 ? 'Prescribed Medication' : 
                    focusedIndex === 1 ? 'Over-the-Counter Medication' : 
                    'Dietary Supplement'} selected. Use arrow keys to navigate.`}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500" data-testid="empty-medications-message">
              No medications added yet. Click "Add Medication" to get started.
            </div>
          </CardContent>
        </Card>


        {showMedicationModal && (
          <MedicationEntryModal 
            clientId={selectedClientId}
            onClose={() => setShowMedicationModal(false)}
            onSave={(medication) => {
              console.log('Medication saved:', medication);
              setShowMedicationModal(false);
            }}
          />
        )}
      </div>
    </div>
      )}
    </>
  );
}

export default App;