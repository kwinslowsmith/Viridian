# Polymath MVP - Week 1 Complete Handoff to T2/T3/T4

**Date:** September 11, 2026  
**Status:** ✅ T1 Week 1 COMPLETE - All 9 API Endpoints Ready  

---

## 🎯 CRITICAL HANDOFF: YOUR APIS ARE LIVE

### For T2 (Frontend) - START WIRING NOW

**T1 has completed all 9 API endpoints.** Your components are ready to connect.

#### Priority 1 Pages to Wire (Start immediately):

1. **Communities List** → `GET /api/communities`
   - Query params: `scope`, `topic`, `search`, `limit`, `offset`
   - Response: `{ communities[], total, limit, offset, hasMore }`
   - Wire: Your communities grid, filters, pagination

2. **Community Dashboard** → `GET /api/communities/[slug]`
   - Response: community object with curator, members, modules count
   - Wire: Your community header, member count display

3. **Discussions List** → `GET /api/communities/[slug]/discussions`
   - Query params: `limit`, `offset`, `sort` ("recent"|"oldest"|"pinned")
   - Response: `{ discussions[], total, hasMore }`
   - Wire: Your discussion feed, pagination, sorting buttons

4. **Discussion Thread** → `GET /api/communities/[slug]/discussions/[discussionId]/messages`
   - Query params: `limit`, `offset`
   - Response: `{ messages[], total, hasMore }` (chronological order)
   - Wire: Your message thread view, load more button

5. **Meetings List** → `GET /api/communities/[slug]/meetings`
   - Query params: `sort` ("upcoming"|"past"), `limit`, `offset`
   - Response: `{ meetings[], total, hasMore }`
   - Wire: Your meetings calendar/list, upcoming tab

#### Priority 2 Forms to Wire (After Priority 1):

6. **Create Discussion** → `POST /api/communities/[slug]/discussions`
   - Body: `{ title, content? }`
   - Response: Created discussion object
   - Wire: Your discussion modal form

7. **Post Message** → `POST /api/communities/[slug]/discussions/[discussionId]/messages`
   - Body: `{ content, googleDocUrl? }`
   - Response: Created message object
   - Wire: Your message input form in thread

8. **Schedule Meeting** → `POST /api/communities/[slug]/meetings`
   - Body: `{ title, description?, scheduledAt, zoomUrl?, location? }`
   - Response: Created meeting object
   - Wire: Your meeting modal form

9. **Upload Resource** → `POST /api/communities/[slug]/resources`
   - Already exists (check existing endpoint)
   - Wire: Your resource upload modal

#### Pattern for T2 - Copy This Template:

```typescript
// In your component:
const [discussions, setDiscussions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities/${slug}/discussions?limit=20&offset=0`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setDiscussions(data.discussions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [slug]);

// In your JSX:
{loading && <Spinner />}
{error && <ErrorMessage message={error} />}
{discussions.length === 0 && <EmptyState />}
{discussions.map(d => <DiscussionCard key={d.id} discussion={d} />)}
```

**Next Sync:** Friday Sep 13 - Report which pages are wired

---

### For T3 (Integration & Real-Time) - WIRE + ADD REALTIME

**T1 has all endpoints ready. You created the API wrapper (lib/polymath-api.ts). Now:**

#### Week 2 Priority 1 - Complete API Wiring:

1. **Test all 9 endpoints** using your `lib/polymath-api.ts` wrapper functions
   - Verify response formats match your TypeScript interfaces
   - Test error cases (403 for non-curator, 404 for missing resource)
   - Test pagination (offset, limit, hasMore)

2. **Wire T2 components** to use your custom hooks from `hooks/usePolymath.ts`
   - Replace mock data with real API calls
   - Test loading/error states
   - Verify data displays correctly

3. **Create reusable hooks** for common patterns:
   - `useCommunityDiscussions(slug)` → fetches + refetch capability
   - `useDiscussionMessages(slug, discussionId)` → fetches messages + load more
   - `useCommunityMeetings(slug)` → fetches meetings
   - `useUserProfile()` → fetches current user profile
   - `useUserDashboard()` → fetches dashboard data

#### Week 3 Priority 2 - Add Real-Time Updates:

**After T2 wiring is complete, add Supabase subscriptions:**

1. **Discussions Real-Time:**
   - Subscribe to Conversation table (filter: `type='community'` AND `communityId=xxx`)
   - On INSERT: Add new discussion to list
   - On UPDATE: Update isPinned, title
   - On DELETE: Remove from list

2. **Messages Real-Time:**
   - Subscribe to Message table (filter: `conversationId=xxx`)
   - On INSERT: Add new message to thread
   - On DELETE: Remove message
   - Update `lastMessageAt` on conversation

3. **Meetings Real-Time:**
   - Subscribe to PolymathMeeting table (filter: `communityId=xxx`)
   - On INSERT: Add meeting to list
   - On UPDATE: Update notes, recording, scheduledAt
   - On DELETE: Remove meeting

4. **Presence Tracking:**
   - Track who's online in community using Supabase presence
   - Show "Alice is typing..." in discussion
   - Show active members in sidebar

**Hook Pattern:**
```typescript
export function useDiscussionMessagesRealtime(slug: string, discussionId: string) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`discussion-${discussionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'Message' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(m => [...m, payload.new]);
          }
        }
      )
      .subscribe();
    
    return () => channel.unsubscribe();
  }, [discussionId]);
  
  return messages;
}
```

