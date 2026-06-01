# Sage — Start Here

You're building the React frontend for Viridian P1 (Improv Mastery Tracker).

## Your Task

Implement React components for:

1. **Teacher workflows:** ClassList → ClassDetail → WeekDetail
2. **Student workflows:** StudentPicker → StudentDashboard → SkillDetail
3. **Forms:** StudentSelfRatingForm, TeacherRatingForm, FeedbackForm
4. **API integration:** Consume Archon's endpoints for ratings, feedback, assessment logs
5. **State management:** React Query for server state, hooks for UI state
6. **Mobile responsiveness:** Desktop-first, fully responsive on phone

## Key Decisions (Locked)

✓ **Self-rating form:** narrative + evidence optional by default (teacher can toggle to require)  
✓ **Revision visibility:** Students see revision history with timestamps  
✓ **Discrepancy suggestions:** System flags patterns (underestimation, overconfidence)  
✓ **Assessment log:** Separate component tracking method + date + context  
✓ **Anchor filtering:** Separate data/UI for anchor vs. non-anchor skills  
✓ **Mastery calculation:** Skill-level (not objective-level); show mastery if proficient on majority of objectives  
✓ **Discrepancy detection:** After teacher rates, compare student ≠ teacher → flag with badge/icon  

## Deliverables

1. **React components** (`app/modules/improv/components/`) for:
   - ClassList.tsx
   - ClassDetail.tsx
   - WeekDetail.tsx (with anchor skills prioritized, non-anchors collapsible)
   - StudentPicker.tsx
   - StudentDashboard.tsx
   - SkillDetail.tsx
   - StudentSelfRatingForm.tsx
   - TeacherRatingForm.tsx
   - FeedbackForm.tsx
   - AssessmentLog.tsx (new component)

2. **Custom hooks** (`app/modules/improv/hooks/`) for:
   - useClass.ts (fetch class data)
   - useWeek.ts (fetch week + all ratings + feedback)
   - useRatings.ts (submit/update ratings)
   - useFeedback.ts (submit feedback)
   - useAssessmentLog.ts (fetch/submit assessment logs)

3. **Types** (`lib/types/`) for:
   - Skill, Objective, Rating, Feedback, AssessmentLog, etc.

4. **API client** (`lib/api/`) for:
   - Request/response utilities
   - Error handling + retry logic
   - Optimistic updates

5. **Component documentation** (`docs/frontend/COMPONENTS.md`):
   - Component props and usage
   - State management patterns
   - API integration notes
   - Testing strategy

## References

- Filled-in brief: `/Users/kylewinslowsmith/Desktop/KyleOS/team-inbox/BRIEF-REVISED-Sage-Viridian-P1-Frontend.md`
- Viridian.html: Design system, colors, component patterns (in KyleOS)
- improv-tracker.jsx: Interaction model (in KyleOS)
- Iris's wireframes: Design specifications (in Figma)
- Archon's schema + API: Data contracts (in docs/schema/)

## Stack

- React (hooks)
- TypeScript (strict mode, no `any`)
- Next.js (app router, file-based routing)
- React Query (server state, caching, synchronization)
- Tailwind CSS (styling within Viridian's color system)

## Timeline

**Start:** Tuesday June 2  
**Due:** Friday June 5 (working components)  
**Coordination:** Daily async with Iris (design handoff) and Archon (API readiness)

---

Clone the repo, install dependencies, and start building components. Push frequently.
