import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { Badge } from './components/ui/badge';

// Mock data
const mockMedications = [
  { id: 1, name: "Metformin 500mg", frequency: "Twice daily", condition: "With meals" },
  { id: 2, name: "Lisinopril 10mg", frequency: "Once daily", condition: "Morning" },
];

const mockMedicationDatabase = [
  { name: "Ibuprofen", broadCategory: "Pain Management", specificCategory: "Anti-inflammatory", isPsychotropic: false, isControlled: false },
  { name: "Lisinopril", broadCategory: "Cardiovascular", specificCategory: "Hypertension", isPsychotropic: false, isControlled: false },
  { name: "Lorazepam", broadCategory: "Mental Health", specificCategory: "Anxiety", isPsychotropic: true, isControlled: true },
  { name: "Metformin", broadCategory: "Diabetes", specificCategory: "Type 2 Diabetes", isPsychotropic: false, isControlled: false },
  { name: "Sertraline", broadCategory: "Mental Health", specificCategory: "Depression", isPsychotropic: true, isControlled: false },
];

const dosageForms = ["Capsule", "Inhaler", "Injection", "Liquid", "Tablet", "Topical"];
const dosageUnits = {
  "Tablet": ["mcg", "mg", "units"],
  "Capsule": ["mcg", "mg", "units"],
  "Liquid": ["mg/ml", "ml", "tbsp", "tsp"],
  "Injection": ["mg", "ml", "units"],
  "Topical": ["%", "g", "mg"],
  "Inhaler": ["mcg", "puffs"]
};

const dosageFrequencies = ["As needed", "Every 12 hours", "Every 4 hours", "Every 6 hours", "Every 8 hours", "Four times daily", "Once daily", "Three times daily", "Twice daily"];
const dosageConditions = ["After meals", "As needed", "Bedtime", "Before meals", "Evening", "Morning", "With meals"];

