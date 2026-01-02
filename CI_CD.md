# CI/CD Pipeline - GitHub Actions

## Overview

LuminaCV uses GitHub Actions to automate testing, building, and deployment. Three main workflows ensure code quality and continuous delivery.

## Workflows

### 1. Tests & Build (`tests.yml`)

**Triggers:** On push to main/master/develop, on pull requests

**Jobs:**
- **test**: Run tests across Node.js 16, 18, 20
- **lint**: Validate CSS, HTML structure, file sizes
- **coverage**: Generate test coverage reports
- **bundle-analysis**: Analyze build output size
- **accessibility-check**: Verify WCAG 2.1 compliance
- **deploy-preview**: Comment status on PRs

**Outputs:**
- Build artifacts (JS, CSS, HTML)
- Test results
- Coverage reports
- Bundle analysis

### 2. Deploy to GitHub Pages (`deploy.yml`)

**Triggers:** On push to main/master, manual workflow dispatch

**Jobs:**
- **build**: 
  - Run tests
  - Build optimized assets
  - Prepare deployment directory
  - Upload to GitHub Pages
- **notification**: Post deployment summary

**Deployment:**
- Automatically publishes to GitHub Pages
- URL: `https://username.github.io/luminacv`

**Setup Required:**
1. Go to Repository → Settings → Pages
2. Select "GitHub Actions" as source
3. Confirm automatic deployments are enabled

### 3. Code Quality (`quality.yml`)

**Triggers:** On push to main/master/develop, on pull requests

**Checks:**
- JavaScript quality metrics (console.log, file count)
- Documentation completeness
- Build script verification
- Security scan (secrets detection)

**Reports:** Posted to GitHub Actions summary

## Configuration

### Secrets

No secrets needed for public repositories. For private repos or external deployments:

```bash
# Add to GitHub Secrets:
DEPLOY_KEY: <SSH key for deployment>
GITHUB_TOKEN: (automatically provided)
```

### Environment Variables

```yaml
# Set in workflow file:
NODE_VERSION: 20.x
ARTIFACT_RETENTION: 30 days
```

## Local Testing

Test workflows locally before pushing:

```bash
# Install act (GitHub Actions locally)
brew install act

# Run all workflows
act

# Run specific workflow
act -j test

# Run with debugging
act -j test --verbose
```

## Monitoring

### GitHub Actions Dashboard
- Navigate to: Repository → Actions
- View all workflow runs
- Download artifacts
- View job logs

### PR Status Checks
- Status badge shows on pull requests
- Merge blocked if tests fail (optional)
- Comments automatically added with results

### Build Artifacts
- Retain for 30 days
- Download from Actions tab
- Use for local testing or analysis

## Troubleshooting

### Tests Failing
1. Check workflow logs in Actions tab
2. Run locally: `npm test`
3. Verify Node.js version compatibility

### Deployment Issues
1. Verify GitHub Pages is enabled in Settings
2. Check GITHUB_TOKEN has correct permissions
3. Ensure build.js completes successfully

### Slow Builds
1. Enable NPM cache: `cache: 'npm'`
2. Parallelize jobs with `strategy.matrix`
3. Use `npm ci` instead of `npm install`

## Performance

### Build Times
- Test suite: ~30-60s per Node version
- Build: ~15-20s
- Deploy: ~2-5 minutes (Pages)
- Total: ~10-15 minutes per push

### Cost
- GitHub Actions: 2000 free minutes/month for public repos
- LuminaCV: ~10-15 minutes per workflow run
- Estimate: ~300-500 minutes/month (plenty of headroom)

## Future Enhancements

```yaml
# Potential additions:
- E2E tests with Playwright
- Performance benchmarking
- Visual regression testing
- Demo GIF generation
- Automated release notes
- Dependency updates (Dependabot)
```

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [GitHub Pages Deployment](https://docs.github.com/en/pages/getting-started-with-github-pages)

---

**Last Updated:** 2 January 2026  
**Status:** ✅ Active
