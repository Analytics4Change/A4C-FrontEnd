# Frontend Architecture Plan - A4C-FrontEnd

## Executive Summary

This document outlines the architectural transformation plan for the A4C-FrontEnd repository, moving from a monolithic React component to a well-structured MVVM (Model-View-ViewModel) architecture with clear separation of concerns and proper frontend patterns.

## Current State Analysis

### Problems Identified

#### 1. **Monolithic Component (Critical)**
- `App.tsx` contains 1,629 lines of code
- Violates Single Responsibility Principle
- Contains 30+ state variables mixing UI state, business logic, and data
- Extremely difficult to test, maintain, or extend
- Multiple developers cannot work on different features simultaneously

#### 2. **State Management Chaos**
- No centralized state management solution
- Complex state interdependencies managed manually through multiple `useState` calls
- State updates trigger cascading effects that are hard to track
- No clear data flow pattern

#### 3. **Hard-coded Mock Data**
- Mock data directly embedded in components
- Cannot easily switch between development and production data
- Difficult to test with different data scenarios
- No clear API contract defined

#### 4. **Poor Type Safety**
- Using `any` type for critical objects (e.g., medication objects)
- Missing TypeScript interfaces for domain models
- Event handlers and callbacks lack proper typing
- No compile-time safety for API responses

#### 5. **Missing Abstraction Layers**
- Business logic mixed with presentation layer
- No service layer for API communication
- Validation logic scattered throughout components
- No clear boundaries between concerns

#### 6. **Accessibility Issues**
- Custom dropdown implementations don't follow ARIA patterns
- Keyboard navigation is incomplete
- Focus management is manual and error-prone
- No screen reader considerations

## Proposed Architecture: MVVM Pattern

### Why MVVM for This Project?

1. **Complex Form State**: The medication entry form manages 30+ interdependent state variables
2. **Reactive UI**: Extensive conditional rendering and dynamic validation
3. **Testability**: ViewModels can be tested independently of React components
4. **Team Scalability**: Clear separation allows parallel development

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Views    │  │  ViewModels │  │    Hooks    │    │
│  │   (React)   │◄─┤   (MobX)    │  │  (Custom)   │    │
│  └─────────────┘  └──────┬──────┘  └─────────────┘    │
└──────────────────────────┼─────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────┐
│                    Service Layer                         │
│  ┌─────────────┐  ┌──────┴──────┐  ┌─────────────┐    │
│  │  API Client │  │Mock Service │  │ Validation  │    │
│  │ Interfaces  │  │   Layer     │  │  Services   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## New Project Structure

