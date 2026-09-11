# T3 Integration Guide: Wiring Frontend to Backend

**Date Created:** 2026-09-11  
**Status:** Week 2 - Integration Phase Started  
**Target Completion:** 2026-09-25 (All Priority 1 & 2 pages wired)

---

## Overview

T3's job is to wire the Polymath frontend (T2 components) to the backend APIs (T1 endpoints) and add real-time sync with Supabase.

**Timeline:**
- **Week 2 (Sep 11-18):** Wire Priority 1 pages + create integration patterns
- **Week 3 (Sep 18-25):** Wire Priority 2 pages + add real-time sync
- **Week 4 (Sep 25-Oct 2):** Polish, optimize, end-to-end testing

---

## Files Created (Week 1 Prep)

1. **`lib/polymath-api.ts`** — API wrapper functions
   - 20+ functions for all API endpoints
   - Consistent error handling
   - TypeScript interfaces for all response types

2. **`hooks/usePolymath.ts`** — Custom React hooks
   - `useCommunities()` — List all communities
   - `useCommunity(slug)` — Fetch single community
   - `useCreateCommunity()` — Create community
   - `useCommunityResources(slug)` — Fetch resources
   - `useCreateResource(slug)` — Upload resource
   - `useCommunityDiscussions(slug)` — Fetch discussions
   - `useCreateDiscussion(slug)` — Start discussion
   - `useDiscussionMessages(slug, discussionId)` — Fetch thread
   - `usePostMessage(slug, discussionId)` — Post message
   - `useCommunityMeetings(slug)` — Fetch meetings
   - `useCreateMeeting(slug)` — Schedule meeting
   - `useCuratorStats(slug)` — Fetch curator dashboard stats
   - `useMyProfile()` — Fetch user profile
   - `useMyDashboard()` — Fetch my dashboard

3. **`hooks/useRealtimeSubscription.ts`** — Real-time sync hooks
   - `useResourcesRealtime(communityId)` — Live resource updates
   - `useDiscussionMessagesRealtime(discussionId)` — Live message updates
   - `useDiscussionsRealtime(communityId)` — Live discussion updates
   - `useCommunityMembersRealtime(communityId)` — Live member updates
   - `useMeetingsRealtime(communityId)` — Live meeting updates
   - `usePresenceTracking(communityId, userId)` — Show who's online

---

## Integration Pattern

### Step 1: Replace Mock Data with Real API Call

**BEFORE (Mock Data):**
```typescript
// Bad: hardcoded mock data
const [communities, setCommunities] = useState([
  { id: 1, name: 'Boston K-8', members: 24 },
  { id: 2, name: 'STEM Network', members: 31 },
]);
```

**AFTER (Real API):**
```typescript
// Good: fetch from API
const { communities, loading, error } = useCommunities();
```

### Step 2: Handle Loading/Error/Empty States

```typescript
'use client';

import { useCommunities } from '@/hooks/usePolymath';

export default function CommunitiesPage() {
  const { communities, loading, error } = useCommunities();

  if (loading) return <div className="p-4">Loading communities...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (communities.length === 0) return <div className="p-4">No communities yet</div>;

  return (
    <div className="grid gap-4">
      {communities.map(community => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  );
}
```

### Step 3: Add Create/Update/Delete Actions

```typescript
export default function CreateCommunityForm() {
  const { create, loading, error } = useCreateCommunity();
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const community = await create(formData);
      console.log('Created:', community);
      // Redirect or show success
    } catch (err) {
      // Error already in state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Community name"
        disabled={loading}
      />
      {error && <p className="text-red-600">{error}</p>}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Step 4: Add Real-Time Sync (Optional, Week 3)

```typescript
'use client';

import { useCommunityResources, useResourcesRealtime } from '@/hooks/usePolymath';

