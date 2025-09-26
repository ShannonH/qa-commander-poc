import { MacSetupStep, MacSystemInfo, MacSetupProgress } from '../types';

export class MacSetupService {
  private static readonly STORAGE_KEY = 'qa-commander-mac-setup-progress';

  // Initialize default setup steps
  private static readonly DEFAULT_SETUP_STEPS: MacSetupStep[] = [
    {
      id: 'system-check',
      title: 'System Requirements Check',
      description: 'Verify macOS version and hardware requirements',
      status: 'pending',
      validationCommand: 'sw_vers',
      troubleshootingTips: [
        'Ensure you are running macOS 13.0 (Ventura) or later',
        'Check system requirements in System Settings > General > About'
      ]
    },
    {
      id: 'homebrew-install',
      title: 'Install Homebrew',
      description: 'Package manager for macOS development tools',
      status: 'pending',
      validationCommand: 'brew --version',
      installCommand: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
      troubleshootingTips: [
        'Make sure you have admin privileges',
        'Check your internet connection',
        'Add Homebrew to PATH after installation: echo \'eval "$(/opt/homebrew/bin/brew shellenv)"\' >> ~/.zshrc'
      ]
    },
    {
      id: 'git-install',
      title: 'Install Git',
      description: 'Version control system required for development',
      status: 'pending',
      validationCommand: 'git --version',
      installCommand: 'brew install git',
      troubleshootingTips: [
        'Configure Git after installation: git config --global user.name "Your Name"',
        'Set your email: git config --global user.email "your.email@example.com"'
      ]
    },
    {
      id: 'node-install',
      title: 'Install Node.js & npm',
      description: 'JavaScript runtime and package manager (version 22+)',
      status: 'pending',
      validationCommand: 'node --version && npm --version',
      installCommand: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && source ~/.zshrc && nvm install 22 && nvm use 22 && nvm alias default 22',
      troubleshootingTips: [
        'Use Node Version Manager (nvm) for easier version management',
        'Restart terminal after nvm installation',
        'Check .nvmrc file in project for required version'
      ]
    },
    {
      id: 'vscode-install',
      title: 'Install Visual Studio Code',
      description: 'Recommended IDE for development',
      status: 'pending',
      validationCommand: 'code --version',
      installCommand: 'brew install --cask visual-studio-code',
      isOptional: true,
      troubleshootingTips: [
        'You can also download from https://code.visualstudio.com/',
        'Install recommended extensions for React development'
      ]
    },
    {
      id: 'chrome-install',
      title: 'Install Google Chrome',
      description: 'Browser for testing and development',
      status: 'pending',
      validationCommand: '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version',
      installCommand: 'brew install --cask google-chrome',
      isOptional: true,
      troubleshootingTips: [
        'Chrome DevTools are essential for web development',
        'You can also download from https://chrome.google.com/'
      ]
    },
    {
      id: 'project-setup',
      title: 'Clone and Setup Project',
      description: 'Clone QA Commander repository and install dependencies',
      status: 'pending',
      validationCommand: 'ls qa-commander-poc/package.json',
      installCommand: 'git clone https://github.com/ShannonH/qa-commander-poc.git && cd qa-commander-poc && npm install',
      troubleshootingTips: [
        'Make sure you have access to the repository',
        'Clear npm cache if installation fails: npm cache clean --force',
        'Check Node.js version matches .nvmrc file'
      ]
    },
    {
      id: 'project-verify',
      title: 'Verify Project Setup',
      description: 'Start development server and verify everything works',
      status: 'pending',
      validationCommand: 'cd qa-commander-poc && npm test -- --watchAll=false',
      troubleshootingTips: [
        'Port 3000 should be available',
        'Check for any error messages in console',
        'Verify all tests pass before development'
      ]
    }
  ];

