/**
 * ManagedDialog Demo Component
 * 
 * Demonstrates the ManagedDialog component with various configurations
 * including nested dialogs, focus restoration, and integration with
 * the FocusManagerContext.
 */

import React, { useState } from 'react';
import { ManagedDialog, ManagedDialogClose, useManagedDialog } from './ManagedDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useFocusable, useFocusManager } from '../../contexts/focus';
import { FocusableType } from '../../contexts/focus/types';

/**
 * Main demo component showcasing ManagedDialog features
 */
export function ManagedDialogDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    preference: ''
  });
  
  const [nestedData, setNestedData] = useState('');
  const { state, setDebug } = useFocusManager();
  
  // Use the hook for programmatic control
  const settingsDialog = useManagedDialog('settings-dialog');
  const nestedDialog = useManagedDialog('nested-dialog');
  
  // Register focusable elements for the demo
  const nameInput = useFocusable('demo-name-input', {
    type: FocusableType.INPUT,
    tabIndex: 1
  });
  
  const emailInput = useFocusable('demo-email-input', {
    type: FocusableType.INPUT,
    tabIndex: 2
  });
  
  const messageInput = useFocusable('demo-message-input', {
    type: FocusableType.TEXTAREA,
    tabIndex: 3
  });
  
  const simpleDialogTrigger = useFocusable('simple-dialog-trigger', {
    type: FocusableType.BUTTON,
    tabIndex: 4
  });
  
  const formDialogTrigger = useFocusable('form-dialog-trigger', {
    type: FocusableType.BUTTON,
    tabIndex: 5
  });
  
  const nestedDialogTrigger = useFocusable('nested-dialog-trigger', {
    type: FocusableType.BUTTON,
    tabIndex: 6
  });
  
  const settingsDialogTrigger = useFocusable('settings-dialog-trigger', {
    type: FocusableType.BUTTON,
    tabIndex: 7
  });
  
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">ManagedDialog Demo</h1>
        <p className="text-gray-600">
          This demo showcases the ManagedDialog component with focus management,
          nested dialogs, and various configuration options.
        </p>
        
        {/* Debug Toggle */}
        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded">
          <Label>Debug Mode:</Label>
          <Button
            variant={state.debug ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDebug(!state.debug)}
          >
            {state.debug ? 'ON' : 'OFF'}
          </Button>
          {state.debug && (
            <span className="text-sm text-gray-600 ml-2">
              Check console for focus events
            </span>
          )}
        </div>
        
        {/* Focus Status Display */}
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-sm space-y-1">
            <div>Current Focus: <strong>{state.currentFocusId || 'none'}</strong></div>
            <div>Active Scope: <strong>{state.activeScopeId}</strong></div>
            <div>Modal Stack: <strong>{state.modalStack.length} modals</strong></div>
          </div>
        </div>
      </div>
      
      {/* Demo Form Fields */}
      <div className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-lg font-semibold">Demo Form Fields</h2>
        <p className="text-sm text-gray-600">
          These fields demonstrate focus navigation outside of dialogs.
          Use Tab/Shift+Tab to navigate.
        </p>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="demo-name">Name</Label>
            <Input
              ref={nameInput.ref as any}
              id="demo-name"
              data-focus-id={nameInput.id}
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="demo-email">Email</Label>
            <Input
              ref={emailInput.ref as any}
              id="demo-email"
              data-focus-id={emailInput.id}
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="demo-message">Message</Label>
            <Textarea
              ref={messageInput.ref as any}
              id="demo-message"
              data-focus-id={messageInput.id}
              placeholder="Enter your message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
      </div>
      
      {/* Dialog Triggers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Simple Dialog */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Simple Dialog</h3>
          <p className="text-sm text-gray-600 mb-4">
            Basic dialog with auto focus restoration
          </p>
          <ManagedDialog
            id="simple-dialog"
            trigger={
              <Button
                ref={simpleDialogTrigger.ref as any}
                id="simple-dialog-trigger"
                data-focus-id={simpleDialogTrigger.id}
                variant="outline"
              >
                Open Simple Dialog
              </Button>
            }
            title="Simple Dialog"
            description="This is a simple dialog with automatic focus management."
            footer={
              <ManagedDialogClose asChild>
                <Button>Close</Button>
              </ManagedDialogClose>
            }
          >
            <div className="py-4">
              <p>When this dialog closes, focus will return to the trigger button.</p>
              <p className="mt-2 text-sm text-gray-600">
                Press Escape or click outside to close.
              </p>
            </div>
          </ManagedDialog>
        </div>
        
        {/* Form Dialog */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Form Dialog</h3>
          <p className="text-sm text-gray-600 mb-4">
            Dialog with form fields and custom restoration
          </p>
          <ManagedDialog
            id="form-dialog"
            trigger={
              <Button
                ref={formDialogTrigger.ref as any}
                id="form-dialog-trigger"
                data-focus-id={formDialogTrigger.id}
                variant="outline"
              >
                Open Form Dialog
              </Button>
            }
            title="Form Dialog"
            description="Enter your preferences below."
            focusRestorationId={messageInput.id}
            onComplete={() => {
              console.log('Form dialog completed');
            }}
          >
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="preference">Preference</Label>
                <Input
                  id="preference"
                  placeholder="Enter preference"
                  value={formData.preference}
                  onChange={(e) => setFormData(prev => ({ ...prev, preference: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <ManagedDialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </ManagedDialogClose>
                <ManagedDialogClose asChild>
                  <Button>Save</Button>
                </ManagedDialogClose>
              </div>
            </div>
          </ManagedDialog>
        </div>
        
        {/* Nested Dialog */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Nested Dialogs</h3>
          <p className="text-sm text-gray-600 mb-4">
            Dialog that opens another dialog
          </p>
          <ManagedDialog
            id="parent-dialog"
            trigger={
              <Button
                ref={nestedDialogTrigger.ref as any}
                id="nested-dialog-trigger"
                data-focus-id={nestedDialogTrigger.id}
                variant="outline"
              >
                Open Parent Dialog
              </Button>
            }
            title="Parent Dialog"
            description="This dialog can open a nested dialog."
          >
            <div className="space-y-4 py-4">
              <p>Click the button below to open a nested dialog.</p>
              
              <ManagedDialog
                id="child-dialog"
                trigger={
                  <Button variant="secondary">
                    Open Nested Dialog
                  </Button>
                }
                title="Nested Dialog"
                description="This is a dialog within a dialog."
                footer={
                  <div className="flex gap-2">
                    <ManagedDialogClose asChild>
                      <Button variant="outline">Close Nested</Button>
                    </ManagedDialogClose>
                  </div>
                }
              >
                <div className="py-4">
                  <Input
                    placeholder="Type something in the nested dialog"
                    value={nestedData}
                    onChange={(e) => setNestedData(e.target.value)}
                    autoFocus
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    When this closes, focus returns to the parent dialog.
                  </p>
                </div>
              </ManagedDialog>
              
              <div className="flex gap-2 justify-end">
                <ManagedDialogClose asChild>
                  <Button>Close Parent</Button>
                </ManagedDialogClose>
              </div>
            </div>
          </ManagedDialog>
        </div>
        
        {/* Programmatically Controlled Dialog */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Programmatic Control</h3>
          <p className="text-sm text-gray-600 mb-4">
            Control dialog with hook
          </p>
          <Button
            ref={settingsDialogTrigger.ref as any}
            id="settings-dialog-trigger"
            data-focus-id={settingsDialogTrigger.id}
            variant="outline"
            onClick={settingsDialog.open}
          >
            Open Settings
          </Button>
          
          <ManagedDialog
            {...settingsDialog.dialogProps}
            title="Settings"
            description="Adjust your preferences."
            closeOnEscape={false}
            closeOnOutsideClick={false}
          >
            <div className="space-y-4 py-4">
              <p>This dialog has custom close behavior:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Escape key disabled</li>
                <li>Outside click disabled</li>
                <li>Must use button to close</li>
              </ul>
              <div className="flex justify-end">
                <Button onClick={settingsDialog.close}>
                  Close Settings
                </Button>
              </div>
            </div>
          </ManagedDialog>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">Testing Instructions</h3>
        <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
          <li>Use Tab/Shift+Tab to navigate between form fields and buttons</li>
          <li>Open dialogs and observe focus management in the status display</li>
          <li>Test nested dialogs to see proper scope management</li>
          <li>Enable debug mode to see detailed console logs</li>
          <li>Notice how focus is restored when dialogs close</li>
          <li>Try using Escape key and clicking outside to close dialogs</li>
        </ul>
      </div>
    </div>
  );
}