# Task Completion Checklist

## After Making Code Changes

### 1. Linting
```bash
npm run lint
```
Fix any linting errors before committing.

### 2. Type Checking
```bash
npx tsc --noEmit
```
Ensure no TypeScript errors.

### 3. Build Verification
```bash
npm run build
```
Verify the production build succeeds.

### 4. Testing (when available)
Currently no test command configured. Tests need to be implemented.

### 5. Format Code
```bash
npx prettier --write .
```
Ensure consistent formatting.

## Pre-Commit Checklist
- [ ] All linting errors resolved
- [ ] TypeScript compilation successful
- [ ] Build passes without errors
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented
- [ ] Component follows MVVM pattern
- [ ] ViewModels properly tested (when tests available)
- [ ] No hardcoded values - use constants or config
- [ ] Accessibility considerations addressed
- [ ] Performance implications considered

## Documentation Updates
- [ ] Update CLAUDE.md if architecture changes
- [ ] Update plan.md if deviating from plan
- [ ] Document any new patterns or conventions
- [ ] Update type definitions if API changes