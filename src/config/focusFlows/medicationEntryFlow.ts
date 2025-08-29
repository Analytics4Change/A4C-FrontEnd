/**
 * Medication Entry Focus Flow Configuration
 * 
 * This configuration defines the complete navigation flow for the medication entry form.
 * Based on the current implementation in MedicationEntryModal and related components.
 * 
 * @module medicationEntryFlow
 */

import { FocusFlow } from '../types/focusFlow.types';

/**
 * Main medication entry flow configuration
 * 
 * Flow order based on current-focus-flow.md:
 * 1. Medication Search
 * 2. Dosage Form (Category, Form Type, Amount, Unit, Total Amount, Total Unit, Frequency, Condition)
 * 3. Broad Categories
 * 4. Specific Categories (conditional)
 * 5. Start Date
 * 6. Discontinue Date
 * 7. Side Effects (optional)
 * 8. Save Button
 */
export const medicationEntryFlow: FocusFlow = {
  id: 'medication-entry',
  name: 'Medication Entry Flow',
  
  // Node definitions with order matching current implementation
  nodes: [
    // Medication Search
    {
      id: 'medication-search',
      order: 1,
      required: true,
      label: 'Medication Search',
      description: 'Search and select medication',
      type: 'input',
      autoAdvance: true,
      validateOnLeave: 'hasMedicationSelected'
    },
    
    // Dosage Form Fields
    {
      id: 'dosage-category',
      order: 2,
      required: true,
      label: 'Dosage Category',
      description: 'Select dosage category',
      type: 'select',
      autoAdvance: true,
      metadata: { parentComponent: 'DosageForm' }
    },
    {
      id: 'form-type',
      order: 3,
      required: true,
      label: 'Form Type',
      description: 'Select medication form type',
      type: 'select',
      autoAdvance: true,
      skipIf: 'noDosageCategory',
      metadata: { parentComponent: 'DosageForm' }
    },
    {
      id: 'dosage-amount',
      order: 4,
      required: true,
      label: 'Dosage Amount',
      description: 'Enter dosage amount',
      type: 'input',
      validateOnLeave: 'isValidNumber',
      metadata: { parentComponent: 'DosageForm' }
    },
    {
      id: 'dosage-unit',
      order: 5,
      required: true,
      label: 'Dosage Unit',
      description: 'Select dosage unit',
      type: 'select',
      autoAdvance: true,
      metadata: { parentComponent: 'DosageForm' }
    },
    {
      id: 'total-amount',
      order: 6,
      required: false,
      label: 'Total Amount',
      description: 'Enter total amount (optional)',
      type: 'input',
      validateOnLeave: 'isValidNumberOrEmpty',
      metadata: { parentComponent: 'DosageForm' }
    },
    {
      id: 'total-unit',
      order: 7,
      required: false,
      label: 'Total Unit',
      description: 'Select total unit',
      type: 'select',
      autoAdvance: true,
      skipIf: 'noTotalAmount',
      metadata: { parentComponent: 'DosageForm' }
    },
    {
      id: 'frequency',
      order: 8,
      required: true,
      label: 'Frequency',
      description: 'Select dosage frequency',
      type: 'select',
      autoAdvance: true,
      metadata: { parentComponent: 'DosageForm' }
    },
    {
      id: 'condition',
      order: 9,
      required: false,
      label: 'Condition',
      description: 'Select administration condition',
      type: 'select',
      autoAdvance: true,
      metadata: { parentComponent: 'DosageForm' }
    },
    
    // Category Selection
    {
      id: 'broad-categories-button',
      order: 10,
      required: true,
      label: 'Broad Categories',
      description: 'Select broad medication categories',
      type: 'button',
      metadata: { 
        opensModal: true,
        modalId: 'broad-categories-modal',
        autoOpen: true 
      }
    },
    {
      id: 'specific-categories-button',
      order: 11,
      required: false,
      label: 'Specific Categories',
      description: 'Select specific medication categories',
      type: 'button',
      skipIf: 'noBroadCategoriesSelected',
      metadata: { 
        opensModal: true,
        modalId: 'specific-categories-modal',
        autoOpen: true 
      }
    },
    
    // Date Selection
    {
      id: 'start-date',
      order: 12,
      required: true,
      label: 'Start Date',
      description: 'Select medication start date',
      type: 'button',
      metadata: { 
        opensModal: true,
        modalId: 'start-date-calendar',
        autoOpen: true 
      }
    },
    {
      id: 'discontinue-date',
      order: 13,
      required: false,
      label: 'Discontinue Date',
      description: 'Select medication discontinue date (optional)',
      type: 'button',
      metadata: { 
        opensModal: true,
        modalId: 'discontinue-date-calendar',
        autoOpen: true 
      }
    },
    
    // Side Effects (Optional)
    {
      id: 'side-effects',
      order: 14,
      required: false,
      label: 'Side Effects',
      description: 'Select experienced side effects',
      type: 'checkbox',
      skipIf: 'skipSideEffects',
      metadata: { 
        multiSelect: true 
      }
    },
    {
      id: 'other-side-effects-input',
      order: 15,
      required: false,
      label: 'Other Side Effects',
      description: 'Describe other side effects',
      type: 'input',
      skipIf: 'noOtherSideEffects',
      metadata: { 
        conditional: true,
        dependsOn: 'side-effects',
        showWhen: 'hasOtherSideEffects'
      }
    }
  ],
  
  // Branch conditions for conditional navigation
  branches: {
    // Branch after side effects selection
    'side-effects': {
      condition: 'hasOtherSideEffects',
      truePath: 'other-side-effects-input',
      falsePath: null,
      description: 'Navigate to other side effects input if "Other" is selected'
    },
    
    // Branch after specific categories (if disabled)
    'specific-categories-button': {
      condition: 'hasSpecificCategoriesEnabled',
      truePath: 'specific-categories-button',
      falsePath: 'start-date',
      description: 'Skip specific categories if no broad categories selected'
    },
    
    // Branch after total amount
    'total-amount': {
      condition: 'hasTotalAmount',
      truePath: 'total-unit',
      falsePath: 'frequency',
      description: 'Skip total unit if no total amount entered'
    }
  },
  
  // Validator functions
  validators: {
    // Medication selection validators
    hasMedicationSelected: () => {
      const searchInput = document.getElementById('medication-search') as HTMLInputElement;
      const selectedMedication = searchInput?.dataset.selectedMedication;
      return !!selectedMedication && selectedMedication !== '';
    },
    
    // Dosage form validators
    noDosageCategory: () => {
      const categoryInput = document.getElementById('dosage-category') as HTMLInputElement;
      return !categoryInput?.value;
    },
    
    isValidNumber: () => {
      const amountInput = document.getElementById('dosage-amount') as HTMLInputElement;
      const value = amountInput?.value;
      return !isNaN(parseFloat(value)) && parseFloat(value) > 0;
    },
    
    isValidNumberOrEmpty: () => {
      const totalAmountInput = document.getElementById('total-amount') as HTMLInputElement;
      const value = totalAmountInput?.value;
      return !value || (!isNaN(parseFloat(value)) && parseFloat(value) > 0);
    },
    
    noTotalAmount: () => {
      const totalAmountInput = document.getElementById('total-amount') as HTMLInputElement;
      return !totalAmountInput?.value || totalAmountInput.value === '';
    },
    
    hasTotalAmount: () => {
      const totalAmountInput = document.getElementById('total-amount') as HTMLInputElement;
      return !!totalAmountInput?.value && totalAmountInput.value !== '';
    },
    
    // Category selection validators
    noBroadCategoriesSelected: () => {
      const broadCategories = document.querySelectorAll('[data-broad-category]:checked');
      return broadCategories.length === 0;
    },
    
    hasSpecificCategoriesEnabled: () => {
      const broadCategories = document.querySelectorAll('[data-broad-category]:checked');
      return broadCategories.length > 0;
    },
    
    // Side effects validators
    skipSideEffects: () => {
      // Could be configured to skip based on medication type or user preference
      return false; // Currently always show side effects
    },
    
    hasOtherSideEffects: () => {
      const otherCheckbox = document.querySelector('[data-side-effect="Other"]:checked');
      return !!otherCheckbox;
    },
    
    noOtherSideEffects: () => {
      const otherCheckbox = document.querySelector('[data-side-effect="Other"]:checked');
      return !otherCheckbox;
    },
    
    // Form validation
    isFormValid: () => {
      // Check required fields
      const requiredFields = [
        'medication-search',
        'dosage-category',
        'form-type',
        'dosage-amount',
        'dosage-unit',
        'frequency',
        'start-date'
      ];
      
      for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId) as HTMLInputElement;
        if (!field?.value || field.value === '') {
          console.warn(`Required field ${fieldId} is empty`);
          return false;
        }
      }
      
      // Validate number fields
      const amountField = document.getElementById('dosage-amount') as HTMLInputElement;
      if (isNaN(parseFloat(amountField?.value)) || parseFloat(amountField.value) <= 0) {
        console.warn('Invalid dosage amount');
        return false;
      }
      
      return true;
    }
  },
  
  // Additional metadata
  metadata: {
    version: '1.0.0',
    createdDate: '2025-08-21',
    description: 'Complete medication entry flow with all fields and validations',
    estimatedCompletionTime: '3-5 minutes',
    supportedModes: ['keyboard', 'mouse', 'touch'],
    accessibilityCompliance: 'WCAG 2.1 AA'
  }
};