export default function ResourcesPage({ slug }: { slug: string }) {
  const { resources, loading, error, refetch } = useCommunityResources(slug);

  // Subscribe to live updates
  useResourcesRealtime(
    slug,
    (newResource) => {
      // New resource created
      setResources(prev => [newResource, ...prev]);
    },
    (updatedResource) => {
      // Resource updated
      setResources(prev =>
        prev.map(r => r.id === updatedResource.id ? updatedResource : r)
      );
    },
    (deletedResourceId) => {
      // Resource deleted
      setResources(prev => prev.filter(r => r.id !== deletedResourceId));
    }
  );

  // ...rest of component
}
```

---

## Priority 1: Essential (Week 2)

These pages MUST be wired by end of Week 2 to unblock T4 and prepare for pilot.

### 1. Communities List Page
**File:** `/app/polymath/communities/page.tsx`  
**API:** `GET /api/communities`  
**Hook:** `useCommunities()`  
**Status:** TO DO

**Requirements:**
- [ ] Display list of communities (cards or grid)
- [ ] Loading spinner while fetching
- [ ] Error message if fetch fails
- [ ] Empty state if no communities
- [ ] Click to view community details
- [ ] Search/filter by topic (optional)

### 2. Community Dashboard
**File:** `/app/polymath/communities/[slug]/page.tsx`  
**APIs:**
- `GET /api/communities/[slug]`
- `GET /api/communities/[slug]/members`
- `GET /api/communities/[slug]/stats`

**Hooks:**
- `useCommunity(slug)`
- `useCommunityMembers(slug)`
- `useCuratorStats(slug)`

**Status:** TO DO

**Requirements:**
- [ ] Display community details (name, description, cover image)
- [ ] Show member count and list
- [ ] Show curator stats (resources, discussions, meetings)
- [ ] Recent activity feed
- [ ] Join button (if not member)
- [ ] Edit button (if curator)

### 3. Resources Gallery
**File:** `/app/polymath/communities/[slug]/resources/page.tsx`  
**APIs:**
- `GET /api/communities/[slug]/resources`
- `POST /api/communities/[slug]/resources` (create)

**Hooks:**
- `useCommunityResources(slug)`
- `useCreateResource(slug)`
- `useResourcesRealtime(slug)` (Week 3)

**Status:** TO DO

**Requirements:**
- [ ] Display resources in grid/list
- [ ] Filter by type (document, video, image, link)
- [ ] Upload new resource (form)
- [ ] Show resource details on click
- [ ] Delete resource (curator only)
- [ ] Real-time: new resources appear instantly

### 4. Create Community Form
**File:** `/app/polymath/communities/new/page.tsx`  
**API:** `POST /api/communities`  
**Hook:** `useCreateCommunity()`  
**Status:** TO DO

**Requirements:**
- [ ] Form fields (name, description, scope, topic, difficulty)
- [ ] Submit button with loading state
- [ ] Error messages
- [ ] Redirect to community dashboard on success
- [ ] Validation (name required, scope required)

### 5. Join Community
**File:** Add to community detail page  
**API:** `POST /api/communities/[slug]/join`  
**Hook:** `useJoinCommunity()`  
**Status:** TO DO

**Requirements:**
- [ ] "Join Community" button on detail page
- [ ] Disabled if already member
- [ ] Loading state during join
- [ ] Refresh member list after join
- [ ] Show success message

---

## Priority 2: Core Features (Week 3)

Wire these after Priority 1 is complete.

### 6. Discussions List
**File:** `/app/polymath/communities/[slug]/discussions/page.tsx`  
**APIs:** `GET /api/communities/[slug]/discussions`  
**Hook:** `useCommunityDiscussions(slug)`  
**Status:** TO DO

**Requirements:**
- [ ] Display discussions (pinned first)
- [ ] Show message count, last activity
- [ ] Filter by status
- [ ] Click to open thread

### 7. Discussion Thread
**File:** `/app/polymath/communities/[slug]/discussions/[discussionId]/page.tsx`  
**APIs:**
- `GET /api/communities/[slug]/discussions/[discussionId]`
- `GET /api/communities/[slug]/discussions/[discussionId]/messages`
- `POST /api/communities/[slug]/discussions/[discussionId]/messages`

**Hooks:**
- `useDiscussion(slug, discussionId)`
- `useDiscussionMessages(slug, discussionId)`
- `usePostMessage(slug, discussionId)`
- `useDiscussionMessagesRealtime(discussionId)` (Week 3)

**Status:** TO DO

**Requirements:**
- [ ] Display discussion title + description
- [ ] Show all messages in thread
- [ ] Message form at bottom
- [ ] Submit message with loading state
- [ ] Real-time: new messages appear instantly
- [ ] Scroll to bottom on new message

### 8. Create Discussion Form
**File:** Add to discussions page  
**API:** `POST /api/communities/[slug]/discussions`  
**Hook:** `useCreateDiscussion(slug)`  
**Status:** TO DO

**Requirements:**
- [ ] Modal or page with form
- [ ] Title + description fields
- [ ] Submit button with loading state
- [ ] Redirect to thread on success

### 9. Meetings Calendar
**File:** `/app/polymath/communities/[slug]/meetings/page.tsx`  
**APIs:** `GET /api/communities/[slug]/meetings`  
**Hook:** `useCommunityMeetings(slug)`  
**Status:** TO DO

**Requirements:**
- [ ] Display meetings in calendar or list
- [ ] Show title, date, time, location/zoom
- [ ] Filter by date range
- [ ] Click to view details

### 10. Schedule Meeting Form
**File:** Add to meetings page  
**API:** `POST /api/communities/[slug]/meetings`  
**Hook:** `useCreateMeeting(slug)`  
**Status:** TO DO

**Requirements:**
- [ ] Form fields (title, description, date, time, zoom URL)
- [ ] Submit button with loading state
- [ ] Validation
- [ ] Redirect to calendar on success

---

## Priority 3: Polish (Week 4)

- Member profiles (name, expertise, affiliations)
- Curator dashboard (impact stats, pending actions)
- User profile edit
- Search across resources/discussions
- Notifications (new message, new resource)

---

## Common Patterns

### Loading States
```typescript
{loading && <Spinner />}
{!loading && communities.length === 0 && <EmptyState />}
{!loading && error && <ErrorBanner error={error} />}
{!loading && communities.length > 0 && /* render */}
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await create(data);
  setError(null);
  // success handling
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed');
}
```

### Refetching Data
```typescript
const { resources, refetch } = useCommunityResources(slug);

