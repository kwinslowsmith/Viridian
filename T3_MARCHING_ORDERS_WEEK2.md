# T3 Integration - Week 2 Marching Orders

**Date:** September 11, 2026  
**Owner:** T3 Integration Agent  
**Status:** Ready to execute  
**Timeline:** September 13-20, 2026  

---

## 🎯 Mission

Verify all T1 API endpoints work correctly and wire T2 components to the backend using your custom hooks and API wrapper functions.

---

## 📋 Priority 1 - API Integration Testing (Sep 13-16)

### Phase 1: Manual Endpoint Verification

**Objective:** Test all 9 endpoints manually to verify request/response contracts

**Tools Needed:**
- Postman, Insomnia, or curl
- Auth token from NextAuth session (copy from browser DevTools)

**Test Each Endpoint:**

#### 1. GET /api/communities/[slug]/discussions

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_SESSION" \
  "http://localhost:3000/api/communities/boston-curriculum/discussions?limit=5&sort=recent"
```

**Expected Response:**
```json
{
  "discussions": [
    {
      "id": "cuid...",
      "type": "community",
      "communityId": "community-id",
      "title": "Discussion Title",
      "createdBy": { "id", "name", "email" },
      "isPinned": false,
      "lastMessageAt": "2026-09-11T14:30:00Z",
      "_count": { "messages": 5, "participants": 3 }
    }
  ],
  "total": 10,
  "limit": 5,
  "offset": 0,
  "hasMore": true
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] Response has all fields shown above
- [ ] Message counts are correct
- [ ] Pagination info (total, hasMore) is correct
- [ ] Sort order is correct (recent first)

---

#### 2. POST /api/communities/[slug]/discussions

**Request:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Discussion", "content": "Test message"}' \
  "http://localhost:3000/api/communities/boston-curriculum/discussions"
```

**Expected Response:**
```json
{
  "id": "new-discussion-id",
  "type": "community",
  "communityId": "...",
  "title": "Test Discussion",
  "createdBy": { "id", "name", "email" },
  "isPinned": false,
  "createdAt": "2026-09-11T14:30:00Z",
  "updatedAt": "2026-09-11T14:30:00Z",
  "_count": { "messages": 1, "participants": 1 }
}
```

**Verification Checklist:**
- [ ] Response status is 201 (Created)
- [ ] New discussion ID is generated
- [ ] Current user is the creator
- [ ] Message count is 1 (from content)
- [ ] Timestamps are set

---

#### 3. GET /api/communities/[slug]/discussions/[discussionId]/messages

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_SESSION" \
  "http://localhost:3000/api/communities/boston-curriculum/discussions/{discussionId}/messages?limit=10&offset=0"
```

**Expected Response:**
```json
{
  "messages": [
    {
      "id": "msg-id",
      "conversationId": "discussion-id",
      "senderId": "user-id",
      "sender": { "id", "name", "email" },
      "content": "Message text",
      "googleDocUrl": null,
      "createdAt": "2026-09-11T14:30:00Z",
      "updatedAt": "2026-09-11T14:30:00Z"
    }
  ],
  "total": 3,
  "limit": 10,
  "offset": 0,
  "hasMore": false
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] Messages are in chronological order (oldest first)
- [ ] Sender details are populated
- [ ] Timestamps are ISO format
- [ ] Pagination works

---

#### 4. POST /api/communities/[slug]/discussions/[discussionId]/messages

**Request:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test reply message"}' \
  "http://localhost:3000/api/communities/boston-curriculum/discussions/{discussionId}/messages"
```

**Expected Response:**
```json
{
  "id": "new-message-id",
  "conversationId": "discussion-id",
  "senderId": "your-user-id",
  "sender": { "id", "name", "email" },
  "content": "Test reply message",
  "createdAt": "2026-09-11T14:35:00Z",
  "updatedAt": "2026-09-11T14:35:00Z"
}
```

**Verification Checklist:**
- [ ] Response status is 201
- [ ] Message ID is generated
- [ ] Your user ID is the sender
- [ ] Content is stored correctly
- [ ] Conversation lastMessageAt is updated (verify by GET discussion)

---

#### 5. PATCH /api/communities/[slug]/discussions/[discussionId]

**Request (Pin):**
```bash
curl -X PATCH -H "Authorization: Bearer YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{"isPinned": true}' \
  "http://localhost:3000/api/communities/boston-curriculum/discussions/{discussionId}"
```

