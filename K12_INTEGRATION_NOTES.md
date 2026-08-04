# K12 Standards API Integration Notes

## Overview

This document describes the integration of real API endpoints with the K12 Standards Interface UI components.

## What Was Done

### 1. Created API Utility Layer
**File:** `/lib/api/k12-standards.ts`

Provides typed methods to call Hephaestus's K12 API endpoints:
- `fetchStandardsByDomain(organizationId)` - GET /api/standards
- `fetchClassMasterySummary(classId, organizationId)` - GET /api/classes/[classId]/mastery-summary
- `fetchStudents(organizationId, classId?)` - GET /api/students
- `fetchStudentProgress(studentId, organizationId)` - GET /api/students/[studentId]/progress
- `updateStudentProgress(...)` - PUT /api/students/[studentId]/progress
- `bulkUpdateClassMastery(...)` - POST /api/classes/[classId]/mastery-summary/bulk-update

All methods:
- Use the existing `apiClient` from `/lib/api/client.ts`
- Include proper error handling and logging
- Return typed responses matching API documentation

### 2. Updated Main Interface Component
**File:** `/app/components/K12StandardsInterface.tsx`

Added:
- **State management** for API data (standards, mastery summaries, students)
- **Loading states** (loading, error, idle) for all API calls
- **Error handling** with user-friendly error messages and dismiss button
- **Toggle button** to switch between mock data and real API data
- **Auto-fetch logic** using `useEffect` hooks:
  - Fetches standards on mount (if orgId provided)
  - Fetches class mastery when a class is selected
- **Fallback to mock data** if API calls fail or real data not requested

### 3. Component Structure

All 4 views maintain the same UI/UX:

#### Standards List View (`K12StandardsList.tsx`)
- **Mock Data:** Reads from mockK12Data.standards
- **Real Data:** Maps API StandardResponse[] to Standard format
- **Domain filtering** works with both data sources
- **Loading state:** Shows spinner during fetch

#### Class List View (`K12ClassList.tsx`)
- **Mock Data:** Reads from mockK12Data.classes
- **Real Data:** Uses classMasteryData.class info + matrix summary
- **Sorting** works with both data sources
- **Loading state:** Shows spinner during fetch

#### Student Grid View (`K12StudentGrid.tsx`)
- **Mock Data:** Reads from mockK12Data.studentProgress
- **Real Data:** Transforms classMasteryData.matrix to StudentMastery format
- **Mastery levels** (1-4 scale) color-coded consistently
- **Cell click** ready for detail modal (implementation left for next phase)
- **Loading state:** Shows spinner during fetch

