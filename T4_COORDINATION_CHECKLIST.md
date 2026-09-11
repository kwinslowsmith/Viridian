# T4 WEEKS 1-2 COORDINATION CHECKLIST

## PRESTART: Today (Sep 11, 2026)

- [ ] Read T4_WEEKS1-2_ANALYSIS.md (this document)
- [ ] Read T4_COMPONENT_SPECIFICATIONS.md (detailed component requirements)
- [ ] Read work_coordination_protocol.md (team coordination rules)
- [ ] Check WORK_LOG.md for any active T1/T2/T3 work that might affect T4

---

## WEEK 1: UNDERSTANDING & DOCUMENTATION (Sep 11-18)

### Monday Sep 11 - Tuesday Sep 12: Read & Understand

- [ ] Read T1 API endpoint code:
  - [ ] `/app/api/communities/[slug]/meetings/route.ts`
  - [ ] `/app/api/communities/[slug]/meetings/[meetingId]/route.ts`
  - [ ] `/app/api/communities/[slug]/stats/route.ts`
  
- [ ] Read Prisma models:
  - [ ] `PolymathMeeting` model in `prisma/schema.prisma`
  - [ ] `LearningCommunity` model
  - [ ] `LearningCommunityMember` model
  
- [ ] Understand auth patterns:
  - [ ] How `getServerSession` works
  - [ ] How curator authorization is checked
  - [ ] What happens when user is not curator

- [ ] Review existing UI patterns:
  - [ ] `/app/components/TeacherClassDashboard.tsx` (similar dashboard)
  - [ ] `/app/k12/classes/[classId]/dashboard/page.tsx` (page structure)
  - [ ] Styling patterns (Tailwind, CSS files)
  - [ ] Component organization

**Expected Time**: 4-6 hours

**Deliverable**: Notes on T1 APIs, Prisma models, auth patterns, UI conventions

---

### Wednesday Sep 13: Initial Coordination Meeting

**Sync with T1 (Priority HIGH)**:
- [ ] Confirm all T1 APIs are finalized and won't change
- [ ] Ask: Are there any planned changes to PolymathMeeting model?
- [ ] Ask: Is Supabase realtime subscriptions set up for meetings?
- [ ] Ask: What's the test community slug for testing?
- [ ] Ask: Do we have test curator accounts ready?
- [ ] Share your COMPONENT_SPEC.md with T1, get feedback on API assumptions

**Sync with T2** (Optional):
- [ ] Ask: Are there UI component patterns we should adopt?
- [ ] Ask: Any shared component library or hooks available?
- [ ] Ask: What's your Tailwind configuration (colors, spacing)?
- [ ] Get reference to T2 components (buttons, modals, forms)

**Sync with T3** (Optional):
- [ ] Any concerns about feature overlap?
- [ ] Any shared dependencies we should know about?

**Documented Output**:
- [ ] Update WORK_LOG.md with T1 confirmation of API stability
- [ ] Note any design patterns to adopt from T2
- [ ] Document any dependencies or blockers

**Expected Time**: 1 hour

---

### Thursday Sep 14 - Friday Sep 15: Architecture & Design

- [ ] Create component tree diagram for meetings page
  ```
  MeetingsPage
    ├── ScheduleMeetingForm (modal)
    ├── MeetingDetailModal
    ├── MeetingList
    │   └── MeetingCard (repeated)
    └── ErrorAlert, LoadingSpinner
  ```

- [ ] Create component tree diagram for curator dashboard
  ```
  CuratorDashboardPage
    ├── CommunityStatsBox
    ├── EngagementMetrics
    ├── ImpactSummary
    ├── PendingActions
    ├── RecentMembers
    ├── TopContributors
    └── QuickActionsBar
  ```

- [ ] Design data flow diagrams:
  - [ ] How meetings data flows from API → component state → UI
  - [ ] How curator edits notes (form → API → database)
  - [ ] How stats update on dashboard

- [ ] Document error handling strategy:
  - [ ] What happens when API fails?
  - [ ] What error messages should users see?
  - [ ] How to recover from errors?

- [ ] Create styling guide:
  - [ ] Adopt Tailwind patterns from T2
  - [ ] Document color scheme
  - [ ] Document responsive breakpoints (375px, 600px, 1024px)
  - [ ] Document spacing/padding conventions

**Expected Time**: 4-5 hours

**Deliverable**: Component tree diagrams, data flow diagrams, error handling strategy, styling guide

---

## WEEK 2: TESTING & PREPARATION (Sep 18-25)

### Monday Sep 18 - Wednesday Sep 20: API Testing & Validation

**Set up testing environment**:
- [ ] Confirm you have test credentials for curator account
- [ ] Confirm you have test community with slug
- [ ] Get Postman or curl commands ready to test API