// After creating resource
const resource = await create(formData);
if (resource) await refetch(); // Refresh list
```

### Disabling During Submit
```typescript
<button disabled={loading} onClick={handleSubmit}>
  {loading ? 'Creating...' : 'Create'}
</button>
```

---

## Type Safety

All API responses have TypeScript types:

```typescript
import { Community, Resource, Discussion, Meeting } from '@/lib/polymath-api';

const community: Community = await fetchCommunity('boston-k8');
const resources: Resource[] = await fetchCommunityResources('boston-k8');
```

Check `lib/polymath-api.ts` for all exported types.

---

## Testing Checklist (Per Page)

- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Loading state shows (if slow API)
- [ ] Error message shows if API fails
- [ ] Empty state shows if no data
- [ ] Create/update/delete actions work
- [ ] Form validation works
- [ ] Mobile responsive (375px+)
- [ ] No TypeScript errors
- [ ] Console has no errors/warnings

---

## Week 2 Deliverables

By end of Week 2 (Sep 18):
1. ✅ `lib/polymath-api.ts` created (DONE)
2. ✅ `hooks/usePolymath.ts` created (DONE)
3. ✅ `hooks/useRealtimeSubscription.ts` created (DONE)
4. ⬜ Communities list page wired
5. ⬜ Community dashboard page wired
6. ⬜ Resources gallery wired
7. ⬜ Create community form wired
8. ⬜ Join community action wired

---

## Week 3 Deliverables

By end of Week 3 (Sep 25):
1. ⬜ Discussions list page wired
2. ⬜ Discussion thread wired
3. ⬜ Real-time messages enabled
4. ⬜ Meetings calendar wired
5. ⬜ Schedule meeting form wired
6. ⬜ Real-time resources enabled
7. ⬜ Real-time discussions enabled

---

## Week 4 Deliverables

By end of Week 4 (Oct 2):
1. ⬜ All Priority 3 pages wired
2. ⬜ End-to-end user flows tested
3. ⬜ Performance optimized
4. ⬜ Bug fixes
5. ⬜ Ready for pilot testing

---

## Quick Start: First Page Integration

To wire your first page, follow this 5-minute template:

```typescript
'use client';

import { useCommunities } from '@/hooks/usePolymath';
import { CommunityCard } from '@/app/components/CommunityCard';

export default function CommunitiesPage() {
  const { communities, loading, error } = useCommunities();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!communities.length) return <div>No communities yet</div>;

  return (
    <div className="grid gap-4">
      {communities.map(c => (
        <CommunityCard key={c.id} community={c} />
      ))}
    </div>
  );
}
```

That's it! The hook handles all loading/error/data management.

---

## Support & Questions

- API issues → Check `lib/polymath-api.ts` for function signatures
- Hook issues → Check `hooks/usePolymath.ts` for usage examples
- Real-time issues → Check `hooks/useRealtimeSubscription.ts`
- Deployment issues → Check Vercel logs

---

**Next Step:** Start wiring Priority 1 pages. Pick one and follow the pattern above.
