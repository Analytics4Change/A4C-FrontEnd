# CI/CD Memory Leak Detection System

This document describes the automated memory leak detection system implemented for A4C-FrontEnd CI/CD pipeline.

## Overview

The memory leak detection system automatically monitors test files for memory usage patterns, detects potential leaks, and provides actionable feedback through PR comments. It operates efficiently to minimize impact on development workflow while maintaining thorough analysis.

## System Components

### 1. GitHub Actions Workflows

#### `memory-check.yml`
- **Trigger**: Pull requests with test or source file changes
- **Duration**: Target < 5 minutes for typical PRs
- **Features**:
  - Detects changed test files automatically
  - Runs targeted analysis on affected tests
  - Compares against baseline from main branch
  - Posts formatted results as PR comment
  - Fails CI if critical thresholds exceeded

#### `memory-check-schedule.yml`
- **Trigger**: Weekly schedule (Sundays 2 AM UTC) + manual dispatch
- **Purpose**: Updates memory baseline from main branch
- **Features**:
  - Full test suite analysis
  - Automatic baseline update and commit
  - Validation of configuration and scripts

### 2. Core Scripts

#### `ci-memory-detection.js`
Main analysis engine with three operation modes:
- **Full Analysis**: All test files (baseline updates)
- **Changed Files**: Only modified test files (PR checks)
- **Impact Analysis**: Tests potentially affected by source changes

**Key Features**:
- Isolated test execution with memory monitoring
- Configurable timeouts and memory limits
- Garbage collection between tests
- Leak detection with multiple heuristics

#### `ci-memory-reporter.js`
Generates formatted markdown reports for PR comments:
- Executive summary with pass/fail status
- Top memory consumers table
- Memory leak details with recommendations
- ASCII charts and trend analysis
- Baseline comparison when available

#### `ci-memory-baseline.js`
Manages memory baseline data:
- Downloads baseline from artifacts or main branch
- Updates baseline from analysis reports
- Maintains backup history
- Validates baseline integrity

#### `generate-memory-charts.js`
Creates visual reports and charts:
- Interactive HTML charts with Chart.js
- Memory usage and trend reports
- Summary markdown with key metrics
- Suitable for CI artifacts

#### `check-memory-thresholds.js`
Validates analysis results against thresholds:
- Configurable warning and critical levels
- Individual test and overall suite validation
- Detailed reporting with actionable output
- Appropriate exit codes for CI integration

### 3. Configuration

#### `.github/memory-check-config.json`
Centralized configuration for all memory checks:

```json
{
  "thresholds": {
    "heap": { "warning": 104857600, "critical": 209715200 },
    "rss": { "warning": 209715200, "critical": 419430400 },
    "duration": { "warning": 30000, "critical": 60000 }
  },
  "limits": {
    "maxMemoryLeaks": 5,
    "maxCriticalIssues": 0
  },
  "execution": {
    "timeout": 60000,
    "maxHeapSize": 2048,
    "isolateTests": true
  }
}
```

## Memory Thresholds

| Metric | Warning | Critical | Description |
|--------|---------|----------|-------------|
| Heap Usage | 100MB | 200MB | V8 heap memory per test |
| RSS Usage | 200MB | 400MB | Total process memory |
| Test Duration | 30s | 60s | Individual test timeout |
| Suite Duration | 5min | 10min | Total analysis time |
| Growth Rate | 5% | 10% | Increase from baseline |

## Workflow Integration

### Pull Request Flow

1. **Trigger Detection**: PR with test/source file changes
2. **Change Analysis**: Identify affected test files
3. **Memory Analysis**: Run targeted memory profiling
4. **Baseline Comparison**: Compare with main branch baseline
5. **Report Generation**: Create charts and summary
6. **PR Comment**: Post formatted results with recommendations
7. **Status Check**: Pass/fail based on thresholds

### Baseline Management

1. **Weekly Update**: Scheduled analysis of main branch
2. **Full Suite Analysis**: Complete memory profiling
3. **Baseline Update**: Commit new reference values
4. **Artifact Storage**: Preserve reports and charts
5. **Validation**: Ensure configuration integrity

## Performance Optimizations

### Targeted Analysis
- Only analyze changed test files in PRs
- Skip documentation-only changes
- Impact analysis for source file changes
- Parallel execution where safe

### Caching Strategy
- Node.js dependency caching
- Git history preservation for comparisons
- Artifact reuse for baseline data
- Incremental analysis approach

