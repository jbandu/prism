# E2E Test Coverage Analysis

**Generated:** 2025-11-04
**Last Updated:** After Migration 004 & Redundancy Analysis Feature

---

## 📊 Current Test Coverage

### ✅ Tested Features (4 test files, 384 lines)

| Test File | Coverage | Lines | Status |
|-----------|----------|-------|--------|
| `01-auth.spec.ts` | Authentication flows | 86 | ✅ Complete |
| `02-admin-companies.spec.ts` | Admin company management | 109 | ✅ Complete |
| `03-company-dashboard.spec.ts` | Dashboard navigation | 94 | ⚠️ Basic only |
| `04-software-management.spec.ts` | Software portfolio | 95 | ⚠️ Basic only |

**Total Tests:** ~20 tests across 3 roles (admin, manager, viewer)

---

## ❌ Missing Test Coverage (14+ pages)

### 🚨 High Priority (Recently Added Features)

| Page | Feature | Priority | Reason |
|------|---------|----------|--------|
| `/redundancy` | **Redundancy Analysis** | 🔴 CRITICAL | NEW FEATURE - Added with activity logging |
| `/analytics` | Usage analytics | 🔴 HIGH | Core functionality |
| `/alternatives` | Alternative software | 🔴 HIGH | Core functionality |
| `/renewals` | Contract renewals | 🔴 HIGH | Core functionality |
| `/contracts` | Contract management | 🔴 HIGH | Core functionality |

### ⚠️ Medium Priority

| Page | Feature | Priority |
|------|---------|----------|
| `/locations` | Office map with weather | 🟡 MEDIUM |
| `/portfolio-map` | Interactive portfolio map | 🟡 MEDIUM |
| `/feature-enrichment` | AI feature tagging | 🟡 MEDIUM |
| `/reports` | Custom reports | 🟡 MEDIUM |
| `/analysis` | AI analysis | 🟡 MEDIUM |

### 🟢 Low Priority

| Page | Feature | Priority |
|------|---------|----------|
| `/achievements` | Gamification | 🟢 LOW |
| `/approvals` | Approval workflows | 🟢 LOW |
| `/bot-settings` | Chatbot config | 🟢 LOW |
| `/import` | Data import | 🟢 LOW |
| `/settings` | Company settings | 🟢 LOW |
| `/shadow-it` | Shadow IT detection | 🟢 LOW |

---

## 🎯 Test Scenarios Missing

### Redundancy Analysis (NEW!)
- ❌ Page loads correctly
- ❌ Software selection controls work
- ❌ "Run Analysis" button triggers analysis
- ❌ Progress tracker shows real-time updates
- ❌ Activity log displays steps
- ❌ Results display with overlap percentage
- ❌ Recommendations are generated
- ❌ Cancel button stops analysis

### Analytics Page
- ❌ Charts render correctly
- ❌ Date range filtering
- ❌ Export functionality
- ❌ Drill-down into metrics

### Alternatives Page
- ❌ Alternatives list displays
- ❌ Filtering by feature parity score
- ❌ AI recommendations shown
- ❌ Cost comparison works

### Renewals Page
- ❌ Upcoming renewals list
- ❌ Date-based filtering
- ❌ Renewal status updates
- ❌ Negotiation tracking

### Contracts Page
- ❌ Upload contract PDFs
- ❌ AI contract parsing
- ❌ Contract metadata extraction
- ❌ Contract search

---

## 🔄 Database Changes to Test (Migration 004)

### Schema Changes
- ✅ Foreign keys (tested implicitly)
- ❌ Audit trail (updated_by columns)
- ❌ Soft delete (deleted_at functionality)
- ❌ Performance improvements

### Test Needed
```typescript
// Audit trail - updated_by should be set
test('should track who updated software', async ({ page }) => {
  // Edit software
  // Verify updated_by is set in DB
});

// Soft delete - deleted_at should be set
test('should soft delete instead of hard delete', async ({ page }) => {
  // Delete software
  // Verify deleted_at is set, record still exists
});
```

---

## 📈 Test Quality Improvements Needed

### Current Issues

1. **Overly Generic Assertions**
   ```typescript
   // Current (weak):
   await expect(page.locator('body')).toContainText('Salesforce');

   // Better:
   await expect(page.getByRole('cell', { name: 'Salesforce' })).toBeVisible();
   ```

2. **Missing Data Validation**
   - Don't verify actual data values
   - Don't check calculations (costs, savings, etc.)

3. **No Error Scenarios**
   - Missing: Test what happens when API fails
   - Missing: Test network errors
   - Missing: Test validation errors

4. **No Performance Tests**
   - Don't verify page load times
   - Don't test with large datasets

5. **Authentication State Issues**
   - Tests reference `.auth/manager.json` but this file doesn't exist
   - Need to create auth state files or use fixtures

---

## 🎯 Recommended Test Plan

### Phase 1: Critical Features (This Sprint)
1. **Redundancy Analysis** (full suite - 10+ tests)
2. **Fix auth state management**
3. **Update software management** (comprehensive data validation)

### Phase 2: Core Features
1. Analytics page
2. Alternatives page
3. Renewals page
4. Contracts page

### Phase 3: Advanced Features
1. Office locations with weather API
2. Portfolio map visualization
3. Feature enrichment AI

### Phase 4: Secondary Features
1. Achievements/gamification
2. Settings pages
3. Import functionality

---

## 📊 Target Coverage Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Page Coverage | 22% (4/18) | 80% (14/18) |
| Feature Coverage | ~30% | 80% |
| Role Testing | 3 roles | 3 roles ✅ |
| Browser Coverage | 1 (Chromium) | 3 (Chrome/FF/Safari) |
| Test Count | ~20 | 100+ |

---

## 🚀 Quick Wins

1. ✅ **Add redundancy analysis tests** - High impact, new feature
2. ✅ **Fix authentication state** - Unblocks other tests
3. ✅ **Add data validation** - Improve test quality
4. ✅ **Test error scenarios** - Find bugs early
5. ✅ **Add performance assertions** - Catch regressions

---

**Next Steps:**
1. Create `05-redundancy-analysis.spec.ts` (PRIORITY)
2. Create `06-analytics.spec.ts`
3. Create `07-contracts.spec.ts`
4. Fix authentication state setup
5. Add data validation helpers
