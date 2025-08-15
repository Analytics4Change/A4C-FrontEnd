/**
 * Mouse Navigation Demo
 * Demonstrates the mouse navigation features implemented in Task 002
 */

import React, { useRef, useEffect, useState } from 'react';
import { useFocusManager } from '../hooks';
import { NavigationMode } from '../types';
import '../focus-manager.css';

export const MouseNavigationDemo: React.FC = () => {
  const {
    registerElement,
    unregisterElement,
    focusField,
    handleMouseNavigation,
    setNavigationMode,
    getNavigationMode,
    canJumpToNode,
    getVisibleSteps,
    state
  } = useFocusManager();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    // Register form fields with different mouse navigation configurations
    registerElement({
      id: 'name-field',
      ref: nameRef as any,
      type: 'input' as any,
      scopeId: 'default',
      tabIndex: 1,
      metadata: { required: true, label: 'Name' },
      mouseNavigation: {
        allowDirectJump: true, // Always allow direct jump to name field
        clickAdvancesBehavior: 'next'
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Name',
        stepDescription: 'Enter your full name'
      }
    });
    
    registerElement({
      id: 'email-field',
      ref: emailRef as any,
      type: 'input' as any,
      scopeId: 'default',
      tabIndex: 2,
      metadata: { required: true, label: 'Email' },
      validator: () => formData.name.length > 0, // Can only focus if name is filled
      mouseNavigation: {
        allowDirectJump: false, // Must complete name first
        clickAdvancesBehavior: 'next'
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Email',
        stepDescription: 'Your email address'
      }
    });
    
    registerElement({
      id: 'phone-field',
      ref: phoneRef as any,
      type: 'input' as any,
      scopeId: 'default',
      tabIndex: 3,
      metadata: { required: false, label: 'Phone' },
      validator: () => formData.email.includes('@'), // Can only focus if email is valid
      mouseNavigation: {
        allowDirectJump: false,
        clickAdvancesBehavior: 'specific',
        clickAdvancesTo: 'submit-button' // Skip address field
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Phone',
        stepDescription: 'Optional phone number'
      }
    });
    
    registerElement({
      id: 'address-field',
      ref: addressRef as any,
      type: 'textarea' as any,
      scopeId: 'default',
      tabIndex: 4,
      metadata: { required: false, label: 'Address' },
      mouseNavigation: {
        allowDirectJump: true, // Allow jumping to address anytime
        clickAdvancesBehavior: 'next'
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Address',
        stepDescription: 'Optional address'
      }
    });
    
    registerElement({
      id: 'submit-button',
      ref: submitRef as any,
      type: 'button' as any,
      scopeId: 'default',
      tabIndex: 5,
      validator: () => formData.name.length > 0 && formData.email.includes('@'),
      mouseNavigation: {
        allowDirectJump: false,
        clickAdvancesBehavior: 'none'
      },
      visualIndicator: {
        showInStepper: true,
        stepLabel: 'Submit',
        stepDescription: 'Submit the form'
      }
    });
    
    return () => {
      unregisterElement('name-field');
      unregisterElement('email-field');
      unregisterElement('phone-field');
      unregisterElement('address-field');
      unregisterElement('submit-button');
    };
  }, [registerElement, unregisterElement, formData]);
  
  const handleFieldClick = (fieldId: string, event: React.MouseEvent) => {
    handleMouseNavigation(fieldId, event.nativeEvent);
  };
  
  const renderNavigationMode = () => {
    const mode = getNavigationMode();
    const icons = {
      [NavigationMode.KEYBOARD]: '⌨️',
      [NavigationMode.MOUSE]: '🖱️',
      [NavigationMode.HYBRID]: '⌨️🖱️',
      [NavigationMode.AUTO]: '🤖'
    };
    
    return (
      <div className="focus-mode-indicator" data-mode={mode}>
        {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
      </div>
    );
  };
  
  const renderStepIndicator = () => {
    const steps = getVisibleSteps();
    
    return (
      <div className="flex gap-2 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
              ${step.isClickable ? 'focus-step-clickable' : 'focus-step-disabled'}
              ${step.status === 'current' ? 'border-blue-500 bg-blue-50' : ''}
              ${step.status === 'complete' ? 'border-green-500 bg-green-50' : ''}
              ${step.status === 'upcoming' ? 'border-gray-300 bg-gray-50' : ''}
              ${step.status === 'disabled' ? 'border-gray-200 bg-gray-100' : ''}
            `}
            onClick={(e) => step.isClickable && handleFieldClick(step.id, e)}
            title={step.description}
          >
            <span className="font-bold">{index + 1}</span>
            <span>{step.label}</span>
            {step.status === 'complete' && <span>✓</span>}
          </div>
        ))}
      </div>
    );
  };
  
  const renderDebugInfo = () => {
    return (
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <div>Current Focus: {state.currentFocusId || 'none'}</div>
        <div>Navigation Mode: {getNavigationMode()}</div>
        <div>Mouse Interactions: {state.mouseInteractionHistory.length}</div>
        <div>Focus History: {state.history.length} entries</div>
        <div className="mt-2">
          <strong>Can Jump To:</strong>
          <ul className="ml-4">
            <li>Name: {canJumpToNode('name-field') ? '✓' : '✗'}</li>
            <li>Email: {canJumpToNode('email-field') ? '✓' : '✗'}</li>
            <li>Phone: {canJumpToNode('phone-field') ? '✓' : '✗'}</li>
            <li>Address: {canJumpToNode('address-field') ? '✓' : '✗'}</li>
            <li>Submit: {canJumpToNode('submit-button') ? '✓' : '✗'}</li>
          </ul>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6 max-w-2xl mx-auto" data-navigation-mode={getNavigationMode()}>
      <h1 className="text-2xl font-bold mb-6">Mouse Navigation Demo</h1>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm">
          This demo showcases the mouse navigation features:
        </p>
        <ul className="text-sm mt-2 ml-4 list-disc">
          <li>Click on fields to navigate (some require prerequisites)</li>
          <li>Navigation mode auto-detects keyboard vs mouse usage</li>
          <li>Invalid jumps show visual feedback (red shake animation)</li>
          <li>Step indicators show progress and clickability</li>
          <li>Different click behaviors: advance to next, specific field, or none</li>
        </ul>
      </div>
      
      {renderStepIndicator()}
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Name (Required) *
          </label>
          <input
            ref={nameRef}
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onClick={(e) => handleFieldClick('name-field', e)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            placeholder="Enter your name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Email (Required) *
          </label>
          <input
            ref={emailRef}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onClick={(e) => handleFieldClick('email-field', e)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            placeholder="your@email.com"
            disabled={!formData.name}
          />
          {!formData.name && (
            <p className="text-xs text-red-500 mt-1">Complete name field first</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone (Optional)
          </label>
          <input
            ref={phoneRef}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            onClick={(e) => handleFieldClick('phone-field', e)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            placeholder="(555) 123-4567"
            disabled={!formData.email.includes('@')}
          />
          {formData.email && !formData.email.includes('@') && (
            <p className="text-xs text-red-500 mt-1">Enter valid email first</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Clicking here will skip to Submit button
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Address (Optional - Always Jumpable)
          </label>
          <textarea
            ref={addressRef}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            onClick={(e) => handleFieldClick('address-field', e)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            placeholder="Enter your address"
            rows={3}
          />
        </div>
        
        <button
          ref={submitRef}
          type="button"
          onClick={(e) => {
            handleFieldClick('submit-button', e);
            if (canJumpToNode('submit-button')) {
              alert('Form submitted!');
            }
          }}
          disabled={!formData.name || !formData.email.includes('@')}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all
            ${formData.name && formData.email.includes('@')
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Submit Form
        </button>
      </form>
      
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => setNavigationMode(NavigationMode.KEYBOARD)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Force Keyboard Mode
        </button>
        <button
          onClick={() => setNavigationMode(NavigationMode.MOUSE)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Force Mouse Mode
        </button>
        <button
          onClick={() => setNavigationMode(NavigationMode.HYBRID)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Force Hybrid Mode
        </button>
      </div>
      
      {renderDebugInfo()}
      {renderNavigationMode()}
    </div>
  );
};