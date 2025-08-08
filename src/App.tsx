import React, { useState } from 'react';
import { ClientSelector } from '@/views/client/ClientSelector';
import { MedicationEntryModal } from '@/views/medication/MedicationEntryModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Plus, Pill } from 'lucide-react';
import './index.css';

function App() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showMedicationTypeSelection, setShowMedicationTypeSelection] = useState(false);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleAddMedication = () => {
    setShowMedicationTypeSelection(true);
  };

  const handleMedicationType = (type: string) => {
    if (type === 'Prescribed Medication') {
      setShowMedicationModal(true);
      setShowMedicationTypeSelection(false);
    }
  };

  if (!selectedClientId) {
    return <ClientSelector onClientSelect={handleClientSelect} />;
  }

  return (
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
            <CardAction>
              <Button 
                onClick={handleAddMedication}
                data-testid="add-medication-button"
                aria-label="Add new medication"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500" data-testid="empty-medications-message">
              No medications added yet. Click "Add Medication" to get started.
            </div>
          </CardContent>
        </Card>

        {showMedicationTypeSelection && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40"
            data-testid="medication-type-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="medication-type-title"
          >
            <Card className="max-w-md w-full m-4">
              <CardHeader>
                <CardTitle id="medication-type-title">Select Medication Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start min-h-[44px]"
                  onClick={() => handleMedicationType('Prescribed Medication')}
                  data-testid="prescribed-medication-button"
                  aria-label="Add prescribed medication"
                >
                  <Pill className="h-4 w-4 mr-2" />
                  Prescribed Medication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start min-h-[44px]"
                  onClick={() => handleMedicationType('Over-the-Counter')}
                  data-testid="otc-medication-button"
                  aria-label="Add over-the-counter medication"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Over-the-Counter Medication
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start min-h-[44px]"
                  onClick={() => handleMedicationType('Supplement')}
                  data-testid="supplement-button"
                  aria-label="Add supplement or vitamin"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Supplement / Vitamin
                </Button>
                <div className="pt-3">
                  <Button
                    variant="ghost"
                    className="w-full min-h-[44px]"
                    onClick={() => setShowMedicationTypeSelection(false)}
                    data-testid="medication-type-cancel-button"
                    aria-label="Cancel medication type selection"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showMedicationModal && (
          <MedicationEntryModal onClose={() => setShowMedicationModal(false)} />
        )}
      </div>
    </div>
  );
}

export default App;