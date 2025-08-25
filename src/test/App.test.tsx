import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the UI components using standardized patterns
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
  CardAction: ({ children, className }: any) => <div className={className}>{children}</div>
}));

// Mock the view components that should exist
vi.mock('@/views/client/ClientSelector', () => ({
  ClientSelector: ({ onClientSelect }: { onClientSelect: (id: string) => void }) => (
    <div data-testid="client-selector">
      <h2>Select Client</h2>
      <button onClick={() => onClientSelect('client-1')}>Test Client</button>
    </div>
  )
}));

vi.mock('@/views/medication/MedicationEntryModal', () => ({
  MedicationEntryModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="medication-modal">
      <h2>Medication Entry Modal</h2>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

describe('App Component', () => {
  it('should render client selector initially', () => {
    render(<App />);
    
    expect(screen.getByTestId('client-selector')).toBeInTheDocument();
    expect(screen.getByText('Select Client')).toBeInTheDocument();
  });

  it('should show medication management after client selection', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Click on client selection
    const clientButton = screen.getByText('Test Client');
    await user.click(clientButton);
    
    // Should now show medication management interface
    expect(screen.getByText('Medication Management')).toBeInTheDocument();
    expect(screen.getByText('Current Medications')).toBeInTheDocument();
    expect(screen.getByText('Add Medication')).toBeInTheDocument();
  });

  it('should show medication type selection modal', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Select client first
    await user.click(screen.getByText('Test Client'));
    
    // Click add medication
    await user.click(screen.getByText('Add Medication'));
    
    // Should show medication type selection
    expect(screen.getByText('Select Medication Type')).toBeInTheDocument();
    expect(screen.getByText('Prescribed Medication')).toBeInTheDocument();
    expect(screen.getByText('Over-the-Counter Medication')).toBeInTheDocument();
  });

  it('should show medication entry modal for prescribed medication', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Select client
    await user.click(screen.getByText('Test Client'));
    
    // Click add medication
    await user.click(screen.getByText('Add Medication'));
    
    // Select prescribed medication
    await user.click(screen.getByText('Prescribed Medication'));
    
    // Should show medication entry modal
    expect(screen.getByTestId('medication-modal')).toBeInTheDocument();
  });
});