**Next Sync:** Friday Sep 13 - Report API wrapper test results

---

### For T4 (Teacher/Curator Experience) - BUILD CURATOR DASHBOARD

**T1 has the stats endpoint ready. You focus on:**

#### Week 2 Priority 1 - Curator Dashboard:

**Endpoint Available:** `GET /api/communities/[slug]/stats` (curator only)

Returns:
```json
{
  "community": { "id", "name", "slug" },
  "stats": {
    "memberCount": 42,
    "discussionCount": 18,
    "messageCount": 234,
    "resourceCount": 12,
    "meetingCount": 5,
    "upcomingMeetingCount": 2
  },
  "engagement": {
    "thisMonthMessages": 89,
    "lastMonthMessages": 56,
    "growth": "58.9"
  },
  "recentMembers": [...],
  "recentDiscussions": [...],
  "topContributors": [...]
}
```

**Build These Sections:**

1. **Impact Cards** (top section)
   - Member count card
   - Discussion count card
   - Message activity card
   - Upcoming meetings card

2. **Engagement Trend** 
   - This month vs last month comparison
   - Growth % (color: green if positive, red if negative)
   - Simple chart or bar comparison

3. **Recent Activity Feed**
   - Latest discussions (title, author, message count)
   - Latest members (name, join date)
   - Top contributors (name, message count)

4. **Quick Actions**
   - "Schedule Meeting" button
   - "Invite Members" button
   - "View Community" button

#### Week 2 Priority 2 - Member Management:

**Endpoints Already Exist:**
- `GET /api/communities/[slug]/members` - List members
- `POST /api/communities/[slug]/members` - Add member (curator only)
- `DELETE /api/communities/[slug]/members/[memberId]` - Remove member (curator only)

**Build:**
1. Members table/grid with:
   - Member name, email, join date, role
   - Remove button (curator only)
2. "Add Member" modal with email invite

#### Week 3 Priority 3 - Resource Curation:

**Endpoints Already Exist:**
- `GET /api/communities/[slug]/resources` - List resources
- `POST /api/communities/[slug]/resources` - Upload (curator only)
- `DELETE /api/communities/[slug]/resources/[resourceId]` - Delete (curator only)

**Build:**
1. Resources gallery with filtering/search
2. Upload resource modal
3. Resource detail/preview
4. Delete confirmation

#### Week 4 - Polish & Testing:

- Mobile responsiveness for all curator views
- Test permission checks (verify non-curators can't access)
- Gather feedback from pilot curators (10 DOC in Boston)
- Optimize performance (large communities with 100+ members)

**Next Sync:** Friday Sep 13 - Share curator dashboard wireframes

---

## 📋 Endpoint Reference (All Ready for Wiring)

### Authentication
All endpoints require: `Authorization: Bearer {nextauth_session}`

### Discussions
```
GET    /api/communities/[slug]/discussions?limit=20&offset=0&sort=recent
POST   /api/communities/[slug]/discussions
GET    /api/communities/[slug]/discussions/[discussionId]
PATCH  /api/communities/[slug]/discussions/[discussionId]
DELETE /api/communities/[slug]/discussions/[discussionId]
```

### Messages
```
GET    /api/communities/[slug]/discussions/[discussionId]/messages?limit=50&offset=0
POST   /api/communities/[slug]/discussions/[discussionId]/messages
DELETE /api/communities/[slug]/discussions/[discussionId]/messages/[messageId]
```

### Meetings
```
GET    /api/communities/[slug]/meetings?limit=20&offset=0&sort=upcoming
POST   /api/communities/[slug]/meetings
GET    /api/communities/[slug]/meetings/[meetingId]
PATCH  /api/communities/[slug]/meetings/[meetingId]
DELETE /api/communities/[slug]/meetings/[meetingId]
```

### User Profile & Dashboard
```
GET    /api/me/profile
PATCH  /api/me/profile
GET    /api/me/dashboard
```

### Curator Dashboard
```
GET    /api/communities/[slug]/stats (curator only)
```

### Existing (Already Wired)
```
GET    /api/communities
GET    /api/communities/[slug]
GET    /api/communities/[slug]/members
POST   /api/communities/[slug]/members
GET    /api/communities/[slug]/resources
POST   /api/communities/[slug]/resources
```

---

## ✅ What T1 Guarantees

- All endpoints **live on Vercel** (auto-deployed from main)
- **Type-safe**: Full TypeScript support
- **Error handling**: Proper 400/401/403/404/500 responses
- **Pagination**: All list endpoints support limit/offset
- **Authorization**: Proper permission checks on all endpoints
- **Database**: Migrations applied, indexes optimized
- **Documentation**: JSDoc comments in all route files

---

## 🤝 Coordination Rules

**Weekly Sync: Every Friday at [TBD]**

**T2 Reports:**
- "Wired [X] pages, blocking issues: [list]"
- "Ready to wire: [next pages]"

**T3 Reports:**
- "API wrapper tested: [endpoints verified]"
- "Real-time working for: [features]"
- "Blocking issues: [list]"

**T4 Reports:**
- "Curator dashboard % complete: [X%]"
- "Ready to test with pilots: Yes/No"
- "Blocking issues: [list]"

**Blocker Protocol:**
- Any blocker reported on Friday sync = T1 fixes by Tuesday
- T1 pushes fix to main branch → auto-deploys to Vercel
- T2/T3/T4 tests fix and reports back by Wednesday

---

## 🎓 Quick Integration Checklist

**For T2:**
- [ ] GET /api/communities wired to communities list
- [ ] GET /api/communities/[slug] wired to community header
- [ ] GET /api/communities/[slug]/discussions wired to feed
- [ ] POST /api/communities/[slug]/discussions wired to form
- [ ] GET/POST messages wired to thread
- [ ] GET/POST meetings wired to calendar

**For T3:**
- [ ] All 9 endpoints tested with API wrapper
- [ ] Custom hooks created for common patterns
- [ ] Supabase subscriptions tested (start with discussions)
- [ ] Presence tracking tested

**For T4:**
- [ ] GET /api/communities/[slug]/stats wired to dashboard
- [ ] Engagement cards displaying correctly
- [ ] Member management wired
- [ ] Resource gallery wired
- [ ] Curator permissions verified

---

## 🚀 Go-Live Checklist (Week 4)

**T1:**
- [ ] Bug fixes from testing
- [ ] Performance profiling complete
- [ ] Error monitoring (Sentry) configured

**T2:**
- [ ] All pages wired and tested
- [ ] Mobile responsiveness verified (375px+)
- [ ] Loading/error states polished

**T3:**
- [ ] Real-time updates working for all features
- [ ] Presence tracking live
- [ ] Notification system integrated

**T4:**
- [ ] Curator dashboard complete
- [ ] Member management tested
- [ ] Resource curation workflow tested

**Pilot Group Testing:**
- [ ] 10 DOC sign up and test
- [ ] Feedback gathered
- [ ] Critical bugs fixed
- [ ] Ready for public beta

---

## 📞 Quick Links

- **T1 Completion Report:** `POLYMATH_T1_WEEK1_COMPLETION.md`
- **API Routes:** `app/api/communities/[slug]/discussions/`, `meetings/`, `stats/`, `app/api/me/`
- **T3 Wrapper:** `lib/polymath-api.ts` (20+ functions)
- **T3 Hooks:** `hooks/usePolymath.ts`, `hooks/useRealtimeSubscription.ts`
- **T2 Components:** `app/components/polymath/`
- **T4 Curriculum:** `app/polymath/curriculum/`

---

**Status: READY TO LAUNCH WEEK 2** 🚀

T1 has done its job. T2/T3/T4 can now execute with confidence knowing all backend infrastructure is production-ready.
