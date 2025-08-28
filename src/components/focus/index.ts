/**
 * Focus Components
 * Export all focus-aware components
 */

export { 
  ManagedDialog, 
  ManagedDialogClose, 
  useManagedDialog 
} from './ManagedDialog';

export type { ManagedDialogProps } from './ManagedDialog';

export {
  StepIndicator,
  VerticalStepIndicator,
  CompactStepIndicator
} from './StepIndicator';

export type { StepIndicatorProps } from './StepIndicator';

// Demo components (usually not exported in production)
export { StepIndicatorDemo } from './StepIndicator.demo';