import { useMemo } from 'react';
import { MockMedicationApi } from '@/services/mock/MockMedicationApi';
import { MockClientApi } from '@/services/mock/MockClientApi';
import { DosageValidator } from '@/services/validation/DosageValidator';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';
import { ClientSelectionViewModel } from '@/viewModels/client/ClientSelectionViewModel';

const medicationApi = new MockMedicationApi();
const clientApi = new MockClientApi();
const dosageValidator = new DosageValidator();

export function useViewModel<T>(
  ViewModelClass: new (...args: any[]) => T
): T {
  const viewModel = useMemo(() => {
    if (ViewModelClass === MedicationEntryViewModel as any) {
      return new MedicationEntryViewModel(medicationApi, dosageValidator) as T;
    }
    
    if (ViewModelClass === ClientSelectionViewModel as any) {
      return new ClientSelectionViewModel(clientApi) as T;
    }
    
    throw new Error(`Unknown ViewModel class: ${ViewModelClass.name}`);
  }, [ViewModelClass]);

  return viewModel;
}