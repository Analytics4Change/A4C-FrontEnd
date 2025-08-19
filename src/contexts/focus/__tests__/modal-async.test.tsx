/**
 * Modal Async Operations Test
 * 
 * Simple test to verify modal operations return Promises
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { FocusManagerProvider } from '../FocusManagerContext';
import { useFocusManager } from '../useFocusManager';

describe('Modal Async Operations', () => {
  it('should return Promises from openModal and closeModal', async () => {
    let testResult: { openResult: any; closeResult: any } | null = null;
    
    const TestComponent: React.FC = () => {
      const { openModal, closeModal } = useFocusManager();
      
      React.useEffect(() => {
        // Test that modal operations return Promises
        const openResult = openModal('test-modal');
        const closeResult = closeModal();
        
        testResult = { openResult, closeResult };
      }, [openModal, closeModal]);
      
      return <div>Test</div>;
    };
    
    render(
      <FocusManagerProvider>
        <TestComponent />
      </FocusManagerProvider>
    );
    
    await waitFor(() => {
      expect(testResult).not.toBeNull();
    });
    
    // Verify both operations return Promises
    expect(testResult!.openResult).toBeInstanceOf(Promise);
    expect(testResult!.closeResult).toBeInstanceOf(Promise);
    
    // Verify they resolve
    await expect(testResult!.openResult).resolves.toBeUndefined();
    await expect(testResult!.closeResult).resolves.toBeUndefined();
  });
});