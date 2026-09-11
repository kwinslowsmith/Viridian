# T4 FEATURES AGENT — WEEKS 1-2 ANALYSIS & PREPARATION

## CURRENT STATE (Week 1, Sep 11, 2026)

### ✅ WHAT'S ALREADY BUILT

**T1 (Backend) - Production Ready:**
- ✅ Meetings API endpoints (GET/POST /api/communities/[slug]/meetings)
- ✅ Curator stats API endpoint (GET /api/communities/[slug]/stats)
- ✅ Prisma models: PolymathMeeting, LearningCommunity, LearningCommunityMember
- ✅ Authorization: Curator-only restrictions enforced
- ✅ Supabase database configured
- ✅ Test data: Communities, users, meetings all seeded

**Polymath Codebase Structure:**
- ✅ /app/polymath/ folder initialized (main layout, pages, mockData)
- ✅ Auth system configured (NextAuth, getServerSession)
- ✅ API folder structure for communities endpoints
- ✅ Existing UI pages: landing, feed, article, approvals, tools, modules, collections

**What's MISSING for Weeks 3-4:**
- ❌ No /polymath/communities/[id]/meetings page
- ❌ No MeetingCard component
- ❌ No ScheduleMeetingForm component
- ❌ No MeetingDetailModal component
- ❌ No /polymath/curator/[communityId] dashboard page
- ❌ No CuratorDashboard component

---

## TEAM COORDINATION STATUS

**T1 (Backend/Orchestrator)** — In progress
- Building core APIs, database, auth
- Meetings & Curator Stats endpoints: ✅ COMPLETE
- Status: Ready for T2/T3 integration

**T2 (Student Experience)** — In progress
- Building student-facing UI components (K12 LMS focused)
- Phase 3: My Grades, Study Guides, Mastery Progress
- Status: Not focused on Polymath yet; patterns available for reference

**T3 (Parent Experience)** — In progress
- Building parent-facing UI & engagement features (K12 LMS focused)
- Phase 3: Alerts, Risk Indicators, Progress Benchmarking
- Status: Not focused on Polymath yet

**T4 (Features - YOU)** — Preparation Phase (Weeks 1-2)
- Timeline: Weeks 3-4 for implementation (after T1 stabilizes)
- Current Task: Understand requirements, plan architecture, coordinate with T1
- Status: Starting now

---

## T1 API REFERENCE (Ready Now)

### Endpoint 1: List & Create Meetings
**GET /api/communities/[slug]/meetings**
```
Query params:
  - limit (default 20, max 100)
  - offset (default 0)
  - sort ("upcoming" | "past")

Response:
{
  "meetings": [
    {
      "id": "clx...",
      "communityId": "clx...",
      "title": "October Curriculum Review",
      "description": "Planning next semester...",
      "scheduledAt": "2026-10-15T18:00:00Z",
      "zoomUrl": "https://zoom.us/j/...",
      "location": "Boston Public Library",
      "hostId": "clx...",
      "host": { "id": "clx...", "name": "Jane Doe", "email": "jane@boston.edu" },
      "notes": null,
      "recordingUrl": null,
      "createdAt": "2026-09-11T14:00:00Z",
      "updatedAt": "2026-09-11T14:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0,
  "hasMore": false
}
```

**POST /api/communities/[slug]/meetings** (Curator only)
```
Request body:
{
  "title": "October Curriculum Review",
  "description": "Planning next semester agenda",
  "scheduledAt": "2026-10-15T18:00:00Z",
  "zoomUrl": "https://zoom.us/j/...",  // optional
  "location": "Boston Public Library"  // optional
}

Response: 201 Created
{
  "id": "clx...",
  "communityId": "clx...",
  "title": "October Curriculum Review",
  ...same as GET response...
}
```

### Endpoint 2: Meeting Details
**GET /api/communities/[slug]/meetings/[meetingId]**
```
Response: Same meeting object as above
```

**PATCH /api/communities/[slug]/meetings/[meetingId]** (Curator only)
```
Request body (any of):
{
  "title": "New Title",
  "description": "New description",
  "scheduledAt": "2026-10-15T18:00:00Z",
  "zoomUrl": "https://zoom.us/j/...",
  "location": "New location",
  "notes": "Meeting notes captured after the call",
  "recordingUrl": "https://..."
}

Response: 200 OK with updated meeting object
```

**DELETE /api/communities/[slug]/meetings/[meetingId]** (Curator only)
```
Response: 204 No Content
```

