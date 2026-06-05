# Viridian P1 Frontend

The Viridian P1 frontend is a comprehensive React application for the Improv Mastery Tracker (and K-12 variant). It provides separate workflows for teachers and students.

## Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Framework**: React 19 with TypeScript
- **State Management**: React Query (TanStack Query v5)
- **Styling**: Tailwind CSS
- **HTTP Client**: Custom fetch-based API client with retry logic
- **Type Safety**: TypeScript strict mode (no `any`)

### Directory Structure

```
app/
├── layout.tsx                    # Root layout with React Query provider
├── page.tsx                      # Home page
├── globals.css                   # Global styles
└── modules/
    └── improv/
        ├── components/           # All React components
        │   ├── ClassList.tsx
        │   ├── ClassDetail.tsx
        │   ├── WeekDetail.tsx
        │   ├── StudentPicker.tsx
        │   ├── StudentDashboard.tsx
        │   ├── SkillDetail.tsx
        │   ├── StudentSelfRatingForm.tsx
        │   ├── TeacherRatingForm.tsx
        │   ├── FeedbackForm.tsx
        │   ├── AssessmentLog.tsx
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   └── Card.tsx
        │   └── index.ts
        ├── hooks/                # Custom React hooks
        │   ├── useClass.ts
        │   ├── useWeek.ts
        │   ├── useRatings.ts
        │   ├── useFeedback.ts
        │   ├── useAssessmentLog.ts
        │   └── index.ts
        ├── design/               # Design tokens
        │   └── colors.ts
        └── README.md             # Module documentation

lib/
├── types/                        # TypeScript definitions
│   └── index.ts
├── api/                          # API client and endpoints
│   ├── client.ts                # Fetch-based HTTP client
│   └── endpoints.ts             # API endpoint functions
└── utils/                        # Utility functions (if needed)

docs/
├── frontend/
│   ├── COMPONENTS.md            # Comprehensive component documentation
│   └── SAGE-BRIEF.md            # Original task brief
└── schema/
    └── ARCHON-BRIEF.md          # Backend schema specification
```

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Development

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format code (if Prettier added)
npm run format
```

## Components Overview

### Teacher Workflow

1. **ClassList** → Display all classes
2. **ClassDetail** → View class and select a week
3. **WeekDetail** → View week details, select a student
4. **TeacherRatingForm** → Rate a student's skill
5. **FeedbackForm** → Provide feedback on a skill

### Student Workflow

1. **StudentPicker** → Choose a class to view progress
2. **StudentDashboard** → View overall progress and feedback
3. **SkillDetail** → View detailed rating for a skill
4. **StudentSelfRatingForm** → Self-assess a skill

## Custom Hooks

- **useClass()** - Fetch class data with students, weeks, skills
- **useWeek()** - Fetch complete week with ratings, feedback, assessment logs
- **useCreateStudentRating()** - Submit or update student self-rating
- **useCreateTeacherRating()** - Submit instructor rating
- **useCreateFeedback()** - Submit instructor feedback
- **useCreateAssessmentLog()** - Log assessment methodology and context
- **useAssessmentLogs()** - Fetch assessment history for a student

## API Integration

All API calls are through `lib/api/endpoints.ts` functions:

```typescript
import {
  getClassWithDetails,
  getWeekDetail,
  createStudentRating,
  createTeacherRating,
  createFeedback,
} from "@/lib/api/endpoints";
```

### Error Handling

The API client automatically retries failed requests with exponential backoff:

```
Attempt 1: immediate
Attempt 2: 1 second delay
Attempt 3: 2 seconds delay
```

HTTP 4xx errors (except 429) fail immediately without retry.

### Endpoints Expected from Backend

```
GET /api/improv/classes/{classId}
GET /api/improv/classes/{classId}/weeks/{weekId}
POST /api/improv/students/{studentId}/ratings
PATCH /api/improv/student-ratings/{ratingId}
POST /api/improv/students/{studentId}/teacher-ratings
POST /api/improv/students/{studentId}/feedback
POST /api/improv/students/{studentId}/assessment-logs
GET /api/improv/students/{studentId}/ratings-comparison?weekId={weekId}
```

See `lib/api/endpoints.ts` for full API surface.

## State Management

### React Query

Server state (classes, ratings, feedback) is managed by React Query:

- **Query keys**: Namespaced (`["class", classId]`, `["week", classId, weekId]`, etc.)
- **Stale time**: 5 minutes default (2 minutes for week data)
- **Garbage collection**: 30 minutes
- **Refetch on window focus**: Enabled for sensitive data

### Component State

Local UI state (form inputs, modal visibility) remains in component state:

```typescript
const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
const [isFormOpen, setIsFormOpen] = useState(false);
```

## Design System

### Colors

Colors are defined in `app/modules/improv/design/colors.ts`:

- **Mastery levels**: Proficient (green), Developing (yellow), Approaching (orange)
- **Accents**: Amber (students), Teal (teachers), Orange (warnings)
- **Neutrals**: Proper contrast for accessibility

### Typography

- **Fraunces**: Serif font for headings (elegant, prominent)
- **Plus Jakarta Sans**: Sans-serif for body text (readable, clean)

### Responsive Design

All components are responsive:

```typescript
// Mobile: p-4, Desktop: p-6
className="p-4 md:p-6"

