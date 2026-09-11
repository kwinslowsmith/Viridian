# T2 Frontend - Week 2 Marching Orders

**Date:** September 11, 2026  
**Owner:** T2 Frontend Agent  
**Status:** Ready to execute  
**Timeline:** September 13-20, 2026  

---

## 🎯 Mission

Wire all Polymath frontend components to T1's 9 live API endpoints. By Friday Sep 20, all major pages should fetch real data from the backend.

---

## 📋 Priority 1 - Wire Core Pages (Sep 13-16)

### Task 1: Communities List Page → GET /api/communities

**File:** `app/polymath/communities/page.tsx`

**Current State:**
- Page exists with mock data
- Components: community grid, filter dropdowns, search box, pagination

**What to Do:**
1. Import `useEffect` and `useState`
2. Add state for: `communities`, `loading`, `error`, `filters`, `pagination`
3. Fetch endpoint: `GET /api/communities?scope=${filters.scope}&topic=${filters.topic}&search=${search}&limit=20&offset=${offset}`
4. Handle response: `{ communities, total, hasMore }`
5. Implement pagination: update `offset` state when user clicks "Next"
6. Show loading spinner while fetching
7. Show error message if fetch fails
8. Show empty state if no communities

**Code Skeleton:**
```typescript
const [communities, setCommunities] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [offset, setOffset] = useState(0);
const limit = 20;

useEffect(() => {
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        scope: filters.scope,
        topic: filters.topic,
        search: searchQuery,
      });
      const response = await fetch(`/api/communities?${params}`);
      if (!response.ok) throw new Error('Failed to fetch communities');
      const data = await response.json();
      setCommunities(data.communities);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchCommunities();
}, [offset, filters, searchQuery]);
```

**Test Checklist:**
- [ ] Page loads with real communities
- [ ] Pagination works (Next/Prev buttons)
- [ ] Filters work (scope, topic)
- [ ] Search works (query string)
- [ ] Loading spinner shows while fetching
- [ ] Error message shows if API fails
- [ ] Empty state shows if no communities

**Acceptance Criteria:** ✅ Real communities loading on page

---

### Task 2: Community Dashboard → GET /api/communities/[slug]

**File:** `app/polymath/communities/[slug]/page.tsx`

**Current State:**
- Page exists with component layout
- Displays: community header, member count, resources, discussions, meetings sections

**What to Do:**
1. Extract `slug` from route params
2. Fetch: `GET /api/communities/${slug}`
3. Response includes: curator info, member count, modules list
4. Update header with: community name, description, cover image, curator name
5. Update member count display
6. Fetch discussions list separately: `GET /api/communities/${slug}/discussions?limit=5`
7. Fetch meetings separately: `GET /api/communities/${slug}/meetings?limit=5&sort=upcoming`
8. Combine all data in dashboard

**Code Skeleton:**
```typescript
const { slug } = params;
const [community, setCommunity] = useState(null);
const [discussions, setDiscussions] = useState([]);
const [meetings, setMeetings] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const [commRes, discRes, meetRes] = await Promise.all([
        fetch(`/api/communities/${slug}`),
        fetch(`/api/communities/${slug}/discussions?limit=5`),
        fetch(`/api/communities/${slug}/meetings?limit=5&sort=upcoming`),
      ]);
      
      const commData = await commRes.json();
      const discData = await discRes.json();
      const meetData = await meetRes.json();
      
      setCommunity(commData);
      setDiscussions(discData.discussions);
      setMeetings(meetData.meetings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [slug]);
```

**Test Checklist:**
- [ ] Community header displays correct name/description
- [ ] Member count is accurate
- [ ] Recent discussions load
- [ ] Recent meetings load (upcoming first)
- [ ] All data is from real API, not mocked

**Acceptance Criteria:** ✅ Dashboard shows real community data

---

### Task 3: Discussions List → GET /api/communities/[slug]/discussions

