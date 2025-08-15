/**
 * StepIndicator Demo Component
 * 
 * Interactive demonstration of the StepIndicator component
 * showing various configurations and integration with FocusManagerContext.
 */

import React, { useState, useRef, useEffect } from 'react';
import { StepIndicator, VerticalStepIndicator, CompactStepIndicator } from './StepIndicator';
import { FocusManagerProvider } from '../../contexts/focus/FocusManagerContext';
import { useFocusManager } from '../../contexts/focus/useFocusManager';
import { FocusableField } from '../FocusableField';
import { StepIndicatorData } from '../../contexts/focus/types';

/**
 * Demo form with integrated step indicator
 */
const StepIndicatorFormDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const { state } = useFocusManager();
  
  // Track completed steps based on form data
  useEffect(() => {
    const completed = new Set<string>();
    if (formData.name) completed.add('name-field');
    if (formData.email && formData.email.includes('@')) completed.add('email-field');
    if (formData.phone && formData.phone.length >= 10) completed.add('phone-field');
    if (formData.address) completed.add('address-field');
    if (formData.notes) completed.add('notes-field');
    setCompletedSteps(completed);
  }, [formData]);
  
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Form with Step Indicator</h3>
      
      {/* Step Indicator - Gets steps from FocusManager */}
      <StepIndicator
        orientation="horizontal"
        allowJumping={true}
        onStepClick={(stepId) => {
          console.log('Step clicked:', stepId);
        }}
      />
      
      {/* Form Fields */}
      <div className="space-y-4 max-w-md">
        <FocusableField
          id="name-field"
          order={1}
          stepIndicator={{
            label: 'Name',
            description: 'Enter your full name',
            allowDirectAccess: true
          }}
          validators={{
            canLeaveFocus: () => formData.name.length > 0
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
        </FocusableField>
        
        <FocusableField
          id="email-field"
          order={2}
          stepIndicator={{
            label: 'Email',
            description: 'Valid email address',
            allowDirectAccess: false
          }}
          validators={{
            canReceiveFocus: () => formData.name.length > 0,
            canLeaveFocus: () => formData.email.includes('@')
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <input
              type="email"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              disabled={!formData.name}
            />
          </div>
        </FocusableField>
        
        <FocusableField
          id="phone-field"
          order={3}
          stepIndicator={{
            label: 'Phone',
            description: 'Contact number',
            allowDirectAccess: false
          }}
          validators={{
            canReceiveFocus: () => formData.email.includes('@'),
            canLeaveFocus: () => formData.phone.length >= 10
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              disabled={!formData.email.includes('@')}
            />
          </div>
        </FocusableField>
        
        <FocusableField
          id="address-field"
          order={4}
          stepIndicator={{
            label: 'Address',
            description: 'Street address',
            allowDirectAccess: false
          }}
          validators={{
            canReceiveFocus: () => formData.phone.length >= 10
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St"
              disabled={formData.phone.length < 10}
            />
          </div>
        </FocusableField>
        
        <FocusableField
          id="notes-field"
          order={5}
          stepIndicator={{
            label: 'Notes',
            description: 'Additional information',
            allowDirectAccess: true
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>
        </FocusableField>
      </div>
      
      {/* Current Focus Info */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
        <div>Current Focus: {state.currentFocusId || 'None'}</div>
        <div>Navigation Mode: {state.navigationMode}</div>
        <div>Completed Steps: {Array.from(completedSteps).join(', ') || 'None'}</div>
      </div>
    </div>
  );
};

/**
 * Static step indicator examples
 */
const StaticStepIndicatorDemo: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<string>('step-2');
  
  // Example static steps
  const staticSteps: StepIndicatorData[] = [
    {
      id: 'step-1',
      label: 'Account',
      description: 'Create your account',
      status: 'complete',
      isClickable: true
    },
    {
      id: 'step-2',
      label: 'Profile',
      description: 'Set up your profile',
      status: 'current',
      isClickable: true
    },
    {
      id: 'step-3',
      label: 'Preferences',
      description: 'Choose preferences',
      status: 'upcoming',
      isClickable: false
    },
    {
      id: 'step-4',
      label: 'Review',
      description: 'Review and confirm',
      status: 'disabled',
      isClickable: false
    }
  ];
  
  // Update steps based on selection
  const stepsWithSelection = staticSteps.map(step => ({
    ...step,
    status: step.id === selectedStep ? 'current' : step.status
  } as StepIndicatorData));
  
  return (
    <div className="p-6 space-y-8">
      <h3 className="text-lg font-semibold">Static Step Indicators</h3>
      
      {/* Horizontal Default */}
      <div className="space-y-2">
        <h4 className="font-medium">Horizontal (Default)</h4>
        <StepIndicator
          steps={stepsWithSelection}
          orientation="horizontal"
          onStepClick={(stepId) => {
            if (staticSteps.find(s => s.id === stepId)?.isClickable) {
              setSelectedStep(stepId);
            }
          }}
        />
      </div>
      
      {/* Vertical */}
      <div className="space-y-2">
        <h4 className="font-medium">Vertical</h4>
        <div className="max-w-xs">
          <VerticalStepIndicator
            steps={stepsWithSelection}
            onStepClick={(stepId) => {
              if (staticSteps.find(s => s.id === stepId)?.isClickable) {
                setSelectedStep(stepId);
              }
            }}
          />
        </div>
      </div>
      
      {/* Compact */}
      <div className="space-y-2">
        <h4 className="font-medium">Compact (No Descriptions)</h4>
        <CompactStepIndicator
          steps={stepsWithSelection}
          onStepClick={(stepId) => {
            if (staticSteps.find(s => s.id === stepId)?.isClickable) {
              setSelectedStep(stepId);
            }
          }}
        />
      </div>
      
      {/* Without Connectors */}
      <div className="space-y-2">
        <h4 className="font-medium">Without Connectors</h4>
        <StepIndicator
          steps={stepsWithSelection}
          showConnectors={false}
          onStepClick={(stepId) => {
            if (staticSteps.find(s => s.id === stepId)?.isClickable) {
              setSelectedStep(stepId);
            }
          }}
        />
      </div>
      
      {/* Different Sizes */}
      <div className="space-y-4">
        <h4 className="font-medium">Size Variants</h4>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Small</p>
          <StepIndicator
            steps={stepsWithSelection}
            size="small"
            onStepClick={setSelectedStep}
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Medium (Default)</p>
          <StepIndicator
            steps={stepsWithSelection}
            size="medium"
            onStepClick={setSelectedStep}
          />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Large</p>
          <StepIndicator
            steps={stepsWithSelection}
            size="large"
            onStepClick={setSelectedStep}
          />
        </div>
      </div>
      
      {/* Custom Render */}
      <div className="space-y-2">
        <h4 className="font-medium">Custom Step Content</h4>
        <StepIndicator
          steps={stepsWithSelection}
          renderStepContent={(step, index) => {
            if (step.status === 'complete') {
              return '✓';
            }
            if (step.status === 'current') {
              return '→';
            }
            return index + 1;
          }}
          onStepClick={setSelectedStep}
        />
      </div>
    </div>
  );
};

/**
 * Main demo component
 */
export const StepIndicatorDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'form' | 'static'>('form');
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">StepIndicator Component Demo</h2>
      
      {/* Demo Selector */}
      <div className="mb-6 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${
            activeDemo === 'form' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setActiveDemo('form')}
        >
          Form Integration
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeDemo === 'static' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setActiveDemo('static')}
        >
          Static Examples
        </button>
      </div>
      
      {/* Demo Content */}
      <div className="border rounded-lg bg-white">
        <FocusManagerProvider debug={true}>
          {activeDemo === 'form' ? (
            <StepIndicatorFormDemo />
          ) : (
            <StaticStepIndicatorDemo />
          )}
        </FocusManagerProvider>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Form Integration: Fill out fields sequentially to see step progress</li>
          <li>Click on completed steps to jump back (when allowed)</li>
          <li>Disabled steps cannot be clicked until prerequisites are met</li>
          <li>The indicator automatically updates based on focus state</li>
          <li>Navigation mode switches to hybrid when clicking steps</li>
        </ul>
      </div>
    </div>
  );
};

export default StepIndicatorDemo;