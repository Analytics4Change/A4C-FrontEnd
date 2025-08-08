import { makeAutoObservable, reaction } from 'mobx';
import { IMedicationApi } from '@/services/api/interfaces/IMedicationApi';
import { 
  Medication, 
  DosageInfo, 
  DosageForm, 
  DosageUnit, 
  DosageFormCategory,
  DosageFormType 
} from '@/types/models';
import { DosageValidator } from '@/services/validation/DosageValidator';
import { 
  getDosageFormsByCategory, 
  getUnitsForDosageForm,
  getCategoryForDosageForm 
} from '@/mocks/data/dosageFormHierarchy.mock';

export class MedicationEntryViewModel {
  medicationName = '';
  selectedMedication: Medication | null = null;
  dosageFormCategory: DosageFormCategory | '' = '';
  dosageFormType = '';  // New field for specific form type (Tablet, Capsule, etc.)
  dosageForm = '';  // Keep for backward compatibility, will store the final form type
  dosageAmount = '';
  dosageUnit = '';
  frequency = '';
  condition = '';
  startDate: Date | null = null;
  discontinueDate: Date | null = null;
  prescribingDoctor = '';
  notes = '';
  
  isLoading = false;
  showMedicationDropdown = false;
  showFormCategoryDropdown = false;
  showFormTypeDropdown = false;
  showFormDropdown = false;
  showUnitDropdown = false;
  showFrequencyDropdown = false;
  showConditionDropdown = false;
  showStartDateCalendar = false;
  showDiscontinueDateCalendar = false;
  
  errors: Map<string, string> = new Map();
  
  searchResults: Medication[] = [];
  selectedBroadCategories: string[] = [];
  selectedSpecificCategories: string[] = [];

  constructor(
    private medicationApi: IMedicationApi,
    private validator: DosageValidator
  ) {
    makeAutoObservable(this);
    this.setupReactions();
  }

  get isValidAmount(): boolean {
    return this.validator.isValidDosageAmount(this.dosageAmount);
  }

  get availableFormTypes(): string[] {
    if (!this.dosageFormCategory) return [];
    const formTypes = getDosageFormsByCategory(this.dosageFormCategory);
    return formTypes.map(ft => ft.name);
  }

  get availableUnits(): DosageUnit[] {
    // Units depend on the specific form type, not the category
    if (!this.dosageFormType) return [];
    // Use the new helper function to get units for the selected form type
    return getUnitsForDosageForm(this.dosageFormType) as DosageUnit[];
  }

  get canSave(): boolean {
    return !!(
      this.selectedMedication &&
      this.dosageFormCategory &&
      this.dosageFormType &&  // Check form type instead of dosageForm
      this.isValidAmount &&
      this.dosageUnit &&
      this.frequency &&
      this.condition &&
      this.errors.size === 0
    );
  }

  get categoriesCompleted(): boolean {
    return this.selectedBroadCategories.length > 0 && 
           this.selectedSpecificCategories.length > 0;
  }

  async searchMedications(query: string) {
    this.medicationName = query;
    
    // Always show all medications and use highlighting for filtering
    // This matches the A4C-figma behavior
    this.isLoading = true;
    try {
      // Always fetch all medications - filtering is done visually via highlighting
      // Pass empty string to get all medications
      this.searchResults = await this.medicationApi.searchMedications('');
      this.showMedicationDropdown = this.searchResults.length > 0;
    } catch (error) {
      this.handleError('Failed to search medications', error);
    } finally {
      this.isLoading = false;
    }
  }

  selectMedication(medication: Medication) {
    this.selectedMedication = medication;
    this.medicationName = medication.name;
    this.showMedicationDropdown = false;
    this.clearError('medication');
    
    if (medication.categories) {
      this.selectedBroadCategories = [medication.categories.broad];
      this.selectedSpecificCategories = [medication.categories.specific];
    }
  }

  clearMedication() {
    this.selectedMedication = null;
    this.medicationName = '';
    this.searchResults = [];
    this.showMedicationDropdown = false;
    this.dosageFormCategory = '';
    this.dosageFormType = '';
    this.dosageForm = '';
    this.dosageAmount = '';
    this.dosageUnit = '';
    this.selectedBroadCategories = [];
    this.selectedSpecificCategories = [];
  }

  setDosageFormCategory(category: DosageFormCategory) {
    this.dosageFormCategory = category;
    this.showFormCategoryDropdown = false;
    // Reset form type and unit when category changes
    this.dosageFormType = '';
    this.dosageForm = '';
    this.dosageUnit = '';
    this.clearError('dosageFormCategory');
  }

  setDosageForm(form: string) {
    // This is now used for setting the category (backward compatibility)
    this.dosageForm = form;
    this.showFormDropdown = false;
    // Auto-set category if not already set
    if (!this.dosageFormCategory) {
      const category = getCategoryForDosageForm(form);
      if (category) {
        this.dosageFormCategory = category;
      }
    }
    // Reset form type and unit when changing
    this.dosageFormType = '';
    this.dosageUnit = '';
    this.clearError('dosageForm');
  }

  setDosageFormType(formType: string) {
    // Set the specific form type (Tablet, Capsule, etc.)
    this.dosageFormType = formType;
    this.dosageForm = formType;  // Keep dosageForm in sync for backward compatibility
    this.showFormTypeDropdown = false;
    // Reset unit when form type changes
    this.dosageUnit = '';
    this.clearError('dosageFormType');
  }

