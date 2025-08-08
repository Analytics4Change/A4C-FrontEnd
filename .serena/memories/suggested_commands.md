# Suggested Commands for A4C-FrontEnd Development

## Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Install dependencies
npm install
```

## Git Commands (macOS/Darwin)
```bash
# Check status
git status

# Add changes
git add .
git add [file]

# Commit changes
git commit -m "message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main
```

## File System Commands (macOS)
```bash
# List files
ls -la

# Navigate directories
cd [directory]
cd ..

# Create directory
mkdir [directory]

# Remove file/directory
rm [file]
rm -rf [directory]

# Find files
find . -name "*.tsx"

# Search in files (ripgrep recommended)
rg "pattern" 

# Open in VS Code
code .
```

## Package Management
```bash
# Install new package
npm install [package]

# Install dev dependency
npm install -D [package]

# Update packages
npm update

# Check outdated packages
npm outdated
```

## TypeScript
```bash
# Type check
npx tsc --noEmit

# Generate types
npx tsc
```