  // Save progress to localStorage
  static saveProgress(progress: MacSetupProgress): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      ...progress,
      lastUpdated: new Date()
    }));
  }

  // Load progress from localStorage
  static loadProgress(): MacSetupProgress | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const progress = JSON.parse(stored);
      return {
        ...progress,
        lastUpdated: new Date(progress.lastUpdated)
      };
    }
    return null;
  }

  // Initialize new setup progress
  static initializeProgress(): MacSetupProgress {
    return {
      currentStep: 0,
      stepsCompleted: 0,
      totalSteps: this.DEFAULT_SETUP_STEPS.length,
      systemInfo: {},
      setupSteps: [...this.DEFAULT_SETUP_STEPS],
      lastUpdated: new Date()
    };
  }

  // Get system information (simulated - in real app would use electron or similar)
  static async getSystemInfo(): Promise<MacSystemInfo> {
    const systemInfo: MacSystemInfo = {};

    try {
      // In a real implementation, these would use actual system commands
      // For now, we'll simulate detection
      const userAgent = navigator.userAgent;
      
      if (userAgent.includes('Mac')) {
        systemInfo.osVersion = 'macOS 14.0 (Detected from browser)';
        systemInfo.architecture = userAgent.includes('Intel') ? 'Intel' : 'Apple Silicon (Detected)';
      }

      // Simulate checking for installed tools
      // In real implementation, this would use actual system commands
      systemInfo.homebrewInstalled = await this.checkCommandExists('brew');
      systemInfo.nodeVersion = await this.getCommandOutput('node --version');
      systemInfo.npmVersion = await this.getCommandOutput('npm --version');
      systemInfo.gitVersion = await this.getCommandOutput('git --version');
      
    } catch (error) {
      console.error('Error getting system info:', error);
    }

    return systemInfo;
  }

  // Simulate command existence check
  private static async checkCommandExists(command: string): Promise<boolean> {
    // In browser environment, we can't actually run system commands
    // This would be implemented with actual system access in an Electron app
    return new Promise((resolve) => {
      // Simulate async check with random result for demo
      setTimeout(() => {
        resolve(Math.random() > 0.5);
      }, 100);
    });
  }

  // Simulate getting command output
  private static async getCommandOutput(command: string): Promise<string> {
    // In browser environment, we can't actually run system commands
    // This would be implemented with actual system access in an Electron app
    return new Promise((resolve) => {
      setTimeout(() => {
        if (command.includes('node')) {
          resolve('v22.1.0 (simulated)');
        } else if (command.includes('npm')) {
          resolve('10.2.0 (simulated)');
        } else if (command.includes('git')) {
          resolve('git version 2.40.0 (simulated)');
        } else {
          resolve('Command not found (simulated)');
        }
      }, 100);
    });
  }

  // Run validation for a specific step
  static async validateStep(step: MacSetupStep): Promise<{ success: boolean; message: string }> {
    try {
      if (!step.validationCommand) {
        return { success: true, message: 'No validation required' };
      }

      // In a real implementation, this would execute the actual command
      // For now, we'll simulate validation results
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      return {
        success,
        message: success 
          ? `✅ ${step.title} validation passed`
          : `❌ ${step.title} validation failed - ${step.troubleshootingTips?.[0] || 'Check installation'}`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Error validating ${step.title}: ${error}`
      };
    }
  }

  // Update step status
  static updateStepStatus(
    progress: MacSetupProgress, 
    stepId: string, 
    status: MacSetupStep['status']
  ): MacSetupProgress {
    const updatedSteps = progress.setupSteps.map(step => 
      step.id === stepId ? { ...step, status } : step
    );
    
    const stepsCompleted = updatedSteps.filter(step => step.status === 'completed').length;
    
    return {
      ...progress,
      setupSteps: updatedSteps,
      stepsCompleted,
      lastUpdated: new Date()
    };
  }

  // Get overall progress percentage
  static getProgressPercentage(progress: MacSetupProgress): number {
    return Math.round((progress.stepsCompleted / progress.totalSteps) * 100);
  }

  // Reset progress
  static resetProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}