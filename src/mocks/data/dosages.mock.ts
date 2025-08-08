import { DosageForm, DosageUnit, DosageFrequency, DosageCondition, DosageFormUnits, DosageFormCategory } from '@/types/models';
import { 
  dosageFormHierarchy, 
  dosageFormCategoryMap,
  getAllCategories,
  getAllDosageForms,
  getDosageFormsByCategory,
  getUnitsForDosageForm
} from './dosageFormHierarchy.mock';

// Export all categories
export const dosageFormCategories: DosageFormCategory[] = getAllCategories();

// Export all dosage forms (flattened list for backward compatibility)
export const dosageForms: DosageForm[] = getAllDosageForms() as DosageForm[];

// Export the hierarchical structure
export { dosageFormHierarchy, dosageFormCategoryMap } from './dosageFormHierarchy.mock';

// Export helper functions
export { 
  getDosageFormsByCategory,
  getUnitsForDosageForm,
  getCategoryForDosageForm,
  getAllCategories,
  getAllDosageForms,
  getAllUnits
} from './dosageFormHierarchy.mock';

// Build dosageUnits object for backward compatibility
export const dosageUnits: DosageFormUnits = (() => {
  const units: DosageFormUnits = {};
  for (const hierarchy of dosageFormHierarchy) {
    for (const form of hierarchy.forms) {
      units[form.name] = form.units;
    }
  }
  return units;
})();

export const dosageFrequencies: DosageFrequency[] = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed'
];

export const dosageConditions: DosageCondition[] = [
  'Morning',
  'Evening',
  'Bedtime',
  'With meals',
  'Before meals',
  'After meals',
  'As needed'
];