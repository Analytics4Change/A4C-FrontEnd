# Cross-Environment Development Guide

This guide covers development setup and best practices for working across multiple environments, particularly Ubuntu 24.04 with Firefox and macOS with Safari.

## Table of Contents
- [Environment Setup](#environment-setup)
- [Git Configuration](#git-configuration)
- [File Synchronization](#file-synchronization)
- [Common Issues and Solutions](#common-issues-and-solutions)
- [Best Practices](#best-practices)

## Environment Setup

### Prerequisites
Ensure both environments have:
- Node.js (same major version, ideally using `nvm`)
- npm (comes with Node.js)
- Git
- A code editor (VS Code, Vim, etc.)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-username/A4C-FrontEnd.git
cd A4C-FrontEnd

# Install dependencies using exact versions
npm ci

# Start development server
npm run dev
```

## Git Configuration

### Line Endings
Configure Git to handle line endings consistently:

```bash
# On Ubuntu/macOS (both use LF line endings)
git config --global core.autocrlf input

# This ensures:
# - LF in repository
# - LF in working directory
# - Converts CRLF to LF on commit (if any)
```

### Global .gitignore
Set up a global gitignore for OS-specific files:

```bash
# Create global gitignore
touch ~/.gitignore_global

# Configure git to use it
git config --global core.excludesfile ~/.gitignore_global
```

Add OS-specific patterns to `~/.gitignore_global`:
```
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Linux
*~
.directory
.Trash-*

# IDEs
.vscode/
.idea/
*.swp
*.swo
```

## File Synchronization

### What IS Tracked (Committed to Git)
✅ These files should be consistent across environments:
- **Source code**: `/src/**/*`
- **Configuration**: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`
- **Documentation**: All `.md` files
- **Tests**: `*.test.ts`, `*.spec.ts`, Playwright configs
- **Public assets**: `/public/**/*`
- **Environment templates**: `.env.example`

### What is NOT Tracked (In .gitignore)
❌ These files/directories are environment-specific:
- **Dependencies**: `node_modules/` - Run `npm ci` after pulling
- **Build output**: `dist/`, `build/`
- **Cache**: `.vite/`, `.cache/`
- **Test results**: `test-results/`, `playwright-report/`, `coverage/`
- **Local configs**: `.env.local`, `.env.development.local`
- **IDE settings**: `.vscode/settings.json`, `.idea/`
- **OS files**: `.DS_Store` (macOS), `Thumbs.db` (Windows)
- **Logs**: `*.log`, `npm-debug.log*`

## Common Issues and Solutions

### Issue 1: Unstaged Changes After Pull
**Symptom**: Files appear modified immediately after `git pull`

**Possible Causes & Solutions**:

1. **Missing .gitignore entries**
   ```bash
   # Check what's causing changes
   git status
   
   # If it's cache/build files, add to .gitignore
   echo ".vite/" >> .gitignore
   echo "*.log" >> .gitignore
   git add .gitignore
   git commit -m "Update .gitignore"
   ```

2. **Line ending differences**
   ```bash
   # Reset line endings
   git rm --cached -r .
   git reset --hard
   ```

3. **File permission changes** (Linux/macOS only)
   ```bash
   # Ignore permission changes
   git config core.filemode false
   ```

### Issue 2: Different package-lock.json
**Symptom**: package-lock.json changes between environments

**Solution**: Always use `npm ci` instead of `npm install`:
```bash
# Good - installs exact versions from package-lock.json
npm ci

# Avoid - may update package-lock.json
npm install
```

### Issue 3: Build/Test Differences
**Symptom**: Tests pass in one environment but fail in another

**Solutions**:
- Ensure same Node.js version: Use `.nvmrc` file
- Clear caches: `rm -rf .vite node_modules && npm ci`
- Check for OS-specific code or dependencies

## Best Practices

### 1. Workflow for Switching Environments

When starting work in a different environment:
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install exact dependencies
npm ci

# 3. Clear any caches
rm -rf .vite

# 4. Start development
npm run dev
```

### 2. Before Committing

```bash
# 1. Run tests
npm test

# 2. Run type check
npm run typecheck

# 3. Check what you're committing
git status
git diff --staged

# 4. Ensure no environment-specific files
git status --ignored
```

### 3. Dependency Management

- **Adding dependencies**: Always commit `package-lock.json`
  ```bash
  npm install some-package
  git add package.json package-lock.json
  git commit -m "Add some-package dependency"
  ```

- **Updating dependencies**: Do this in one environment, test, then propagate
  ```bash
  npm update
  npm test
  git add package.json package-lock.json
  git commit -m "Update dependencies"
  ```

### 4. Environment Variables

Use `.env.local` for environment-specific settings:
```bash
# .env.local (not committed)
VITE_API_URL=http://localhost:3000
VITE_DEBUG_MODE=true

# .env.example (committed as template)
VITE_API_URL=your_api_url_here
VITE_DEBUG_MODE=false
```

### 5. Node Version Management

Use `nvm` to maintain consistent Node versions:

```bash
# Install nvm (if not already installed)
# Ubuntu:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# macOS:
brew install nvm

# Create .nvmrc file in project root
echo "20.11.0" > .nvmrc

# Use the specified version
nvm use
```

## Troubleshooting Checklist

If you encounter issues after switching environments:

- [ ] Run `npm ci` to ensure correct dependencies
- [ ] Clear Vite cache: `rm -rf .vite`
- [ ] Check Node version: `node --version`
- [ ] Verify git config: `git config --list | grep -E "(autocrlf|filemode)"`
- [ ] Check for uncommitted changes: `git status`
- [ ] Review ignored files: `git status --ignored`
- [ ] Clear and rebuild: `npm run clean && npm run build`

## Platform-Specific Notes

### Ubuntu 24.04 + Firefox
- File watching works well with default settings
- May need to increase watchers limit for large projects:
  ```bash
  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
  ```

### macOS + Safari
- File watching may be slower on some macOS versions
- Safari DevTools may require enabling Developer menu:
  - Safari → Preferences → Advanced → Show Develop menu
- Consider using Chrome/Firefox for better React DevTools support

## Summary

The key to successful cross-environment development is:
1. **Consistent tooling versions** (Node.js, npm)
2. **Proper .gitignore configuration** to exclude environment-specific files
3. **Using `npm ci`** instead of `npm install` for reproducible builds
4. **Committing package-lock.json** to ensure dependency consistency
5. **Regular testing** in both environments before major releases

Remember: If files show as modified immediately after pulling, they probably shouldn't be tracked by Git and should be added to .gitignore.