  updateDosageAmount(value: string) {
    this.dosageAmount = value;
    this.validateDosageAmount();
  }

  setDosageUnit(unit: string) {
    this.dosageUnit = unit;
    this.showUnitDropdown = false;
    this.clearError('dosageUnit');
  }

  setFrequency(freq: string) {
    this.frequency = freq;
    this.showFrequencyDropdown = false;
    this.clearError('frequency');
  }

  setCondition(cond: string) {
    this.condition = cond;
    this.showConditionDropdown = false;
    this.clearError('condition');
  }

  setStartDate(date: Date) {
    this.startDate = date;
    this.showStartDateCalendar = false;
    this.clearError('startDate');
  }

  setDiscontinueDate(date: Date) {
    this.discontinueDate = date;
    this.showDiscontinueDateCalendar = false;
    this.clearError('discontinueDate');
  }

  toggleBroadCategory(category: string) {
    const index = this.selectedBroadCategories.indexOf(category);
    if (index > -1) {
      this.selectedBroadCategories.splice(index, 1);
    } else {
      this.selectedBroadCategories.push(category);
    }
  }

  toggleSpecificCategory(category: string) {
    const index = this.selectedSpecificCategories.indexOf(category);
    if (index > -1) {
      this.selectedSpecificCategories.splice(index, 1);
    } else {
      this.selectedSpecificCategories.push(category);
    }
  }

  async save() {
    // Validate all required fields
    if (!this.validateRequiredFields()) {
      return;
    }
    
    if (!this.canSave) return;

    const dosageInfo: DosageInfo = {
      medicationId: this.selectedMedication!.id,
      form: this.dosageForm as DosageForm,
      amount: parseFloat(this.dosageAmount),
      unit: this.dosageUnit as DosageUnit,
      frequency: this.frequency as any,
      condition: this.condition as any,
      startDate: this.startDate || undefined,
      discontinueDate: this.discontinueDate || undefined,
      prescribingDoctor: this.prescribingDoctor || undefined,
      notes: this.notes || undefined
    };

    this.isLoading = true;
    try {
      await this.medicationApi.saveMedication(dosageInfo);
      this.reset();
    } catch (error) {
      this.handleError('Failed to save medication', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private validateRequiredFields(): boolean {
    let isValid = true;
    
    if (!this.selectedMedication) {
      this.setError('medication', 'Please select a medication');
      isValid = false;
    }
    
    if (!this.dosageFormCategory) {
      this.setError('dosageFormCategory', 'Please select a dosage form category');
      isValid = false;
    }
    
    if (!this.dosageFormType) {
      this.setError('dosageFormType', 'Please select a dosage form type');
      isValid = false;
    }
    
    if (!this.dosageAmount) {
      this.setError('dosageAmount', 'Please enter the dosage amount');
      isValid = false;
    } else {
      this.validateDosageAmount();
      if (this.errors.has('dosageAmount')) {
        isValid = false;
      }
    }
    
    if (!this.dosageUnit) {
      this.setError('dosageUnit', 'Please select a unit');
      isValid = false;
    }
    
    if (!this.frequency) {
      this.setError('frequency', 'Please select frequency');
      isValid = false;
    }
    
    if (!this.condition) {
      this.setError('condition', 'Please select when to take');
      isValid = false;
    }
    
    return isValid;
  }

  reset() {
    this.medicationName = '';
    this.selectedMedication = null;
    this.dosageFormCategory = '';
    this.dosageForm = '';
    this.dosageAmount = '';
    this.dosageUnit = '';
    this.frequency = '';
    this.condition = '';
    this.startDate = null;
    this.discontinueDate = null;
    this.prescribingDoctor = '';
    this.notes = '';
    this.errors.clear();
    this.searchResults = [];
    this.selectedBroadCategories = [];
    this.selectedSpecificCategories = [];
    this.showMedicationDropdown = false;
    this.showFormCategoryDropdown = false;
    this.showFormTypeDropdown = false;
    this.showFormDropdown = false;
    this.showUnitDropdown = false;
    this.showFrequencyDropdown = false;
    this.showConditionDropdown = false;
  }

  private setupReactions() {
    reaction(
      () => this.dosageAmount,
      () => this.validateDosageAmount()
    );

    reaction(
      () => this.dosageFormCategory,
      () => {
        // Reset form type and unit when category changes
        this.dosageFormType = '';
        this.dosageForm = '';
        this.dosageUnit = '';
      }
    );

    reaction(
      () => this.dosageFormType,
      () => {
        // Reset unit when form type changes
        this.dosageUnit = '';
        // Keep dosageForm in sync
        this.dosageForm = this.dosageFormType;
      }
    );

    reaction(
      () => [this.startDate, this.discontinueDate],
      () => this.validateDates()
    );
  }

  private validateDosageAmount() {
    if (!this.dosageAmount) {
      this.clearError('dosageAmount');
      return;
    }
    
    const numValue = parseFloat(this.dosageAmount);
    
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

  private validateDates() {
    if (this.startDate && this.discontinueDate) {
      if (this.discontinueDate < this.startDate) {
        this.setError('discontinueDate', 'Discontinue date must be after start date');
      } else {
        this.clearError('discontinueDate');
      }
    }
  }

  private setError(field: string, message: string) {
    this.errors.set(field, message);
  }

  private clearError(field: string) {
    this.errors.delete(field);
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.setError('general', message);
  }
}