**Test GET /api/communities/[slug]/meetings**:
- [ ] Call with sort="upcoming" → verify returns only future meetings
- [ ] Call with sort="past" → verify returns only past meetings
- [ ] Call with limit=10, offset=0 → verify pagination works
- [ ] Verify response structure matches API spec
- [ ] Check error handling: 401 (no auth), 403 (access), 404 (not found)

**Test POST /api/communities/[slug]/meetings** (curator):
- [ ] Create meeting with valid data → verify 201 response
- [ ] Create meeting with invalid data → verify 400 error
- [ ] Try to create as non-curator → verify 403 error
- [ ] Try to create without auth → verify 401 error

**Test GET /api/communities/[slug]/meetings/[meetingId]**:
- [ ] Fetch meeting by ID → verify returns correct meeting
- [ ] Try invalid ID → verify 404 error

**Test PATCH /api/communities/[slug]/meetings/[meetingId]** (curator):
- [ ] Update title → verify changes
- [ ] Add notes → verify notes saved
- [ ] Add recordingUrl → verify URL saved
- [ ] Update as non-curator → verify 403 error
- [ ] Update non-existent meeting → verify 404 error

**Test DELETE /api/communities/[slug]/meetings/[meetingId]** (curator):
- [ ] Delete meeting → verify 204 response
- [ ] Try delete as non-curator → verify 403 error
- [ ] Try delete non-existent meeting → verify 404 error

**Test GET /api/communities/[slug]/stats** (curator):
- [ ] Fetch stats → verify all fields present
- [ ] Verify memberCount > 0
- [ ] Verify stats match database state
- [ ] Try as non-curator → verify 403 error

**Document results**:
- [ ] Create API_TEST_RESULTS.md with all test cases and outcomes
- [ ] Note any unexpected behavior
- [ ] Flag any bugs or issues for T1

**Expected Time**: 6-8 hours

**Deliverable**: API_TEST_RESULTS.md, list of any blockers for T1

---

### Thursday Sep 21: Build Reusable Components

- [ ] Create `app/hooks/useFetch.ts`
  - [ ] Generic fetch logic with loading/error handling
  - [ ] Support GET, POST, PATCH, DELETE
  - [ ] Include refetch function
  - [ ] Full TypeScript types

- [ ] Create `app/hooks/useTimeFormat.ts`
  - [ ] formatDate(date) → "Oct 15, 2026"
  - [ ] formatTime(date) → "6:00 PM"
  - [ ] formatDateTime(date) → "Oct 15, 6:00 PM"
  - [ ] formatRelative(date) → "2 days from now"

- [ ] Create `app/components/polymath/LoadingSpinner.tsx`
  - [ ] Animated spinner
  - [ ] Optional message
  - [ ] Responsive sizing

- [ ] Create `app/components/polymath/ErrorAlert.tsx`
  - [ ] Red background error display
  - [ ] Optional retry button
  - [ ] Optional dismiss button

- [ ] Create `app/components/polymath/EmptyState.tsx`
  - [ ] Icon + title + description
  - [ ] Optional action button
  - [ ] Used for empty meetings lists, etc.

**Expected Time**: 4-5 hours

**Deliverable**: 5 reusable components/hooks, all type-checked, all responsive

---

### Friday Sep 22: Final Coordination & Week 3 Prep

**Final Sync with T1**:
- [ ] Share API_TEST_RESULTS.md
- [ ] Get confirmation: No API changes planned for Weeks 3-4?
- [ ] Ask T1: Database has test meetings ready?
- [ ] Ask: Any realtime subscription setup we need to know about?

**Final Sync with T2/T3**:
- [ ] Any final design pattern questions?
- [ ] Any shared component libraries ready to use?
- [ ] Confirm: No timeline conflicts?

**Prepare for Week 3**:
- [ ] Create folder structure:
  - [ ] `app/polymath/communities/[id]/meetings/`
  - [ ] `app/polymath/curator/[communityId]/`
  - [ ] `app/components/polymath/` (for new components)

- [ ] Create page skeletons:
  - [ ] `app/polymath/communities/[id]/meetings/page.tsx` (bare skeleton)
  - [ ] `app/polymath/curator/[communityId]/page.tsx` (bare skeleton)

- [ ] Push all Week 1-2 work to main branch:
  - [ ] Reusable hooks
  - [ ] Reusable components
  - [ ] Component specifications
  - [ ] API test results
  - [ ] Architecture diagrams

- [ ] Update WORK_LOG.md:
  - [ ] Mark "T4 Weeks 1-2: Planning & Coordination" as COMPLETED
  - [ ] Document all learnings and decisions
  - [ ] List any blockers or risks
  - [ ] Note: "T4 Ready for implementation Week 3"

**Expected Time**: 2-3 hours

