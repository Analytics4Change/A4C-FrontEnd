# Code Style and Conventions

## TypeScript Conventions
- Strict mode enabled
- Explicit typing for all function parameters and returns
- Interfaces for all data models
- Avoid `any` type - current code has issues with this that need fixing

## React Patterns
- Functional components with hooks
- MobX observer pattern for state-connected components
- Custom hooks for reusable logic (useViewModel, useDebounce, useAutoComplete)
- Components follow single responsibility principle

## File Organization
```
src/
├── viewModels/     # MobX ViewModels (business logic)
├── views/          # React components (presentation)
├── services/       # API and validation services
├── types/          # TypeScript type definitions
├── hooks/          # Custom React hooks
├── mocks/          # Mock data for development
├── utils/          # Utility functions
└── components/     # Reusable UI components (shadcn/ui)
```

## Naming Conventions
- **Components**: PascalCase (MedicationEntryModal.tsx)
- **ViewModels**: PascalCase with ViewModel suffix (MedicationEntryViewModel.ts)
- **Hooks**: camelCase with use prefix (useDebounce.ts)
- **Interfaces**: PascalCase with I prefix (IMedicationApi.ts)
- **Mock files**: .mock.ts suffix
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for configurations

## Component Structure
- Index file for complex components
- Separate files for sub-components
- Props interfaces defined in component file
- Observer HOC for MobX-connected components

## State Management
- ViewModels handle all business logic
- Components are purely presentational
- Use MobX reactions for side effects
- Computed values for derived state

## CSS/Styling
- Tailwind CSS utility classes
- Custom glass morphism effects
- Component-specific styles in className
- Avoid inline styles