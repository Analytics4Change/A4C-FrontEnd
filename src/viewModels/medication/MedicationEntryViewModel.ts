import { makeAutoObservable, runInAction } from 'mobx';
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
import { MedicationEntryValidation } from './MedicationEntryValidation';

export class MedicationEntryViewModel {
  medicationName = '';
  selectedMedication: Medication | null = null;
  dosageFormCategory: DosageFormCategory | '' = '';
  dosageFormType = '';  // New field for specific form type (Tablet, Capsule, etc.)
  dosageForm = '';  // Keep for backward compatibility, will store the final form type
  dosageAmount = '';
  dosageUnit = '';
  totalAmount = '';
  totalUnit = '';
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
  
  errors: Map<string, string> = new Map();
  
  searchResults: Medication[] = [];
  selectedTherapeuticClasses: string[] = [];
  selectedRegimenCategories: string[] = [];
  
  private validation: MedicationEntryValidation;

  constructor(
    private medicationApi: IMedicationApi,
    private validator: DosageValidator
  ) {
    makeAutoObservable(this);
    this.validation = new MedicationEntryValidation(this);
    this.validation.setupReactions();
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
      this.totalAmount &&
      this.totalUnit &&
      this.frequency &&
      this.condition &&
      this.errors.size === 0
    );
  }

  get categoriesCompleted(): boolean {
    return this.selectedTherapeuticClasses.length > 0 && 
           this.selectedRegimenCategories.length > 0;
  }

  async searchMedications(query: string) {
    runInAction(() => {
      this.medicationName = query;
      // If query is empty, immediately close dropdown
      if (!query) {
        this.searchResults = [];
        this.showMedicationDropdown = false;
        this.isLoading = false;
        console.log(`[MedicationEntryViewModel] Empty query - closing dropdown`);
        return;
      }
      this.isLoading = true;
    });
    
    // Don't make API call if query is empty
    if (!query) return;
    
    try {
      // Pass the actual query to get filtered results
      const results = await this.medicationApi.searchMedications(query);
      console.log(`[MedicationEntryViewModel] Search for "${query}" returned ${results.length} results`);
      runInAction(() => {
        this.searchResults = results;
        this.showMedicationDropdown = this.searchResults.length > 0;
        console.log(`[MedicationEntryViewModel] showMedicationDropdown = ${this.showMedicationDropdown}`);
      });
    } catch (error) {
      this.validation.handleError('Failed to search medications', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  selectMedication(medication: Medication) {
    runInAction(() => {
      this.selectedMedication = medication;
      this.medicationName = medication.name;
      this.showMedicationDropdown = false;
      
      if (medication.categories) {
        this.selectedTherapeuticClasses = [medication.categories.broad];
        this.selectedRegimenCategories = [medication.categories.specific];
      }
    });
    this.validation.clearError('medication');
  }

  clearMedication() {
    runInAction(() => {
      // Clear medication selection
      this.selectedMedication = null;
      this.medicationName = '';
      this.searchResults = [];
      this.showMedicationDropdown = false;
      
      // Cascade clear ALL form fields (complete reset)
      this.dosageFormCategory = '';
      this.dosageFormType = '';
      this.dosageForm = '';
      this.dosageAmount = '';
      this.dosageUnit = '';
      this.totalAmount = '';
      this.totalUnit = '';
      this.frequency = '';
      this.condition = '';
      this.startDate = null;
      this.discontinueDate = null;
      this.prescribingDoctor = '';
      this.notes = '';
      this.selectedTherapeuticClasses = [];
      this.selectedRegimenCategories = [];
      
      // Clear all dropdowns
      this.showFormCategoryDropdown = false;
      this.showFormTypeDropdown = false;
      this.showFormDropdown = false;
      this.showUnitDropdown = false;
      this.showFrequencyDropdown = false;
      this.showConditionDropdown = false;
      
      // Clear errors
      this.errors.clear();
    });
  }

  setDosageFormCategory(category: DosageFormCategory) {
    runInAction(() => {
      this.dosageFormCategory = category;
      this.showFormCategoryDropdown = false;
      // Reset form type and unit when category changes
      this.dosageFormType = '';
      this.dosageForm = '';
      this.dosageUnit = '';
      this.totalUnit = '';
    });
    this.validation.clearError('dosageFormCategory');
  }

  setDosageForm(form: string) {
    runInAction(() => {
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
    });
    this.validation.clearError('dosageForm');
  }

  setDosageFormType(formType: string) {
    runInAction(() => {
      // Set the specific form type (Tablet, Capsule, etc.)
      this.dosageFormType = formType;
      this.dosageForm = formType;  // Keep dosageForm in sync for backward compatibility
      this.showFormTypeDropdown = false;
      // Reset unit when form type changes
      this.dosageUnit = '';
    });
    this.validation.clearError('dosageFormType');
  }

  updateDosageAmount(value: string) {
    runInAction(() => {
      this.dosageAmount = value;
    });
    this.validation.validateDosageAmount();
  }

  setDosageUnit(unit: string) {
    runInAction(() => {
      this.dosageUnit = unit;
      this.showUnitDropdown = false;
    });
    this.validation.clearError('dosageUnit');
  }

  updateTotalAmount(value: string) {
    runInAction(() => {
      this.totalAmount = value;
    });
    this.validation.validateTotalAmount();
  }

  setTotalUnit(unit: string) {
    runInAction(() => {
      this.totalUnit = unit;
    });
    this.validation.clearError('totalUnit');
  }

  setFrequency(freq: string) {
    runInAction(() => {
      this.frequency = freq;
      this.showFrequencyDropdown = false;
    });
    this.validation.clearError('frequency');
  }

  setCondition(cond: string) {
    runInAction(() => {
      this.condition = cond;
      this.showConditionDropdown = false;
    });
    this.validation.clearError('condition');
  }

  setStartDate(date: Date | null) {
    runInAction(() => {
      this.startDate = date;
    });
    this.validation.clearError('startDate');
  }

  setDiscontinueDate(date: Date | null) {
    runInAction(() => {
      this.discontinueDate = date;
    });
    this.validation.clearError('discontinueDate');
  }

  toggleTherapeuticClass(category: string) {
    const index = this.selectedTherapeuticClasses.indexOf(category);
    if (index > -1) {
      this.selectedTherapeuticClasses.splice(index, 1);
    } else {
      this.selectedTherapeuticClasses.push(category);
    }
  }

  toggleRegimenCategory(category: string) {
    const index = this.selectedRegimenCategories.indexOf(category);
    if (index > -1) {
      this.selectedRegimenCategories.splice(index, 1);
    } else {
      this.selectedRegimenCategories.push(category);
    }
  }

  async save() {
    // Validate all required fields
    if (!this.validation.validateRequiredFields()) {
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

    runInAction(() => {
      this.isLoading = true;
    });
    
    try {
      await this.medicationApi.saveMedication(dosageInfo);
      this.reset();
    } catch (error) {
      this.validation.handleError('Failed to save medication', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  reset() {
    this.medicationName = '';
    this.selectedMedication = null;
    this.dosageFormCategory = '';
    this.dosageForm = '';
    this.dosageAmount = '';
    this.dosageUnit = '';
    this.totalAmount = '';
    this.totalUnit = '';
    this.frequency = '';
    this.condition = '';
    this.startDate = null;
    this.discontinueDate = null;
    this.prescribingDoctor = '';
    this.notes = '';
    this.errors.clear();
    this.searchResults = [];
    this.selectedTherapeuticClasses = [];
    this.selectedRegimenCategories = [];
    this.showMedicationDropdown = false;
    this.showFormCategoryDropdown = false;
    this.showFormTypeDropdown = false;
    this.showFormDropdown = false;
    this.showUnitDropdown = false;
    this.showFrequencyDropdown = false;
    this.showConditionDropdown = false;
  }
}