**Expected Response:**
```json
{
  "id": "discussion-id",
  "isPinned": true,
  ...
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] isPinned is toggled
- [ ] Only works for creator or curator (test as different user)

---

#### 6. GET /api/communities/[slug]/meetings

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_SESSION" \
  "http://localhost:3000/api/communities/boston-curriculum/meetings?sort=upcoming&limit=5"
```

**Expected Response:**
```json
{
  "meetings": [
    {
      "id": "meeting-id",
      "communityId": "...",
      "title": "October Curriculum Review",
      "description": "...",
      "scheduledAt": "2026-10-15T18:00:00Z",
      "zoomUrl": "https://...",
      "location": null,
      "host": { "id", "name", "email" },
      "notes": null,
      "recordingUrl": null,
      "createdAt": "2026-09-11T14:30:00Z",
      "updatedAt": "2026-09-11T14:30:00Z"
    }
  ],
  "total": 2,
  "limit": 5,
  "offset": 0,
  "hasMore": false
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] Meetings are sorted by scheduledAt (earliest first)
- [ ] Host details are populated
- [ ] Zoom URL is included
- [ ] Pagination works

---

#### 7. POST /api/communities/[slug]/meetings (Curator Only)

**Request:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "description": "Test meeting description",
    "scheduledAt": "2026-10-20T18:00:00Z",
    "zoomUrl": "https://zoom.us/j/...",
    "location": "Room 101"
  }' \
  "http://localhost:3000/api/communities/boston-curriculum/meetings"
```

**Expected Response:**
```json
{
  "id": "new-meeting-id",
  "communityId": "...",
  "title": "Test Meeting",
  "scheduledAt": "2026-10-20T18:00:00Z",
  "host": { "id": "your-user-id", "name", "email" },
  ...
}
```

**Verification Checklist:**
- [ ] Response status is 201
- [ ] New meeting ID is generated
- [ ] You are the host
- [ ] Fails with 403 if you're not curator (test as member)
- [ ] Fails with 400 if title/scheduledAt missing

---

#### 8. GET /api/me/profile

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_SESSION" \
  "http://localhost:3000/api/me/profile"
```

**Expected Response:**
```json
{
  "id": "your-user-id",
  "name": "Your Name",
  "email": "your@email.com",
  "role": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "curatedCommunities": [
    { "id", "name", "slug" }
  ],
  "learningCommunityMemberships": [
    { "id", "role", "community": { "id", "name", "slug" } }
  ]
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] Your profile data is correct
- [ ] Curated communities list is accurate
- [ ] Memberships include all communities you're in

---

#### 9. GET /api/communities/[slug]/stats (Curator Only)

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_SESSION" \
  "http://localhost:3000/api/communities/boston-curriculum/stats"
```

**Expected Response:**
```json
{
  "community": { "id", "name", "slug" },
  "stats": {
    "memberCount": 12,
    "discussionCount": 5,
    "messageCount": 42,
    "resourceCount": 3,
    "meetingCount": 2,
    "upcomingMeetingCount": 1
  },
  "engagement": {
    "thisMonthMessages": 42,
    "lastMonthMessages": 28,
    "growth": "50.0"
  },
  "recentMembers": [...],
  "recentDiscussions": [...],
  "topContributors": [...]
}
```

**Verification Checklist:**
- [ ] Response status is 200
- [ ] Stats are accurate (verify counts match GET endpoints)
- [ ] Fails with 403 if you're not curator
- [ ] Growth % calculation is correct

---

### Phase 2: Create/Update Hook Tests

**Objective:** Test POST/PATCH/DELETE operations and verify data updates

**File:** Create test file `lib/polymath-api-test.ts`

**Test Suite:**

```typescript
// Test: Create → Read → Verify
export async function testCreateDiscussion(slug: string) {
  // 1. Create
  const newDiscussion = await createDiscussion(slug, {
    title: `Test ${Date.now()}`,
    content: "Test content"
  });
  console.log('Created:', newDiscussion);
  
  // 2. Read
  const fetched = await getDiscussion(slug, newDiscussion.id);
  console.log('Fetched:', fetched);
  
  // 3. Verify
  if (fetched.title !== newDiscussion.title) {
    throw new Error('Title mismatch');
  }
  
  // 4. Cleanup (delete)
  await deleteDiscussion(slug, newDiscussion.id);
  console.log('Deleted successfully');
}