**Deliverable**: Folder structure ready, page skeletons created, all prep work committed to main

---

## SUCCESS CRITERIA FOR WEEKS 1-2

By end of Friday Sep 22, you should be able to answer YES to all:

- [ ] Do you understand all T1 API endpoints completely?
- [ ] Have you tested all T1 APIs manually and documented results?
- [ ] Do you know the exact component structure you'll build?
- [ ] Have you created all reusable hooks/components needed?
- [ ] Is folder structure initialized and skeleton pages created?
- [ ] Have you adopted T2's UI patterns and styling conventions?
- [ ] Are there any remaining blockers for Week 3? (List them)
- [ ] Have you coordinated with T1/T2/T3 and resolved conflicts?
- [ ] Is all Week 1-2 work committed to main branch?
- [ ] Are you confident starting implementation Monday Sep 25?

---

## BLOCKERS TO WATCH

If ANY of these are true, STOP and escalate to T1:

1. **API instability**: T1 changes endpoints after your testing
2. **Auth issues**: Curator authorization not working
3. **Database issues**: Test data not seeded, can't fetch meetings
4. **Schema changes**: Prisma models changed after your testing
5. **Supabase issues**: Realtime subscriptions not set up
6. **UI conflicts**: T2's patterns incompatible with your design
7. **Scope creep**: New requirements added mid-week

---

## DOCUMENTATION DELIVERABLES

By end of Week 2, you should have created:

1. **T4_WEEKS1-2_ANALYSIS.md** ✅ (Already provided)
   - High-level overview, decisions, API reference

2. **T4_COMPONENT_SPECIFICATIONS.md** ✅ (Already provided)
   - Detailed component requirements, visual layouts, props

3. **T4_COORDINATION_CHECKLIST.md** (This document)
   - Week-by-week tasks and coordination

4. **API_TEST_RESULTS.md** (Create this)
   - Manual API tests with curl/Postman
   - All test cases passed/failed
   - Any bugs or issues found

5. **COMPONENT_ARCHITECTURE.md** (Create this)
   - Component tree diagrams
   - Data flow diagrams
   - Error handling strategy
   - Styling guide

6. **Week3_IMPLEMENTATION_PLAN.md** (Create this)
   - Day-by-day implementation schedule for Week 3
   - Which components to build each day
   - Dependencies and build order

---

## WEEKLY SYNC MESSAGES TO WORK_LOG.md

### Friday Sep 13

```
T4 COORDINATION UPDATE — Sep 13
STATUS: Week 1 Planning Underway
COMPLETED:
- Read all T1 API code and Prisma models
- Reviewed existing UI patterns (K12 LMS)
- Initial coordination meeting with T1

IN PROGRESS:
- Architecture design and component trees
- Data flow diagrams
- Error handling strategy

BLOCKERS:
- (None yet)

NEXT WEEK:
- API testing and validation (manual tests)
- Create reusable hooks/components
- Final coordination before Week 3 implementation
```

### Friday Sep 20

```
T4 COORDINATION UPDATE — Sep 20
STATUS: Week 2 Testing Complete
COMPLETED:
- All 6 T1 API endpoints tested manually
- API_TEST_RESULTS.md created (all tests PASS)
- 5 reusable hooks/components built
- Component architecture documented
- Folder structure initialized
- Week 3 implementation plan finalized

API TEST SUMMARY:
✅ GET /api/communities/[slug]/meetings (sort=upcoming/past)
✅ POST /api/communities/[slug]/meetings (create, auth checks)
✅ GET /api/communities/[slug]/meetings/[meetingId]
✅ PATCH /api/communities/[slug]/meetings/[meetingId] (notes editing)
✅ DELETE /api/communities/[slug]/meetings/[meetingId]
✅ GET /api/communities/[slug]/stats (curator dashboard)

BLOCKERS:
- (None identified)

READY FOR WEEK 3:
✅ All APIs stable and tested
✅ Reusable components ready
✅ Architecture finalized
✅ T1/T2 coordination complete
✅ No dependencies blocking implementation

STARTING IMPLEMENTATION: Monday Sep 25
```

---

## WEEK 3 TEASER: What's Coming

Week 3 will focus on building these components in this order:

1. **Day 1-2 (Sep 25-26)**: MeetingCard & MeetingDetailModal
2. **Day 3-4 (Sep 27-28)**: ScheduleMeetingForm & Meetings page
3. **Day 5 (Sep 29)**: CuratorDashboard components (stats, metrics)
4. **Week 4 (Oct 2-9)**: Polish, mobile optimization, testing, bug fixes

See Week3_IMPLEMENTATION_PLAN.md for detailed daily breakdown.

---

**You're building the features that drive adoption. Make them beautiful, make them reliable, make them feel like they're built for educators.**

Good luck, T4. Let's ship this.
