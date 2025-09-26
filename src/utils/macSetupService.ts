import { MacSetupStep, MacSystemInfo, MacSetupProgress } from '../types';

export class MacSetupService {
  private static readonly STORAGE_KEY = 'blackboard-learn-mac-setup-progress';

  // Initialize default setup steps for Blackboard Learn Ultra development
  private static readonly DEFAULT_SETUP_STEPS: MacSetupStep[] = [
    {
      id: 'system-check',
      title: 'System Requirements Check',
      description: 'Verify macOS version, architecture, and hardware requirements',
      status: 'pending',
      validationCommand: 'uname -m && sw_vers',
      troubleshootingTips: [
        'Ensure you are running macOS 13.0 (Ventura) or later',
        'Check if you have Apple Silicon (arm64) or Intel (x86_64) processor',
        'Ensure at least 16GB RAM and 50GB free disk space'
      ]
    },
    {
      id: 'hostname-setup',
      title: 'Configure Hostname and Hosts File',
      description: 'Set up hostname and update hosts file for Blackboard Learn development',
      status: 'pending',
      validationCommand: 'scutil --get HostName && grep "mylearn.int.bbpd.io" /etc/hosts',
      troubleshootingTips: [
        'Hostname should follow pattern: <first initial><lastname>mbp<model year>',
        'Contact IT if hostname needs to be reset',
        'Must add mylearn.int.bbpd.io to /etc/hosts file'
      ]
    },
    {
      id: 'zscaler-cert',
      title: 'Configure ZScaler Certificate',
      description: 'Extract and configure ZScaler certificate for development tools',
      status: 'pending',
      validationCommand: 'ls ~/work/zscaler-certs/ZscalerRootCA.pem',
      installCommand: 'mkdir -p ~/work/zscaler-certs',
      troubleshootingTips: [
        'Open Keychain Access → System → Certificates',
        'Export ZScaler cert as both .pem and .cer formats',
        'Save to ~/work/zscaler-certs/ directory',
        'Set SSL_CERT_FILE environment variable'
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
        'Configure ZScaler certificate BEFORE installing Homebrew',
        'For Apple Silicon: brew installs to /opt/homebrew',
        'For Intel: brew installs to /usr/local',
        'Add Homebrew to PATH after installation'
      ]
    },
    {
      id: 'git-ssh-setup',
      title: 'Install Git and Setup SSH',
      description: 'Version control and GitHub SSH access for Blackboard repositories',
      status: 'pending',
      validationCommand: 'git --version && ssh -T git@github.com',
      installCommand: 'brew install git',
      troubleshootingTips: [
        'Generate SSH key WITHOUT passphrase: ssh-keygen -t ed25519',
        'Add SSH key to GitHub account',
        'Configure SSO for blackboard-learn organizations',
        'Test with: ssh -T git@github.com'
      ]
    },
    {
      id: 'java-install',
      title: 'Install Java (Amazon Corretto 11)',
      description: 'Java 11 runtime required for Blackboard Learn backend',
      status: 'pending',
      validationCommand: 'java -version 2>&1 | grep "Corretto-11"',
      installCommand: 'brew install --cask corretto11',
      troubleshootingTips: [
        'Must use Amazon Corretto 11 specifically',
        'Set JAVA_HOME to Corretto installation path',
        'Verify with: java -version'
      ]
    },
    {
      id: 'postgresql-install',
      title: 'Install PostgreSQL 12',
      description: 'Database server for Blackboard Learn development',
      status: 'pending',
      validationCommand: 'pg_config --version | grep "PostgreSQL 12"',
      installCommand: 'brew install postgresql@12 && brew services start postgresql@12',
      troubleshootingTips: [
        'Must use PostgreSQL version 12 specifically',
        'Create data directory: ~/work/bb/blackboard-data',
        'Start service: brew services start postgresql@12',
        'Set PGDATA environment variable'
      ]
    },
    {
      id: 'node-install',
      title: 'Install Node.js 18 & npm',
      description: 'JavaScript runtime for Ultra UI development',
      status: 'pending',
      validationCommand: 'node --version | grep "v18" && npm --version',
      installCommand: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && source ~/.zshrc && nvm install 18 && nvm use 18 && nvm alias default 18',
      troubleshootingTips: [
        'Must use Node.js version 18 for Ultra compatibility',
        'Set NODE_EXTRA_CA_CERTS for ZScaler certificate',
        'Use NVM for version management'
      ]
    },
    {
      id: 'work-directory',
      title: 'Setup Work Directory Structure',
      description: 'Create required directory structure for Blackboard development',
      status: 'pending',
      validationCommand: 'ls -la ~/work/bb && ls -la ~/work/zscaler-certs',
      installCommand: 'mkdir -p ~/work/bb ~/work/zscaler-certs',
      troubleshootingTips: [
        'All Blackboard development must be in ~/work directory',
        'Create ~/work/bb for Blackboard installation',
        'Create ~/work/zscaler-certs for certificates',
        'Directory structure is critical for build system'
      ]
    },
    {
      id: 'environment-variables',
      title: 'Configure Environment Variables',
      description: 'Set up required environment variables for Blackboard development',
      status: 'pending',
      validationCommand: 'echo $BLACKBOARD_HOME && echo $JAVA_HOME && echo $SSL_CERT_FILE',
      troubleshootingTips: [
        'Add variables to ~/.zshrc or ~/.bash_profile',
        'BLACKBOARD_HOME=~/work/bb/blackboard',
        'JAVA_HOME=/Library/Java/JavaVirtualMachines/amazon-corretto-11.jdk/Contents/Home',
        'SSL_CERT_FILE=~/work/zscaler-certs/ZscalerRootCA.pem',
        'Reload shell: source ~/.zshrc'
      ]
    },
    {
      id: 'clone-repositories',
      title: 'Clone Learn Repositories',
      description: 'Clone Blackboard Learn source code repositories',
      status: 'pending',
      validationCommand: 'ls ~/work/learn && ls ~/work/learn.util',
      installCommand: 'cd ~/work && git clone git@github.com:blackboard-learn/learn.git && git clone git@github.com:blackboard-learn/learn.util.git',
      troubleshootingTips: [
        'Requires GitHub SSH access to blackboard-learn organization',
        'Must configure SSO authorization',
        'Repositories should be cloned to ~/work directory',
        'Test SSH access first: ssh -T git@github.com'
      ]
    },
    {
      id: 'verify-setup',
      title: 'Verify Complete Setup',
      description: 'Validate all components are properly installed and configured',
      status: 'pending',
      validationCommand: 'echo "Checking all components..." && java -version && node --version && psql --version && brew --version && git --version',
      troubleshootingTips: [
        'All components should be installed and accessible',
        'Environment variables should be set correctly',
        'SSH access to GitHub should be working',
        'Ready to proceed with Learn platform installation'
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