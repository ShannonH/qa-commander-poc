# Mac Development Environment Setup Guide

This guide walks you through setting up your Mac for QA Commander development.

## Prerequisites

### System Requirements
- macOS 13.0 (Ventura) or later
- Apple Silicon (M1/M2/M3) or Intel processor
- At least 8GB RAM (16GB recommended)
- At least 10GB free disk space

## Installation Steps

### 1. Install Homebrew
Homebrew is a package manager for macOS that makes installing development tools easy.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, add Homebrew to your PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 2. Install Git
Git is required for version control and cloning repositories.

```bash
brew install git
```

Configure Git with your information:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Install Node.js and npm
We use Node.js 22+ and npm 10+ for this project.

```bash
# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal or reload profile
source ~/.zshrc

# Install and use Node.js 22
nvm install 22
nvm use 22
nvm alias default 22
```

Verify installation:
```bash
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x or higher
```

### 4. Install Visual Studio Code (Recommended)
VS Code is the recommended IDE for this project.

```bash
brew install --cask visual-studio-code
```

#### Recommended VS Code Extensions:
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- TypeScript Hero
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### 5. Install Additional Development Tools

```bash
# Chrome for testing
brew install --cask google-chrome

# Optional: Chrome DevTools for React
# Will be available in Chrome after running the project

# Optional: Postman for API testing
brew install --cask postman
```

### 6. Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/ShannonH/qa-commander-poc.git
cd qa-commander-poc

# Install dependencies
npm install

# Start development server
npm start
```

### 7. Verify Setup
1. The application should open at `http://localhost:3000`
2. You should see the QA Commander dashboard
3. Try navigating between different sections
4. Check browser console for any errors

## Troubleshooting

### Common Issues

#### Homebrew Installation Issues
- If you get permission errors, ensure you have admin access
- For Apple Silicon Macs, Homebrew installs to `/opt/homebrew`
- For Intel Macs, Homebrew installs to `/usr/local`

#### Node.js Version Issues
- Always use the version specified in `.nvmrc` file
- Use `nvm use` in the project directory to switch to correct version

#### npm Install Failures
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check if you're behind a corporate firewall affecting npm downloads

#### Port 3000 Already in Use
- Kill existing process: `lsof -ti:3000 | xargs kill -9`
- Or use a different port: `npm start -- --port 3001`

### Performance Optimization
- Close unnecessary applications while developing
- Ensure adequate free disk space
- Consider increasing Node.js memory limit for large builds:
  ```bash
  export NODE_OPTIONS="--max-old-space-size=4096"
  ```

## Next Steps
1. Read the main `README.md` for project overview
2. Explore the codebase structure
3. Run tests: `npm test`
4. Build for production: `npm run build`
5. Join the development team discussions