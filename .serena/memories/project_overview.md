# A4C-FrontEnd Project Overview

## Purpose
A4C-FrontEnd is a medication administration application designed for healthcare facilities. It manages client medications, dosages, schedules, and administration tracking. The application is currently undergoing a major architectural transformation from a monolithic React component to a MVVM architecture with MobX state management.

## Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: MobX + mobx-react-lite
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Date Handling**: date-fns
- **Icons**: lucide-react

## Current Architecture Status
The project is transitioning from a monolithic 1600+ line App.tsx to:
- MVVM pattern with ViewModels (MobX)
- Service layer with API interfaces
- Mock data layer for development
- Proper TypeScript typing throughout

## Key Features
- Medication entry and search
- Client selection and management
- Dosage calculation and validation
- Calendar-based scheduling
- Category-based medication organization
- Support for PRN and controlled substances