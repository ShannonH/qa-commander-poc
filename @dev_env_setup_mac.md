# Mac Development Environment Setup Guide

This guide walks you through setting up your Mac for Blackboard Learn Ultra development.

## Prerequisites

### System Requirements
- macOS 13.0 (Ventura) or later
- Apple Silicon (M1/M2/M3) or Intel processor
- At least 16GB RAM (32GB recommended)
- At least 50GB free disk space

### Mac OS - Know Your Architecture Type First
There are several sections split for M1 Macs (with Apple Silicon chips) and Intel Macs (with Intel processors). Make sure you are selecting the correct type for your Mac.

#### Via Command Line
You can check by running this in your terminal:
```bash
uname -m
```
If the response is `x86_64`, then your Mac is running an Intel Processor. If the response is `arm64`, then your Mac is running an Apple Silicon Processor.

## Access Required

### GitHub Access
All source code for Learn and its various sister projects are stored in Learn Github. You must create an SSH Key for Github and add it to your Github account before you can use git to push/pull code.

**Important:** Generate the SSH key without a passphrase. Just hit the "return" key to leave it blank. Otherwise, Gradle and Git will fail to authenticate you!

## Installation Steps

### 1. Get Your Hostname
By default, IT configures machines with a default hostname of `<first initial><lastname>mbp<model year>`. For example, John Smith's 2023 MacBook Pro would have the hostname `jsmithmbp23`.

To get your current hostname:
```bash
scutil --get HostName
```

Verify that your hostname matches the normal pattern – no spaces, special characters, etc. If your hostname is incorrect, please reach out to IT to reset it.

### 2. Update the hosts file
By default, we use `mylearn.int.bbpd.io` as the hostname for our Learn installs. However, we don't register this hostname in DNS, so you need to update your hosts file.

```bash
sudo nano /etc/hosts
```

Add your machine's hostname and mylearn.int.bbpd.io as entries. For example, if your hostname was `jsmithmbp23`:
```
127.0.0.1    localhost localhost:localdomain jsmithmbp23 mylearn.int.bbpd.io
```

### 3. Configure ZScaler Certificate
ZScaler is Anthology's internet security solution. You need to extract and configure its certificate for various development tools.

#### Extract the ZScaler Root Certificate
1. Create a new folder: `~/work/zscaler-certs`
2. Open "Keychain Access" app
3. Go to "System" keychain → "Certificates" tab
4. Right-click the Zscaler cert and choose Export
5. Rename to `ZscalerRootCA` and save as `.pem` in `~/work/zscaler-certs`
6. Export again as `.cer` format to the same directory

#### Add Certificate for Homebrew
Add this to your shell profile:
```bash
# For Zsh (default)
echo "export SSL_CERT_FILE=~/work/zscaler-certs/ZscalerRootCA.pem" >> ~/.zshrc
# For Bash
echo "export SSL_CERT_FILE=~/work/zscaler-certs/ZscalerRootCA.pem" >> ~/.bash_profile
```

### 4. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, add Homebrew to your PATH:
```bash
# For Apple Silicon
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
# For Intel
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc

# Reload shell
source ~/.zshrc
```

### 5. Install Git and SSH Setup
```bash
brew install git
```

Configure Git:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Generate SSH key for GitHub:
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
# Press Enter for default location and NO PASSPHRASE
```

Add SSH key to GitHub account and configure SSO for Blackboard organizations.

### 6. Install Java (Amazon Corretto 11)
```bash
brew install --cask corretto11
```

Set JAVA_HOME:
```bash
echo 'export JAVA_HOME="/Library/Java/JavaVirtualMachines/amazon-corretto-11.jdk/Contents/Home"' >> ~/.zshrc
```

### 7. Install PostgreSQL 12
```bash
brew install postgresql@12
brew services start postgresql@12
```

Create Postgres data directory:
```bash
mkdir -p ~/work/bb/blackboard-data
```

### 8. Install Node.js and npm
```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc

# Install Node.js 18 (required for Ultra)
nvm install 18
nvm use 18
nvm alias default 18
```

Add Node certificate configuration:
```bash
echo 'export NODE_EXTRA_CA_CERTS="~/work/zscaler-certs/ZscalerRootCA.pem"' >> ~/.zshrc
```

### 9. Setup Work Directory Structure
```bash
mkdir -p ~/work/bb
mkdir -p ~/work/zscaler-certs
cd ~/work
```

### 10. Clone Learn Repositories
```bash
# Clone Learn Original
git clone git@github.com:blackboard-learn/learn.git
cd learn

# Clone Learn Utilities
git clone git@github.com:blackboard-learn/learn.util.git
```

### 11. Environment Variables Setup
Add these to your `~/.zshrc`:

```bash
# Blackboard Environment Variables
export BLACKBOARD_HOME="~/work/bb/blackboard"
export bbHome="~/work/bb/blackboard"
export GIT_ROOT="~/work/learn"
export JAVA_HOME="/Library/Java/JavaVirtualMachines/amazon-corretto-11.jdk/Contents/Home"

# PostgreSQL Configuration
# For Homebrew on Apple Silicon
export PGDATA="/opt/homebrew/var/postgresql@12"
# For Homebrew on Intel
# export PGDATA="/usr/local/var/postgresql@12"

# Certificates
export SSL_CERT_FILE="~/work/zscaler-certs/ZscalerRootCA.pem"
export NODE_EXTRA_CA_CERTS="~/work/zscaler-certs/ZscalerRootCA.pem"
```

### 12. Install Learn Platform
Follow the specific Learn installation procedures in your team's documentation for:
- Running the Learn installer
- Configuring database connections
- Setting up Ultra UI development environment

## Troubleshooting

### Common Issues

#### Hostname Problems
- Ensure no spaces or special characters in hostname
- Contact IT if hostname needs to be reset

#### ZScaler Certificate Issues
- Verify certificate is exported in both .pem and .cer formats
- Check that SSL_CERT_FILE environment variable is set
- Restart terminal after adding environment variables

#### Homebrew Installation Issues
- Ensure ZScaler certificate is configured before installing Homebrew
- For Apple Silicon Macs, Homebrew installs to `/opt/homebrew`
- For Intel Macs, Homebrew installs to `/usr/local`

#### PostgreSQL Issues
- Ensure PostgreSQL 12 is installed and running
- Check that data directory exists and has proper permissions
- Use `brew services restart postgresql@12` to restart service

#### Git SSH Issues
- Ensure SSH key is generated WITHOUT a passphrase
- Add key to GitHub and configure SSO authorization
- Test connection with `ssh -T git@github.com`

#### Java Issues
- Verify JAVA_HOME points to Corretto 11 installation
- Check Java version with `java -version`
- Ensure PATH includes Java binaries

### Getting Help
- **Onboarding Guides**: Start with the central Blackboard Developer onboarding documentation
- **Teams Channels**: 
  - Learn Engineering (for Learn Original questions)
  - Ultra Engineering (for Ultra-specific questions)
- **Documentation**: Refer to the Onboarding - Survival Guide and Ultra Survival Guide

## Next Steps
1. Complete Learn platform installation following team-specific guides
2. Configure your IDE (IntelliJ IDEA recommended)
3. Set up local database and test data
4. Run initial Learn build and validation
5. Join team standups and development discussions