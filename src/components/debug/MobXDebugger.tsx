import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';

interface MobXDebuggerProps {
  viewModel: MedicationEntryViewModel;
  show?: boolean;
}

/**
 * Debug component to monitor MobX state changes
 * Shows current state and render count
 */
export const MobXDebugger: React.FC<MobXDebuggerProps> = observer(({ viewModel, show = true }) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current++;
  });
  
  if (!show || !import.meta.env.DEV) {
    return null;
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#00ff00',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxWidth: '400px',
        zIndex: 9999,
        border: '1px solid #00ff00'
      }}
    >
      <div style={{ marginBottom: '5px', color: '#ffff00' }}>
        🔍 MobX State Monitor
      </div>
      <div style={{ marginBottom: '5px' }}>
        Render Count: {renderCount.current}
      </div>
      <div style={{ marginBottom: '5px' }}>
        Therapeutic Classes ({viewModel.selectedTherapeuticClasses.length}):
        <div style={{ marginLeft: '10px', color: '#00ffff' }}>
          {JSON.stringify(viewModel.selectedTherapeuticClasses, null, 2)}
        </div>
      </div>
      <div style={{ marginBottom: '5px' }}>
        Regimen Categories ({viewModel.selectedRegimenCategories.length}):
        <div style={{ marginLeft: '10px', color: '#00ffff' }}>
          {JSON.stringify(viewModel.selectedRegimenCategories, null, 2)}
        </div>
      </div>
      <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
        Last update: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
});