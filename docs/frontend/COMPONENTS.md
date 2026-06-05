# Viridian Frontend Components Documentation

This document provides comprehensive documentation for all React components, custom hooks, type definitions, and API integrations in the Viridian P1 (Improv Mastery Tracker) frontend.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Components](#components)
3. [Custom Hooks](#custom-hooks)
4. [Type Definitions](#type-definitions)
5. [API Client](#api-client)
6. [State Management](#state-management)
7. [Design System](#design-system)
8. [Testing Strategy](#testing-strategy)
9. [Mobile Responsiveness](#mobile-responsiveness)

---

## Architecture Overview

The Viridian frontend follows a modular architecture with clear separation of concerns:

- **Components** (`app/modules/improv/components/`): Reusable React components organized by feature
- **Hooks** (`app/modules/improv/hooks/`): Custom React hooks for data fetching, mutation, and state management
- **Design System** (`app/modules/improv/design/`): Color palette and design tokens
- **API Client** (`lib/api/`): Centralized API request handling with retry logic
- **Types** (`lib/types/`): TypeScript type definitions for all entities
- **UI Components** (`app/modules/improv/components/ui/`): Low-level reusable components (Button, Card)

### Key Decisions

- **Server State**: React Query (TanStack Query) manages all server state (classes, weeks, ratings, feedback)
- **UI State**: Local component state for forms, modals, and UI interactions
- **No External UI Libraries**: All components built with Tailwind CSS and custom components
- **Type Safety**: Strict TypeScript with no `any` types
- **Mobile First**: Desktop-first design, fully responsive on mobile viewports

---

## Components

### Teacher Workflow Components

#### **ClassList**

Lists all classes for an instructor.

**Props:**
```typescript
interface ClassListProps {
  classes: Class[];
  onSelectClass: (classId: string) => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
<ClassList
  classes={classes}
  onSelectClass={(classId) => setSelectedClassId(classId)}
  isLoading={isLoadingClasses}
/>
```

**Features:**
- Displays class name, subtitle, duration, and student count
- Shows student avatars (up to 4 with overflow indicator)
- Responsive grid layout
- Loading skeleton UI

---

#### **ClassDetail**

Shows a single class with all available weeks.

**Props:**
```typescript
interface ClassDetailProps {
  cls: Class;
  onBack: () => void;
  onSelectWeek: (weekId: string) => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
<ClassDetail
  cls={selectedClass}
  onBack={() => setSelectedClassId(null)}
  onSelectWeek={(weekId) => setSelectedWeekId(weekId)}
  isLoading={isLoadingClass}
/>
```

**Features:**
- Class metadata (name, subtitle, duration, student count)
- Week listing with focus areas
- Back navigation
- Loading states

---

#### **WeekDetail**

Shows a week's details with anchor skills prioritized and non-anchor skills collapsible.

**Props:**
```typescript
interface WeekDetailProps {
  cls: Class;
  week: Week;
  students: Student[];
  anchorSkills: Skill[];
  nonAnchorSkills: Skill[];
  onBack: () => void;
  onSelectStudent: (studentId: string) => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
const { data: weekData } = useWeek(classId, weekId);

<WeekDetail
  cls={selectedClass}
  week={weekData.week}
  students={weekData.students}
  anchorSkills={weekData.anchorSkills}
  nonAnchorSkills={weekData.allSkills.filter(s => !s.isAnchorForUnit)}
  onBack={() => setSelectedWeekId(null)}
  onSelectStudent={(studentId) => setSelectedStudentId(studentId)}
/>
```

**Features:**
- Week metadata (number, title, focus areas, notes)
- Anchor skills prominently displayed
- Collapsible non-anchor skills section
- Student listing with quick navigation
- Responsive grid layout

---

### Student Workflow Components

#### **StudentPicker**

Lets students choose which class to view their progress in.

**Props:**
```typescript
interface StudentPickerProps {
  classes: Class[];
  onSelectClass: (classId: string) => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
<StudentPicker
  classes={studentClasses}
  onSelectClass={(classId) => setSelectedClassId(classId)}
  isLoading={isLoadingClasses}
/>
```

**Features:**
- List of enrolled classes
- Pedagogical context indicator (Improv vs K-12)
- Class duration display

---

#### **StudentDashboard**

Shows a student's progress across all skills with feedback.

**Props:**
```typescript
interface StudentDashboardProps {
  cls: Class;
  student: Student;
  onBack: () => void;
  onSelectSkill?: (skillId: string, weekId: string) => void;
}
```

**Usage:**
```tsx
<StudentDashboard
  cls={selectedClass}
  student={selectedStudent}
  onBack={() => setSelectedStudentId(null)}
  onSelectSkill={(skillId, weekId) => navigateToSkillDetail(skillId, weekId)}
/>
```

**Features:**
- Progress circle showing mastery percentage
- Mastery level badges (proficient, developing, approaching, unrated)
- Skills organized by category
- Instructor feedback section with dates
- Empty state messaging

---

#### **SkillDetail**

Shows detailed information about a student's rating on a specific skill.

**Props:**
```typescript
interface SkillDetailProps {
  skill: Skill;
  studentRating?: StudentRating;
  teacherRating?: TeacherRating;
  feedback: Feedback[];
  onBack: () => void;
}
```

**Usage:**
```tsx
<SkillDetail
  skill={selectedSkill}
  studentRating={studentRating}
  teacherRating={teacherRating}
  feedback={skillFeedback}
  onBack={() => setSelectedSkillId(null)}
/>
```

**Features:**
- Side-by-side comparison of student vs teacher ratings
- Mastery level definitions displayed
- Student's narrative and evidence for self-rating
- Revision history with timestamps
- Discrepancy badge (yellow alert) if student and teacher ratings differ
- All instructor feedback for the skill
- Revision timestamp tracking

---

### Form Components

#### **StudentSelfRatingForm**

Form for students to self-rate their skills.

**Props:**
```typescript
interface StudentSelfRatingFormProps {
  skills: Skill[];
  onSubmit: (
    skillId: string,
    level: MasteryLevel,
    narrative?: string,
    evidence?: string
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  requireNarrative?: boolean;
  requireEvidence?: boolean;
}
```

**Usage:**
```tsx
const { mutate: submitRating, isPending } = useCreateStudentRating();

<StudentSelfRatingForm
  skills={classSkills}
  onSubmit={async (skillId, level, narrative, evidence) => {
    await submitRating({
      studentId: student.id,
      request: { skillId, weekId, level, narrative, evidence }
    });
  }}
  onCancel={() => setShowForm(false)}
  isLoading={isPending}
  requireNarrative={false}
  requireEvidence={false}
/>
```

**Features:**
- Skill selector with descriptions
- Radio-button style level selector (approaching, developing, proficient)
- Level definitions shown dynamically
- Narrative field (optional by default, required by teacher toggle)
- Evidence field (optional by default, required by teacher toggle)
- Form validation
- Submit/Cancel buttons with loading state

---

#### **TeacherRatingForm**

Form for instructors to rate student skills.

**Props:**
```typescript
interface TeacherRatingFormProps {
  student: Student;
  skills: Skill[];
  onSubmit: (
    skillId: string,
    level: MasteryLevel,
    feedback?: string
  ) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
const { mutate: submitTeacherRating, isPending } = useCreateTeacherRating();

<TeacherRatingForm
  student={selectedStudent}
  skills={classSkills}
  onSubmit={async (skillId, level, feedback) => {
    await submitTeacherRating({
      studentId: student.id,
      request: { skillId, weekId, level }
    });
    if (feedback) {
      await submitFeedback({
        studentId: student.id,
        request: { skillId, weekId, instructorNote: feedback }
      });
    }
  }}
  onCancel={() => setShowForm(false)}
  isLoading={isPending}
/>
```

**Features:**
- Student name in header
- Skill selector with descriptions
- Level selector (approaching, developing, proficient)
- Level definitions shown dynamically
- Optional feedback field
- Form validation
- Submit/Cancel buttons with loading state

---

#### **FeedbackForm**

Form for instructors to provide feedback on a student's skill.

**Props:**
```typescript
interface FeedbackFormProps {
  student: Student;
  skill: Skill;
  onSubmit: (feedback: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
const { mutate: submitFeedback, isPending } = useCreateFeedback();

<FeedbackForm
  student={selectedStudent}
  skill={selectedSkill}
  onSubmit={async (feedback) => {
    await submitFeedback({
      studentId: student.id,
      request: {
        skillId: skill.id,
        weekId: weekId,
        instructorNote: feedback
      }
    });
  }}
  onCancel={() => setShowFeedbackForm(false)}
  isLoading={isPending}
/>
```

**Features:**
- Student and skill information in header
- Large textarea for detailed feedback
- Character count (optional enhancement)
- Submit/Cancel buttons with loading state

---

### Data Display Components

#### **AssessmentLog**

Displays assessment history for a student (method, date, context).

**Props:**
```typescript
interface AssessmentLogProps {
  logs: AssessmentLog[];
  isLoading?: boolean;
}
```

**Usage:**
```tsx
const { data: assessmentLogs, isLoading } = useAssessmentLogs(studentId, weekId);

<AssessmentLog logs={assessmentLogs || []} isLoading={isLoading} />
```

**Features:**
- Assessment method badge
- Context badge (e.g., "Intervention Block")
- Assessment date
- Optional notes
- Loading skeleton UI
- Empty state messaging

---

## Custom Hooks

### Data Fetching Hooks

#### **useClass**

Fetches a single class with all related data (students, weeks, skills).

**Usage:**
```tsx
const { data: cls, isLoading, error } = useClass(classId);

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;

return <ClassDetail cls={cls} {...props} />;
```

**Features:**
- Auto-enabled when classId is provided
- 5-minute stale time
- 30-minute garbage collection time
- Prefetching available via `useClassPrefetch`

---

#### **useWeek**

Fetches week details with all students, skills, ratings, feedback, and assessment logs.

**Usage:**
```tsx
const { data: weekData, isLoading, refetch } = useWeek(classId, weekId);

// Later: refetch on demand
await refetch();
```

**Features:**
- Returns `WeekDetailResponse` with complete week data
- 2-minute stale time (more frequent updates)
- Refetches on window focus
- Refresh method available via `useWeekRefresh`

---

### Mutation Hooks

#### **useCreateStudentRating**

Submits a student's self-rating.

**Usage:**
```tsx
const { mutate, isPending, error } = useCreateStudentRating();

await mutate({
  studentId: "student123",
  request: {
    skillId: "skill456",
    weekId: "week789",
    level: "proficient",
    narrative: "...",
    evidence: "..."
  }
});
```

**Side Effects:**
- Invalidates `studentRatings` query
- Invalidates `week` query (updates all ratings display)

---

#### **useUpdateStudentRating**

Updates a student's self-rating (for revisions).

**Usage:**
```tsx
const { mutate, isPending } = useUpdateStudentRating(studentId);

await mutate({
  ratingId: "rating123",
  request: {
    level: "developing",
    narrative: "Updated thinking..."
  }
});
```

**Side Effects:**
- Invalidates `studentRatings` query
- Invalidates `week` query

---

#### **useCreateTeacherRating**

Submits an instructor's rating.

**Usage:**
```tsx
const { mutate, isPending } = useCreateTeacherRating();

await mutate({
  studentId: "student123",
  request: {
    skillId: "skill456",
    weekId: "week789",
    level: "proficient"
  }
});
```

**Side Effects:**
- Invalidates `teacherRatings` query
- Invalidates `week` query
- Invalidates `ratingsComparison` query

---

#### **useCreateFeedback**

Submits instructor feedback on a student's skill.

**Usage:**
```tsx
const { mutate, isPending } = useCreateFeedback();

await mutate({
  studentId: "student123",
  request: {
    skillId: "skill456",
    weekId: "week789",
    instructorNote: "Great work on..."
  }
});
```

**Side Effects:**
- Invalidates `feedback` query
- Invalidates `week` query

---

#### **useCreateAssessmentLog**

Logs an assessment event (method, date, context).

**Usage:**
```tsx
const { mutate, isPending } = useCreateAssessmentLog();

await mutate({
  studentId: "student123",
  request: {
    skillId: "skill456",
    weekId: "week789",
    method: "verbal discussion",
    date: "2026-06-05",
    context: "Intervention Block",
    notes: "Student demonstrated..."
  }
});
```

**Side Effects:**
- Invalidates `assessmentLogs` query
- Invalidates `weekAssessmentLogs` query

---

#### **useAssessmentLogs**

Fetches assessment logs for a student (optionally filtered by week).

**Usage:**
```tsx
const { data: logs, isLoading } = useAssessmentLogs(studentId, weekId);
```

**Features:**
- Optional week filtering
- 5-minute stale time
- Auto-enabled when studentId is provided

---

## Type Definitions

### Core Entities

```typescript
// Mastery Levels (3-point scale)
type MasteryLevel = "approaching" | "developing" | "proficient";

// Skill with anchor flag and level definitions
interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  isAnchorForUnit: boolean; // Teacher marks for priority assessment
  levelDefinitions: LevelDefinitions;
  classId: string;
  createdAt: string;
  updatedAt: string;
}

// Class (instructor view)
interface Class {
  id: string;
  name: string;
  subtitle?: string;
  numWeeks: number;
  instructorId: string;
  pedagogicalContext: "improv" | "k12";
  students?: Student[];
  weeks?: Week[];
  skills?: Skill[];
  createdAt: string;
  updatedAt: string;
}

// Student enrolled in a class
interface Student {
  id: string;
  name: string;
  email?: string;
  classId: string;
  enrollmentDate: string;
  status: "active" | "inactive";
  studentRatings?: StudentRating[];
  teacherRatings?: TeacherRating[];
  feedback?: Feedback[];
  assessmentLogs?: AssessmentLog[];
  createdAt: string;
  updatedAt: string;
}

// Week in a class
interface Week {
  id: string;
  classId: string;
  weekNum: number;
  title?: string;
  focusAreas?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Rating Types

```typescript
// Student's self-assessment
interface StudentRating {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  narrative?: string; // Why they chose this level
  evidence?: string; // Supporting examples
  createdAt: string;
  revisedAt?: string; // If student revised after teacher feedback
  updatedAt: string;
}

// Instructor's assessment
interface TeacherRating {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  createdAt: string;
  updatedAt: string;
}

// Instructor feedback
interface Feedback {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  instructorNote: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Assessment methodology logging
interface AssessmentLog {
  id: string;
  studentId: string;
  skillId: string;
  weekId: string;
  method: string; // "verbal discussion", "written response", "performance"
  date: string;
  context: string; // "Intervention Block", "Class Discussion"
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Request/Response Types

```typescript
interface CreateStudentRatingRequest {
  skillId: string;
  weekId: string;
  level: MasteryLevel;
  narrative?: string;
  evidence?: string;
}

interface CreateTeacherRatingRequest {
  skillId: string;
  weekId: string;
  level: MasteryLevel;
}

interface CreateFeedbackRequest {
  skillId: string;
  weekId: string;
  instructorNote: string;
}

interface WeekDetailResponse {
  week: Week;
  anchorSkills: Skill[];
  allSkills: Skill[];
  students: Student[];
  studentRatings: StudentRating[];
  teacherRatings: TeacherRating[];
  feedback: Feedback[];
  assessmentLogs: AssessmentLog[];
}
```

---

## API Client

### Architecture

The API client is built with:
- Automatic retry logic with exponential backoff (3 attempts by default)
- Request/response serialization
- Error handling with status codes and data
- Timeout support
- No authentication built-in (add to `lib/api/client.ts` as needed)

### Usage

```typescript
import { apiClient } from "@/lib/api/client";

// GET request
const data = await apiClient.get<Class>("/api/classes/123");

// POST request
const result = await apiClient.post<StudentRating>(
  "/api/ratings",
  { skillId: "...", level: "proficient" }
);

// PATCH request
const updated = await apiClient.patch<StudentRating>(
  "/api/ratings/456",
  { level: "developing" }
);
```

### Endpoint Functions

All endpoint functions are in `lib/api/endpoints.ts`:

```typescript
// Classes
getClasses(instructorId: string): Promise<Class[]>
getClass(classId: string): Promise<Class>
getClassWithDetails(classId: string): Promise<Class>

// Students
getStudent(studentId: string): Promise<Student>
getClassStudents(classId: string): Promise<Student[]>

// Weeks
getWeek(weekId: string): Promise<Week>
getClassWeeks(classId: string): Promise<Week[]>
getWeekDetail(classId: string, weekId: string): Promise<WeekDetailResponse>

// Skills
getClassSkills(classId: string): Promise<Skill[]>
getSkill(skillId: string): Promise<Skill>

// Student Ratings
createStudentRating(studentId: string, request: CreateStudentRatingRequest): Promise<StudentRating>
updateStudentRating(ratingId: string, request: UpdateStudentRatingRequest): Promise<StudentRating>
getStudentRatings(studentId: string, weekId?: string): Promise<StudentRating[]>
getStudentRating(studentId: string, skillId: string, weekId: string): Promise<StudentRating | null>

// Teacher Ratings
createTeacherRating(studentId: string, request: CreateTeacherRatingRequest): Promise<TeacherRating>
getTeacherRatings(studentId: string, weekId?: string): Promise<TeacherRating[]>
getTeacherRating(studentId: string, skillId: string, weekId: string): Promise<TeacherRating | null>

// Feedback
createFeedback(studentId: string, request: CreateFeedbackRequest): Promise<Feedback>
getFeedback(studentId: string, weekId?: string): Promise<Feedback[]>

// Assessment Logs
createAssessmentLog(studentId: string, request: CreateAssessmentLogRequest): Promise<AssessmentLog>
getAssessmentLogs(studentId: string, weekId?: string): Promise<AssessmentLog[]>
getWeekAssessmentLogs(weekId: string): Promise<AssessmentLog[]>

// Comparisons
getRatingsComparison(studentId: string, weekId: string): Promise<RatingsComparisonResponse>
```

---

## State Management

### React Query Configuration

The app uses React Query with these defaults:

```typescript
{
  staleTime: 5 * 60 * 1000,        // 5 minutes (or 2 min for week data)
  gcTime: 30 * 60 * 1000,           // 30 minutes (garbage collection)
  refetchOnWindowFocus: true,       // For sensitive data like weeks
  retryDelay: attemptIndex => Math.pow(2, attemptIndex) * 1000
}
```

### Query Keys Pattern

Queries use namespaced keys for organization:

```typescript
["class", classId]
["week", classId, weekId]
["studentRatings", studentId, weekId]
["teacherRatings", studentId, weekId]
["feedback", studentId, weekId]
["assessmentLogs", studentId, weekId]
["ratingsComparison", studentId, weekId]
```

### Invalidation Strategy

When mutations succeed, related queries are invalidated:

```
submitStudentRating() → invalidate studentRatings, week queries
submitTeacherRating() → invalidate teacherRatings, week, ratingsComparison queries
submitFeedback() → invalidate feedback, week queries
```

---

## Design System

### Color Palette

```typescript
colors = {
  // Neutrals
  black: "#000000",
  white: "#FFFFFF",
  bg: "#F8F8F8",           // Light background
  surface: "#FFFFFF",      // Card/surface background
  border: "#E5E5E5",       // Border color
  text: "#1A1A1A",         // Primary text
  text2: "#666666",        // Secondary text
  text3: "#999999",        // Tertiary/muted text

  // Mastery Levels
  proficient: {
    bg: "#DCFCE7",
    border: "#86EFAC",
    text: "#166534",
    accent: "#22C55E"
  },
  developing: {
    bg: "#FEF9E7",
    border: "#FDE047",
    text: "#713F12",
    accent: "#EAB308"
  },
  approaching: {
    bg: "#FEF3E2",
    border: "#FED7AA",
    text: "#92400E",
    accent: "#EA580C"
  },

  // UI Accents
  amber: { /* ... */ },    // For teachers
  teal: { /* ... */ },     // For instructors
  orange: { /* ... */ },   // For alerts/discrepancies
  red: { /* ... */ }       // For errors
}
```

### Typography

- **Headings**: Fraunces (serif) - elegant, prominent
- **Body**: Plus Jakarta Sans (sans-serif) - readable, clean
- **Code**: Monospace (Geist Mono)

### Responsive Design

All components use Tailwind's responsive prefixes:

```tsx
className="p-4 md:p-6"     // 4px padding mobile, 6px desktop
className="text-base md:text-lg" // Scale text for mobile
className="grid md:grid-cols-2"   // Single column mobile, 2-col desktop
```

---

## Testing Strategy

### Unit Tests (Components)

Test individual components in isolation:

```typescript
// ClassList.test.tsx
describe("ClassList", () => {
  it("renders class names", () => {
    const { getByText } = render(
      <ClassList classes={mockClasses} onSelectClass={() => {}} />
    );
    expect(getByText("Improv 101")).toBeInTheDocument();
  });

  it("calls onSelectClass when a class is clicked", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <ClassList classes={mockClasses} onSelectClass={onSelect} />
    );
    fireEvent.click(getByText("Improv 101"));
    expect(onSelect).toHaveBeenCalledWith("class-123");
  });

  it("shows loading skeleton", () => {
    const { container } = render(
      <ClassList classes={[]} onSelectClass={() => {}} isLoading={true} />
    );
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
```

### Hook Tests

Test hooks with React Testing Library:

```typescript
// useWeek.test.ts
describe("useWeek", () => {
  it("fetches week data when classId and weekId are provided", async () => {
    const { result } = renderHook(() => useWeek("class-1", "week-1"), {
      wrapper: QueryClientProvider
    });
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.data.week.weekNum).toBe(1);
    });
  });

  it("is disabled when classId is null", () => {
    const { result } = renderHook(() => useWeek(null, "week-1"), {
      wrapper: QueryClientProvider
    });
    
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Integration Tests

Test component + hook combinations:

```typescript
// WeekDetail.integration.test.tsx
describe("WeekDetail Integration", () => {
  it("loads week data and displays students", async () => {
    const { getByText, getAllByRole } = render(
      <QueryClientProvider client={new QueryClient()}>
        <WeekDetail classId="class-1" weekId="week-1" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByText("Week 1")).toBeInTheDocument();
      const studentButtons = getAllByRole("button");
      expect(studentButtons.length).toBeGreaterThan(0);
    });
  });

  it("navigates to student detail when student is selected", async () => {
    const onSelectStudent = jest.fn();
    const { getByText } = render(
      <QueryClientProvider client={new QueryClient()}>
        <WeekDetail
          classId="class-1"
          weekId="week-1"
          onSelectStudent={onSelectStudent}
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      fireEvent.click(getByText("Alice Johnson"));
      expect(onSelectStudent).toHaveBeenCalledWith("student-1");
    });
  });
});
```

### E2E Tests (Cypress/Playwright)

Test complete user workflows:

```typescript
// cypress/e2e/teacher-workflow.cy.ts
describe("Teacher Assessment Workflow", () => {
  it("completes a full assessment cycle", () => {
    cy.login("teacher@example.com", "password");
    
    // View classes
    cy.get("[data-testid=class-list]").should("be.visible");
    cy.contains("Improv 101").click();
    
    // Select week
    cy.get("[data-testid=week-card]").first().click();
    
    // Select student
    cy.contains("Alice Johnson").click();
    
    // Rate student
    cy.get("[data-testid=rating-form]").within(() => {
      cy.get("[data-value=proficient]").click();
      cy.get("textarea").first().type("Great performance!");
      cy.contains("Submit").click();
    });
    
    // Verify success
    cy.contains("Rating submitted").should("be.visible");
  });
});
```

---

## Mobile Responsiveness

### Viewport Breakpoints

Using Tailwind's standard breakpoints:

- **Mobile**: < 768px (sm, no prefix)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: > 1024px (lg, xl)

### Responsive Components

#### **ClassList**

```
Mobile: Single column, compact avatars
Tablet: Single column with larger spacing
Desktop: Could be 2-column grid (enhancement)
```

#### **WeekDetail**

```
Mobile: Skills stack vertically, student list below
Tablet: Skills and students side-by-side (enhancement)
Desktop: Full layout with maximum content width
```

#### **StudentDashboard**

```
Mobile: Progress circle + stats stack, categories single column
Tablet: Progress circle inline with stats, 2-column category grid
Desktop: Full-width with enhanced layout
```

#### **Forms**

```
Mobile: Full-width inputs, buttons stack
Tablet: Same as mobile with better spacing
Desktop: Max-width 600px centered with better form layout
```

### Testing Mobile Responsiveness

```typescript
// Test mobile viewport
cy.viewport("iphone-x");
cy.visit("/");
cy.get("[data-testid=class-list]").should("be.visible");
cy.get("[data-testid=class-item]").first().should("have.width", "100%");

// Test tablet viewport
cy.viewport("ipad-2");
cy.visit("/");
cy.get("[data-testid=week-detail]").should("be.visible");
```

---

## Performance Optimization

### Image Optimization

- Use Next.js `Image` component for all images
- Set `priority` for above-fold images
- Provide responsive sizes for mobile/desktop

### Code Splitting

- Components are tree-shakeable
- Lazy load modals and heavy components with `React.lazy`

### Query Optimization

- Set appropriate `staleTime` and `gcTime`
- Use `queryKey` patterns to minimize overwatching
- Avoid refetching on every mount with `enabled` flag

### Bundle Size

No external UI library dependencies beyond React Query:
- Smaller bundle size
- Faster initial load
- Custom components for full control

---

## Accessibility Considerations

### ARIA Labels

Use semantic HTML and ARIA labels for assistive technologies:

```tsx
<button
  onClick={() => onSelectClass(cls.id)}
  aria-label={`Open class ${cls.name}`}
>
  {cls.name}
</button>
```

### Color Contrast

All text meets WCAG AA standards:
- Text: #1A1A1A on #FFFFFF = 16.5:1 contrast
- Mastery level colors: all > 4.5:1 contrast

### Keyboard Navigation

- All interactive elements accessible via Tab
- Enter/Space activates buttons
- Form focus management for accessibility

### Responsive Text

- Text sizes responsive for readability
- Min 16px font on mobile to prevent zoom
- Line heights at least 1.5 for readability

---

## Error Handling

### API Errors

```typescript
const { data, error, isError } = useWeek(classId, weekId);

if (isError) {
  return (
    <div role="alert">
      <p>Failed to load week data: {error.message}</p>
      <button onClick={() => refetch()}>Try again</button>
    </div>
  );
}
```

### Form Validation

```typescript
const canSubmit = selectedSkillId && level && (!requireNarrative || narrative.trim());

<Button disabled={!canSubmit || isSubmitting}>
  Submit
</Button>
```

### Network Resilience

- Automatic retry with exponential backoff (3 attempts)
- Stale data served while refetching
- Optimistic updates for better UX

---

## Future Enhancements

1. **Offline Support**: Implement service workers for offline rating capture
2. **Real-time Collaboration**: WebSocket integration for live updates
3. **Advanced Analytics**: Dashboard for mastery trends and patterns
4. **Bulk Operations**: Batch rate multiple students at once
5. **Export/Reports**: PDF generation for progress reports
6. **Customizable Forms**: Teacher can configure required fields per assignment
7. **Goal Tracking**: Integration with goal-setting workflows
8. **Mobile App**: React Native version for iOS/Android

---

## Deployment Checklist

- [ ] Environment variables set (API_URL, etc.)
- [ ] TypeScript strict mode passes
- [ ] All tests passing
- [ ] ESLint rules satisfied
- [ ] Lighthouse score > 90
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passed
- [ ] Error boundaries in place
- [ ] Analytics tracking added
- [ ] Sentry error monitoring configured

---

**Last Updated**: 2026-06-05  
**Version**: 1.0.0  
**Maintainer**: Sage (Frontend Architect)
