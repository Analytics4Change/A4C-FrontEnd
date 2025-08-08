import { DosageForm, DosageUnit, DosageFormCategory } from '@/types/models';
import { 
  dosageUnits, 
  dosageFormCategories,
  getAllDosageForms,
  getUnitsForDosageForm 
} from '@/mocks/data/dosages.mock';

export class DosageValidator {
  isValidDosageAmount(amount: string): boolean {
    if (!amount) return false;
    
    const numericRegex = /^\d*\.?\d*$/;
    const isNumericFormat = numericRegex.test(amount);
    const numericValue = parseFloat(amount);
    
    return isNumericFormat && !isNaN(numericValue) && numericValue > 0;
  }

  getUnitsForForm(form: DosageForm | string): DosageUnit[] {
    // Use the new helper function from the hierarchical mock data
    return getUnitsForDosageForm(form) as DosageUnit[];
  }

  validateDosageCategory(category: string): boolean {
    return dosageFormCategories.includes(category as DosageFormCategory);
  }

  validateDosageForm(form: string): boolean {
    const validForms = getAllDosageForms();
    return validForms.includes(form);
  }

  validateDosageUnit(unit: string, form: DosageForm | string): boolean {
    const availableUnits = this.getUnitsForForm(form);
    return availableUnits.includes(unit as DosageUnit);
  }

  validateDosageFrequency(frequency: string): boolean {
    const validFrequencies = [
      'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
      'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
      'As needed'
    ];
    return validFrequencies.includes(frequency);
  }

  validateDosageCondition(condition: string): boolean {
    const validConditions = [
      'Morning', 'Evening', 'Bedtime', 'With meals', 
      'Before meals', 'After meals', 'As needed'
    ];
    return validConditions.includes(condition);
  }

  validateCompleteDosage(
    category: DosageFormCategory | string,
    form: DosageForm | string,
    amount: string,
    unit: DosageUnit | string,
    frequency: string,
    condition: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (category && !this.validateDosageCategory(category)) {
      errors.push('Invalid dosage form category');
    }

    if (!this.validateDosageForm(form)) {
      errors.push('Invalid dosage form');
    }

    if (!this.isValidDosageAmount(amount)) {
      errors.push('Invalid dosage amount');
    }

    if (!this.validateDosageUnit(unit, form)) {
      errors.push('Invalid dosage unit for selected form');
    }

    if (!this.validateDosageFrequency(frequency)) {
      errors.push('Invalid dosage frequency');
    }

    if (!this.validateDosageCondition(condition)) {
      errors.push('Invalid dosage condition');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}