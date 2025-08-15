/**
 * FocusableField Demo
 * 
 * Demonstrates the FocusableField component's capabilities including:
 * - Field validation (canReceiveFocus, canLeaveFocus)
 * - Mouse override configuration
 * - Keyboard navigation (Enter/Tab)
 * - Step indicator metadata
 * - Integration with FocusManagerContext
 */

import React, { useState, useRef } from 'react';
import { FocusableField } from './FocusableField';
import { FocusManagerProvider } from '../contexts/focus/FocusManagerContext';
import { useFocusManager, useStepIndicator } from '../contexts/focus/useFocusManager';
import '../contexts/focus/focus-manager.css';

/**
 * Step Indicator Component for the demo
 */
const StepIndicator: React.FC = () => {
  const { steps, onStepClick } = useStepIndicator();
  
  return (
    <div className="step-indicator" style={{ marginBottom: '20px' }}>
      <h3>Progress Steps:</h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={(e) => step.isClickable && onStepClick(step.id, e)}
              disabled={!step.isClickable}
              style={{
                padding: '8px 16px',
                border: '2px solid',
                borderColor: step.status === 'current' ? '#007bff' : 
                           step.status === 'complete' ? '#28a745' :
                           step.status === 'disabled' ? '#ccc' : '#6c757d',
                backgroundColor: step.status === 'current' ? '#e7f3ff' :
                                step.status === 'complete' ? '#e7f9e7' :
                                'white',
                borderRadius: '4px',
                cursor: step.isClickable ? 'pointer' : 'not-allowed',
                opacity: step.status === 'disabled' ? 0.5 : 1
              }}
              title={step.description}
            >
              <span style={{ fontWeight: 'bold' }}>{index + 1}. </span>
              {step.label}
              {step.status === 'complete' && ' ✓'}
            </button>
            {index < steps.length - 1 && (
              <div style={{
                width: '30px',
                height: '2px',
                backgroundColor: steps[index + 1].status !== 'upcoming' ? '#28a745' : '#ccc'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/**
 * Demo Form Component
 */
const DemoForm: React.FC = () => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validation state
  const [nameValid, setNameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  
  // Get focus manager for debugging
  const { state, setDebug } = useFocusManager();
  
  // Enable debug mode
  React.useEffect(() => {
    setDebug(true);
  }, [setDebug]);
  
  // Validation functions
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  
  const validatePhone = (value: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value.replace(/\D/g, ''));
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>FocusableField Demo Form</h2>
      
      {/* Step Indicator */}
      <StepIndicator />
      
      {/* Debug Info */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <strong>Debug Info:</strong><br />
        Current Focus: {state.currentFocusId || 'none'}<br />
        Navigation Mode: {state.navigationMode}<br />
        Active Scope: {state.activeScopeId}
      </div>
      
      {/* Name Field - Required to proceed */}
      <FocusableField
        id="name-field"
        order={1}
        scope="demo-form"
        onComplete={() => {
          const valid = name.length >= 2;
          setNameValid(valid);
          return valid;
        }}
        validators={{
          canLeaveFocus: () => name.length >= 2
        }}
        stepIndicator={{
          label: "Name",
          description: "Enter your full name (min 2 characters)",
          allowDirectAccess: true
        }}
        className="field-wrapper"
        style={{ marginBottom: '15px' }}
      >
        <div>
          <label htmlFor="name">
            Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name (min 2 chars)"
            style={{
              width: '100%',
              padding: '8px',
              border: nameValid ? '2px solid green' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          {name.length > 0 && name.length < 2 && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Name must be at least 2 characters
            </div>
          )}
        </div>
      </FocusableField>
      
      {/* Email Field - Must be valid email format */}
      <FocusableField
        id="email-field"
        order={2}
        scope="demo-form"
        onComplete={() => {
          const valid = validateEmail(email);
          setEmailValid(valid);
          return valid;
        }}
        validators={{
          canReceiveFocus: () => nameValid,
          canLeaveFocus: () => validateEmail(email) || email === ''
        }}
        stepIndicator={{
          label: "Email",
          description: "Enter a valid email address",
          allowDirectAccess: false // Can't jump directly until name is valid
        }}
        mouseOverride={{
          captureClicks: true,
          preserveFocusOnInteraction: true
        }}
        className="field-wrapper"
        style={{ marginBottom: '15px' }}
      >
        <div>
          <label htmlFor="email">
            Email <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={!nameValid}
            style={{
              width: '100%',
              padding: '8px',
              border: emailValid ? '2px solid green' : '1px solid #ccc',
              borderRadius: '4px',
              opacity: nameValid ? 1 : 0.5
            }}
          />
          {email.length > 0 && !validateEmail(email) && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
              Please enter a valid email address
            </div>
          )}
        </div>
      </FocusableField>
      
      {/* Phone Field - Optional but must be valid if provided */}
      <FocusableField
        id="phone-field"
        order={3}
        scope="demo-form"
        onComplete={() => {
          if (phone === '') return true;
          const valid = validatePhone(phone);
          setPhoneValid(valid);
          return valid;
        }}
        validators={{
          canReceiveFocus: () => emailValid,
          canLeaveFocus: () => phone === '' || validatePhone(phone)
        }}
        stepIndicator={{
          label: "Phone",
          description: "Optional phone number (10 digits)",
          allowDirectAccess: false
        }}
        className="field-wrapper"
        style={{ marginBottom: '15px' }}
      >
        <div>
          <label htmlFor="phone">Phone (Optional)</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            disabled={!emailValid}
            style={{
              width: '100%',
              padding: '8px',
              border: phoneValid && phone ? '2px solid green' : '1px solid #ccc',
              borderRadius: '4px',
              opacity: emailValid ? 1 : 0.5
            }}
          />
          {phone.length > 0 && !validatePhone(phone) && (
            <div style={{ color: 'orange', fontSize: '12px', marginTop: '4px' }}>
              Phone must be 10 digits
            </div>
          )}
        </div>
      </FocusableField>
      
      {/* Address Field - No validation, just needs email to be valid */}
      <FocusableField
        id="address-field"
        order={4}
        scope="demo-form"
        validators={{
          canReceiveFocus: () => emailValid
        }}
        stepIndicator={{
          label: "Address",
          description: "Enter your address",
          allowDirectAccess: false
        }}
        mouseOverride={{
          allowDirectJump: true // Allow jumping here via mouse once available
        }}
        className="field-wrapper"
        style={{ marginBottom: '15px' }}
      >
        <div>
          <label htmlFor="address">Address</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, State"
            disabled={!emailValid}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              opacity: emailValid ? 1 : 0.5
            }}
          />
        </div>
      </FocusableField>
      
      {/* Notes Field - Textarea example */}
      <FocusableField
        id="notes-field"
        order={5}
        scope="demo-form"
        stepIndicator={{
          label: "Notes",
          description: "Additional notes (optional)",
          allowDirectAccess: true
        }}
        className="field-wrapper"
        style={{ marginBottom: '15px' }}
      >
        <div>
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            rows={4}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
      </FocusableField>
      
      {/* Submit Button */}
      <FocusableField
        id="submit-button"
        order={6}
        scope="demo-form"
        validators={{
          canReceiveFocus: () => nameValid && emailValid
        }}
        stepIndicator={{
          label: "Submit",
          description: "Submit the form",
          allowDirectAccess: false
        }}
        className="field-wrapper"
      >
        <button
          onClick={() => {
            alert(`Form Submitted!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nNotes: ${notes}`);
          }}
          disabled={!nameValid || !emailValid}
          style={{
            padding: '10px 20px',
            backgroundColor: nameValid && emailValid ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: nameValid && emailValid ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          Submit Form
        </button>
      </FocusableField>
      
      {/* Instructions */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f0f8ff',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <h3>Instructions:</h3>
        <ul>
          <li><strong>Keyboard Navigation:</strong> Use Tab/Shift+Tab to navigate, Enter to advance when field is valid</li>
          <li><strong>Field Validation:</strong> Name requires 2+ characters, Email must be valid format</li>
          <li><strong>Progressive Disclosure:</strong> Fields unlock as you complete required fields</li>
          <li><strong>Mouse Override:</strong> Email field has click capture enabled</li>
          <li><strong>Step Indicator:</strong> Click on completed steps to jump back (when allowed)</li>
          <li><strong>Ctrl+Enter:</strong> Switch to hybrid navigation mode</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Main Demo App
 */
export const FocusableFieldDemo: React.FC = () => {
  return (
    <FocusManagerProvider debug={true}>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>
          FocusableField Component Demo
        </h1>
        <DemoForm />
      </div>
    </FocusManagerProvider>
  );
};

export default FocusableFieldDemo;