**File:** `app/polymath/communities/[slug]/discussions/page.tsx`

**Current State:**
- Page exists with discussion cards
- Features: sorting (recent/oldest/pinned), pagination

**What to Do:**
1. Add sort state: `sort` ("recent" | "oldest" | "pinned")
2. Fetch: `GET /api/communities/${slug}/discussions?sort=${sort}&limit=20&offset=${offset}`
3. Response: `{ discussions[], total, hasMore }`
4. Each discussion shows: title, author name, message count, last message time, pin status
5. Implement pagination
6. Implement sort buttons (Recent / Oldest / Pinned)

**Code Skeleton:**
```typescript
const [discussions, setDiscussions] = useState([]);
const [sort, setSort] = useState('recent');
const [offset, setOffset] = useState(0);

useEffect(() => {
  const fetchDiscussions = async () => {
    const response = await fetch(
      `/api/communities/${slug}/discussions?sort=${sort}&limit=20&offset=${offset}`
    );
    const data = await response.json();
    setDiscussions(data.discussions);
  };
  fetchDiscussions();
}, [slug, sort, offset]);
```

**Test Checklist:**
- [ ] Discussions load with real data
- [ ] Sort by Recent works
- [ ] Sort by Oldest works
- [ ] Sort by Pinned works (pinned first)
- [ ] Pagination works
- [ ] Message counts are accurate

**Acceptance Criteria:** ✅ Discussion feed shows real data

---

### Task 4: Discussion Thread → GET /api/communities/[slug]/discussions/[discussionId]/messages

**File:** `app/polymath/communities/[slug]/discussions/[discussionId]/page.tsx`

**Current State:**
- Page exists with message thread layout
- Shows discussion title and message cards

**What to Do:**
1. Extract `discussionId` from route params
2. Fetch discussion: `GET /api/communities/${slug}/discussions/${discussionId}`
3. Fetch messages: `GET /api/communities/${slug}/discussions/${discussionId}/messages?limit=50&offset=${offset}`
4. Messages are in chronological order (oldest first)
5. Each message shows: sender name, content, timestamp
6. Implement "Load More" at bottom (pagination)
7. Auto-scroll to latest message on load

**Code Skeleton:**
```typescript
const [discussion, setDiscussion] = useState(null);
const [messages, setMessages] = useState([]);
const [offset, setOffset] = useState(0);

useEffect(() => {
  const fetchThread = async () => {
    const [discRes, msgRes] = await Promise.all([
      fetch(`/api/communities/${slug}/discussions/${discussionId}`),
      fetch(`/api/communities/${slug}/discussions/${discussionId}/messages?limit=50`),
    ]);
    
    const discData = await discRes.json();
    const msgData = await msgRes.json();
    
    setDiscussion(discData);
    setMessages(msgData.messages);
  };
  
  fetchThread();
}, [slug, discussionId]);
```

**Test Checklist:**
- [ ] Discussion title and details display
- [ ] Messages load in chronological order
- [ ] Sender names are accurate
- [ ] Timestamps display correctly
- [ ] "Load More" button works
- [ ] Page scrolls to latest message

**Acceptance Criteria:** ✅ Discussion thread shows real messages

---

### Task 5: Meetings Calendar → GET /api/communities/[slug]/meetings

**File:** `app/polymath/communities/[slug]/meetings/page.tsx`

**Current State:**
- Page exists with meetings list/calendar view
- Has tabs: Upcoming / Past

**What to Do:**
1. Implement two tabs: Upcoming and Past
2. Tab 1 (Upcoming): Fetch `GET /api/communities/${slug}/meetings?sort=upcoming&limit=20`
   - Filter: `scheduledAt >= now`
   - Sort: earliest first
3. Tab 2 (Past): Fetch `GET /api/communities/${slug}/meetings?sort=past&limit=20`
   - Filter: `scheduledAt < now`
   - Sort: most recent first
