import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MacSetupView from './MacSetupView';

// Mock localStorage
const localStorageMock = (() => {
  let store = {} as Record<string, string>;
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the MacSetupService
const mockInitialProgress = {
  currentStep: 0,
  stepsCompleted: 0,
  totalSteps: 8,
  systemInfo: {
    osVersion: 'macOS 14.0 (Test)',
    architecture: 'Apple Silicon (Test)',
    nodeVersion: 'v22.1.0 (test)',
    gitVersion: 'git version 2.40.0 (test)'
  },
  setupSteps: [
    {
      id: 'system-check',
      title: 'System Requirements Check',
      description: 'Verify macOS version and hardware requirements',
      status: 'pending' as const,
      validationCommand: 'sw_vers',
      troubleshootingTips: [
        'Ensure you are running macOS 13.0 (Ventura) or later'
      ]
    },
    {
      id: 'homebrew-install',
      title: 'Install Homebrew',
      description: 'Package manager for macOS development tools',
      status: 'pending' as const,
      validationCommand: 'brew --version',
      installCommand: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
      troubleshootingTips: [
        'Make sure you have admin privileges'
      ]
    }
  ],
  lastUpdated: new Date()
};

jest.mock('../utils/macSetupService', () => ({
  MacSetupService: {
    loadProgress: jest.fn(() => null),
    saveProgress: jest.fn(),
    initializeProgress: jest.fn(() => mockInitialProgress),
    getSystemInfo: jest.fn(() => Promise.resolve({
      osVersion: 'macOS 14.0 (Test)',
      architecture: 'Apple Silicon (Test)',
      nodeVersion: 'v22.1.0 (test)',
      gitVersion: 'git version 2.40.0 (test)'
    })),
    validateStep: jest.fn(() => Promise.resolve({
      success: true,
      message: '✅ Test validation passed'
    })),
    updateStepStatus: jest.fn((progress, stepId, status) => ({
      ...progress,
      setupSteps: progress.setupSteps.map(step => 
        step.id === stepId ? { ...step, status } : step
      ),
      stepsCompleted: status === 'completed' ? progress.stepsCompleted + 1 : progress.stepsCompleted,
      lastUpdated: new Date()
    })),
    getProgressPercentage: jest.fn(() => 25),
    resetProgress: jest.fn()
  }
}));

describe('MacSetupView', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders Mac setup view with title and description', async () => {
    render(<MacSetupView />);
    
    await waitFor(() => {
      expect(screen.getByText('Mac Development Environment Setup')).toBeInTheDocument();
      expect(screen.getByText(/Follow this interactive guide to set up your Mac/)).toBeInTheDocument();
    });
  });

  test('displays system information section', async () => {
    render(<MacSetupView />);
    
    await waitFor(() => {
      expect(screen.getByText('System Information')).toBeInTheDocument();
      expect(screen.getByText('Operating System')).toBeInTheDocument();
      expect(screen.getByText('Architecture')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Git')).toBeInTheDocument();
    });
  });

  test('displays setup progress section', async () => {
    render(<MacSetupView />);
    
    await waitFor(() => {
      expect(screen.getByText('Setup Progress')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Skipped')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  test('displays setup steps with validate buttons', async () => {
    render(<MacSetupView />);
    
    await waitFor(() => {
      expect(screen.getByText('System Requirements Check')).toBeInTheDocument();
      expect(screen.getByText('Install Homebrew')).toBeInTheDocument();
      
      const validateButtons = screen.getAllByText('Validate');
      expect(validateButtons.length).toBeGreaterThan(0);
    });
  });

  test('validate step functionality works', async () => {
    const mockMacSetupService = require('../utils/macSetupService').MacSetupService;
    render(<MacSetupView />);
    
    await waitFor(() => {
      const validateButtons = screen.getAllByText('Validate');
      fireEvent.click(validateButtons[0]);
    });

    await waitFor(() => {
      expect(mockMacSetupService.validateStep).toHaveBeenCalled();
    });
  });

  test('help button opens troubleshooting dialog', async () => {
    render(<MacSetupView />);
    
    await waitFor(() => {
      const helpButtons = screen.getAllByText('Help');
      fireEvent.click(helpButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Troubleshooting Tips')).toBeInTheDocument();
    });
  });

  test('validate all button works', async () => {
    const mockMacSetupService = require('../utils/macSetupService').MacSetupService;
    render(<MacSetupView />);
    
    await waitFor(() => {
      const validateAllButton = screen.getByText('Validate All');
      fireEvent.click(validateAllButton);
    });

    // Give it time to run through validations
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(mockMacSetupService.validateStep).toHaveBeenCalled();
  });

  test('reset button works', async () => {
    const mockMacSetupService = require('../utils/macSetupService').MacSetupService;
    render(<MacSetupView />);
    
    await waitFor(() => {
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
    });

    expect(mockMacSetupService.resetProgress).toHaveBeenCalled();
  });
});