### Endpoint 3: Curator Dashboard Stats
**GET /api/communities/[slug]/stats** (Curator only)
```
Response:
{
  "community": {
    "id": "clx...",
    "name": "Boston Directors of Curriculum",
    "slug": "boston-directors"
  },
  "stats": {
    "memberCount": 42,
    "discussionCount": 18,
    "messageCount": 234,
    "resourceCount": 56,
    "meetingCount": 8,
    "upcomingMeetingCount": 2
  },
  "engagement": {
    "thisMonthMessages": 45,
    "lastMonthMessages": 32,
    "growth": "40.6"  // percentage
  },
  "recentMembers": [
    {
      "id": "clx...",
      "user": { "id": "clx...", "name": "Alex K.", "email": "alex@school.edu" },
      "joinedAt": "2026-09-08T10:00:00Z"
    }
  ],
  "recentDiscussions": [
    {
      "id": "clx...",
      "title": "How do we decolonize the curriculum?",
      "createdBy": { "id": "clx...", "name": "Jane Doe" },
      "_count": { "messages": 12 },
      "lastMessageAt": "2026-09-10T14:00:00Z"
    }
  ],
  "topContributors": [
    {
      "user": { "id": "clx...", "name": "Bob Smith", "email": "bob@..." },
      "messageCount": 34
    }
  ]
}
```

---

## DESIGN PATTERNS TO FOLLOW (From Viridian K12 LMS)

### State Management
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<DataType | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/...`);
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchData();
}, [dependencies]);
```

### Error Handling
- Show user-friendly error messages
- Log errors to console for debugging
- Provide recovery actions (retry button, go back, etc.)

### Mobile Responsive
- Base: 375px (mobile)
- Tablet: 600px+
- Desktop: 1024px+
- Use Tailwind CSS breakpoints consistently

### Styling Convention
- Use existing Viridian design tokens
- Tailwind CSS for styling
- Keep color palette consistent (blues, teals, grays)

---

## YOUR TASKS FOR WEEKS 1-2

### Week 1 (Sep 11-18) — PLANNING & COORDINATION

1. **Read & Understand**
   - ✅ This document
   - Read T1 API code: /app/api/communities/[slug]/meetings/route.ts
   - Read T1 API code: /app/api/communities/[slug]/stats/route.ts
   - Check Prisma models: PolymathMeeting, LearningCommunity
   - Understand auth pattern (getServerSession, curator-only)

2. **Coordinate with T1**
   - Confirm T1 APIs are stable and won't change
   - Check if Supabase realtime subscriptions are set up
   - Ask T1: Any planned changes to API contract?
   - Ask T1: What's the test community slug for testing?

3. **Design Component Architecture**
   - Sketch component tree for meetings page
   - Sketch component tree for curator dashboard
   - Plan data flow (fetch → state → render)
   - Plan error states and loading states

4. **Create Documentation**
   - Create COMPONENT_SPEC.md (detailed component requirements)
   - Create API_INTEGRATION_GUIDE.md (how to call each endpoint)
   - Create TESTING_CHECKLIST.md (browser verification steps)

### Week 2 (Sep 18-25) — PATTERN BUILDING & TESTING

1. **Test T1 APIs Manually**
   - Use curl or fetch to test all endpoints
   - Verify error handling (401, 403, 404, 500)
   - Test with real test data from database
   - Document any issues to report to T1

2. **Review Existing K12 Patterns**
   - Study /app/components/TeacherClassDashboard.tsx for dashboard pattern
   - Study /app/k12/classes/[classId]/dashboard/page.tsx for page structure
   - Study form patterns from K12 LMS
   - Adopt the same styling and patterns

3. **Build Reusable Patterns**
   - Create hook: useFetch() for API calls
   - Create hook: useTimeFormat() for meeting dates
   - Create component: LoadingSpinner (reusable)
   - Create component: ErrorAlert (reusable)
   - Create component: EmptyState (reusable)

4. **Prepare for Week 3 Start**
   - Create page skeleton for /polymath/communities/[id]/meetings
   - Create page skeleton for /polymath/curator/[communityId]
   - Set up folder structure
   - Confirm T1 APIs won't change during Weeks 3-4

---

## KEY DECISIONS TO MAKE (In Coordination with T1/T2)

### 1. Real-Time Updates
**Question**: Should meetings appear instantly when curator schedules them?
- **Option A**: Basic (no real-time) — Refresh page to see new meetings
- **Option B**: Supabase subscriptions — Meetings appear instantly for all members
- **Decision**: TBD (check with T1 on Supabase setup)