// Mobile: grid, Desktop: 2-column
className="space-y-4 md:grid md:grid-cols-2 md:gap-6"
```

## Testing

Components are designed to be easily testable:

- Pure functional components
- Props-driven behavior
- Minimal side effects
- Clear data flow

Example test:

```typescript
describe("ClassList", () => {
  it("renders classes and calls onSelectClass when clicked", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <ClassList classes={mockClasses} onSelectClass={onSelect} />
    );
    
    fireEvent.click(getByText("Improv 101"));
    expect(onSelect).toHaveBeenCalledWith("class-123");
  });
});
```

## Performance Optimization

### Bundle Size

- No external UI library (Tailwind only)
- Tree-shakeable component exports
- Minimal dependencies

### Code Splitting

Consider lazy loading for modals and heavy routes:

```typescript
const TeacherRatingForm = lazy(() =>
  import("./TeacherRatingForm").then(mod => ({ default: mod.TeacherRatingForm }))
);
```

### Query Optimization

Set appropriate `staleTime` and `gcTime` to minimize unnecessary fetches:

```typescript
// Week data should refetch more often
useQuery({
  queryKey: ["week", classId, weekId],
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
});
```

## Accessibility

All components meet WCAG AA standards:

- ✓ Color contrast > 4.5:1
- ✓ Keyboard navigation support
- ✓ Semantic HTML
- ✓ ARIA labels where needed
- ✓ Responsive text sizes

## Mobile Responsiveness

Test on actual mobile devices or use browser DevTools:

```bash
# iPhone viewport: 375px
# Tablet viewport: 768px
# Desktop: 1024px+
```

All components are fully functional on mobile with:
- Touch-friendly button sizes (48px minimum)
- Single-column layouts on mobile
- Readable text sizes (min 16px)
- Proper spacing and padding

## Deployment

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Build & Deploy

```bash
# Build
npm run build

# Test build
npm run start

# Deploy to Vercel
# Connect GitHub repository in Vercel dashboard
```

## Troubleshooting

### API Connection Issues

Check that the backend API is running and accessible:

```bash
curl http://localhost:3001/api/improv/health
```

Update `NEXT_PUBLIC_API_URL` in `.env.local`.

### React Query Issues

Enable React Query DevTools in development:

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Type Errors

Ensure `tsconfig.json` has `strict: true`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## Documentation

- **Component Documentation**: `docs/frontend/COMPONENTS.md`
- **API Specification**: See backend schema at `docs/schema/ARCHON-BRIEF.md`
- **Design System**: `app/modules/improv/design/colors.ts`

## Contributing

1. Create feature branch: `git checkout -b feature/add-export-pdf`
2. Make changes and commit: `git commit -am "Add PDF export"`
3. Push: `git push origin feature/add-export-pdf`
4. Create pull request

### Code Style

- Use TypeScript strict mode
- Follow naming conventions: PascalCase for components, camelCase for functions
- Add JSDoc comments for public APIs
- Keep components focused (single responsibility)

## License

MIT

## Contact

Built by Sage (Frontend Architect) for Viridian P1 (Improv Mastery Tracker)
