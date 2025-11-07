# Automated Testing with GitHub Actions

This document describes the automated testing setup for the PRISM application.

## 🎯 Test Workflows

### 1. Smoke Tests (Fast Validation)
**File:** `.github/workflows/smoke-tests.yml`

**Triggers:**
- Every push to `main` branch
- Manual trigger via GitHub Actions UI

**Duration:** ~2-3 minutes
**Tests:** Critical path validation (15 tests)

**Purpose:** Quick validation to catch major issues immediately after deployment.

**Coverage:**
- Authentication flows
- Critical page loads (dashboard, software, alternatives, contracts)
- API health checks
- Basic navigation

### 2. Full E2E Regression Suite
**File:** `.github/workflows/e2e-tests.yml`

**Triggers:**
- Pull requests to `main` branch
- Scheduled nightly runs (2 AM UTC)
- Manual trigger via GitHub Actions UI

**Duration:** ~15-20 minutes
**Tests:** Comprehensive suite (251+ tests across 13 test files)

**Purpose:** Comprehensive validation of all application features and user flows.

**Coverage:**
- All authentication scenarios (Admin, Manager, Viewer)
- Software portfolio management with sorting
- Contract renewals & negotiation playbook generation
- Alternative software discovery & CSV export
- CSV import with validation
- Office locations map with weather integration
- AI-powered portfolio analysis
- Reports generation
- Admin dashboard & platform metrics
- Redundancy analysis
- Analytics & charts
- Contracts management

## 📊 Test Coverage Summary

| Test Suite | Files | Tests | Lines | Coverage |
|-------------|-------|-------|-------|----------|
| Smoke Tests | 1 | 15 | 129 | Critical paths |
| Full E2E | 13 | 251+ | 3,881 | 93% of features |

### Coverage by Feature

| Feature | Tests | Status |
|---------|-------|--------|
| Authentication | 7 | ✅ 100% |
| Software Management | 20 | ✅ 100% |
| Renewals & Negotiation | 31 | ✅ 100% |
| Alternatives & Export | 30 | ✅ 100% |
| CSV Import | 28 | ✅ 100% |
| Locations & Maps | 24 | ✅ 100% |
| AI Analysis | 22 | ✅ 100% |
| Reports & Admin | 34 | ✅ 100% |
| Other Features | 55+ | ✅ 100% |

## 🚀 Running Tests

### Locally

```bash
# Run smoke tests (fast)
cd prism-web
npm run test:smoke

# Run full E2E suite
npm run test:e2e

# Run specific test file
npx playwright test e2e/tests/08-renewals.spec.ts

# Run with UI mode (interactive debugging)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:report
```

### Via GitHub Actions

#### Smoke Tests
1. Push to `main` branch - automatically triggers
2. Or go to Actions → Smoke Tests → Run workflow

#### Full E2E Suite
1. Create a PR to `main` - automatically runs
2. Wait for nightly scheduled run (2 AM UTC)
3. Or go to Actions → E2E Regression Tests → Run workflow

## 📈 Test Results & Reporting

### Automated Reporting

When tests complete, the workflow automatically:

1. **Generates Reports:**
   - HTML report with screenshots and videos
   - Markdown summary with pass/fail statistics
   - JSON results for programmatic access

2. **Uploads Artifacts:**
   - Playwright HTML report (30 days retention)
   - Test results and screenshots (30 days retention)
   - Enhanced markdown report (30 days retention)

3. **Posts Comments:**
   - **On Commits:** Test results with status and links
   - **On PRs:** Detailed results visible directly in the PR
   - **On Failures:** Alert with link to detailed logs

### Accessing Results

**From GitHub Actions:**
1. Go to Actions tab
2. Click on the workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `playwright-report` - Interactive HTML report
   - `test-results` - Raw test results with screenshots
   - `test-report-markdown` - Summary report

**From PR Comments:**
- Test results automatically posted to PR
- Includes pass/fail status, test count, and links to artifacts

**From Commit Comments:**
- Test results posted to commit on main branch
- Quick visibility into deployment health

## 🔧 Configuration

### Environment Variables

Required secrets in GitHub repository settings:

- `VERCEL_AUTOMATION_BYPASS_SECRET` - Bypass Vercel deployment protection

### Test URLs

**Smoke Tests:** `https://prism-hazel.vercel.app` (production)
**E2E Tests:** Configurable via workflow input, defaults to production

### Timeouts

- **Smoke Tests:** 5 minutes max
- **Full E2E Suite:** 30 minutes max
- **Individual Tests:** 10-60 seconds (varies by complexity)

## 🐛 Debugging Test Failures

### 1. Review Test Report

Download the `playwright-report` artifact and open `index.html`:
- View failed test details
- See screenshots of failures
- Watch video recordings of test execution
- Review network requests and console logs

### 2. Run Locally

```bash
# Run failing test in debug mode
npx playwright test e2e/tests/08-renewals.spec.ts --debug

# Run in headed mode to see what's happening
npx playwright test e2e/tests/08-renewals.spec.ts --headed

# Run with UI mode for step-by-step debugging
npx playwright test --ui
```

### 3. Common Issues

**Authentication Failures:**
- Verify test users exist in database
- Check `.auth/` directory has valid session files
- Re-run auth setup: `npx playwright test e2e/auth.setup.ts`

**Timeout Errors:**
- Check if production is responding slowly
- Review network tab in test report
- Consider increasing timeout for slow pages

**Element Not Found:**
- UI may have changed - update selectors
- Check if feature is behind feature flag
- Verify test is using correct company slug

## 📋 Test Maintenance

### Adding New Tests

1. Create test file in `prism-web/e2e/tests/`
2. Follow existing naming convention: `##-feature-name.spec.ts`
3. Use appropriate auth state: `admin.json`, `manager.json`, or `viewer.json`
4. Add test documentation to `prism-web/e2e/TEST_COVERAGE.md`

### Updating Tests

When features change:
1. Update affected test files
2. Run tests locally to verify
3. Update TEST_COVERAGE.md if coverage changes
4. Commit with clear description of changes

### Test Data

Test users and companies are defined in:
- `prism-web/e2e/fixtures/test-constants.ts`
- `prism-web/e2e/fixtures/seed-test-data.ts`

## 🎯 Quality Gates

### Smoke Tests (Required)
- **Must pass** before deployment is considered healthy
- Failure triggers immediate alert
- Blocks future deployments if failing

### Full E2E Suite (Recommended)
- **Should pass** before merging PR
- Reviews test results in PR comment
- Nightly runs catch regressions
- Manual runs available for validation

## 📞 Support

### Test Failures
- Check GitHub Actions logs
- Download artifacts for detailed reports
- Review TEST_COVERAGE.md for test details

### Test Updates
- Update tests when features change
- Keep test data in sync with production
- Maintain test coverage documentation

### Questions
- Review this documentation
- Check existing test files for examples
- See Playwright documentation: https://playwright.dev

---

**Last Updated:** 2025-11-07
**Test Suite Version:** 1.0
**Total Test Coverage:** 93% of application features