### 2. Meeting Calendar View
**Question**: Should we build a calendar widget (Week 4 nice-to-have)?
- **Option A**: List view only (sorted, simple)
- **Option B**: List + Calendar grid (month view, click events)
- **Decision**: List view MVP, calendar is bonus

### 3. Study Materials in Meetings
**Question**: Should meetings have attachments/resources?
- **Option A**: Just notes + recording URL
- **Option B**: Full resource library + notes + recording
- **Decision**: MVP = notes + recording URL only

### 4. Zoom Embed or Link
**Question**: Embed Zoom iframe or just link to it?
- **Option A**: Link only (simpler, safer)
- **Option B**: Embed Zoom iframe (better UX)
- **Decision**: Link only for MVP, embed in Week 4 if time

### 5. Attendance Tracking
**Question**: Should we track who attended meetings?
- **Option A**: No tracking (too complex)
- **Option B**: Simple checklist (curator marks attendees)
- **Decision**: No tracking in MVP

---

## FILE STRUCTURE FOR WEEKS 3-4

```
app/
  polymath/
    communities/
      [id]/
        meetings/
          page.tsx                    // Main page (list + calendar)
          ScheduleMeetingForm.tsx     // Form to schedule (curator only)
          MeetingCard.tsx             // Card component for each meeting
          MeetingDetailModal.tsx      // Modal for full meeting details
    curator/
      [communityId]/
        page.tsx                      // Curator dashboard main page
        CuratorDashboard.tsx          // Dashboard component
        CommunityStatsBox.tsx         // Stats section
        EngagementMetrics.tsx         // Engagement trends
        ImpactSummary.tsx             // What community built
        PendingActions.tsx            // Pending items
  components/
    polymath/
      LoadingSpinner.tsx              // Reusable loading indicator
      ErrorAlert.tsx                  // Reusable error message
      EmptyState.tsx                  // Empty state placeholder
  hooks/
    useFetch.ts                       // Generic fetch hook
    useTimeFormat.ts                  // Format dates/times
```

---

## SUCCESS CRITERIA FOR WEEKS 1-2

By end of Week 2 (Sep 25):
- ✅ All T1 APIs tested and understood
- ✅ Component architecture documented
- ✅ Page/component structure planned
- ✅ Reusable hooks/components created
- ✅ Folder structure initialized
- ✅ No blockers identified for Week 3
- ✅ Team coordination confirmed (no conflicts)
- ✅ Ready to start building on Monday, Sep 25

---

## RED FLAGS TO WATCH

1. **T1 API Changes**: If T1 changes endpoints during Week 3, we're blocked
2. **Supabase Issues**: If realtime subscriptions aren't set up, we can't do live updates
3. **Auth Problems**: If curator authorization fails, meetings can't be created
4. **Mobile UX**: If mobile layout breaks at 375px, we need to redesign
5. **Performance**: If stats endpoint takes >2s, we need to optimize

---

## COMMUNICATION CHECKLIST

**Weekly Sync Points (Every Friday):**
- [ ] T1: "APIs stable? Any changes coming?"
- [ ] T2: "Any UI patterns we should adopt?"
- [ ] T3: "Any conflicts or dependencies we should know?"
- [ ] T4 (You): "Ready for Week 3? Any blockers?"

**Before Week 3 Starts (Sep 22):**
- [ ] Confirm T1 APIs won't change
- [ ] Get T2 UI pattern reference
- [ ] Check database has test communities with meetings
- [ ] Verify curator test accounts exist
- [ ] Test all endpoints manually

---

## QUICK REFERENCE: KEY FILES

**T1 Backend:**
- `/app/api/communities/[slug]/meetings/route.ts` — Meetings CRUD
- `/app/api/communities/[slug]/meetings/[meetingId]/route.ts` — Meeting detail
- `/app/api/communities/[slug]/stats/route.ts` — Curator dashboard stats
- `/prisma/schema.prisma` — Data models (PolymathMeeting, LearningCommunity)

**Existing Patterns:**
- `/app/k12/classes/[classId]/dashboard/page.tsx` — Similar page structure
- `/app/components/TeacherClassDashboard.tsx` — Dashboard pattern example
- `/lib/prisma.ts` — Prisma client setup
- `/lib/auth.ts` — NextAuth configuration

---

**Next Step**: Read this analysis, coordinate with T1, then start Week 1 tasks above.

**When Ready for Week 3**: File a message saying "T4 Ready for implementation" with blockers list.