```
src/
├── viewModels/              # MVVM ViewModels (State Management)
│   ├── medication/
│   │   ├── MedicationEntryViewModel.ts
│   │   ├── MedicationListViewModel.ts
│   │   └── MedicationSearchViewModel.ts
│   ├── client/
│   │   └── ClientSelectionViewModel.ts
│   └── shared/
│       ├── CalendarViewModel.ts
│       └── NavigationViewModel.ts
│
├── views/                   # React Components (Presentation)
│   ├── pages/
│   │   ├── MedicationAdminPage.tsx
│   │   └── layouts/
│   │       └── AdminLayout.tsx
│   ├── medication/
│   │   ├── MedicationEntryModal/
│   │   │   ├── index.tsx
│   │   │   ├── MedicationSearch.tsx
│   │   │   ├── DosageForm.tsx
│   │   │   └── CategorySelection.tsx
│   │   ├── MedicationList/
│   │   │   ├── index.tsx
│   │   │   ├── MedicationCard.tsx
│   │   │   └── MedicationFilters.tsx
│   │   └── components/
│   │       ├── DosageAmountInput.tsx
│   │       ├── FrequencySelector.tsx
│   │       └── ValidationMessage.tsx
│   ├── client/
│   │   ├── ClientSelector.tsx
│   │   └── ClientCard.tsx
│   └── shared/
│       ├── Calendar/
│       ├── Dropdown/
│       └── Modal/
│
├── hooks/                   # Custom React Hooks
│   ├── useViewModel.ts      # ViewModel instantiation
│   ├── useValidation.ts     # Form validation
│   ├── useDebounce.ts       # Input debouncing
│   ├── useAutoComplete.ts   # Autocomplete logic
│   └── useKeyboardNav.ts    # Keyboard navigation
│
├── services/               # Service Layer
│   ├── api/
│   │   ├── clients/
│   │   │   ├── MedicationApiClient.ts
│   │   │   └── ClientApiClient.ts
│   │   └── interfaces/
│   │       ├── IMedicationApi.ts
│   │       └── IClientApi.ts
│   ├── mock/
│   │   ├── MockMedicationApi.ts
│   │   └── MockClientApi.ts
│   └── validation/
│       ├── DosageValidator.ts
│       └── DateValidator.ts
│
├── types/                  # TypeScript Definitions
│   ├── models/
│   │   ├── Medication.ts
│   │   ├── Client.ts
│   │   └── Dosage.ts
│   ├── api/
│   │   ├── ApiResponse.ts
│   │   └── ApiError.ts
│   └── ui/
│       ├── FormState.ts
│       └── ViewState.ts
│
├── mocks/                  # Development Mock Data
│   ├── data/
│   │   ├── medications.mock.ts
│   │   ├── clients.mock.ts
│   │   ├── categories.mock.ts
│   │   └── dosages.mock.ts
│   ├── handlers/           # MSW Request Handlers
│   │   ├── medication.handlers.ts
│   │   └── client.handlers.ts
│   └── browser.ts          # MSW Setup
│
├── utils/                  # Utility Functions
│   ├── formatters/
│   │   ├── medication.formatter.ts
│   │   └── date.formatter.ts
│   ├── validators/
│   │   └── input.validators.ts
│   └── constants/
│       ├── dosage.constants.ts
│       └── ui.constants.ts
│
├── components/            # Existing shadcn/ui components
│   └── ui/
│
└── App.tsx               # Application Root
```

## Implementation Details

### 1. ViewModel Pattern (MobX)

```typescript
// viewModels/medication/MedicationEntryViewModel.ts
import { makeAutoObservable, reaction } from 'mobx';
import { IMedicationApi } from '@/services/api/interfaces/IMedicationApi';
import { Medication, DosageInfo } from '@/types/models';
import { DosageValidator } from '@/services/validation/DosageValidator';

export class MedicationEntryViewModel {
  // Observable State
  medicationName = '';
  selectedMedication: Medication | null = null;
  dosageForm = '';
  dosageAmount = '';
  dosageUnit = '';
  frequency = '';
  condition = '';
  
  // UI State
  isLoading = false;
  showMedicationDropdown = false;
  errors: Map<string, string> = new Map();
  
  // Search Results
  searchResults: Medication[] = [];

  constructor(
    private medicationApi: IMedicationApi,
    private validator: DosageValidator
  ) {
    makeAutoObservable(this);
    this.setupReactions();
  }

  // Computed Properties
  get isValidAmount(): boolean {
    return this.validator.isValidDosageAmount(this.dosageAmount);
  }

  get availableUnits(): string[] {
    if (!this.dosageForm) return [];
    return this.validator.getUnitsForForm(this.dosageForm);
  }

  get canSave(): boolean {
    return !!(
      this.selectedMedication &&
      this.dosageForm &&
      this.isValidAmount &&
      this.dosageUnit &&
      this.frequency &&
      this.condition &&
      this.errors.size === 0
    );
  }

  // Actions
  async searchMedications(query: string) {
    this.medicationName = query;
    
    if (query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.isLoading = true;
    try {
      this.searchResults = await this.medicationApi.searchMedications(query);
      this.showMedicationDropdown = true;
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
  }

  updateDosageAmount(value: string) {
    this.dosageAmount = value;
    this.validateDosageAmount();
  }

  async save() {
    if (!this.canSave) return;

    const dosageInfo: DosageInfo = {
      medicationId: this.selectedMedication!.id,
      form: this.dosageForm,
      amount: parseFloat(this.dosageAmount),
      unit: this.dosageUnit,
      frequency: this.frequency,
      condition: this.condition
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

  reset() {
    this.medicationName = '';
    this.selectedMedication = null;
    this.dosageForm = '';
    this.dosageAmount = '';
    this.dosageUnit = '';
    this.frequency = '';
    this.condition = '';
    this.errors.clear();
    this.searchResults = [];
  }

  // Private Methods
  private setupReactions() {
    // Auto-validate dosage amount
    reaction(
      () => this.dosageAmount,
      () => this.validateDosageAmount()
    );

    // Clear unit when form changes
    reaction(
      () => this.dosageForm,
      () => {
        this.dosageUnit = '';
      }
    );
  }

  private validateDosageAmount() {
    if (this.dosageAmount && !this.isValidAmount) {
      this.setError('dosageAmount', 'Please enter a valid number');
    } else {
      this.clearError('dosageAmount');
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
    // Could integrate with error reporting service
  }
}
```

