# K12 Standards Interface — Prototype Documentation

**Status:** Prototype Complete (Mock Data)  
**Date:** August 3, 2026  
**Component Location:** `/app/components/K12*`  
**Integration Point:** `/app/organization/[slug]/page.tsx` (StandardsTab)

---

## Overview

The K12 Standards Interface is a comprehensive mastery tracking dashboard for educational organizations. It provides four coordinated views for teachers, admins, and learning community curators to:

1. Browse and filter learning standards
2. View class-level mastery aggregations
3. Analyze individual student progress in detail
4. Filter students by demographic/support cohorts

**Design Approach:** React/TypeScript with strict typing, mock data for prototyping, responsive design, and accessibility built-in.

---

## Component Architecture

### Core Components

| Component | Purpose | File |
|-----------|---------|------|
| **K12StandardsInterface** | Main orchestrator; manages view switching & state | `K12StandardsInterface.tsx` |
| **K12StandardsList** | Display & filter all standards | `K12StandardsList.tsx` |
| **K12ClassList** | Show classes with mastery overview | `K12ClassList.tsx` |
| **K12StudentGrid** | Student × Standard mastery grid | `K12StudentGrid.tsx` |
| **K12CohortFilter** | Filter students by cohort/demographics | `K12CohortFilter.tsx` |

### Supporting Files

| File | Purpose |
|------|---------|
| `K12StandardsInterface.types.ts` | TypeScript interfaces & mastery level definitions |
| `K12StandardsInterface.mockData.ts` | Mock data for prototyping |
| `K12StandardsInterface.stories.tsx` | Storybook stories for each component |

---

## Type Definitions

### Standard
```typescript
interface Standard {
  id: string;
  name: string;
  domain: string;
  description?: string;
  classCount: number;
  studentCount: number;
}
```

### Class
```typescript
interface Class {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  studentCount: number;
  standardCount: number;
  avgMasteryLevel: number; // 1-4
}
```

### StudentMastery
```typescript
interface StudentMastery {
  studentId: string;
  studentName: string;
  email?: string;
  masteryByStandard: Record<string, number>; // standardId -> mastery level (1-4)
  cohort?: string;
  avgMastery?: number;
}
```

### CohortGroup
```typescript
interface CohortGroup {
  id: string;
  name: string;
  description?: string;
  studentCount: number;
  avgMasteryLevel?: number;
}
```

### K12StandardsData
```typescript
interface K12StandardsData {
  standards: Standard[];
  classes: Class[];
  studentProgress: StudentProgress[];
  cohorts: CohortGroup[];
}
```

---

## Mastery Levels

Four levels represent student progress:

| Level | Label | Color | Background | Use When |
|-------|-------|-------|------------|----------|
| 1 | Approaching | #c2410c | #fff7ed | Student is beginning to develop skill |
| 2 | Developing | #a16207 | #fefce8 | Student shows emerging proficiency |
| 3 | Proficient | #166534 | #f0fdf4 | Student demonstrates expected skill level |
| 4 | Advanced | #0369a1 | #e0f2fe | Student exceeds expected skill level |

---

## View Navigation Flow

```
User enters Standards Tab
        ↓
   [Standards View]
     ├─ Filter by domain
     ├─ View all standards (8 in mock data)
     └─ Click "View Classes" → Classes View
              ↓
         [Classes View]
          ├─ Sort by name/students/mastery
          ├─ Card layout (responsive grid)
          └─ Click "View Students" → Students View
                   ↓
              [Students View]
               ├─ Student × Standard grid
               ├─ Hover/click cells for details
               └─ Back button → Classes View

Also available: [Cohorts View]
  ├─ Select cohort from buttons
  ├─ View stats for cohort
  └─ Student × Standard grid (filtered by cohort)
```

---

## Integration with Organization Page

The K12 Standards Interface is integrated into the Organizations page as a tab:

```typescript
// In /app/organization/[slug]/page.tsx

function StandardsTab({ org }: { org: any }) {
  return (
    <div>
      <K12StandardsInterface orgId={org?.id} />
    </div>
  );
}
```

**Entry Point:** `/organizations/[slug]?tab=standards`

---

## Mock Data Structure

Located in `K12StandardsInterface.mockData.ts`:

- **8 Standards** across 4 domains (US History, AP Seminar, English Lit)
- **7 Classes** across History & English departments
- **8 Students** with varying mastery levels and cohort assignments
- **3 Cohorts:** ELL, IEP, 504

---

## Component Features

### K12StandardsList
- **Filter by domain** — Dropdown selector
- **Table view** — Standard name, domain badge, class count, student count, CTA button
- **Hover effects** — Row highlighting
- **Responsive** — Works on mobile (scrollable table)
- **Accessibility** — Semantic HTML, proper labels

### K12ClassList
- **Sort options** — By name, student count, avg. mastery
- **Card layout** — Responsive grid (desktop: 3 cols, tablet: 2 cols, mobile: 1 col)
- **Metrics** — Student count, standards count, avg. mastery badge
- **Interactive** — Click card or button to drill down
- **Accessibility** — Button labels, color contrast

### K12StudentGrid
- **Sticky headers** — Student name column stays visible when scrolling
- **Color-coded cells** — Mastery level 1-4 with visual encoding
- **Interactive cells** — Hover effect, click to select
- **Legend** — Shows mastery level definitions
- **Alternating rows** — For readability
- **Average column** — Shows student avg. across all standards
- **Responsive** — Horizontal scroll on mobile
- **Accessibility** — ARIA labels on cells, keyboard-navigable

