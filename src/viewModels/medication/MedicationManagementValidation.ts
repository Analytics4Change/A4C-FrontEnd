import { reaction } from 'mobx';
import { MedicationManagementViewModel } from './MedicationManagementViewModel';

export class MedicationManagementValidation {
  private vm: MedicationManagementViewModel;

  constructor(viewModel: MedicationManagementViewModel) {
    this.vm = viewModel;
  }

  setupReactions() {
    reaction(
      () => this.vm.dosageAmount,
      () => this.validateDosageAmount()
    );

    reaction(
      () => this.vm.inventoryQuantity,
      () => this.validateInventoryQuantity()
    );

    reaction(
      () => this.vm.dosageForm,
      () => {
        // Reset dosage route and dosage unit when form changes
        this.vm.dosageRoute = '';
        this.vm.dosageUnit = '';
        this.vm.inventoryUnit = '';
      }
    );

    reaction(
      () => this.vm.dosageRoute,
      () => {
        // Reset dosage unit when dosage route changes
        this.vm.dosageUnit = '';
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
    
    if (!this.vm.dosageForm) {
      this.setError('dosageForm', 'Please select a dosage form');
      isValid = false;
    }
    
    if (!this.vm.dosageRoute) {
      this.setError('dosageRoute', 'Please select a dosage route');
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
      this.setError('dosageUnit', 'Please select a dosage unit');
      isValid = false;
    }
    
    if (!this.vm.inventoryQuantity) {
      this.setError('inventoryQuantity', 'Please enter the inventory quantity');
      isValid = false;
    } else {
      this.validateInventoryQuantity();
      if (this.vm.errors.has('inventoryQuantity')) {
        isValid = false;
      }
    }
    
    if (!this.vm.inventoryUnit) {
      this.setError('inventoryUnit', 'Please select an inventory unit');
      isValid = false;
    }
    
    if (!this.vm.frequency) {
      this.setError('frequency', 'Please select dosage frequency');
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
      this.setError('dosageAmount', 'Dosage amount must be greater than 0');
    } else if (numValue > 9999) {
      this.setError('dosageAmount', 'Dosage amount cannot exceed 9999');
    } else {
      this.clearError('dosageAmount');
    }
  }

  validateInventoryQuantity() {
    if (!this.vm.inventoryQuantity) {
      this.clearError('inventoryQuantity');
      return;
    }
    
    const numValue = parseFloat(this.vm.inventoryQuantity);
    
    if (isNaN(numValue)) {
      this.setError('inventoryQuantity', 'Please enter a valid number');
    } else if (numValue <= 0) {
      this.setError('inventoryQuantity', 'Quantity must be greater than 0');
    } else if (numValue > 9999) {
      this.setError('inventoryQuantity', 'Quantity cannot exceed 9999');
    } else {
      this.clearError('inventoryQuantity');
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