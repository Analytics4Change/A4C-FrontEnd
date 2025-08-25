/**
 * Focus Flow Configurations Export
 * 
 * Central export point for all focus flow configurations.
 * Import flow configurations from this module to use in components.
 * 
 * @module focusFlows
 */

// Export flow configurations
export { medicationEntryFlow } from './medicationEntryFlow';

// Re-export types for convenience
export type {
  FocusFlow,
  FocusFlowNode,
  FocusBranch,
  FocusFlowOptions,
  FocusFlowState,
  FlowNavigationResult,
  ValidatorFunction,
  FlowEventType,
  FlowEventHandler
} from '../types/focusFlow.types';

// Export utility functions for flow management
export { createFlowConfiguration, validateFlow } from './utils';

/**
 * Registry of all available flows
 * This can be used for dynamic flow selection
 */
export const flowRegistry = {
  'medication-entry': () => import('./medicationEntryFlow').then(m => m.medicationEntryFlow),
  // Add more flows as they are created
  // 'patient-intake': () => import('./patientIntakeFlow').then(m => m.patientIntakeFlow),
  // 'appointment-booking': () => import('./appointmentBookingFlow').then(m => m.appointmentBookingFlow),
} as const;

/**
 * Get a flow configuration by ID
 * @param flowId The ID of the flow to retrieve
 * @returns Promise resolving to the flow configuration
 */
export async function getFlowById(flowId: keyof typeof flowRegistry) {
  const loader = flowRegistry[flowId];
  if (!loader) {
    throw new Error(`Flow configuration not found: ${flowId}`);
  }
  return loader();
}