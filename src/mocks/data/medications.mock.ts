import { Medication } from '@/types/models';

export const mockMedicationDatabase: Medication[] = [
  {
    id: '1',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandNames: ['Advil', 'Motrin'],
    categories: {
      broad: 'Pain Management',
      specific: 'Anti-inflammatory',
      therapeutic: 'NSAID'
    },
    flags: {
      isPsychotropic: false,
      isControlled: false,
      isNarcotic: false,
      requiresMonitoring: false
    },
    activeIngredients: ['Ibuprofen']
  },
  {
    id: '2',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandNames: ['Prinivil', 'Zestril'],
    categories: {
      broad: 'Cardiovascular',
      specific: 'Hypertension',
      therapeutic: 'ACE Inhibitor'
    },
    flags: {
      isPsychotropic: false,
      isControlled: false,
      isNarcotic: false,
      requiresMonitoring: true
    },
    activeIngredients: ['Lisinopril']
  },
  {
    id: '3',
    name: 'Lorazepam',
    genericName: 'Lorazepam',
    brandNames: ['Ativan'],
    categories: {
      broad: 'Mental Health',
      specific: 'Anxiety',
      therapeutic: 'Benzodiazepine'
    },
    flags: {
      isPsychotropic: true,
      isControlled: true,
      isNarcotic: false,
      requiresMonitoring: true
    },
    activeIngredients: ['Lorazepam']
  },
  {
    id: '4',
    name: 'Metformin',
    genericName: 'Metformin',
    brandNames: ['Glucophage', 'Fortamet'],
    categories: {
      broad: 'Diabetes',
      specific: 'Type 2 Diabetes',
      therapeutic: 'Biguanide'
    },
    flags: {
      isPsychotropic: false,
      isControlled: false,
      isNarcotic: false,
      requiresMonitoring: true
    },
    activeIngredients: ['Metformin hydrochloride']
  },
  {
    id: '5',
    name: 'Sertraline',
    genericName: 'Sertraline',
    brandNames: ['Zoloft'],
    categories: {
      broad: 'Mental Health',
      specific: 'Depression',
      therapeutic: 'SSRI'
    },
    flags: {
      isPsychotropic: true,
      isControlled: false,
      isNarcotic: false,
      requiresMonitoring: true
    },
    activeIngredients: ['Sertraline hydrochloride']
  },
  {
    id: '6',
    name: 'Pravastatin',
    genericName: 'Pravastatin',
    brandNames: ['Pravachol'],
    categories: {
      broad: 'Cardiovascular',
      specific: 'Cholesterol Management',
      therapeutic: 'Statin'
    },
    flags: {
      isPsychotropic: false,
      isControlled: false,
      isNarcotic: false,
      requiresMonitoring: true
    },
    activeIngredients: ['Pravastatin sodium']
  },
  {
    id: '7',
    name: 'Alprazolam',
    genericName: 'Alprazolam',
    brandNames: ['Xanax'],
    categories: {
      broad: 'Mental Health',
      specific: 'Anxiety',
      therapeutic: 'Benzodiazepine'
    },
    flags: {
      isPsychotropic: true,
      isControlled: true,
      isNarcotic: false,
      requiresMonitoring: true
    },
    activeIngredients: ['Alprazolam']
  }
];

export const mockMedicationHistory = [
  {
    id: '1',
    name: 'Metformin 500mg',
    frequency: 'Twice daily',
    condition: 'With meals'
  },
  {
    id: '2',
    name: 'Lisinopril 10mg',
    frequency: 'Once daily',
    condition: 'Morning'
  }
];