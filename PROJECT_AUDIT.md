# KrashBoard v3 - Comprehensive Project Audit

**Date:** January 2025  
**Auditor:** AI Code Review  
**Project Status:** Production (Live)  
**Framework:** Next.js 16.1.1, React 19, TypeScript

---

## Executive Summary

This audit identifies **critical security vulnerabilities**, code quality issues, architectural concerns, and areas for improvement. The project is functional but requires immediate attention to security issues and significant refactoring for maintainability and scalability.

**Overall Assessment:** ⚠️ **Needs Immediate Attention**

- **Critical Issues:** 3
- **High Priority:** 8
- **Medium Priority:** 12
- **Low Priority:** 15

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. SQL Injection Vulnerabilities (CRITICAL)

**Location:** Multiple files  
**Severity:** 🔴 CRITICAL - **IMMEDIATE FIX REQUIRED**

#### Issue 1.1: String Interpolation in SQL Queries
**Files:**
- `src/lib/bigquery.ts` (lines 137, 157, 192, 202)
- `src/app/api/nfl/props/filtered/route.ts` (lines 40-68, 151, 162)

**Problem:**
```typescript
// ❌ VULNERABLE - Direct string interpolation
const query = `
  WHERE player_id = '${playerId}'
  AND season = ${season}
`

// ❌ VULNERABLE - User input directly in SQL
const playerList = players.map((p: string) => `'${p.replace(/'/g, "''")}'`).join(',')
whereConditions.push(`kw_player_name IN (${playerList})`)
```

**Risk:** Attackers can inject malicious SQL code, potentially:
- Accessing unauthorized data
- Modifying/deleting data
- Executing arbitrary commands

**Fix Required:**
- Use BigQuery parameterized queries (`@param_name`)
- Validate and sanitize all user inputs
- Use BigQuery's built-in parameter binding

**Example Fix:**
```typescript
// ✅ SAFE - Parameterized query
const query = `
  WHERE player_id = @player_id
  AND season = @season
`
const [rows] = await bigquery.query({
  query,
  params: { player_id: playerId, season: season }
})
```

**Priority:** Fix immediately before production use

---

### 2. Missing Input Validation

**Location:** All API routes  
**Severity:** 🔴 CRITICAL

**Problem:**
- No validation on query parameters
- No rate limiting
- No request size limits
- No type checking on POST body data

**Files Affected:**
- `src/app/api/nfl/props/filtered/route.ts` - Accepts arbitrary POST body
- `src/app/api/nfl/players/[id]/gamelogs/route.ts` - No validation on `id` parameter
- All other API routes

**Fix Required:**
- Implement Zod schemas for all API inputs
- Add rate limiting middleware
- Validate all parameters before use
- Add request size limits

---

### 3. Environment Variable Exposure Risk

**Location:** `src/lib/supabase.ts`, `src/lib/bigquery.ts`  
**Severity:** 🔴 CRITICAL

**Problem:**
- Environment variables accessed without validation
- No fallback error handling
- Missing env vars cause runtime crashes
- No validation of env var format

**Fix Required:**
- Create centralized env validation utility
- Validate all required env vars at startup
- Provide clear error messages for missing vars
- Use Zod for env var schema validation

---

## 🟠 HIGH PRIORITY ISSUES

### 4. No Authentication/Authorization

**Location:** All API routes  
**Severity:** 🟠 HIGH

**Problem:**
- All API endpoints are publicly accessible
- No authentication middleware
- No rate limiting
- No API key protection
- Supabase auth exists but is not used

**Impact:**
- Anyone can call your APIs
- Potential for abuse/DoS attacks
- No user tracking
- No usage limits

**Fix Required:**
- Implement authentication middleware
- Add API key protection for public endpoints
- Implement rate limiting (e.g., using Upstash Redis)
- Add user session validation

---

### 5. Excessive Console Logging in Production

**Location:** 24 files, 62+ instances  
**Severity:** 🟠 HIGH

**Files with console.log:**
- `src/lib/bigquery.ts`
- `src/app/api/nfl/props/route.ts`
- `src/app/api/nhl/player-vs-opp/route.ts`
- `src/app/api/nhl/props/route.ts`
- `src/app/api/nhl/players/[id]/play-by-play/route.ts`
- And 19+ more files

**Problem:**
- Console logs expose sensitive information
- Performance impact in production
- No structured logging
- Debug information leaked to clients

**Fix Required:**
- Replace `console.log` with proper logging library (Winston, Pino)
- Use environment-based log levels
- Remove debug logs from production
- Implement structured logging with context

---

### 6. Type Safety Issues

**Location:** Throughout codebase  
**Severity:** 🟠 HIGH

**Problem:**
- 94 instances of `any` type
- Missing type definitions
- Loose type checking
- `[key: string]: any` used in interfaces

**Examples:**
```typescript
// ❌ BAD
interface PlayerGamelog {
  [key: string]: any
}