4. Each meeting shows: title, date/time, host name, Zoom URL (if available)
5. Implement pagination on both tabs

**Code Skeleton:**
```typescript
const [tab, setTab] = useState('upcoming');
const [meetings, setMeetings] = useState([]);

useEffect(() => {
  const fetchMeetings = async () => {
    const response = await fetch(
      `/api/communities/${slug}/meetings?sort=${tab}&limit=20`
    );
    const data = await response.json();
    setMeetings(data.meetings);
  };
  fetchMeetings();
}, [slug, tab]);
```

**Test Checklist:**
- [ ] Upcoming tab shows future meetings
- [ ] Past tab shows previous meetings
- [ ] Dates are formatted correctly
- [ ] Host names display
- [ ] Zoom URLs are clickable
- [ ] Pagination works on both tabs

**Acceptance Criteria:** ✅ Meetings display correctly sorted by date

---

## 📋 Priority 2 - Wire Forms (Sep 17-18)

### Task 6: Create Discussion Modal → POST /api/communities/[slug]/discussions

**File:** `app/components/polymath/CreateDiscussionModal.tsx`

**Current State:**
- Modal exists with form (title, content inputs)
- Has "Create" button

**What to Do:**
1. Add state: `loading`, `error`, `success`
2. Form validation: title required, content optional
3. On submit:
   ```typescript
   const response = await fetch(`/api/communities/${slug}/discussions`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title, content })
   });
   ```
4. Handle response: `{ id, title, createdBy, ... }`
5. On success: close modal, refetch discussions list, show success message
6. On error: show error message, keep modal open

**Test Checklist:**
- [ ] Form validation works (title required)
- [ ] POST request sent correctly
- [ ] New discussion appears in list immediately after
- [ ] Modal closes on success
- [ ] Error message shows on failure
- [ ] Loading spinner shows during submission

**Acceptance Criteria:** ✅ Can create new discussion via form

---

### Task 7: Post Message Modal → POST /api/communities/[slug]/discussions/[discussionId]/messages

**File:** `app/polymath/communities/[slug]/discussions/[discussionId]/page.tsx` (message input form)

**Current State:**
- Text input for new message
- Send button

**What to Do:**
1. On submit:
   ```typescript
   const response = await fetch(
     `/api/communities/${slug}/discussions/${discussionId}/messages`,
     {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ content: message })
     }
   );
   ```
2. Handle response: new message object
3. On success: 
   - Clear input field
   - Add message to thread immediately
   - Scroll to bottom
4. On error: show error message

**Test Checklist:**
- [ ] Message input validation
- [ ] POST request sent correctly
- [ ] Message appears in thread immediately
- [ ] Input clears after send
- [ ] Scrolls to new message
- [ ] Error shows on failure

**Acceptance Criteria:** ✅ Can post messages to discussion thread

---

### Task 8: Schedule Meeting Modal → POST /api/communities/[slug]/meetings

**File:** `app/components/polymath/ScheduleMeetingModal.tsx`

**Current State:**
- Modal exists with form (title, date, time, Zoom URL inputs)
- Has "Schedule" button

**What to Do:**
1. Form fields: title (required), description (optional), scheduledAt (required), zoomUrl (optional), location (optional)
2. Convert date/time inputs to ISO string: `new Date(date + 'T' + time).toISOString()`
3. On submit:
   ```typescript
   const response = await fetch(`/api/communities/${slug}/meetings`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       title,
       description,
       scheduledAt: scheduledAtISO,
       zoomUrl,
       location
     })
   });
   ```
4. On success: close modal, refetch meetings, show success
5. On error: show error message

**Test Checklist:**
- [ ] Title is required
- [ ] Date/time validation
- [ ] ISO date conversion works
- [ ] POST request sent correctly
- [ ] New meeting appears in list
- [ ] Modal closes on success

**Acceptance Criteria:** ✅ Can schedule new meeting via form