### 2. View Component Pattern

```typescript
// views/medication/MedicationEntryModal/index.tsx
import { observer } from 'mobx-react-lite';
import { useViewModel } from '@/hooks/useViewModel';
import { MedicationEntryViewModel } from '@/viewModels/medication/MedicationEntryViewModel';
import { MedicationSearch } from './MedicationSearch';
import { DosageForm } from './DosageForm';
import { Button } from '@/components/ui/button';

export const MedicationEntryModal = observer(() => {
  const vm = useViewModel(MedicationEntryViewModel);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="glass-lg rounded-3xl max-w-3xl w-full m-4">
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-8">
            Add New Prescribed Medication
          </h2>
          
          <div className="space-y-8">
            <MedicationSearch
              value={vm.medicationName}
              searchResults={vm.searchResults}
              isLoading={vm.isLoading}
              showDropdown={vm.showMedicationDropdown}
              onSearch={(query) => vm.searchMedications(query)}
              onSelect={(med) => vm.selectMedication(med)}
              selectedMedication={vm.selectedMedication}
              error={vm.errors.get('medication')}
            />

            {vm.selectedMedication && (
              <DosageForm
                dosageForm={vm.dosageForm}
                onFormChange={(form) => vm.dosageForm = form}
                dosageAmount={vm.dosageAmount}
                onAmountChange={(amount) => vm.updateDosageAmount(amount)}
                dosageUnit={vm.dosageUnit}
                onUnitChange={(unit) => vm.dosageUnit = unit}
                availableUnits={vm.availableUnits}
                frequency={vm.frequency}
                onFrequencyChange={(freq) => vm.frequency = freq}
                condition={vm.condition}
                onConditionChange={(cond) => vm.condition = cond}
                errors={vm.errors}
              />
            )}

            <div className="flex justify-center gap-6">
              <Button 
                variant="outline" 
                onClick={() => vm.reset()}
                disabled={vm.isLoading}
              >
                Discard
              </Button>
              <Button 
                onClick={() => vm.save()}
                disabled={!vm.canSave || vm.isLoading}
                loading={vm.isLoading}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
```

### 3. Service Layer Architecture