export default function App() {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [showMedicationList, setShowMedicationList] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [medicationType, setMedicationType] = useState<string>("");
  const [showMedicationEntry, setShowMedicationEntry] = useState(false);

  // Medication entry state
  const [medicationName, setMedicationName] = useState("");
  const [filteredMedications, setFilteredMedications] = useState(mockMedicationDatabase);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  
  // Dosage Form state
  const [dosageForm, setDosageForm] = useState("");
  const [dosageFormInput, setDosageFormInput] = useState("");
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  
  // Dosage Unit state
  const [dosageUnit, setDosageUnit] = useState("");
  const [dosageUnitInput, setDosageUnitInput] = useState("");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  
  const [dosageAmount, setDosageAmount] = useState("");
  const [mirroredAmount, setMirroredAmount] = useState("");
  const [showMirroredAmount, setShowMirroredAmount] = useState(false);
  const [isValidAmount, setIsValidAmount] = useState(false);
  
  // Dosage Frequency state
  const [dosageFrequency, setDosageFrequency] = useState("");
  const [dosageFrequencyInput, setDosageFrequencyInput] = useState("");
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  
  // Dosage Condition state
  const [dosageCondition, setDosageCondition] = useState("");
  const [dosageConditionInput, setDosageConditionInput] = useState("");
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  
  const [showBroadCategories, setShowBroadCategories] = useState(false);
  const [showSpecificCategories, setShowSpecificCategories] = useState(false);
  const [selectedBroadCategories, setSelectedBroadCategories] = useState<string[]>([]);
  const [selectedSpecificCategories, setSelectedSpecificCategories] = useState<string[]>([]);
  const [categoriesCompleted, setCategoriesCompleted] = useState(false);
  const [showStartDateCalendar, setShowStartDateCalendar] = useState(false);
  const [showDiscontinueDateCalendar, setShowDiscontinueDateCalendar] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [discontinueDate, setDiscontinueDate] = useState<Date | null>(null);
  const [showProhibitModal, setShowProhibitModal] = useState(false);

  // Calendar state
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  // Dropdown refs for auto-scrolling and positioning
  const medicationDropdownRef = useRef<HTMLDivElement>(null);
  const formDropdownRef = useRef<HTMLDivElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const frequencyDropdownRef = useRef<HTMLDivElement>(null);
  const conditionDropdownRef = useRef<HTMLDivElement>(null);

  // Input refs for focus management and positioning
  const medicationInputRef = useRef<HTMLInputElement>(null);
  const dosageFormInputRef = useRef<HTMLInputElement>(null);
  const dosageAmountInputRef = useRef<HTMLInputElement>(null);
  const dosageUnitInputRef = useRef<HTMLInputElement>(null);
  const dosageFrequencyInputRef = useRef<HTMLInputElement>(null);
  const dosageConditionInputRef = useRef<HTMLInputElement>(null);
  const broadCategoryBtnRef = useRef<HTMLButtonElement>(null);
  const specificCategoryBtnRef = useRef<HTMLButtonElement>(null);
  const startDateBtnRef = useRef<HTMLButtonElement>(null);
  const discontinueDateBtnRef = useRef<HTMLButtonElement>(null);

  // Helper function to determine if medication entry modal is the topmost modal
  const isMedicationEntryTopmost = () => {
    return showMedicationEntry && 
           !showBroadCategories && 
           !showSpecificCategories && 
           !showProhibitModal && 
           !showStartDateCalendar && 
           !showDiscontinueDateCalendar;
  };

  // Auto-focus management using refs - Updated for new order
  useEffect(() => {
    if (selectedMedication && !dosageForm) {
      // Focus on dosage form input when medication is selected
      setTimeout(() => {
        dosageFormInputRef.current?.focus();
      }, 100);
    }
  }, [selectedMedication, dosageForm]);

  useEffect(() => {
    if (dosageForm && !dosageAmount) {
      // Focus on dosage amount input when form is selected
      setTimeout(() => {
        dosageAmountInputRef.current?.focus();
      }, 100);
    }
  }, [dosageForm, dosageAmount]);

  useEffect(() => {
    if (isValidAmount && !dosageUnit) {
      // Focus on dosage unit input when amount is valid
      setTimeout(() => {
        dosageUnitInputRef.current?.focus();
      }, 100);
    }
  }, [isValidAmount, dosageUnit]);

  useEffect(() => {
    if (dosageUnit && !dosageFrequency) {
      // Focus on frequency input when unit is selected
      setTimeout(() => {
        dosageFrequencyInputRef.current?.focus();
      }, 100);
    }
  }, [dosageUnit, dosageFrequency]);

  useEffect(() => {
    if (dosageFrequency && !dosageCondition) {
      // Focus on condition input when frequency is selected
      setTimeout(() => {
        dosageConditionInputRef.current?.focus();
      }, 100);
    }
  }, [dosageFrequency, dosageCondition]);

  useEffect(() => {
    if (categoriesCompleted && !startDate) {
      // Focus on start date button when categories are completed
      setTimeout(() => {
        startDateBtnRef.current?.focus();
      }, 100);
    }
  }, [categoriesCompleted, startDate]);

  useEffect(() => {
    if (startDate && !discontinueDate) {
      // Focus on discontinue date button when start date is selected
      setTimeout(() => {
        discontinueDateBtnRef.current?.focus();
      }, 100);
    }
  }, [startDate, discontinueDate]);

  // New useEffect for focus management when specific category button appears
  useEffect(() => {
    if (!categoriesCompleted && selectedBroadCategories.length > 0 && selectedSpecificCategories.length === 0 && !showBroadCategories) {
      // Focus on specific category button when broad categories are selected and broad modal is closed
      setTimeout(() => {
        specificCategoryBtnRef.current?.focus();
      }, 100);
    }
  }, [selectedBroadCategories, selectedSpecificCategories, categoriesCompleted, showBroadCategories]);

  useEffect(() => {
    // Always show all medications, highlighting will be handled in rendering
    setFilteredMedications(mockMedicationDatabase);
    
    // Auto-scroll to first highlighted medication
    if (medicationName && medicationDropdownRef.current) {
      setTimeout(() => {
        const highlightedItem = medicationDropdownRef.current?.querySelector('.highlighted-item');
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [medicationName]);

  useEffect(() => {
    // Validate that the input contains only digits and optional decimal point
    const numericRegex = /^\d*\.?\d*$/;
    const isNumericFormat = numericRegex.test(dosageAmount);
    const isNotEmpty = dosageAmount !== "";
    const isValid = isNumericFormat && isNotEmpty;
    
    setIsValidAmount(isValid);
    setMirroredAmount(dosageAmount);
  }, [dosageAmount]);

  const handleClientSelect = (clientName: string) => {
    setSelectedClient(clientName);
    setShowMedicationList(true);
  };

  const handleAddNewMedication = () => {
    setShowAddMedication(true);
  };

  const handleMedicationTypeSelect = (type: string) => {
    setMedicationType(type);
    if (type === "Prescribed Medication") {
      setShowMedicationEntry(true);
      setShowAddMedication(false);
    }
  };

  const handleMedicationSelect = (medication: any) => {
    setSelectedMedication(medication);
    setMedicationName(medication.name);
    setShowMedicationDropdown(false);
  };

  const handleDosageAmountChange = (value: string) => {
    setDosageAmount(value);
    setShowMirroredAmount(value !== "");
  };

  const handleMirroredAmountClick = () => {
    if (isValidAmount) {
      setShowMirroredAmount(false);
      // Focus on unit input when valid amount is confirmed (new order)
      setTimeout(() => {
        dosageUnitInputRef.current?.focus();
      }, 100);
    } else if (dosageAmount !== "") {
      setShowProhibitModal(true);
    }
  };

  const handleManualFocusChange = () => {
    if (!isValidAmount && dosageAmount !== "") {
      setShowProhibitModal(true);
    }
  };

  const handleMedicationNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !selectedMedication) {
      // Check if there's an exact match first
      const exactMatch = mockMedicationDatabase.find(med => 
        med.name.toLowerCase() === medicationName.toLowerCase()
      );
      
      if (exactMatch) {
        handleMedicationSelect(exactMatch);
      } else if (medicationName) {
        // Check if there's only one highlighted option
        const highlightedOptions = mockMedicationDatabase.filter(med =>
          med.name.toLowerCase().startsWith(medicationName.toLowerCase())
        );
        
        if (highlightedOptions.length === 1) {
          handleMedicationSelect(highlightedOptions[0]);
        } else if (filteredMedications.length > 0) {
          // Select the first medication if no highlighting logic applies
          handleMedicationSelect(filteredMedications[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowMedicationDropdown(false);
    }
  };

  const isMedicationHighlighted = (medication: any) => {
    if (!medicationName) return false;
    return medication.name.toLowerCase().startsWith(medicationName.toLowerCase());
  };

  const handleDosageAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent any default form submission
      
      if (isValidAmount) {
        setShowMirroredAmount(false);
        // Focus on unit input when valid amount is confirmed with Enter (new order)
        setTimeout(() => {
          dosageUnitInputRef.current?.focus();
        }, 100);
      } else if (dosageAmount !== "") {
        // Invalid input, show validation modal
        setShowProhibitModal(true);
      }
    }
  };

  // Auto-scroll effect for form dropdown
  useEffect(() => {
    if (dosageFormInput && formDropdownRef.current) {
      setTimeout(() => {
        const highlightedItem = formDropdownRef.current?.querySelector('.highlighted-item');
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [dosageFormInput]);

  // Auto-scroll effect for unit dropdown
  useEffect(() => {
    if (dosageUnitInput && unitDropdownRef.current) {
      setTimeout(() => {
        const highlightedItem = unitDropdownRef.current?.querySelector('.highlighted-item');
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [dosageUnitInput]);

  // Auto-scroll effect for frequency dropdown
  useEffect(() => {
    if (dosageFrequencyInput && frequencyDropdownRef.current) {
      setTimeout(() => {
        const highlightedItem = frequencyDropdownRef.current?.querySelector('.highlighted-item');
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [dosageFrequencyInput]);

  // Auto-scroll effect for condition dropdown
  useEffect(() => {
    if (dosageConditionInput && conditionDropdownRef.current) {
      setTimeout(() => {
        const highlightedItem = conditionDropdownRef.current?.querySelector('.highlighted-item');
        if (highlightedItem) {
          highlightedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [dosageConditionInput]);

  // Dosage Form handlers
  const handleFormInputChange = (value: string) => {
    setDosageFormInput(value);
    if (dosageForm && !dosageForm.toLowerCase().includes(value.toLowerCase())) {
      setDosageForm("");
    }
  };

  const handleFormSelect = (form: string) => {
    setDosageForm(form);
    setDosageFormInput(form);
    setShowFormDropdown(false);
    // Move focus to amount input after form selection (new order)
    setTimeout(() => {
      dosageAmountInputRef.current?.focus();
    }, 100);
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const exactMatch = dosageForms.find(form => 
        form.toLowerCase() === dosageFormInput.toLowerCase()
      );
      
      if (exactMatch) {
        handleFormSelect(exactMatch);
      } else if (dosageFormInput) {
        const highlightedOptions = dosageForms.filter(form =>
          form.toLowerCase().startsWith(dosageFormInput.toLowerCase())
        );
        
        if (highlightedOptions.length === 1) {
          handleFormSelect(highlightedOptions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowFormDropdown(false);
    }
  };

  const isFormHighlighted = (form: string) => {
    if (!dosageFormInput) return false;
    return form.toLowerCase().startsWith(dosageFormInput.toLowerCase());
  };

  // Dosage Unit handlers
  const handleUnitInputChange = (value: string) => {
    setDosageUnitInput(value);
    if (dosageUnit && !dosageUnit.toLowerCase().includes(value.toLowerCase())) {
      setDosageUnit("");
    }
  };

  const handleUnitSelect = (unit: string) => {
    setDosageUnit(unit);
    setDosageUnitInput(unit);
    setShowUnitDropdown(false);
    // Move focus to frequency input after unit selection (new order)
    setTimeout(() => {
      dosageFrequencyInputRef.current?.focus();
    }, 100);
  };

  const handleUnitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const availableUnits = dosageUnits[dosageForm as keyof typeof dosageUnits] || [];
      const exactMatch = availableUnits.find(unit => 
        unit.toLowerCase() === dosageUnitInput.toLowerCase()
      );
      
      if (exactMatch) {
        handleUnitSelect(exactMatch);
      } else if (dosageUnitInput) {
        const highlightedOptions = availableUnits.filter(unit =>
          unit.toLowerCase().startsWith(dosageUnitInput.toLowerCase())
        );
        
        if (highlightedOptions.length === 1) {
          handleUnitSelect(highlightedOptions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowUnitDropdown(false);
    }
  };

  const isUnitHighlighted = (unit: string) => {
    if (!dosageUnitInput) return false;
    return unit.toLowerCase().startsWith(dosageUnitInput.toLowerCase());
  };

  // Dosage Frequency handlers
  const handleFrequencyInputChange = (value: string) => {
    setDosageFrequencyInput(value);
    if (dosageFrequency && !dosageFrequency.toLowerCase().includes(value.toLowerCase())) {
      setDosageFrequency("");
    }
  };

  const handleFrequencySelect = (frequency: string) => {
    setDosageFrequency(frequency);
    setDosageFrequencyInput(frequency);
    setShowFrequencyDropdown(false);
    // Move focus to condition input after frequency selection
    setTimeout(() => {
      dosageConditionInputRef.current?.focus();
    }, 100);
  };

  const handleFrequencyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const exactMatch = dosageFrequencies.find(freq => 
        freq.toLowerCase() === dosageFrequencyInput.toLowerCase()
      );
      
      if (exactMatch) {
        handleFrequencySelect(exactMatch);
      } else if (dosageFrequencyInput) {
        const highlightedOptions = dosageFrequencies.filter(freq =>
          freq.toLowerCase().startsWith(dosageFrequencyInput.toLowerCase())
        );
        
        if (highlightedOptions.length === 1) {
          handleFrequencySelect(highlightedOptions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowFrequencyDropdown(false);
    }
  };

  const isFrequencyHighlighted = (frequency: string) => {
    if (!dosageFrequencyInput) return false;
    return frequency.toLowerCase().startsWith(dosageFrequencyInput.toLowerCase());
  };

  // Dosage Condition handlers
  const handleConditionInputChange = (value: string) => {
    setDosageConditionInput(value);
    if (dosageCondition && !dosageCondition.toLowerCase().includes(value.toLowerCase())) {
      setDosageCondition("");
    }
  };

  const handleConditionSelect = (condition: string) => {
    setDosageCondition(condition);
    setDosageConditionInput(condition);
    setShowConditionDropdown(false);
    // Move focus to broad category button after condition selection
    setTimeout(() => {
      broadCategoryBtnRef.current?.focus();
    }, 100);
  };

  const handleConditionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const exactMatch = dosageConditions.find(condition => 
        condition.toLowerCase() === dosageConditionInput.toLowerCase()
      );
      
      if (exactMatch) {
        handleConditionSelect(exactMatch);
      } else if (dosageConditionInput) {
        const highlightedOptions = dosageConditions.filter(condition =>
          condition.toLowerCase().startsWith(dosageConditionInput.toLowerCase())
        );
        
        if (highlightedOptions.length === 1) {
          handleConditionSelect(highlightedOptions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowConditionDropdown(false);
    }
  };

  const isConditionHighlighted = (condition: string) => {
    if (!dosageConditionInput) return false;
    return condition.toLowerCase().startsWith(dosageConditionInput.toLowerCase());
  };

  // Helper function to get input position for fixed positioning
  const getInputPosition = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (!inputRef.current) return { top: 0, left: 0, width: 0 };
    
    const rect = inputRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  };

  const renderCalendar = (year: number, month: number, onDateSelect: (date: Date) => void, onSkip: () => void) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const today = new Date();
    
    const days = [];
    
    // Always generate exactly 42 cells (6 rows × 7 days) for consistent calendar size
    for (let i = 0; i < 42; i++) {
      if (i < firstDayOfMonth) {
        // Empty cells before the month starts
        days.push(<div key={`empty-before-${i}`} className="w-8 h-8"></div>);
      } else if (i < firstDayOfMonth + daysInMonth) {
        // Days of the current month
        const day = i - firstDayOfMonth + 1;
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        
        days.push(
          <button
            key={day}
            onClick={() => onDateSelect(date)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onDateSelect(date);
              }
            }}
            className={`w-8 h-8 rounded-xl hover:glass-secondary focus:glass-secondary focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:outline-none transition-all duration-200 ${
              isToday ? 'glass text-primary font-medium' : 'hover:bg-blue-50/80 text-foreground'
            }`}
          >
            {day}
          </button>
        );
      } else {
        // Empty cells after the month ends
        days.push(<div key={`empty-after-${i}`} className="w-8 h-8"></div>);
      }
    }

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
        <div className="glass-lg rounded-2xl p-8 w-96 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCalendarYear(prev => prev - 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarYear(prev => prev - 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:glass-secondary transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-16 text-center">{year}</span>
                <button 
                  onClick={() => setCalendarYear(prev => prev + 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarYear(prev => prev + 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:glass-secondary transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCalendarMonth(prev => prev === 0 ? 11 : prev - 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarMonth(prev => prev === 0 ? 11 : prev - 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:glass-secondary transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-24 text-center">
                  {new Date(year, month).toLocaleString('default', { month: 'long' })}
                </span>
                <button 
                  onClick={() => setCalendarMonth(prev => prev === 11 ? 0 : prev + 1)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setCalendarMonth(prev => prev === 11 ? 0 : prev + 1);
                    }
                  }}
                  className="p-2 rounded-xl hover:glass-secondary transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onSkip}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSkip();
                }
              }}
              className="glass-secondary border-white/20 hover:glass text-foreground"
            >
              Skip
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 h-48">
            {days}
          </div>
        </div>
      </div>
    );
  };

  // Category mappings - centralized for consistency
  const categoryMappings = {
    "Mental Health": ["Anxiety", "Depression"],
    "Cardiovascular": ["Hypertension"],
    "Diabetes": ["Type 2 Diabetes"],
    "Pain Management": ["Anti-inflammatory"]
  };

  // Get all available specific categories for selected broad categories
  const getAvailableSpecificCategories = () => {
    const availableSpecific: string[] = [];
    selectedBroadCategories.forEach(broad => {
      const specificCats = categoryMappings[broad as keyof typeof categoryMappings] || [];
      availableSpecific.push(...specificCats);
    });
    return availableSpecific.sort();
  };

  // Generate medication reason permutations
  const generateMedicationReasons = () => {
    const reasons: string[] = [];

    selectedBroadCategories.forEach(broad => {
      const availableSpecific = categoryMappings[broad as keyof typeof categoryMappings] || [];
      const selectedForBroad = selectedSpecificCategories.filter(specific => 
        availableSpecific.includes(specific)
      );
      
      if (selectedForBroad.length > 0) {
        selectedForBroad.forEach(specific => {
          reasons.push(`${broad}: ${specific}`);
        });
      }
    });

    return reasons;
  };

  const canSave = selectedMedication && dosageForm && dosageAmount && isValidAmount && dosageUnit && dosageFrequency && dosageCondition && categoriesCompleted;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-30 px-8 py-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Medication Administration Record</h1>
          {selectedClient && (
            <div className="text-lg font-medium text-blue-600 px-4 py-2 glass-secondary rounded-xl">
              Client: {selectedClient}
            </div>
          )}
        </div>
      </header>

      <div className="p-8">
        {/* Client Selection */}
        {!selectedClient && (
          <div className="glass rounded-2xl border border-white/20 overflow-hidden">
            <div className="glass-secondary p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold">Select Client</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["John Smith", "Sarah Johnson", "Michael Brown"].map((client) => (
                  <Button
                    key={client}
                    variant="outline"
                    onClick={() => handleClientSelect(client)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleClientSelect(client);
                      }
                    }}
                    className="h-24 glass-secondary border-white/20 hover:glass text-foreground font-medium transition-all duration-300 hover:scale-105"
                  >
                    {client}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Medication List */}
        {showMedicationList && !showAddMedication && !showMedicationEntry && (
          <div className="glass rounded-2xl border border-white/20 overflow-hidden">
            <div className="glass-secondary p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold">Current Medications</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockMedications.map((med) => (
                  <div key={med.id} className="p-6 glass-secondary rounded-xl border border-white/10">
                    <div className="font-medium text-lg">{med.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {med.frequency} - {med.condition}
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={handleAddNewMedication} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNewMedication();
                    }
                  }}
                  className="w-full h-16 glass-secondary border-white/20 hover:glass text-foreground font-medium transition-all duration-300 hover:scale-105"
                  variant="outline"
                >
                  Add New Medication
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Medication Type Selection */}
        {showAddMedication && (
          <div className="glass rounded-2xl border border-white/20 overflow-hidden">
            <div className="glass-secondary p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold">Select Medication Type</h3>
            </div>
            <div className="p-6">
              <div className="flex gap-6">
                <Button
                  variant={medicationType === "OTC Medication" ? "default" : "outline"}
                  onClick={() => handleMedicationTypeSelect("OTC Medication")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMedicationTypeSelect("OTC Medication");
                    }
                  }}
                  className={`h-16 px-8 font-medium transition-all duration-300 hover:scale-105 ${
                    medicationType === "OTC Medication" 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'glass-secondary border-white/20 text-foreground hover:glass'
                  }`}
                >
                  OTC Medication
                </Button>
                <Button
                  variant={medicationType === "Prescribed Medication" ? "default" : "outline"}
                  onClick={() => handleMedicationTypeSelect("Prescribed Medication")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMedicationTypeSelect("Prescribed Medication");
                    }
                  }}
                  className={`h-16 px-8 font-medium transition-all duration-300 hover:scale-105 ${
                    medicationType === "Prescribed Medication" 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                      : 'glass-secondary border-white/20 text-foreground hover:glass'
                  }`}
                >
                  Prescribed Medication
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Medication Entry Modal */}
        {showMedicationEntry && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in duration-200">
            <div className="glass-lg rounded-3xl max-w-3xl w-full max-h-[90vh] m-4 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
              <div className="p-8 pb-0 flex-shrink-0">
                <h2 className="text-2xl font-semibold">Add New Prescribed Medication</h2>
              </div>
              
              <div className={`flex-1 p-8 pt-8 ${isMedicationEntryTopmost() ? 'invisible-scrollbar' : 'overflow-hidden'}`}>
                <div className="space-y-8">
                  {/* Medication Name */}
                  <div className="relative">
                    <Label htmlFor="medication-name" className="text-sm font-medium text-foreground/80 mb-2 block">Medication Name</Label>
                    <div className="relative">
                      <Input
                        id="medication-name"
                        ref={medicationInputRef}
                        value={medicationName}
                        onChange={(e) => setMedicationName(e.target.value)}
                        onKeyDown={handleMedicationNameKeyDown}
                        onFocus={() => setShowMedicationDropdown(true)}
                        onBlur={() => setTimeout(() => setShowMedicationDropdown(false), 200)}
                        placeholder="Start typing medication name or click to see options..."
                        autoComplete="off"
                        autoFocus
                        className="glass-secondary border-white/20 focus:glass focus:border-blue-400/50 h-12 text-base pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMedicationDropdown(!showMedicationDropdown)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:glass-tertiary transition-all duration-200"
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    {selectedMedication && (
                      <div className="mt-3 flex gap-2">
                        {selectedMedication.isPsychotropic && (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1">Psychotropic</Badge>
                        )}
                        {selectedMedication.isControlled && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1">Controlled</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dosage Form - Custom Autocomplete */}
                  {selectedMedication && (
                    <div className="relative">
                      <Label htmlFor="dosage-form-input" className="text-sm font-medium text-foreground/80 mb-2 block">Dosage Form</Label>
                      <div className="relative">
                        <Input
                          id="dosage-form-input"
                          ref={dosageFormInputRef}
                          value={dosageFormInput}
                          onChange={(e) => handleFormInputChange(e.target.value)}
                          onKeyDown={handleFormKeyDown}
                          onFocus={() => setShowFormDropdown(true)}
                          onBlur={() => setTimeout(() => setShowFormDropdown(false), 200)}
                          placeholder="Start typing form or click to see options..."
                          autoComplete="off"
                          className="glass-secondary border-white/20 focus:glass focus:border-blue-400/50 h-12 text-base pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFormDropdown(!showFormDropdown)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:glass-tertiary transition-all duration-200"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dosage Amount - Moved to position 3 */}
                  {dosageForm && (
                    <div className="relative">
                      {showMirroredAmount && (
                        <div
                          className={`absolute top-0 left-0 -mt-12 p-3 rounded-xl cursor-pointer z-10 transition-all duration-200 ${
                            isValidAmount 
                              ? 'glass-secondary text-green-600 border border-green-400/30' 
                              : 'bg-red-50/90 text-red-600 border border-red-400/30'
                          }`}
                          onClick={handleMirroredAmountClick}
                        >
                          {mirroredAmount}
                        </div>
                      )}
                      <Label htmlFor="dosage-amount" className="text-sm font-medium text-foreground/80 mb-2 block">Dosage Amount</Label>
                      <Input
                        id="dosage-amount"
                        ref={dosageAmountInputRef}
                        value={dosageAmount}
                        onChange={(e) => handleDosageAmountChange(e.target.value)}
                        onKeyDown={handleDosageAmountKeyDown}
                        onBlur={handleManualFocusChange}
                        placeholder="Enter numeric value"
                        autoComplete="off"
                        className="glass-secondary border-white/20 focus:glass focus:border-blue-400/50 h-12 text-base"
                      />
                    </div>
                  )}

                  {/* Dosage Unit of Measure - Moved to position 4 */}
                  {isValidAmount && (
                    <div className="relative">
                      <Label htmlFor="dosage-unit-input" className="text-sm font-medium text-foreground/80 mb-2 block">Dosage Unit of Measure</Label>
                      <div className="relative">
                        <Input
                          id="dosage-unit-input"
                          ref={dosageUnitInputRef}
                          value={dosageUnitInput}
                          onChange={(e) => handleUnitInputChange(e.target.value)}
                          onKeyDown={handleUnitKeyDown}
                          onFocus={() => setShowUnitDropdown(true)}
                          onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                          placeholder="Start typing unit or click to see options..."
                          autoComplete="off"
                          className="glass-secondary border-white/20 focus:glass focus:border-blue-400/50 h-12 text-base pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:glass-tertiary transition-all duration-200"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dosage Frequency - Custom Autocomplete with Highlighting */}
                  {dosageUnit && (
                    <div className="relative">
                      <Label htmlFor="dosage-frequency-input" className="text-sm font-medium text-foreground/80 mb-2 block">Dosage Frequency</Label>
                      <div className="relative">
                        <Input
                          id="dosage-frequency-input"
                          ref={dosageFrequencyInputRef}
                          value={dosageFrequencyInput}
                          onChange={(e) => handleFrequencyInputChange(e.target.value)}
                          onKeyDown={handleFrequencyKeyDown}
                          onFocus={() => setShowFrequencyDropdown(true)}
                          onBlur={() => setTimeout(() => setShowFrequencyDropdown(false), 200)}
                          placeholder="Start typing frequency or click to see options..."
                          autoComplete="off"
                          className="glass-secondary border-white/20 focus:glass focus:border-blue-400/50 h-12 text-base pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:glass-tertiary transition-all duration-200"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dosage Condition - Custom Autocomplete */}
                  {dosageFrequency && (
                    <div className="relative">
                      <Label htmlFor="dosage-condition-input" className="text-sm font-medium text-foreground/80 mb-2 block">Dosage Condition</Label>
                      <div className="relative">
                        <Input
                          id="dosage-condition-input"
                          ref={dosageConditionInputRef}
                          value={dosageConditionInput}
                          onChange={(e) => handleConditionInputChange(e.target.value)}
                          onKeyDown={handleConditionKeyDown}
                          onFocus={() => setShowConditionDropdown(true)}
                          onBlur={() => setTimeout(() => setShowConditionDropdown(false), 200)}
                          placeholder="Start typing condition or click to see options..."
                          autoComplete="off"
                          className="glass-secondary border-white/20 focus:glass focus:border-blue-400/50 h-12 text-base pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConditionDropdown(!showConditionDropdown)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:glass-tertiary transition-all duration-200"
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Medication Reason */}
                  {dosageCondition && (
                    <div>
                      {!categoriesCompleted && (
                        <Label className="text-sm font-medium text-foreground/80 mb-2 block">Medication Reason</Label>
                      )}
                      <div className="space-y-3">
                        {!categoriesCompleted && selectedBroadCategories.length === 0 && (
                          <Button
                            variant="outline"
                            ref={broadCategoryBtnRef}
                            data-broad-category-btn
                            onClick={() => setShowBroadCategories(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setShowBroadCategories(true);
                              }
                            }}
                            className="glass-secondary border-white/20 hover:glass h-12 px-6"
                          >
                            Broad Category Purpose
                          </Button>
                        )}
                        
                        {!categoriesCompleted && selectedBroadCategories.length > 0 && selectedSpecificCategories.length === 0 && (
                          <Button
                            variant="outline"
                            ref={specificCategoryBtnRef}
                            onClick={() => setShowSpecificCategories(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setShowSpecificCategories(true);
                              }
                            }}
                            className="glass-secondary border-white/20 hover:glass h-12 px-6"
                          >
                            Specific Category Purpose
                          </Button>
                        )}
                        
                        {categoriesCompleted && (
                          <div className="glass-secondary rounded-xl p-4 border border-white/20">
                            <div className="text-sm font-medium mb-3 text-foreground/80">Medication Reasons:</div>
                            <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                              {generateMedicationReasons().map((reason, index) => (
                                <li key={index} className="text-foreground/70">{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Start Date */}
                  {categoriesCompleted && (
                    <div>
                      <Label className="text-sm font-medium text-foreground/80 mb-2 block">Medication Start Date</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          ref={startDateBtnRef}
                          data-start-date-btn
                          onClick={() => setShowStartDateCalendar(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setShowStartDateCalendar(true);
                            }
                          }}
                          className="glass-secondary border-white/20 hover:glass h-10 px-4"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        {startDate && (
                          <span className="text-sm glass-tertiary px-3 py-2 rounded-lg">
                            {startDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Discontinuation Date */}
                  {startDate && (
                    <div>
                      <Label className="text-sm font-medium text-foreground/80 mb-2 block">Medication Discontinuation Date</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          ref={discontinueDateBtnRef}
                          data-discontinue-date-btn
                          onClick={() => setShowDiscontinueDateCalendar(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setShowDiscontinueDateCalendar(true);
                            }
                          }}
                          className="glass-secondary border-white/20 hover:glass h-10 px-4"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        {discontinueDate && (
                          <span className="text-sm glass-tertiary px-3 py-2 rounded-lg">
                            {discontinueDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-8 pt-0 flex-shrink-0">
                <div className="flex justify-center gap-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMedicationEntry(false);
                      setShowAddMedication(false);
                      // Reset all form data
                      setMedicationName("");
                      setSelectedMedication(null);
                      setDosageForm("");
                      setDosageFormInput("");
                      setDosageAmount("");
                      setDosageUnit("");
                      setDosageUnitInput("");
                      setDosageFrequency("");
                      setDosageFrequencyInput("");
                      setDosageCondition("");
                      setDosageConditionInput("");
                      setSelectedBroadCategories([]);
                      setSelectedSpecificCategories([]);
                      setCategoriesCompleted(false);
                      setStartDate(null);
                      setDiscontinueDate(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowMedicationEntry(false);
                        setShowAddMedication(false);
                        // Reset all form data
                        setMedicationName("");
                        setSelectedMedication(null);
                        setDosageForm("");
                        setDosageFormInput("");
                        setDosageAmount("");
                        setDosageUnit("");
                        setDosageUnitInput("");
                        setDosageFrequency("");
                        setDosageFrequencyInput("");
                        setDosageCondition("");
                        setDosageConditionInput("");
                        setSelectedBroadCategories([]);
                        setSelectedSpecificCategories([]);
                        setCategoriesCompleted(false);
                        setStartDate(null);
                        setDiscontinueDate(null);
                      }
                    }}
                    className="glass-secondary border-white/20 hover:bg-red-50/80 hover:text-red-600 h-12 px-8"
                  >
                    Discard
                  </Button>
                  <Button
                    disabled={!canSave}
                    onClick={() => {
                      // Save medication logic would go here
                      alert("Medication saved successfully!");
                      setShowMedicationEntry(false);
                      setShowAddMedication(false);
                      // Reset all form data
                      setMedicationName("");
                      setSelectedMedication(null);
                      setDosageForm("");
                      setDosageFormInput("");
                      setDosageAmount("");
                      setDosageUnit("");
                      setDosageUnitInput("");
                      setDosageFrequency("");
                      setDosageFrequencyInput("");
                      setDosageCondition("");
                      setDosageConditionInput("");
                      setSelectedBroadCategories([]);
                      setSelectedSpecificCategories([]);
                      setCategoriesCompleted(false);
                      setStartDate(null);
                      setDiscontinueDate(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canSave) {
                        // Same save logic as onClick
                        alert("Medication saved successfully!");
                        setShowMedicationEntry(false);
                        setShowAddMedication(false);
                        // Reset all form data
                        setMedicationName("");
                        setSelectedMedication(null);
                        setDosageForm("");
                        setDosageFormInput("");
                        setDosageAmount("");
                        setDosageUnit("");
                        setDosageUnitInput("");
                        setDosageFrequency("");
                        setDosageFrequencyInput("");
                        setDosageCondition("");
                        setDosageConditionInput("");
                        setSelectedBroadCategories([]);
                        setSelectedSpecificCategories([]);
                        setCategoriesCompleted(false);
                        setStartDate(null);
                        setDiscontinueDate(null);
                      }
                    }}
                    className={`h-12 px-8 transition-all duration-300 ${
                      canSave 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                        : 'glass-tertiary text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fixed positioned dropdowns using portal-like rendering */}
        {showMedicationDropdown && !selectedMedication && medicationInputRef.current && (
          <div 
            ref={medicationDropdownRef}
            className="fixed glass-lg rounded-xl border border-white/20 max-h-48 overflow-y-auto z-[100]"
            style={{
              ...getInputPosition(medicationInputRef),
              marginTop: '4px'
            }}
          >
            {filteredMedications.map((med, index) => {
              const isHighlighted = isMedicationHighlighted(med);
              return (
                <button
                  key={index}
                  onClick={() => handleMedicationSelect(med)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMedicationSelect(med);
                    }
                  }}
                  className={`w-full text-left p-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-white/10 last:border-b-0 focus:outline-none ${
                    isHighlighted 
                      ? 'glass text-blue-600 font-medium shadow-lg backdrop-blur-20 border-l-4 border-l-blue-500 highlighted-item' 
                      : 'hover:glass-secondary focus:glass-secondary'
                  }`}
                >
                  {med.name}
                </button>
              );
            })}
          </div>
        )}

        {showFormDropdown && dosageFormInputRef.current && (
          <div 
            ref={formDropdownRef}
            className="fixed glass-lg rounded-xl border border-white/20 max-h-48 overflow-y-auto z-[100]"
            style={{
              ...getInputPosition(dosageFormInputRef),
              marginTop: '4px'
            }}
          >
            {dosageForms.map((form, index) => {
              const isHighlighted = isFormHighlighted(form);
              return (
                <button
                  key={index}
                  onClick={() => handleFormSelect(form)}
                  className={`w-full text-left p-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-white/10 last:border-b-0 focus:outline-none ${
                    isHighlighted 
                      ? 'glass text-blue-600 font-medium shadow-lg backdrop-blur-20 border-l-4 border-l-blue-500 highlighted-item' 
                      : 'hover:glass-secondary focus:glass-secondary'
                  }`}
                >
                  {form}
                </button>
              );
            })}
          </div>
        )}

        {showUnitDropdown && dosageUnits[dosageForm as keyof typeof dosageUnits] && dosageUnitInputRef.current && (
          <div 
            ref={unitDropdownRef}
            className="fixed glass-lg rounded-xl border border-white/20 max-h-48 overflow-y-auto z-[100]"
            style={{
              ...getInputPosition(dosageUnitInputRef),
              marginTop: '4px'
            }}
          >
            {dosageUnits[dosageForm as keyof typeof dosageUnits].map((unit, index) => {
              const isHighlighted = isUnitHighlighted(unit);
              return (
                <button
                  key={index}
                  onClick={() => handleUnitSelect(unit)}
                  className={`w-full text-left p-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-white/10 last:border-b-0 focus:outline-none ${
                    isHighlighted 
                      ? 'glass text-blue-600 font-medium shadow-lg backdrop-blur-20 border-l-4 border-l-blue-500 highlighted-item' 
                      : 'hover:glass-secondary focus:glass-secondary'
                  }`}
                >
                  {unit}
                </button>
              );
            })}
          </div>
        )}

        {showFrequencyDropdown && dosageFrequencyInputRef.current && (
          <div 
            ref={frequencyDropdownRef}
            className="fixed glass-lg rounded-xl border border-white/20 max-h-48 overflow-y-auto z-[100]"
            style={{
              ...getInputPosition(dosageFrequencyInputRef),
              marginTop: '4px'
            }}
          >
            {dosageFrequencies.map((freq, index) => {
              const isHighlighted = isFrequencyHighlighted(freq);
              return (
                <button
                  key={index}
                  onClick={() => handleFrequencySelect(freq)}
                  className={`w-full text-left p-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-white/10 last:border-b-0 focus:outline-none ${
                    isHighlighted 
                      ? 'glass text-blue-600 font-medium shadow-lg backdrop-blur-20 border-l-4 border-l-blue-500 highlighted-item' 
                      : 'hover:glass-secondary focus:glass-secondary'
                  }`}
                >
                  {freq}
                </button>
              );
            })}
          </div>
        )}

        {showConditionDropdown && dosageConditionInputRef.current && (
          <div 
            ref={conditionDropdownRef}
            className="fixed glass-lg rounded-xl border border-white/20 max-h-48 overflow-y-auto z-[100]"
            style={{
              ...getInputPosition(dosageConditionInputRef),
              marginTop: '4px'
            }}
          >
            {dosageConditions.map((condition, index) => {
              const isHighlighted = isConditionHighlighted(condition);
              return (
                <button
                  key={index}
                  onClick={() => handleConditionSelect(condition)}
                  className={`w-full text-left p-3 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl border-b border-white/10 last:border-b-0 focus:outline-none ${
                    isHighlighted 
                      ? 'glass text-blue-600 font-medium shadow-lg backdrop-blur-20 border-l-4 border-l-blue-500 highlighted-item' 
                      : 'hover:glass-secondary focus:glass-secondary'
                  }`}
                >
                  {condition}
                </button>
              );
            })}
          </div>
        )}

        {/* Broad Categories Modal */}
        {showBroadCategories && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && selectedBroadCategories.length > 0) {
                setShowBroadCategories(false);
              } else if (e.key === 'Escape') {
                setShowBroadCategories(false);
              }
            }}
          >
            <div className="glass-lg rounded-2xl p-8 max-w-md w-full m-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Select Broad Categories</h3>
                <Button
                  disabled={selectedBroadCategories.length === 0}
                  onClick={() => setShowBroadCategories(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && selectedBroadCategories.length > 0) {
                      setShowBroadCategories(false);
                    }
                  }}
                  className={`h-10 px-6 transition-all duration-300 ${
                    selectedBroadCategories.length > 0
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                      : 'glass-tertiary text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Done
                </Button>
              </div>
              <div className="space-y-4">
                {["Cardiovascular", "Diabetes", "Mental Health", "Pain Management"].map((category) => (
                  <div key={category} className="flex items-center space-x-4 p-4 rounded-xl glass-secondary hover:glass transition-all duration-200 border border-white/10">
                    <Checkbox
                      id={category}
                      checked={selectedBroadCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBroadCategories(prev => [...prev, category]);
                        } else {
                          setSelectedBroadCategories(prev => prev.filter(c => c !== category));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const isCurrentlyChecked = selectedBroadCategories.includes(category);
                          if (isCurrentlyChecked) {
                            setSelectedBroadCategories(prev => prev.filter(c => c !== category));
                          } else {
                            setSelectedBroadCategories(prev => [...prev, category]);
                          }
                        }
                      }}
                      className="checkbox-glass w-6 h-6 rounded-lg"
                    />
                    <label htmlFor={category} className="text-sm font-medium flex-1 cursor-pointer text-foreground">{category}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Specific Categories Modal */}
        {showSpecificCategories && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && selectedSpecificCategories.length > 0) {
                setShowSpecificCategories(false);
                setCategoriesCompleted(true);
              } else if (e.key === 'Escape') {
                setShowSpecificCategories(false);
              }
            }}
          >
            <div className="glass-lg rounded-2xl p-8 max-w-md w-full m-4 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Select Specific Categories</h3>
                <Button
                  disabled={selectedSpecificCategories.length === 0}
                  onClick={() => {
                    setShowSpecificCategories(false);
                    setCategoriesCompleted(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && selectedSpecificCategories.length > 0) {
                      setShowSpecificCategories(false);
                      setCategoriesCompleted(true);
                    }
                  }}
                  className={`h-10 px-6 transition-all duration-300 ${
                    selectedSpecificCategories.length > 0
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                      : 'glass-tertiary text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Done
                </Button>
              </div>
              <div className="space-y-4">
                {getAvailableSpecificCategories().map((specificCategory) => (
                  <div key={specificCategory} className="flex items-center space-x-4 p-4 rounded-xl glass-secondary hover:glass transition-all duration-200 border border-white/10">
                    <Checkbox
                      id={specificCategory.toLowerCase().replace(/\s+/g, '')}
                      checked={selectedSpecificCategories.includes(specificCategory)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSpecificCategories(prev => [...prev, specificCategory]);
                        } else {
                          setSelectedSpecificCategories(prev => prev.filter(c => c !== specificCategory));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const isCurrentlyChecked = selectedSpecificCategories.includes(specificCategory);
                          if (isCurrentlyChecked) {
                            setSelectedSpecificCategories(prev => prev.filter(c => c !== specificCategory));
                          } else {
                            setSelectedSpecificCategories(prev => [...prev, specificCategory]);
                          }
                        }
                      }}
                      className="checkbox-glass w-6 h-6 rounded-lg"
                    />
                    <label htmlFor={specificCategory.toLowerCase().replace(/\s+/g, '')} className="text-sm font-medium flex-1 cursor-pointer text-foreground">{specificCategory}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prohibit Manual Refocus Modal */}
        {showProhibitModal && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setShowProhibitModal(false);
                setShowMirroredAmount(true);
                // Return focus to dosage amount input and position cursor at the end
                setTimeout(() => {
                  if (dosageAmountInputRef.current) {
                    dosageAmountInputRef.current.focus();
                    // Position cursor at the end of the text
                    const length = dosageAmountInputRef.current.value.length;
                    dosageAmountInputRef.current.setSelectionRange(length, length);
                  }
                }, 100);
              }
            }}
          >
            <div className="glass-lg rounded-2xl p-8 max-w-sm w-full m-4 animate-in zoom-in-95 duration-200">
              <p className="mb-6 text-center">You must enter a valid number for the Dosage Amount field.</p>
              <Button
                onClick={() => {
                  setShowProhibitModal(false);
                  setShowMirroredAmount(true);
                  // Return focus to dosage amount input and position cursor at the end
                  setTimeout(() => {
                    if (dosageAmountInputRef.current) {
                      dosageAmountInputRef.current.focus();
                      // Position cursor at the end of the text
                      const length = dosageAmountInputRef.current.value.length;
                      dosageAmountInputRef.current.setSelectionRange(length, length);
                    }
                  }, 100);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setShowProhibitModal(false);
                    setShowMirroredAmount(true);
                    // Return focus to dosage amount input and position cursor at the end
                    setTimeout(() => {
                      if (dosageAmountInputRef.current) {
                        dosageAmountInputRef.current.focus();
                        // Position cursor at the end of the text
                        const length = dosageAmountInputRef.current.value.length;
                        dosageAmountInputRef.current.setSelectionRange(length, length);
                      }
                    }, 100);
                  }
                }}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                autoFocus
              >
                OK
              </Button>
            </div>
          </div>
        )}

        {/* Start Date Calendar */}
        {showStartDateCalendar && renderCalendar(
          calendarYear,
          calendarMonth,
          (date) => {
            setStartDate(date);
            setShowStartDateCalendar(false);
          },
          () => setShowStartDateCalendar(false)
        )}

        {/* Discontinuation Date Calendar */}
        {showDiscontinueDateCalendar && renderCalendar(
          calendarYear,
          calendarMonth,
          (date) => {
            setDiscontinueDate(date);
            setShowDiscontinueDateCalendar(false);
          },
          () => setShowDiscontinueDateCalendar(false)
        )}
      </div>
    </div>
  );
}