---

### Task 9: Update/Delete Actions

**Files:** 
- Discussion card (pin, delete icons)
- Meeting card (edit, delete icons)
- Message card (delete icon for own messages)

**What to Do:**

**Pin Discussion:**
```typescript
const pinDiscussion = async (discussionId) => {
  await fetch(`/api/communities/${slug}/discussions/${discussionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isPinned: true })
  });
  // Refetch discussions
};
```

**Delete Discussion:**
```typescript
const deleteDiscussion = async (discussionId) => {
  await fetch(`/api/communities/${slug}/discussions/${discussionId}`, {
    method: 'DELETE'
  });
  // Refetch discussions
};
```

**Similar patterns for:** Delete message, Delete meeting, Update meeting (notes)

**Test Checklist:**
- [ ] Pin icon toggles discussion pin status
- [ ] Delete shows confirmation before deleting
- [ ] Delete removes from list
- [ ] Only shows for own messages/creator/curator
- [ ] Updates appear immediately

**Acceptance Criteria:** ✅ All CRUD operations work

---

## 📊 Completion Checklist - Week 2

**By Friday Sep 20:**

- [ ] Task 1: Communities list wired + tested
- [ ] Task 2: Community dashboard wired + tested
- [ ] Task 3: Discussions list wired + tested
- [ ] Task 4: Discussion thread wired + tested
- [ ] Task 5: Meetings list wired + tested
- [ ] Task 6: Create discussion form wired + tested
- [ ] Task 7: Post message form wired + tested
- [ ] Task 8: Schedule meeting form wired + tested
- [ ] Task 9: Update/delete actions wired + tested

**Quality Checklist:**
- [ ] All pages show loading spinner during fetch
- [ ] All errors handled gracefully with error messages
- [ ] All forms have validation
- [ ] Empty states show when no data
- [ ] Pagination works on all list pages
- [ ] Mobile responsive (375px+)
- [ ] No hardcoded mock data (all from API)

---

## 🚀 Friday Sep 20 Sync Report

**Report Template:**
```
T2 Frontend - Week 2 Completion Report

COMPLETED:
- Communities list: ✅ Wired
- Community dashboard: ✅ Wired
- Discussions list: ✅ Wired
- Discussion thread: ✅ Wired
- Meetings list: ✅ Wired
- Forms: ✅ All 4 wired
- Update/Delete: ✅ Wired

TESTING STATUS:
- Real data loading: ✅ Yes
- Loading states: ✅ Yes
- Error handling: ✅ Yes
- Pagination: ✅ Yes

BLOCKING ISSUES:
[List any issues or API mismatch discovered]

READY FOR:
- T3 real-time wiring
- T4 curator dashboard testing
- Pilot group testing
```

---

## 💡 Tips & Tricks

**Avoid Common Mistakes:**
1. Don't hardcode `offset=0` - use state variable
2. Don't forget to handle `hasMore` - use for "Load More" button
3. Don't assume user is authenticated - handle 401 errors
4. Don't forget loading state - show spinner while fetching
5. Don't forget error state - show user-friendly messages

**Performance Tips:**
1. Use `useCallback` for memoized fetch functions
2. Debounce search input (wait 300ms after user stops typing)
3. Don't refetch on every render - use dependency arrays correctly
4. Cancel fetch if component unmounts to avoid memory leak

**Testing Tips:**
1. Test with slow network (DevTools throttle)
2. Test with errors (kill API, see error handling)
3. Test with empty data (no communities, no messages)
4. Test with large data (100+ discussions)
5. Test pagination (test offset/limit combinations)

---

## 📞 Questions?

- Check endpoint docs in `POLYMATH_WEEK1_HANDOFF_TO_T234.md`
- Check T1 API files: `app/api/communities/[slug]/discussions/route.ts`
- Ask T1 on Friday sync if endpoint behavior is unclear

---

**GO WIRE IT** 🎯