```typescript
// services/api/interfaces/IMedicationApi.ts
export interface IMedicationApi {
  searchMedications(query: string): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication>;
  saveMedication(dosageInfo: DosageInfo): Promise<void>;
  getMedicationHistory(clientId: string): Promise<MedicationHistory[]>;
}

// services/mock/MockMedicationApi.ts
import { IMedicationApi } from '@/services/api/interfaces/IMedicationApi';
import { mockMedicationDatabase } from '@/mocks/data/medications.mock';

export class MockMedicationApi implements IMedicationApi {
  async searchMedications(query: string): Promise<Medication[]> {
    // Simulate network delay
    await this.simulateDelay(300);
    
    const results = mockMedicationDatabase.filter(med =>
      med.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return results;
  }

  async saveMedication(dosageInfo: DosageInfo): Promise<void> {
    await this.simulateDelay(500);
    console.log('Mock: Saving medication', dosageInfo);
    // In real implementation, this would persist to backend
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// services/api/clients/MedicationApiClient.ts
export class MedicationApiClient implements IMedicationApi {
  constructor(private baseUrl: string, private authToken: string) {}

  async searchMedications(query: string): Promise<Medication[]> {
    const response = await fetch(
      `${this.baseUrl}/api/medications/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new ApiError('Failed to search medications', response.status);
    }
    
    return response.json();
  }

  // ... other methods
}
```

### 4. Custom Hooks

```typescript
// hooks/useViewModel.ts
import { useMemo } from 'react';
import { useApiClient } from './useApiClient';
import { useDependencyInjection } from './useDependencyInjection';

export function useViewModel<T>(
  ViewModelClass: new (...args: any[]) => T
): T {
  const { getService } = useDependencyInjection();
  
  const viewModel = useMemo(() => {
    // Get dependencies
    const apiClient = getService('medicationApi');
    const validator = getService('dosageValidator');
    
    // Create view model with dependencies
    return new ViewModelClass(apiClient, validator);
  }, [ViewModelClass, getService]);

  return viewModel;
}

// hooks/useAutoComplete.ts
import { useState, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoCompleteOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  debounceMs?: number;
  minChars?: number;
}

export function useAutoComplete<T>({
  searchFn,
  debounceMs = 300,
  minChars = 2
}: UseAutoCompleteOptions<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const abortControllerRef = useRef<AbortController>();

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const items = await searchFn(searchQuery);
      setResults(items);
      setShowDropdown(true);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Autocomplete search failed:', error);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchFn, minChars]);

  const debouncedSearch = useDebounce(performSearch, debounceMs);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSelect = useCallback((item: T) => {
    setShowDropdown(false);
  }, []);

  const handleBlur = useCallback(() => {
    // Delay to allow click events on dropdown items
    setTimeout(() => setShowDropdown(false), 200);
  }, []);

  return {
    query,
    results,
    isLoading,
    showDropdown,
    handleInputChange,
    handleSelect,
    handleBlur,
    setShowDropdown
  };
}
```

### 5. Type Definitions

```typescript
// types/models/Medication.ts
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  brandNames?: string[];
  categories: MedicationCategory;
  flags: MedicationFlags;
  activeIngredients?: string[];
}

export interface MedicationCategory {
  broad: string;
  specific: string;
  therapeutic?: string;
}

export interface MedicationFlags {
  isPsychotropic: boolean;
  isControlled: boolean;
  isNarcotic: boolean;
  requiresMonitoring: boolean;
}

// types/models/Dosage.ts
export interface DosageInfo {
  medicationId: string;
  form: DosageForm;
  amount: number;
  unit: DosageUnit;
  frequency: DosageFrequency;
  condition: DosageCondition;
  startDate?: Date;
  discontinueDate?: Date;
  prescribingDoctor?: string;
  notes?: string;
}

export type DosageForm = 
  | 'Tablet'
  | 'Capsule'
  | 'Liquid'
  | 'Injection'
  | 'Topical'
  | 'Inhaler';

export type DosageUnit = 
  | 'mg'
  | 'mcg'
  | 'ml'
  | 'units'
  | 'puffs'
  | '%';

