import { reaction } from 'mobx';
import { MedicationEntryViewModel } from './MedicationEntryViewModel';

export class MedicationEntryValidation {
  private vm: MedicationEntryViewModel;

  constructor(viewModel: MedicationEntryViewModel) {
    this.vm = viewModel;
  }

  setupReactions() {
    reaction(
      () => this.vm.dosageAmount,
      () => this.validateDosageAmount()
    );

    reaction(
      () => this.vm.totalAmount,
      () => this.validateTotalAmount()
    );

    reaction(
      () => this.vm.dosageFormCategory,
      () => {
        // Reset form type and unit when category changes
        this.vm.dosageFormType = '';
        this.vm.dosageForm = '';
        this.vm.dosageUnit = '';
        this.vm.totalUnit = '';
      }
    );

    reaction(
      () => this.vm.dosageFormType,
      () => {
        // Reset unit when form type changes
        this.vm.dosageUnit = '';
        // Keep dosageForm in sync
        this.vm.dosageForm = this.vm.dosageFormType;
      }
    );

    reaction(
      () => [this.vm.startDate, this.vm.discontinueDate],
      () => this.validateDates()
    );
  }

  validateRequiredFields(): boolean {
    let isValid = true;
    
    if (!this.vm.selectedMedication) {
      this.setError('medication', 'Please select a medication');
      isValid = false;
    }
    
    if (!this.vm.dosageFormCategory) {
      this.setError('dosageFormCategory', 'Please select a dosage form category');
      isValid = false;
    }
    
    if (!this.vm.dosageFormType) {
      this.setError('dosageFormType', 'Please select a dosage form type');
      isValid = false;
    }
    
    if (!this.vm.dosageAmount) {
      this.setError('dosageAmount', 'Please enter the dosage amount');
      isValid = false;
    } else {
      this.validateDosageAmount();
      if (this.vm.errors.has('dosageAmount')) {
        isValid = false;
      }
    }
    
    if (!this.vm.dosageUnit) {
      this.setError('dosageUnit', 'Please select a unit');
      isValid = false;
    }
    
    if (!this.vm.totalAmount) {
      this.setError('totalAmount', 'Please enter the total amount');
      isValid = false;
    } else {
      this.validateTotalAmount();
      if (this.vm.errors.has('totalAmount')) {
        isValid = false;
      }
    }
    
    if (!this.vm.totalUnit) {
      this.setError('totalUnit', 'Please select a total unit');
      isValid = false;
    }
    
    if (!this.vm.frequency) {
      this.setError('frequency', 'Please select frequency');
      isValid = false;
    }
    
    if (!this.vm.condition) {
      this.setError('condition', 'Please select when to take');
      isValid = false;
    }
    
    return isValid;
  }

  validateDosageAmount() {
    if (!this.vm.dosageAmount) {
      this.clearError('dosageAmount');
      return;
    }
    
    const numValue = parseFloat(this.vm.dosageAmount);
    
    if (isNaN(numValue)) {
      this.setError('dosageAmount', 'Please enter a valid number');
    } else if (numValue <= 0) {
      this.setError('dosageAmount', 'Amount must be greater than 0');
    } else if (numValue > 9999) {
      this.setError('dosageAmount', 'Amount cannot exceed 9999');
    } else {
      this.clearError('dosageAmount');
    }
  }

  validateTotalAmount() {
    if (!this.vm.totalAmount) {
      this.clearError('totalAmount');
      return;
    }
    
    const numValue = parseFloat(this.vm.totalAmount);
    
    if (isNaN(numValue)) {
      this.setError('totalAmount', 'Please enter a valid number');
    } else if (numValue <= 0) {
      this.setError('totalAmount', 'Amount must be greater than 0');
    } else if (numValue > 9999) {
      this.setError('totalAmount', 'Amount cannot exceed 9999');
    } else {
      this.clearError('totalAmount');
    }
  }

  validateDates() {
    if (this.vm.startDate && this.vm.discontinueDate) {
      if (this.vm.discontinueDate < this.vm.startDate) {
        this.setError('discontinueDate', 'Discontinue date must be after start date');
      } else {
        this.clearError('discontinueDate');
      }
    }
  }

  setError(field: string, message: string) {
    this.vm.errors.set(field, message);
  }

  clearError(field: string) {
    this.vm.errors.delete(field);
  }

  handleError(message: string, error: any) {
    console.error(message, error);
    this.setError('general', message);
  }
}