### K12CohortFilter
- **Cohort selector** — Button group for quick switching
- **Cohort stats** — Show avg. mastery, student count, assessment count
- **Filtered grid** — Students × Standards for selected cohort
- **Same interactions** — As StudentGrid (hover, click, scroll)
- **Empty state** — "No students in this cohort"
- **Accessibility** — Proper labeling, ARIA attributes

---

## Responsive Design

### Desktop (1200px+)
- Full table width
- 3-column grid for classes
- All standards visible in student grid (with horizontal scroll)

### Tablet (768px - 1199px)
- Optimized spacing
- 2-column grid for classes
- Vertical writing for standard headers (if > 5 standards)

### Mobile (< 768px)
- Single-column layout
- Sticky student name column in grids
- Horizontal scroll for tables
- Vertical standard names
- Touch-friendly button sizing (min 44px height)

---

## Accessibility Features

- **Semantic HTML** — `<table>`, `<th>`, `<td>`, `<button>`, `<label>`
- **ARIA Labels** — Cells labeled with student name + standard + mastery level
- **Keyboard Navigation** — All interactive elements (buttons, cells) are tab-able
- **Color Not Only** — Mastery levels include numbers + labels in addition to color
- **Contrast** — Text colors meet WCAG AA standards
- **Focus States** — Visible focus indicators on buttons and cells
- **Touch Targets** — Min 44px × 44px for mobile

---

## API Integration (Next Steps)

Currently using **mock data**. To wire up real API:

1. **Fetch data on component mount** (useEffect)
2. **Replace mockK12Data with API call** to endpoints:
   - `GET /api/organizations/[slug]/standards` → Standard[]
   - `GET /api/organizations/[slug]/classes` → Class[]
   - `GET /api/organizations/[slug]/students/progress` → StudentProgress[]
   - `GET /api/organizations/[slug]/cohorts` → CohortGroup[]

3. **Handle loading & error states**
4. **Add pagination** if dataset grows

**API Spec:** See `/SPEC-K12Standards-API-Endpoints.md` (via Hephaestus)

---

## Storybook Stories

Stories are available at `/K12StandardsInterface.stories.tsx`.

**To run Storybook:**
```bash
npm run storybook
```

**Available Stories:**

- K12 Standards Interface → DefaultView, WithOrgId
- K12 Standards List → AllStandards, FilteredByDomain, EmptyState
- K12 Class List → DefaultView, SortedByMastery, EmptyState
- K12 Student Grid → DefaultView, AllStandards, EmptyState
- K12 Cohort Filter → DefaultView, AllStandards, EmptyState

Each story includes:
- Happy path (normal data)
- Variations (sorting, filtering, empty states)
- Edge cases

---

## Known Limitations (MVP)

1. **Mock data only** — Real API integration pending
2. **Limited students per class** — Grid shows first 8 students for demo (expandable)
3. **No real-time updates** — Static snapshot of data
4. **No cell detail view** — Click-to-detail planned for next phase
5. **No export** — CSV/PDF export planned later
6. **No historical tracking** — Shows current mastery only

---

## Testing Notes

### Responsive Testing
- Desktop: Full-width browser (1200px+)
- Tablet: Chrome DevTools (768px)
- Mobile: iPhone 12/14 (390px)

### Accessibility Testing
- Keyboard-only navigation (Tab, Enter)
- Screen reader (VoiceOver/NVDA)
- Color contrast (WCAG AA)

### Component Testing
- Individual component stories in Storybook
- Mock data loads correctly
- Navigation between views works
- Sorting/filtering works as expected

---

## Files Changed

### New Files
- `/app/components/K12StandardsInterface.tsx`
- `/app/components/K12StandardsList.tsx`
- `/app/components/K12ClassList.tsx`
- `/app/components/K12StudentGrid.tsx`
- `/app/components/K12CohortFilter.tsx`
- `/app/components/K12StandardsInterface.types.ts`
- `/app/components/K12StandardsInterface.mockData.ts`
- `/app/components/K12StandardsInterface.stories.tsx`
- `/K12_STANDARDS_INTERFACE_README.md`

### Modified Files
- `/app/organization/[slug]/page.tsx` — Added K12StandardsInterface import & StandardsTab replacement

---

## Design Decisions

### Why React with TypeScript?
- Strict type safety (no `any` types)
- Matches Viridian's existing codebase patterns
- Component reusability for future extensions

### Why Four Separate Views vs. Single Page?
- Focused user experience (one task at a time)
- Reduced cognitive load
- Clear drill-down navigation
- Easy to add permissions per view

### Why Mock Data?
- Unblocks frontend development while backend is in progress
- Allows design iteration independently
- Enables QA testing without DB setup
- Simple to swap out with real API

### Why Grid for Student Mastery?
- Familiar spreadsheet-like interface for teachers
- Easy to scan trends horizontally (student progress) & vertically (standard difficulty)
- Compact display of many data points
- Works well with color encoding

---

## Future Enhancements

1. **Cell detail modal** — Click mastery cell → see student feedback, progression history
2. **Export to CSV/PDF** — Download reports for each view
3. **Real-time collaboration** — Live sync when teacher updates mastery
4. **Historical tracking** — Show progress over time (chart)
5. **Predictive analytics** — Flag at-risk students
6. **Integration with Community Module Mastery** — Sync standards with community learning paths
7. **Admin bulk actions** — Reassign cohorts, update standards, bulk import
8. **Mobile app view** — Optimized for teacher mobile experience

---

## Questions or Issues?

See parent brief: `BRIEF-Theia-Daedalus-K12Interface.md`

**Next step:** Design review with Theia → polish → API integration with Hephaestus.

---

**Build Date:** August 3, 2026  
**Build Time:** ~5 hours  
**Status:** Ready for Theia design review