export interface DosageSchedule {
  frequency: DosageFrequency;
  condition: DosageCondition;
  times?: string[];
  daysOfWeek?: number[];
}
```

## Migration Strategy

### Phase 1: Project Setup (Week 1)

1. **Initialize Build System**
   ```bash
   npm init
   npm install react react-dom typescript vite @vitejs/plugin-react
   npm install mobx mobx-react-lite
   npm install -D @types/react @types/react-dom eslint prettier
   ```

2. **Configure TypeScript**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "useDefineForClassFields": true,
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "module": "ESNext",
       "skipLibCheck": true,
       "moduleResolution": "node",
       "strict": true,
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Setup Development Tools**
   - ESLint configuration
   - Prettier configuration
   - Git hooks with Husky
   - VS Code settings

### Phase 2: Mock Data Extraction (Week 1)

1. **Extract Mock Data**
   - Create `/mocks/data` directory
   - Move all hardcoded data from App.tsx
   - Create typed mock data files
   - Setup MSW for API mocking

2. **Create Mock Services**
   - Implement mock API interfaces
   - Add realistic delays
   - Include error scenarios
   - Create data generators

### Phase 3: ViewModel Implementation (Week 2)

1. **Setup MobX**
   - Configure MobX providers
   - Create base ViewModel class
   - Implement dependency injection

2. **Create ViewModels**
   - MedicationEntryViewModel
   - ClientSelectionViewModel
   - MedicationListViewModel
   - Extract all state logic from App.tsx

### Phase 4: Component Decomposition (Week 2-3)

1. **Create Component Structure**
   - Break App.tsx into ~20 focused components
   - Implement proper component hierarchy
   - Create reusable UI components

2. **Connect ViewModels**
   - Use observer HOC
   - Implement proper data binding
   - Handle loading and error states

### Phase 5: Service Layer (Week 3)

1. **Define API Interfaces**
   - Create service contracts
   - Define request/response types
   - Implement error handling

2. **Implement Services**
   - Mock implementations
   - Real API client stubs
   - Configuration for environment switching

### Phase 6: Testing & Optimization (Week 4)

1. **Add Testing**
   - Unit tests for ViewModels
   - Component tests with React Testing Library
   - Integration tests with MSW

2. **Performance Optimization**
   - Code splitting
   - Lazy loading
   - Bundle analysis

## Quality Metrics

### Code Quality Goals
- **Component Size**: No component > 200 lines
- **ViewModel Size**: No ViewModel > 300 lines
- **Type Coverage**: 100% TypeScript coverage
- **Test Coverage**: 80% minimum

### Performance Goals
- **Bundle Size**: < 500KB initial load
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: > 90

## Repository Boundaries

### This Repository (A4C-FrontEnd) Contains:
- React components and views
- ViewModels for UI state
- Frontend-specific validation
- Mock data for development
- UI utilities and helpers
- Frontend types and interfaces

### Backend Repository (A4C-API) Will Contain:
- RESTful API endpoints
- Domain models and entities
- Business logic and rules
- Database schemas
- Authentication/Authorization
- Backend validation

### Shared Types Repository (A4C-Types) Will Contain:
- API contracts
- Shared domain types
- Common constants
- Shared utilities

## Next Steps

1. **Immediate Actions**
   - Set up package.json and build configuration
   - Extract mock data from App.tsx
   - Create first ViewModel

2. **Short Term (2 weeks)**
   - Complete component decomposition
   - Implement all ViewModels
   - Setup testing infrastructure

3. **Medium Term (1 month)**
   - Full migration to new architecture
   - Comprehensive test coverage
   - Performance optimization

4. **Long Term**
   - Integration with backend API
   - Advanced features (offline support, real-time updates)
   - Mobile responsive design improvements

## Expo Development Setup

### Prerequisites

Before setting up Expo, ensure you have:
- Node.js 18+ installed (`node --version`)
- npm or yarn package manager
- VS Code installed
- iOS Simulator (macOS) or Android Studio (for Android emulation)
- Expo Go app on your physical device (optional, for testing on real devices)

### Initial Expo Setup Instructions

#### Step 1: Initialize Expo Project

Since this appears to be a React web project with existing components, we'll set up Expo for React Native development. You have two options:

**Option A: Expo SDK (Recommended for mobile-first development)**
```bash
# Navigate to project directory
cd /Users/lars/dev/A4C-FrontEnd

