# Viridian P1 — Project Status (Central Truth)

**Last Updated:** June 5, 2026, 8:30 AM ET

---

## Phase 1: Improv Mastery Tracker (P1)

**Status:** 🔶 FRONTEND COMPLETE, AWAITING BACKEND INTEGRATION

**Timeline:**
- Start: June 2, 2026
- Target: Friday June 5, 2026 (working components)
- Current: June 5, 2026 (components built, backend pending)
- Pilot launch: ~June 16, 2026

---

## What's Been Built

### ✅ Archon (Systems Architect) — COMPLETE
- **Deliverable:** Database schema + API architecture (Prisma models)
- **Status:** ✅ Done (June 3)
- **What:** Class, Student, Week, Skill, StudentRating, TeacherRating, Feedback, Goal, Objective, AssessmentLog models
- **Location:** `docs/schema/ARCHON-BRIEF.md` (detailed spec)
- **Next:** API routes need to be implemented in Next.js

### ✅ Iris (Designer) — COMPLETE
- **Deliverable:** Design system + wireframes
- **Status:** ✅ Done (June 4)
- **What:** 6 screen wireframes, color system, typography, component specs
- **Location:** Figma (https://www.figma.com/design/QCLXWKURarovgFfUiJJbQU/)
- **Note:** Kyle built designs in Figma directly (Iris can't access Figma UI)

### ✅ Sage (Frontend Engineer) — COMPLETE
- **Deliverable:** React components + hooks + type definitions + API client
- **Status:** ✅ Done (June 5, 8:30 AM)
- **What:**
  - 10 React components (ClassList, ClassDetail, WeekDetail, StudentPicker, StudentDashboard, SkillDetail, StudentSelfRatingForm, TeacherRatingForm, FeedbackForm, AssessmentLog)
  - 5 custom hooks (useClass, useWeek, useRatings, useFeedback, useAssessmentLog)
  - Complete TypeScript types (lib/types/)
  - API client with retry logic (lib/api/)
  - Component documentation (docs/frontend/COMPONENTS.md)
- **Location:** `app/modules/improv/components/`, `app/modules/improv/hooks/`, `lib/types/`, `lib/api/`
- **Architecture:** Next.js 16, React 19, TypeScript strict, Tailwind CSS, React Query
- **GitHub:** Commit f2e2de2 pushed to main

---

## What's Pending

### 🔴 Backend API Routes (BLOCKER)
- **Who:** Needs backend dev (could be Archon, Sage, or Kyle)
- **What:** Implement Next.js API routes at `/api/viridian/*` for all 20+ endpoints
- **Routes needed:**
  - GET /api/viridian/classes
  - GET /api/viridian/classes/:classId
  - GET /api/viridian/weeks/:weekId
  - POST /api/viridian/students/:studentId/ratings
  - POST /api/viridian/students/:studentId/teacher-ratings
  - POST /api/viridian/feedback
  - GET /api/viridian/students/:studentId/dashboard
  - GET /api/viridian/assessment-logs
  - (See ARCHON-BRIEF.md for full list)
- **Database:** Prisma schema defined, but database not yet created
- **Timeline:** 2-3 hours
- **Blocker Impact:** Frontend can't fetch data without API

### 🔴 Database Setup (BLOCKER)
- **What:** Create PostgreSQL database, run Prisma migrations
- **Status:** Seed data exists but database not yet initialized
- **Timeline:** 30 minutes

### ⚠️ Integration Testing
- **What:** Connect frontend components to API, test full workflows
- **Timeline:** 2-3 hours
- **Workflows to test:**
  - Teacher: Browse classes → select week → rate student → provide feedback
  - Student: View dashboard → see ratings → understand progress
  - Discrepancy detection: Verify rating mismatches trigger alerts

### ⚠️ Deployment
- **Platform:** Vercel (recommended for Next.js)
- **Database:** PostgreSQL (managed, e.g., Vercel Postgres or Railway)
- **Timeline:** 2 hours setup + testing

---

## Architecture Decisions (Locked)

✓ **Next.js 16** — Full-stack framework, single deployment unit  
✓ **React 19 + TypeScript** — Type-safe frontend  
✓ **React Query** — Server state management, automatic caching  
✓ **Tailwind CSS** — Utility-first styling, no external UI library  
✓ **Modular structure** — Organized by domain (improv/, k12/)  
✓ **Separate from kyleos-dashboard** — Independent product, independent repo  

**Design Decisions (From Iris + Kyle):**
✓ Self-rating optional narrative + evidence  
✓ Revision history with timestamps  
✓ Discrepancy detection (student vs. teacher rating mismatches)  
✓ Anchor skills prioritized, non-anchors collapsible  
✓ Mastery calculation at skill-level (not objective-level)  
✓ Mobile-responsive (desktop-first)  
✓ WCAG AA accessible  

---

## Repos & Important Links

- **Viridian GitHub:** https://github.com/kwinslowsmith/Viridian
- **Figma Design:** https://www.figma.com/design/QCLXWKURarovgFfUiJJbQU/
- **Local paths:**
  - Repo: `/Users/kylewinslowsmith/Desktop/Viridian`
  - Briefs: `docs/schema/ARCHON-BRIEF.md`, `docs/design/IRIS-BRIEF.md`, `docs/frontend/SAGE-BRIEF.md`
  - Frontend docs: `docs/frontend/COMPONENTS.md`

---

## Next Steps (Priority Order)

1. **Implement backend API routes** (CRITICAL BLOCKER)
   - Who: Sage or backend developer
   - Time: 2-3 hours
   - Unblocks: Integration testing

2. **Set up PostgreSQL database**
   - Create DB, run Prisma migrations, seed data
   - Time: 30 minutes

3. **Integration testing**
   - Connect frontend to API
   - Test teacher + student workflows
   - Time: 2-3 hours

4. **Deploy to Vercel**
   - Connect repo, set up environment variables, deploy
   - Time: 2 hours

5. **Pilot with MF Improv** (~June 16)
   - Real user testing, feedback collection
   - Iterate based on feedback

---

## Known Issues / Decisions Made Today

**Issue:** Viridian was initially built in kyleos-dashboard (wrong repo, wrong architecture)
**Resolution:** Rebuilt in Viridian repo using Next.js (correct)
**Lesson:** Central project status document created to prevent future misalignment

**Decision:** Separate Viridian from personal dashboard to maintain clean product separation

---

## Team Contacts

- **Archon** (Schema/Architecture): `docs/schema/ARCHON-BRIEF.md`
- **Iris** (Design): `docs/design/IRIS-BRIEF.md`
- **Sage** (Frontend): `docs/frontend/SAGE-BRIEF.md`

---

## How to Run Locally

```bash
# Clone repo
git clone https://github.com/kwinslowsmith/Viridian.git
cd Viridian

# Install dependencies
npm install

# Set up database
# (Once backend API + DB are ready, add DATABASE_URL to .env)

# Run development server
npm run dev

# Open http://localhost:3000
```

---

**Maintained by:** Viridian Team  
**Updates:** After each sprint completion