// Test: Create message → Verify lastMessageAt updated
export async function testCreateMessage(slug: string, discussionId: string) {
  const beforeUpdate = await getDiscussion(slug, discussionId);
  const before = new Date(beforeUpdate.lastMessageAt);
  
  const message = await createMessage(slug, discussionId, {
    content: "Test message"
  });
  
  const afterUpdate = await getDiscussion(slug, discussionId);
  const after = new Date(afterUpdate.lastMessageAt);
  
  if (after <= before) {
    throw new Error('lastMessageAt was not updated');
  }
}

// Test: Pin discussion
export async function testPinDiscussion(slug: string, discussionId: string) {
  const before = await getDiscussion(slug, discussionId);
  
  const updated = await updateDiscussion(slug, discussionId, {
    isPinned: !before.isPinned
  });
  
  if (updated.isPinned === before.isPinned) {
    throw new Error('isPinned was not toggled');
  }
}

// Run all tests
export async function runAllTests(slug: string, discussionId: string) {
  console.log('Starting API integration tests...');
  
  try {
    await testCreateDiscussion(slug);
    console.log('✅ testCreateDiscussion passed');
    
    await testCreateMessage(slug, discussionId);
    console.log('✅ testCreateMessage passed');
    
    await testPinDiscussion(slug, discussionId);
    console.log('✅ testPinDiscussion passed');
    
    console.log('🎉 All tests passed!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}
```

**Run Tests:**
```typescript
// Add to your page or component:
useEffect(() => {
  const runTests = async () => {
    await runAllTests('boston-curriculum', 'test-discussion-id');
  };
  runTests();
}, []);
```

---

## 📋 Priority 2 - Hook Integration (Sep 17-18)

### Task 1: Verify Custom Hooks Work

**File:** `hooks/usePolymath.ts` (created by T3 earlier)

**Test Each Hook:**

```typescript
// Test useCommunityDiscussions hook
function TestDiscussions() {
  const { discussions, loading, error, refetch } = useCommunityDiscussions('boston-curriculum');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Discussions ({discussions.length})</h2>
      {discussions.map(d => (
        <div key={d.id}>{d.title}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

**Verification Checklist:**
- [ ] Hook fetches data on mount
- [ ] Loading state shows first
- [ ] Data displays after fetch completes
- [ ] Error state shows if fetch fails
- [ ] Refetch works (click button, data refreshes)

**Create Test Components for:**
- [ ] useCommunities
- [ ] useCommunityResources
- [ ] useCommunityMeetings
- [ ] useUserProfile
- [ ] useUserDashboard
- [ ] useCreateDiscussion (mutation hook)
- [ ] useCreateMessage (mutation hook)
- [ ] useScheduleMeeting (mutation hook)

**Test File:** `app/polymath/test-hooks/page.tsx`

---

### Task 2: Wire T2 Components to Hooks

**Coordinate with T2 Frontend:**

For each T2 page being wired:
1. T2 builds the component structure (loading, error, UI)
2. T3 replaces mock data with hook calls
3. T3 verifies real data displays
4. T3 tests error handling

**Example for Communities List:**

Before (T2):
```typescript
const [communities] = useState(MOCK_COMMUNITIES);
```

After (T3):
```typescript
const { communities, loading, error } = useCommunities();
```

**Pages to Wire:**
- [ ] Communities list
- [ ] Community dashboard
- [ ] Discussions list
- [ ] Discussion thread
- [ ] Meetings list
- [ ] Curator stats dashboard (T4)

---

## 📋 Priority 3 - Real-Time Preparation (Sep 19-20)

### Phase 1: Set Up Supabase Realtime Subscriptions

**Objective:** Create hooks for real-time updates (you created the templates, now test)

**File:** `hooks/useRealtimeSubscription.ts` (update existing)

**Test Realtime Discussions Hook:**

```typescript
export function useDiscussionsRealtime(slug: string, communityId: string) {
  const [discussions, setDiscussions] = useState([]);
  
  useEffect(() => {
    // Fetch initial data
    fetchDiscussions(slug).then(setDiscussions);
    
    // Subscribe to changes
    const channel = supabase
      .channel(`discussions-${communityId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Conversation',
        filter: `communityId=eq.${communityId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDiscussions(d => [...d, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setDiscussions(d => 
            d.map(x => x.id === payload.new.id ? payload.new : x)
          );
        } else if (payload.eventType === 'DELETE') {
          setDiscussions(d => d.filter(x => x.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => channel.unsubscribe();
  }, [slug, communityId]);
  
  return discussions;
}
```

**Test:**
1. Open 2 browser windows (same discussion)
2. Create new message in window 1
3. Verify message appears in window 2 within 1 second

---

### Phase 2: Plan Real-Time Architecture

**Channels to Subscribe:**

1. **Discussions Channel** 
   - Table: Conversation
   - Filter: `type='community'` AND `communityId=xxx`
   - Events: INSERT (new discussion), UPDATE (pin/unpin), DELETE

2. **Messages Channel**
   - Table: Message
   - Filter: `conversationId=xxx`
   - Events: INSERT (new message), DELETE

3. **Meetings Channel**
   - Table: PolymathMeeting
   - Filter: `communityId=xxx`
   - Events: INSERT (new meeting), UPDATE (notes/recording), DELETE

4. **Members Channel**
   - Table: LearningCommunityMember
   - Filter: `communityId=xxx`
   - Events: INSERT (new member joined), DELETE (member left)

**Document:**
- [ ] Channel naming convention: `<resource>-<id>`
- [ ] Filter syntax for each table
- [ ] Event handling logic
- [ ] Error recovery (reconnect, re-sync)

---

## 🧪 Test Scenarios

**By Friday Sep 20, you should be able to:**

### Test 1: Full Discussion Creation Flow
1. Create new discussion via POST
2. List discussions via GET (new one appears)
3. Post message to discussion via POST
4. List messages via GET (new message appears)
5. Pin discussion via PATCH
6. Verify pinned status reflected in list

### Test 2: Meeting Scheduling Flow
1. Schedule new meeting via POST (curator only)
2. List meetings via GET (new one appears in upcoming)
3. Update meeting with notes via PATCH
4. Delete meeting via DELETE
5. Verify removal from list

### Test 3: Authorization Testing
1. Try POST as non-member → 403
2. Try POST discussion message as member → 200 (should work)
3. Try DELETE others' message as non-curator → 403
4. Try DELETE own message as author → 200
5. Try schedule meeting as non-curator → 403

### Test 4: Pagination Testing
1. Create 50+ discussions
2. GET with limit=10 → verify returns 10
3. GET with offset=10 → verify different results
4. GET with hasMore → verify true if more data

---

## 📊 Completion Checklist - Week 2

**By Friday Sep 20:**

**API Testing:**
- [ ] All 9 endpoints manually tested
- [ ] Request/response contracts verified
- [ ] Error cases tested (400, 403, 404, 500)
- [ ] Authorization checks working
- [ ] Pagination working

**Hook Integration:**
- [ ] All custom hooks tested
- [ ] Hooks wired to T2 components
- [ ] Real data loading in T2 pages
- [ ] Error handling working in T2

**Real-Time Prep:**
- [ ] Supabase realtime subscriptions created (draft)
- [ ] Event handling logic planned
- [ ] Channel architecture documented

---

## 🚀 Friday Sep 20 Sync Report

**Report Template:**
```
T3 Integration - Week 2 Completion Report

API TESTING:
- All 9 endpoints tested: ✅ Yes
- Passed manual testing: ✅ Yes
- Authorization checks verified: ✅ Yes
- Pagination verified: ✅ Yes

HOOK INTEGRATION:
- Custom hooks working: ✅ Yes
- T2 components wired: ✅ [X/6 pages]
- Real data loading: ✅ Yes
- Error handling: ✅ Yes

REAL-TIME PREP:
- Subscriptions drafted: ✅ Yes
- Channel architecture: ✅ Documented
- Ready for Week 3: ✅ Yes

BLOCKING ISSUES:
[List any API mismatches or issues found]

READY FOR WEEK 3:
- Real-time implementation
- Live updates for discussions/messages
- Presence tracking
```

---

## 💡 Tips

**Debugging API Calls:**
```typescript
// Add this to see all API calls
window.fetch = function(...args) {
  console.log('API Call:', args[0], args[1]);
  return fetch(...args);
};
```

**Testing Authorization:**
1. Open DevTools → Application → Cookies
2. Find NextAuth session cookie
3. Copy and use in curl/Postman with `-H "Authorization: Bearer TOKEN"`

**Real-Time Testing:**
1. Open Supabase dashboard
2. Go to Realtime → Inspect messages
3. See events as they happen

---

## 📞 Questions?

- Check T1 API files for endpoint details
- Review T3_INTEGRATION_GUIDE.md for patterns
- Ask T1 on Friday sync if API behavior unclear

---

**GO TEST & WIRE IT** 🧪