# Initialize Expo app (this will create necessary configuration)
npx create-expo-app . --template blank-typescript

# Or if you want to preserve existing structure:
npm install expo expo-status-bar react-native react-native-web
npx expo install @expo/webpack-config
```

**Option B: React Native with Expo Modules (For existing React web projects)**
```bash
# If you want to add Expo to existing React project
npm init -y
npm install react react-dom react-native-web
npm install -D @expo/webpack-config webpack webpack-cli webpack-dev-server
npm install expo expo-status-bar
```

#### Step 2: Configure package.json Scripts

Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx"
  }
}
```

#### Step 3: Create app.json Configuration

Create `app.json` in the root directory:
```json
{
  "expo": {
    "name": "A4C-FrontEnd",
    "slug": "a4c-frontend",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.a4cfrontend"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourcompany.a4cfrontend"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "webpack"
    }
  }
}
```

#### Step 4: Create Metro Configuration

Create `metro.config.js`:
```javascript
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
```

### VS Code Configuration for Expo Development

#### Step 1: Install VS Code Extensions

Install these extensions for optimal Expo development:
1. **React Native Tools** (Microsoft) - Debugging and IntelliSense
2. **Expo Tools** (Expo) - Expo-specific features
3. **React Native Snippet** - Code snippets
4. **ESLint** - Code linting
5. **Prettier** - Code formatting

#### Step 2: Create VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "react-native-tools.showUserTips": false,
  "react-native-tools.projectRoot": "./",
  "react-native-tools.packager.port": 19000,
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  }
}
```

#### Step 3: Create Debug Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Expo App",
      "type": "reactnative",
      "request": "launch",
      "platform": "exponent",
      "expoHostType": "local",
      "port": 19000
    },
    {
      "name": "Debug iOS",
      "type": "reactnative",
      "request": "launch",
      "platform": "ios"
    },
    {
      "name": "Debug Android",
      "type": "reactnative",
      "request": "launch",
      "platform": "android"
    },
    {
      "name": "Attach to Packager",
      "type": "reactnative",
      "request": "attach"
    }
  ]
}
```

### Running and Examining Expo Output

#### Starting the Development Server