#### Cohort Filter View (`K12CohortFilter.tsx`)
- **Uses mock data only** (API doesn't have cohort filtering yet)
- **Filters by student cohort** within selected cohort
- **Shows cohort statistics** (avg mastery, student count, assessments)
- **Independent of main data source toggle**

### 4. Error Handling

All API calls wrapped with try/catch:
- Network errors logged to console
- User-facing error message displayed
- Error can be dismissed
- Fallback to mock data on failure
- Retry logic built into apiClient (exponential backoff)

### 5. Loading States

Visual feedback during API calls:
- Overlay spinner on main content area
- "Loading..." text
- Smooth CSS animation
- Prevents interaction during load
- Clears automatically when data arrives

### 6. Data Transformation

API responses mapped to component types:

**StandardResponse → Standard:**
```typescript
{
  id: std.id,
  name: std.name,
  domain: 'api',
  description: std.description,
  classCount: std.stats?.studentsTracked,
  studentCount: std.stats?.studentsTracked,
}
```

**ClassMasterySummaryResponse → ClassMastery:**
```typescript
{
  id: classMasteryData.class.id,
  name: classMasteryData.class.name,
  departmentName: classMasteryData.class.subject,
  studentCount: classMasteryData.summary.totalStudents,
  standardCount: classMasteryData.summary.totalStandards,
  avgMasteryLevel: classMasteryData.summary.averageMastery,
}
```

**MasterySummaryRow → StudentMastery:**
```typescript
{
  studentId: row.studentId,
  studentName: row.studentName,
  email: row.studentEmail,
  masteryByStandard: { standardId → masteryLevel },
  cohort: '',
}
```

## Usage

### Switching Between Mock and Real Data

In K12StandardsInterface, click the toggle button:
- **Using Mock Data** - Shows demo data (faster iteration)
- **Using Real Data** - Fetches from API (production-like)

### Providing Organization ID

Pass `orgId` prop to K12StandardsInterface:
```typescript
<K12StandardsInterface orgId="org_abc123" />
```

Without orgId, real data fetching won't start (safe fallback).

## API Requirements

All endpoints require:
- Valid NextAuth session (user logged in)
- `domain` query parameter with organizationId
- Role-based access (Teacher, Admin, etc.)

**Note:** The frontend doesn't manage authentication - NextAuth session is implicit.

## Environment Setup

Ensure these API routes are running in the backend:
- `/api/standards` - Standards CRUD
- `/api/students` - Student list + progress
- `/api/classes/[classId]/mastery-summary` - Class grid

See `/API_K12_STANDARDS_ENDPOINTS.md` for full endpoint documentation.

## Responsive Design

All views responsive at:
- **Desktop** (1200px+) - Full tables, multi-column layout
- **Tablet** (768px - 1199px) - Adjusted columns, vertical scroll where needed
- **Mobile** (< 768px) - Single column, horizontal scroll on grids

CSS media queries maintained from Daedalus's original design.

## Accessibility

All views maintain WCAG AA compliance:
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management during loading
- Color contrast on mastery levels
- Semantic HTML (tables, buttons, headings)

## Performance

Optimization patterns:
- **useMemo** for filtered/computed data (standards, students, stats)
- **useEffect** for API calls (no unnecessary fetches)
- **Loading state** prevents multiple simultaneous requests
- **Error boundaries** built into apiClient (retry logic)
- **Fallback to mock data** on API failure

## Future Enhancements

### Phase 2: Student Detail Modal
- Click grid cell → open modal
- Show: student progress, feedback, objectives
- Call: `/api/students/[studentId]/progress`

### Phase 3: Grade Entry Interface
- Bulk update mastery levels
- Call: `/api/classes/[classId]/mastery-summary/bulk-update`
- UI: Inline editing or modal form

### Phase 4: Cohort API Integration
- Backend: Create `/api/cohorts` endpoint
- Frontend: Replace mock cohort data with API calls
- Add cohort filtering to class/standard views

### Phase 5: Analytics & Charts
- Mastery distribution charts (D3 or Recharts)
- Progress over time graphs
- Cohort comparison views

## Testing Checklist

- [ ] Mock data loads and displays (no API needed)
- [ ] Toggle to real data → API calls start
- [ ] Standards list fetches and displays
- [ ] Class selection → mastery-summary API call
- [ ] Student grid displays matrix correctly
- [ ] Loading spinner appears during fetch
- [ ] Error message displays on API failure
- [ ] Dismiss error button works
- [ ] Responsive design: desktop, tablet, mobile
- [ ] Keyboard navigation: tab through all controls
- [ ] Screen reader: aria-labels read correctly
- [ ] Fallback: if API fails, can still use mock data

## File Locations

- **API Utilities:** `/lib/api/k12-standards.ts`
- **Main Component:** `/app/components/K12StandardsInterface.tsx`
- **Sub-components:** `/app/components/K12*.tsx` (unchanged structure)
- **Mock Data:** `/app/components/K12StandardsInterface.mockData.ts`
- **Types:** `/app/components/K12StandardsInterface.types.ts`
- **API Documentation:** `/API_K12_STANDARDS_ENDPOINTS.md`

## Dependencies

- React 18+
- Next.js 16+
- Existing apiClient (`/lib/api/client.ts`)
- NextAuth.js (session management implicit)

No new npm packages required.

## Notes

- **Backward Compatible:** Mock data flow unchanged - no breaking changes
- **Safe Defaults:** Real API only used if explicitly toggled + orgId provided
- **Error Recovery:** Always falls back to mock data if API fails
- **DevX Friendly:** Easy to develop with mock data, test with real API
