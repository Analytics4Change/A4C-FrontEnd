import { useMemo } from 'react';
import { MockMedicationApi } from '@/services/mock/MockMedicationApi';
import { MockClientApi } from '@/services/mock/MockClientApi';
import { DosageValidator } from '@/services/validation/DosageValidator';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';
import { ClientSelectionViewModel } from '@/viewModels/client/ClientSelectionViewModel';

// Create singleton instances
const medicationApi = new MockMedicationApi();
const clientApi = new MockClientApi();
const dosageValidator = new DosageValidator();

// Store view model instances to reuse them
const viewModelInstances = new Map();

export function useViewModel<T>(
  ViewModelClass: new (...args: any[]) => T
): T {
  const viewModel = useMemo(() => {
    // Check if we already have an instance
    const className = ViewModelClass.name;
    if (viewModelInstances.has(className)) {
      return viewModelInstances.get(className) as T;
    }

    let instance: T;
    
    if (ViewModelClass === MedicationEntryViewModel as any) {
      instance = new MedicationEntryViewModel(medicationApi, dosageValidator) as T;
    } else if (ViewModelClass === ClientSelectionViewModel as any) {
      instance = new ClientSelectionViewModel(clientApi) as T;
    } else {
      throw new Error(`Unknown ViewModel class: ${className}`);
    }
    
    // Store the instance for reuse
    viewModelInstances.set(className, instance);
    return instance;
  }, [ViewModelClass]);

  return viewModel;
}