1. **Open VS Code Terminal** (Terminal → New Terminal or `Ctrl+` `)

2. **Start Expo Dev Server**:
   ```bash
   npm start
   # or
   expo start
   ```

3. **Metro Bundler Output**:
   You'll see output like:
   ```
   Starting Metro Bundler
   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
   █ ▄▄▄▄▄ █▀▄█ ▄▀█ ██ ▄▄▄▄▄ █
   █ █   █ █▄▀██▄ ▀▄▄█ █   █ █
   █ █▄▄▄█ █ ▄▀▄▀ ▀ ██ █▄▄▄█ █
   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
   
   › Metro waiting on exp://192.168.1.100:19000
   › Scan the QR code above with Expo Go (Android) or Camera (iOS)
   
   › Press a │ open Android
   › Press i │ open iOS simulator
   › Press w │ open web
   
   › Press r │ reload app
   › Press m │ toggle menu
   ```

#### Examining Output in VS Code

1. **Terminal Output Panel**:
   - Shows Metro bundler logs
   - Displays compilation errors
   - Shows console.log statements
   - Network requests

2. **Debug Console** (View → Debug Console):
   - JavaScript runtime errors
   - React component errors
   - Network failures

3. **Problems Panel** (View → Problems):
   - TypeScript errors
   - ESLint warnings
   - Build issues

#### Development Workflow

1. **Hot Reloading**:
   - Code changes automatically reload
   - State is preserved during development
   - Press `r` in terminal to force reload

2. **Developer Menu**:
   - Shake device or press `m` in terminal
   - Access debugging options
   - Performance monitor
   - Element inspector

3. **Chrome DevTools**:
   - Press `j` in terminal to open debugger
   - Use Chrome DevTools for debugging
   - Set breakpoints in VS Code

### Debugging in VS Code

#### Setting Up Debugging

1. **Enable Debug Mode**:
   ```bash
   # In Metro Bundler terminal
   Press 'd' to open developer menu
   Select "Debug JS Remotely"
   ```

2. **Using Breakpoints**:
   - Click in the gutter to set breakpoints
   - F5 to start debugging
   - F10 to step over
   - F11 to step into

3. **Debug Console Commands**:
   ```javascript
   // In Debug Console
   console.log(variable)
   console.table(array)
   console.trace()
   ```

#### Examining Component Output

1. **React Developer Tools**:
   ```bash
   # Install globally
   npm install -g react-devtools
   
   # Run standalone
   react-devtools
   ```

2. **Component Inspector**:
   - Press `i` in terminal
   - Tap on components to inspect
   - View props and state

3. **Performance Monitoring**:
   - Enable from developer menu
   - Shows FPS and memory usage
   - Identifies performance bottlenecks

### Common Expo Commands

```bash
# Development
expo start                 # Start dev server
expo start --clear        # Clear cache and start
expo start --offline      # Start in offline mode
expo start --localhost    # Use localhost instead of LAN

# Building
expo build:ios            # Build iOS app
expo build:android        # Build Android APK
expo build:web           # Build web version

# Publishing
expo publish             # Publish to Expo servers
expo export             # Export for self-hosting

# Utilities
expo doctor             # Diagnose issues
expo upgrade           # Upgrade Expo SDK
expo install [package] # Install Expo-compatible packages
```

### Troubleshooting

#### Common Issues and Solutions

1. **Metro Bundler Port Conflict**:
   ```bash
   # Kill existing process
   lsof -i :19000
   kill -9 [PID]
   
   # Or use different port
   expo start --port 19001
   ```

2. **Clear Cache**:
   ```bash
   expo start -c
   # or
   watchman watch-del-all
   rm -rf node_modules/.cache
   ```

3. **iOS Simulator Issues**:
   ```bash
   # Reset simulator
   xcrun simctl erase all
   
   # Open specific simulator
   xcrun simctl boot "iPhone 14"
   ```

4. **Module Resolution Issues**:
   ```bash
   # Clear everything
   rm -rf node_modules
   rm package-lock.json
   npm cache clean --force
   npm install
   expo start --clear
   ```

### Integration with Existing React Code

Since you have existing React components (shadcn/ui), you'll need to adapt them for React Native:

1. **Create React Native Equivalents**:
   ```typescript
   // components/native/Button.tsx
   import { TouchableOpacity, Text } from 'react-native';
   
   export const Button = ({ onPress, children }) => (
     <TouchableOpacity onPress={onPress}>
       <Text>{children}</Text>
     </TouchableOpacity>
   );
   ```

2. **Platform-Specific Code**:
   ```typescript
   import { Platform } from 'react-native';
   
   const styles = {
     container: {
       padding: Platform.OS === 'ios' ? 20 : 10
     }
   };
   ```

3. **Web Compatibility**:
   ```typescript
   // Use react-native-web for web platform
   import { View, Text } from 'react-native';
   // This works on web, iOS, and Android
   ```

## Conclusion

This architecture transformation will convert the current monolithic application into a maintainable, scalable, and testable frontend application. The MVVM pattern with MobX provides a robust foundation for complex state management while maintaining clear separation of concerns.

The phased migration approach ensures continuous functionality while progressively improving the codebase. This plan positions the A4C-FrontEnd repository for long-term success and easy integration with backend services.