// ❌ BAD
const formattedRows = rows.map((row: any) => ({ ... }))
```

**Fix Required:**
- Remove all `any` types
- Create proper TypeScript interfaces
- Enable stricter TypeScript settings
- Use type guards for runtime validation

---

### 7. No Error Boundaries

**Location:** React components  
**Severity:** 🟠 HIGH

**Problem:**
- No React Error Boundaries
- Unhandled errors crash entire app
- No graceful error recovery
- Poor user experience on errors

**Fix Required:**
- Add Error Boundary components
- Implement error recovery UI
- Add error reporting (Sentry)
- Create fallback UI for errors

---

### 8. Missing Tests

**Location:** Entire project  
**Severity:** 🟠 HIGH

**Problem:**
- Zero test files found
- No unit tests
- No integration tests
- No E2E tests
- No test coverage

**Impact:**
- No confidence in code changes
- High risk of regressions
- Difficult to refactor safely
- No documentation through tests

**Fix Required:**
- Set up Jest/Vitest
- Add unit tests for utilities
- Add integration tests for API routes
- Add component tests with React Testing Library
- Set up E2E tests with Playwright
- Aim for 70%+ code coverage

---

### 9. Inconsistent Error Handling

**Location:** API routes  
**Severity:** 🟠 HIGH

**Problem:**
- Inconsistent error response formats
- Some routes return `{ error: string }`
- Others return `{ success: false, error: string, message: string }`
- No standardized error codes
- Errors expose internal details

**Fix Required:**
- Create standardized error response format
- Implement error handling middleware
- Use HTTP status codes correctly
- Don't expose internal error details
- Create custom error classes

---

### 10. Memory Leaks in Cache Implementation

**Location:** `src/lib/cache.ts`  
**Severity:** 🟠 HIGH

**Problem:**
- `setInterval` timers never cleared on server restart
- Memory leaks in long-running serverless functions
- Cache grows unbounded
- No cache size limits

**Fix Required:**
- Add cache size limits
- Implement LRU eviction
- Clear intervals on cleanup
- Use proper cache invalidation

---

### 11. No Request Validation

**Location:** All API routes  
**Severity:** 🟠 HIGH

**Problem:**
- No validation of request bodies
- No validation of query parameters
- No validation of path parameters
- Type coercion issues (e.g., `parseInt` without validation)

**Example:**
```typescript
// ❌ BAD - No validation
const season = parseInt(searchParams.get('season') || '2024')
const page = parseInt(searchParams.get('page') || '1')
```

**Fix Required:**
- Use Zod for all input validation
- Validate before processing
- Return 400 for invalid inputs
- Add type-safe validation helpers

---

## 🟡 MEDIUM PRIORITY ISSUES

### 12. Code Duplication

**Location:** Multiple files  
**Severity:** 🟡 MEDIUM

**Problem:**
- Team logo mapping duplicated across files
- Bookmaker logo mapping duplicated
- Similar dashboard components with duplicated logic
- Repeated error handling patterns

**Examples:**
- `getNHLTeamLogo()` duplicated in multiple files
- `getBookmakerLogo()` duplicated
- Similar chart rendering logic in multiple dashboards

**Fix Required:**
- Extract shared utilities
- Create reusable components
- Use shared constants
- Implement DRY principle

---

### 13. Large Component Files

**Location:** Multiple files  
**Severity:** 🟡 MEDIUM

**Problem:**
- `src/app/nfl/prop-lab/[player_id]/page.tsx` - 1112 lines
- `src/app/nfl/tools/prop-lab/page.tsx` - 1374 lines
- `src/app/nhl/prop-lab/[player_id]/page.tsx` - 983 lines

**Impact:**
- Difficult to maintain
- Hard to test
- Poor code organization
- Performance issues

**Fix Required:**
- Break into smaller components
- Extract custom hooks
- Separate concerns
- Use composition pattern

---

### 14. Missing API Documentation

**Location:** All API routes  
**Severity:** 🟡 MEDIUM

**Problem:**
- No OpenAPI/Swagger documentation
- No JSDoc comments on API routes
- No request/response examples
- No API versioning

**Fix Required:**
- Add OpenAPI specification
- Document all endpoints
- Add request/response examples
- Implement API versioning strategy

---

### 15. Inefficient Data Fetching

**Location:** Client components  
**Severity:** 🟡 MEDIUM

**Problem:**
- Multiple `useEffect` hooks fetching data
- No request deduplication
- No request cancellation
- Fetching on every render in some cases
- No loading states coordination

**Fix Required:**
- Use React Query or SWR
- Implement request deduplication
- Add request cancellation
- Optimize data fetching patterns

---

### 16. Hardcoded Values

**Location:** Throughout codebase  
**Severity:** 🟡 MEDIUM

**Problem:**
- Hardcoded project IDs (`nfl25-469415`, `nhl25-473523`)
- Hardcoded table names
- Hardcoded cache TTL values
- Hardcoded API limits

**Fix Required:**
- Move to configuration files
- Use environment variables
- Create constants file
- Make values configurable

---

### 17. Missing Loading States

**Location:** Some components  
**Severity:** 🟡 MEDIUM

**Problem:**
- Inconsistent loading UI
- Some components show nothing while loading
- No skeleton loaders
- Poor UX during data fetching

**Fix Required:**
- Standardize loading components
- Add skeleton loaders
- Improve loading UX
- Add progress indicators

---

### 18. No Monitoring/Observability

**Location:** Entire application  
**Severity:** 🟡 MEDIUM

**Problem:**
- No error tracking (Sentry mentioned but not implemented)
- No performance monitoring
- No analytics
- No API usage tracking

**Fix Required:**
- Integrate Sentry for error tracking
- Add performance monitoring
- Implement analytics
- Track API usage and errors

---

### 19. Inconsistent Naming Conventions

**Location:** Throughout codebase  
**Severity:** 🟡 MEDIUM

**Problem:**
- Mix of camelCase and snake_case
- Inconsistent file naming
- Inconsistent component naming
- Inconsistent variable naming

**Examples:**
- `player_id` vs `playerId`
- `getNFLPlayers` vs `fetchPlayerVsOppData`
- `PlayerGamelog` vs `player_gamelogs`

**Fix Required:**
- Establish naming conventions
- Use ESLint rules for consistency
- Refactor inconsistent names
- Document naming standards

---

### 20. Missing Accessibility Features

**Location:** UI components  
**Severity:** 🟡 MEDIUM

**Problem:**
- Missing ARIA labels
- No keyboard navigation support
- Poor screen reader support
- Missing focus indicators

**Fix Required:**
- Add ARIA labels
- Implement keyboard navigation
- Test with screen readers
- Add focus indicators

---

### 21. No API Rate Limiting

**Location:** API routes  
**Severity:** 🟡 MEDIUM

**Problem:**
- No rate limiting on endpoints
- Vulnerable to abuse
- No protection against DoS
- Unlimited API usage

**Fix Required:**
- Implement rate limiting
- Use Vercel Edge Config or Upstash
- Add per-IP limits
- Add per-user limits

---

### 22. Debug Code Left in Production

**Location:** Multiple files  
**Severity:** 🟡 MEDIUM

**Problem:**
- Debug comments left in code
- Console.log statements
- Temporary code not removed
- Debug flags still present

**Examples:**
```typescript
// Debug: log first few rows to see data structure
// Query standardized shots view - remove player filter temporarily to debug
// Debug logging
```

**Fix Required:**
- Remove all debug code
- Use proper logging
- Clean up temporary code
- Add pre-commit hooks to prevent debug code

---

### 23. Missing Environment Variable Validation

**Location:** `src/lib/bigquery.ts`, `src/lib/supabase.ts`  
**Severity:** 🟡 MEDIUM

**Problem:**
- No validation of env var format
- No validation of required vars at startup
- Silent failures when vars missing
- No type safety for env vars

**Fix Required:**
- Create env validation utility
- Validate at application startup
- Use Zod for env schema
- Provide clear error messages

---

## 🟢 LOW PRIORITY / CODE QUALITY

### 24. Missing JSDoc Comments

**Location:** Functions and components  
**Severity:** 🟢 LOW

**Problem:**
- No documentation on complex functions
- No parameter descriptions
- No return type documentation
- No usage examples

**Fix Required:**
- Add JSDoc to all public functions
- Document complex logic
- Add usage examples
- Generate API documentation

---

### 25. Unused Dependencies

**Location:** `package.json`  
**Severity:** 🟢 LOW

**Problem:**
- Zustand installed but `src/stores/` is empty
- Some dependencies may be unused
- No dependency audit

**Fix Required:**
- Audit dependencies
- Remove unused packages
- Keep dependencies up to date
- Use `depcheck` to find unused deps

---

### 26. Missing Prettier Configuration

**Location:** Root directory  
**Severity:** 🟢 LOW

**Problem:**
- No `.prettierrc` file
- Inconsistent code formatting
- No formatting on commit

**Fix Required:**
- Add Prettier configuration
- Add pre-commit formatting hook
- Format entire codebase
- Add to CI/CD pipeline

---

### 27. Inconsistent Import Organization

**Location:** All files  
**Severity:** 🟢 LOW

**Problem:**
- Imports not organized consistently
- Mix of import styles
- No import sorting

**Fix Required:**
- Use ESLint import sorting
- Organize imports consistently
- Group imports (external, internal, relative)
- Add import sorting to pre-commit

---

### 28. Missing Type Exports

**Location:** `src/types/index.ts`  
**Severity:** 🟢 LOW

**Problem:**
- Types not properly exported
- Duplicate type definitions
- Missing shared types

**Fix Required:**
- Centralize type definitions
- Export all shared types
- Remove duplicate types
- Create type index file

---

### 29. No CI/CD Pipeline

**Location:** Project root  
**Severity:** 🟢 LOW

**Problem:**
- No GitHub Actions workflows
- No automated testing
- No automated linting
- No automated deployment checks

**Fix Required:**
- Set up GitHub Actions
- Add automated tests
- Add linting checks
- Add type checking
- Add build verification

---

### 30. Missing .env Validation

**Location:** Root directory  
**Severity:** 🟢 LOW

**Problem:**
- No validation of .env file
- No schema for env vars
- Silent failures on missing vars

**Fix Required:**
- Use `zod` for env validation
- Validate on startup
- Provide clear error messages
- Document required vars

---

### 31. No Performance Optimization

**Location:** Components and API routes  
**Severity:** 🟢 LOW

**Problem:**
- No code splitting
- No lazy loading
- Large bundle sizes
- No image optimization strategy

**Fix Required:**
- Implement code splitting
- Add lazy loading for routes
- Optimize bundle size
- Add image optimization

---

### 32. Missing Error Recovery

**Location:** Client components  
**Severity:** 🟢 LOW

**Problem:**
- No retry logic
- No offline support
- No error recovery UI
- Poor error messages

**Fix Required:**
- Add retry logic
- Implement offline detection
- Improve error messages
- Add recovery actions

---

### 33. Inconsistent Styling

**Location:** Components  
**Severity:** 🟢 LOW

**Problem:**
- Mix of inline styles and Tailwind
- Inconsistent spacing
- Inconsistent color usage

**Fix Required:**
- Standardize styling approach
- Use Tailwind consistently
- Create design tokens
- Document styling patterns

---

### 34. Missing SEO Optimization

**Location:** Pages  
**Severity:** 🟢 LOW

**Problem:**
- Basic metadata only
- No dynamic metadata
- No structured data
- No sitemap

**Fix Required:**
- Add dynamic metadata
- Implement structured data
- Generate sitemap
- Optimize for SEO

---

### 35. No Code Comments

**Location:** Complex logic  
**Severity:** 🟢 LOW

**Problem:**
- Complex logic not explained
- No business logic documentation
- Hard to understand intent

**Fix Required:**
- Add comments to complex logic
- Document business rules
- Explain "why" not "what"
- Keep comments up to date

---

### 36. Missing Git Hooks

**Location:** `.git/hooks`  
**Severity:** 🟢 LOW

**Problem:**
- No pre-commit hooks
- No commit message validation
- No automated checks

**Fix Required:**
- Add Husky
- Add pre-commit hooks
- Validate commit messages
- Run tests before commit

---

### 37. No Dependency Updates

**Location:** `package.json`  
**Severity:** 🟢 LOW

**Problem:**
- Dependencies may be outdated
- No automated updates
- Security vulnerabilities possible

**Fix Required:**
- Use Dependabot
- Regular dependency audits
- Keep dependencies updated
- Monitor security advisories

---

### 38. Missing Build Optimization

**Location:** `next.config.js`  
**Severity:** 🟢 LOW

**Problem:**
- Basic Next.js config
- No bundle analysis
- No build optimization

**Fix Required:**
- Optimize Next.js config
- Add bundle analyzer
- Optimize build output
- Add build caching

---

## 📊 Architecture & Design Issues

### 39. Monolithic API Routes

**Problem:**
- All logic in route handlers
- No service layer
- No separation of concerns
- Difficult to test

**Fix Required:**
- Create service layer
- Separate business logic
- Extract data access layer
- Implement proper layering

---

### 40. No Centralized Configuration

**Problem:**
- Configuration scattered
- Hardcoded values
- No config management

**Fix Required:**
- Create config module
- Centralize configuration
- Use environment-based config
- Document configuration

---

### 41. Inconsistent Data Fetching Patterns

**Problem:**
- Mix of server and client fetching
- No consistent pattern
- Duplicate fetching logic

**Fix Required:**
- Standardize data fetching
- Use React Server Components where possible
- Create data fetching utilities
- Document patterns

---

## 📝 Recommendations Summary

### Immediate Actions (This Week)
1. ✅ **Fix SQL injection vulnerabilities** - Use parameterized queries
2. ✅ **Add input validation** - Implement Zod schemas
3. ✅ **Remove console.log statements** - Replace with proper logging
4. ✅ **Add error boundaries** - Prevent app crashes
5. ✅ **Implement rate limiting** - Protect APIs from abuse

### Short Term (This Month)
6. Add authentication/authorization
7. Set up testing framework
8. Fix type safety issues
9. Refactor large components
10. Add monitoring/observability

### Medium Term (Next Quarter)
11. Implement CI/CD pipeline
12. Add comprehensive tests
13. Refactor architecture
14. Improve documentation
15. Optimize performance

### Long Term (Ongoing)
16. Continuous improvement
17. Regular security audits
18. Dependency updates
19. Performance monitoring
20. Code quality improvements

---

## 📈 Code Quality Metrics

- **TypeScript Coverage:** ~85% (needs improvement)
- **Test Coverage:** 0% (critical)
- **Code Duplication:** High (needs refactoring)
- **Cyclomatic Complexity:** High in some files
- **Maintainability Index:** Medium-Low

---

## 🔍 Files Requiring Immediate Attention

1. `src/app/api/nfl/props/filtered/route.ts` - SQL injection
2. `src/lib/bigquery.ts` - SQL injection, type safety
3. `src/app/nfl/tools/prop-lab/page.tsx` - 1374 lines, needs refactoring
4. `src/app/nfl/prop-lab/[player_id]/page.tsx` - 1112 lines, needs refactoring
5. `src/app/nhl/prop-lab/[player_id]/page.tsx` - 983 lines, needs refactoring

---

## 📚 Additional Notes

### Positive Aspects
- ✅ Good use of TypeScript
- ✅ Modern React patterns (hooks)
- ✅ Good component library (Radix UI)
- ✅ Proper Next.js App Router usage
- ✅ Good styling with Tailwind
- ✅ Comprehensive CHANGELOG

### Areas of Strength
- Component organization is reasonable
- UI/UX appears well thought out
- Good use of modern React features
- Proper separation of API routes

---

## 🎯 Priority Action Plan

### Week 1: Critical Security Fixes
- [ ] Fix all SQL injection vulnerabilities
- [ ] Add input validation with Zod
- [ ] Remove all console.log statements
- [ ] Add environment variable validation

### Week 2: High Priority Fixes
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add error boundaries
- [ ] Fix type safety issues

### Week 3: Testing & Quality
- [ ] Set up testing framework
- [ ] Write critical path tests
- [ ] Add CI/CD pipeline
- [ ] Improve error handling

### Week 4: Refactoring
- [ ] Break down large components
- [ ] Extract shared utilities
- [ ] Improve code organization
- [ ] Add documentation

---

**End of Audit Report**

*This audit was conducted to help improve code quality, security, and maintainability. All issues should be addressed based on priority and business impact.*