### Resource Management
- Configurable memory limits (2GB default)
- Test isolation prevents cross-contamination
- Garbage collection between tests
- Process timeout protection

## Error Handling

### Graceful Degradation
- Continue on individual test failures
- Generate partial reports when possible
- Fallback to impact analysis if changed files unavailable
- Clear error messages in PR comments

### Failure Scenarios
- **Test Timeout**: Individual test > 60s limit
- **Memory Exhaustion**: Process > 2GB limit  
- **Critical Issues**: > 0 critical memory leaks
- **High Leak Count**: > 5 total memory issues

## Usage Examples

### Manual Trigger (Full Analysis)
```bash
# Trigger full memory analysis
gh workflow run memory-check.yml -f full_analysis=true
```

### Local Testing
```bash
# Run memory detection locally
node scripts/ci-memory-detection.js --full --output report.json

# Generate charts
node scripts/generate-memory-charts.js report.json ./reports/

# Check thresholds
node scripts/check-memory-thresholds.js report.json --verbose
```

### Configuration Override
```bash
# Custom thresholds
node scripts/check-memory-thresholds.js report.json \
  --max-memory-leaks 10 \
  --fail-on-warning
```

## Monitoring and Maintenance

### Weekly Tasks
- Review baseline updates for trends
- Monitor workflow execution times
- Check for configuration drift
- Validate script dependencies

### Monthly Tasks  
- Analyze memory usage patterns
- Update thresholds based on growth
- Clean up old artifacts
- Review and update documentation

### Troubleshooting

#### Common Issues

**Workflow Timeout**
- Check for infinite loops in tests
- Verify memory limits are appropriate
- Consider breaking up large test suites

**False Positives**
- Review baseline freshness
- Check for external factors (CI environment changes)
- Adjust thresholds if consistently exceeded

**Missing Baseline**
- Run manual baseline update workflow
- Check main branch for baseline file
- Verify backup artifacts are available

#### Debug Commands
```bash
# Validate configuration
cat .github/memory-check-config.json | jq empty

# Check script syntax
node -c scripts/ci-memory-detection.js

# Test individual components
node scripts/ci-memory-baseline.js validate
```

## Integration with Development Workflow

### Pre-commit Hooks
Consider adding memory checks to pre-commit hooks for early detection:

```bash
#!/bin/bash
# Check if memory-sensitive files changed
git diff --cached --name-only | grep -E '\.(test|spec)\.(js|ts)x?$'
if [ $? -eq 0 ]; then
  echo "Running quick memory check..."
  # Quick subset analysis
fi
```

### IDE Integration
Developers can run memory analysis locally:

```json
{
  "scripts": {
    "test:memory": "node scripts/ci-memory-detection.js --impact-analysis",
    "test:memory:full": "node scripts/ci-memory-detection.js --full",
    "memory:report": "node scripts/generate-memory-charts.js memory-report.json"
  }
}
```

## Security Considerations

- Scripts run in isolated environments
- No sensitive data exposure in reports
- Limited GitHub token permissions
- Artifact retention limits (30-90 days)

## Future Enhancements

### Planned Features
- Memory leak regression detection
- Performance trend analysis over time  
- Integration with monitoring dashboards
- Automated threshold adjustment
- Multi-browser memory profiling

### Metrics Collection
- Track memory usage trends
- Monitor CI execution times
- Measure false positive rates
- Analyze threshold effectiveness

---

## Quick Reference

### Key Commands
```bash
# Full analysis
node scripts/ci-memory-detection.js --full

# Changed files only  
echo "test1.js test2.js" | node scripts/ci-memory-detection.js --changed-files

# Generate report comment
node scripts/ci-memory-reporter.js memory-report.json

# Update baseline
node scripts/ci-memory-baseline.js update memory-report.json

# Check thresholds
node scripts/check-memory-thresholds.js memory-report.json
```

### Configuration Locations
- Workflow: `.github/workflows/memory-check.yml`
- Config: `.github/memory-check-config.json`
- Scripts: `scripts/ci-memory-*.js`
- Baseline: `baseline-memory.json`

### Artifacts
- Memory reports: `memory-report.json`
- Charts: `memory-reports/*.html`
- Baselines: `memory-baseline-*.json`
- Summaries: `*-summary.md`

For detailed implementation information, see [Memory Leak Detection Plan](../docs/testing/MEMORY_LEAK_DETECTION_PLAN.md).