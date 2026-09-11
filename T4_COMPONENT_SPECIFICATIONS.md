# T4 COMPONENT SPECIFICATIONS — Detailed Requirements

## FEATURE 1: MEETINGS PAGE & COMPONENTS

### Page: `/app/polymath/communities/[id]/meetings/page.tsx`

**Purpose**: Display all meetings for a community, allow curator to schedule new meetings

**Data Flow**:
1. Load community ID from params
2. Fetch meetings from `GET /api/communities/[slug]/meetings?sort=upcoming`
3. Show upcoming meetings first, then past meetings
4. If user is curator: show [Schedule Meeting] button

**Layout**:
```
Header: "Meetings" (with community name)
[Schedule Meeting] button (curator only) 
_________________________________
Calendar View (optional Week 4):
  Month/Week selector
  Grid of days with meeting indicators

OR

Meeting List (MVP):
  Sort tabs: "Upcoming" | "Past" | "All"
  Filter: None (but can add later)
  
  For each meeting:
    <MeetingCard 
      meeting={meeting}
      isCurator={isCurator}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
```

**Component Props Interface**:
```typescript
interface MeetingsPageProps {
  params: Promise<{ id: string }>;
}

interface Meeting {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  scheduledAt: string; // ISO date
  zoomUrl?: string;
  location?: string;
  hostId: string;
  host: { id: string; name: string; email: string };
  notes?: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  meetings: Meeting[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

**Responsibilities**:
- Load community from URL
- Fetch meetings from API
- Handle loading/error/empty states
- Track curator status (from auth session)
- Show [Schedule Meeting] button only if curator
- Trigger modal when button clicked
- Pass meetings to MeetingCard components
- Responsive at 375px (mobile), 600px (tablet), 1024px (desktop)

**User Actions**:
- View upcoming meetings
- View past meetings
- Click [Schedule Meeting] → opens ScheduleMeetingForm modal
- Click meeting card → opens MeetingDetailModal
- Delete meeting (curator only)

---

### Component: `MeetingCard.tsx`

**Purpose**: Display a single meeting in card format

**Props**:
```typescript
interface MeetingCardProps {
  meeting: Meeting;
  isCurator: boolean;
  onEdit?: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
}
```

**Visual Layout**:
```
┌─────────────────────────────────┐
│ [Upcoming|Past|In Progress]     │  // Status badge
│                                 │
│ Meeting Title                   │  // Bold, large
│ October 15 • 6:00 PM            │  // Date + time
│ Boston Public Library           │  // Location (if present)
│                                 │
│ Hosted by Jane Doe              │  // Host name
│ 42 members registered           │  // If available
│                                 │
│ [Join Zoom]  [Details] [•••]    │  // Action buttons
│                                 │  // •••: edit/delete (curator only)
└─────────────────────────────────┘
```

**Features**:
- Status badge (color-coded):
  - 🔵 Upcoming (blue) = scheduledAt > now
  - 🟡 In Progress (orange) = within 15 min before/after scheduledAt
  - ⚪ Past (gray) = scheduledAt < now
- Show meeting title (truncate if long)
- Show date formatted nicely (e.g., "Oct 15, 6:00 PM")
- Show location if present
- Show host name
- If curator:
  - Edit button (pencil icon)
  - Delete button (trash icon)
- If meeting is in progress or upcoming + has zoomUrl:
  - [Join Zoom] button
- If meeting is past + has notes:
  - [See Notes] link
- If meeting is past + has recordingUrl:
  - [Watch Recording] link

**Interactions**:
- Click [Join Zoom] → Open zoomUrl in new tab
- Click [Details] or card itself → Open MeetingDetailModal
- Click [See Notes] → Open MeetingDetailModal with notes section visible
- Click [Watch Recording] → Open recordingUrl in new tab
- Click edit (curator) → Open ScheduleMeetingForm modal with prefilled data
- Click delete (curator) → Show confirm dialog, then delete via API

**Styling**:
- White background, rounded corners, light shadow
- Tailwind: `bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow`
- Color badges: Blue (upcoming), Orange (in progress), Gray (past)
- Responsive: Full width on mobile, cards in grid on desktop

---

### Component: `ScheduleMeetingForm.tsx`

**Purpose**: Form to create or edit a meeting (curator only)

**Props**:
```typescript
interface ScheduleMeetingFormProps {
  communitySlug: string;
  meetingToEdit?: Meeting; // If editing, pre-fill form
  onSuccess?: (meeting: Meeting) => void;
  onCancel?: () => void;
}
```

**Visual Layout**:
```
Title: "Schedule a Meeting" (or "Edit Meeting")

Form Fields:
┌─────────────────────────────────┐
│ Title *                         │
│ [____________________________]  │  // text input, required
│                                 │
│ Date *                          │
│ [____________________________]  │  // date picker, required, no past dates
│                                 │
│ Time *                          │
│ [____________________________]  │  // time picker, required
│                                 │
│ Zoom URL                        │
│ [____________________________]  │  // url input, optional
│                                 │
│ Location                        │
│ [____________________________]  │  // text input, optional (e.g., "Boston Public Library")
│                                 │
│ Description                     │
│ [____________________________]  │  // textarea, optional, 3 rows
│ ____________________________    │
│                                 │
│ [Cancel]  [Schedule Meeting]    │  // Buttons
└─────────────────────────────────┘
```

**Fields**:
1. **Title** (required)
   - Text input, max 100 chars
   - Placeholder: "October Curriculum Review"
   - Validation: Required, >3 chars

2. **Date** (required)
   - Date picker
   - Cannot select past dates
   - Validation: Required, >= today

3. **Time** (required)
   - Time picker (HH:MM format)
   - Validation: Required, valid time

4. **Zoom URL** (optional)
   - URL input
   - Placeholder: "https://zoom.us/j/..."
   - Validation: Valid URL format if provided

5. **Location** (optional)
   - Text input
   - Placeholder: "Boston Public Library"
   - Validation: Max 200 chars

6. **Description** (optional)
   - Textarea
   - Placeholder: "Agenda: curriculum review, next semester planning..."
   - Validation: Max 500 chars

**Validation & Error Handling**:
- Show red error text below each invalid field
- Disable [Schedule] button if form is invalid or loading
- Show loading spinner on button while submitting
- Show success toast: "Meeting scheduled!"
- Show error toast if API fails: "Failed to schedule meeting. Please try again."

**API Calls**:
- POST /api/communities/[slug]/meetings (create new)
- PATCH /api/communities/[slug]/meetings/[meetingId] (edit)

**After Success**:
- Close modal
- Refresh meetings list on parent page
- Show success toast

---

### Component: `MeetingDetailModal.tsx`

**Purpose**: Show full meeting details, capture notes (curator only)

**Props**:
```typescript
interface MeetingDetailModalProps {
  meeting: Meeting;
  isCurator: boolean;
  onClose: () => void;
  onUpdate?: (updatedMeeting: Meeting) => void;
}
```

**Visual Layout**:
```
┌─────────────────────────────────────────────┐
│ X                                           │  // Close button
│                                             │
│ Meeting Title                               │  // Large
│                                             │
│ Oct 15, 2026 • 6:00 PM - 7:00 PM           │
│ Boston Public Library                       │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ Hosted by Jane Doe (jane@boston.edu)        │
│                                             │
│ Zoom Link:                                  │
│ [Join Zoom] (or copy link icon)             │  // If has zoomUrl
│                                             │
│ Description:                                │
│ Planning next semester's curriculum with   │
│ focus on decolonization frameworks.        │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ Meeting Notes (curator only):               │
│ [____________________________]              │  // textarea, editable
│ ____________________________                │
│ ____________________________                │
│                                             │
│ [Save Notes]                                │  // Save button (curator only)
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ Recording:                                  │
│ [Watch Recording] (if has recordingUrl)     │
│                                             │
│ ─────────────────────────────────────────── │
│                                             │
│ [Close]                                     │
└─────────────────────────────────────────────┘
```

**Sections**:
1. **Header**: Title, date, time, location, status
2. **Host Info**: Name and email
3. **Zoom Link**: If has zoomUrl, show [Join Zoom] + copy button
4. **Description**: Show meeting description (if present)
5. **Meeting Notes** (curator only):
   - Editable textarea
   - [Save Notes] button
   - Shows updated timestamp
6. **Recording** (if past meeting):
   - [Watch Recording] link if has recordingUrl
   - Show timestamp when recording was added

**Curator-Only Actions**:
- Edit notes textarea
- Click [Save Notes] → PATCH /api/communities/[slug]/meetings/[meetingId] with notes
- Show loading state on button while saving
- Show success/error toast

**Interactions**:
- Click [Join Zoom] → Open zoomUrl in new tab
- Click copy icon → Copy zoomUrl to clipboard, show "Copied!"
- Click [Watch Recording] → Open recordingUrl in new tab
- Type in notes → Live preview
- Click [Save Notes] → Save to database

**Styling**:
- Modal with backdrop
- Centered on desktop, full-height on mobile
- Responsive: Adjust padding/margins at 375px

---

## FEATURE 2: CURATOR DASHBOARD

### Page: `/app/polymath/curator/[communityId]/page.tsx`

**Purpose**: Show curator dashboard with stats, engagement metrics, and action items

**Data Flow**:
1. Load community ID from params
2. Fetch stats from `GET /api/communities/[slug]/stats`
3. Verify user is curator (auth check)
4. Display all dashboard sections

**Layout**:
```
Header: "Dashboard: [Community Name]"

Grid Layout (responsive):
┌─────────────────────────────────────────────────────────┐
│ Community Stats Box   │ Engagement Metrics              │
│ • X members           │ This Month: X messages (↑20%)    │
│ • Y resources         │ Last Month: Y messages          │
│ • Z discussions       │ Most Active: [Top 3 members]    │
│ • W meetings          │                                  │
├─────────────────────────────────────────────────────────┤
│ Impact Summary                                          │
│ Your community has built:                               │
│ • 12 lesson plans                                       │
│ • 3 decolonized curriculum units                        │
│ • 5 collaborative rubrics                               │
│ You've facilitated 8 meetings, brought together 42 educators
├─────────────────────────────────────────────────────────┤
│ Pending Actions         │ Upcoming Meetings              │
│ • 3 new members        │ • Oct 15: Curriculum Review    │
│ • 2 flagged resources  │ • Oct 22: Standards Workshop   │
│ • 1 pending approval   │                                │
├─────────────────────────────────────────────────────────┤
│ Recent Members          │ Most Active Contributors       │
│ • Jane Doe (Sep 10)     │ • Bob Smith (34 messages)     │
│ • Alex K (Sep 8)        │ • Sarah Lee (28 messages)     │
│ • Chris P (Sep 5)       │ • Michael J (22 messages)     │
└─────────────────────────────────────────────────────────┘

Quick Action Buttons:
[Schedule Meeting] [Invite Member] [View Community] [Export Report]
```

**Layout Strategy**:
- Mobile (375px): Single column, cards stack vertically
- Tablet (600px): 2-column grid where possible
- Desktop (1024px): Full grid layout as shown

**Component Props Interface**:
```typescript
interface CuratorDashboardPageProps {
  params: Promise<{ communityId: string }>;
}

interface CuratorStats {
  community: {
    id: string;
    name: string;
    slug: string;
  };
  stats: {
    memberCount: number;
    discussionCount: number;
    messageCount: number;
    resourceCount: number;
    meetingCount: number;
    upcomingMeetingCount: number;
  };
  engagement: {
    thisMonthMessages: number;
    lastMonthMessages: number;
    growth: string; // percentage like "40.6"
  };
  recentMembers: Array<{
    id: string;
    user: { id: string; name: string; email: string };
    joinedAt: string;
  }>;
  recentDiscussions: Array<{
    id: string;
    title: string;
    createdBy: { id: string; name: string };
    _count: { messages: number };
    lastMessageAt: string;
  }>;
  topContributors: Array<{
    user: { id: string; name: string; email: string };
    messageCount: number;
  }>;
}
```

**Responsibilities**:
- Load community from route params
- Fetch stats from API
- Handle loading/error/empty states
- Verify user is curator (auth check)
- Display all dashboard sections
- Show quick action buttons
- Responsive at all breakpoints

**User Actions**:
- View all stats
- Click [Schedule Meeting] → Navigate to /meetings page
- Click [Invite Member] → Open invite modal (Week 4 if time)
- Click [View Community] → Navigate to community page
- Click [Export Report] → Download PDF (Week 4 if time)

---

### Component: `CommunityStatsBox.tsx`

**Purpose**: Display key stats about the community in a compact box

**Props**:
```typescript
interface CommunityStatsBoxProps {
  stats: {
    memberCount: number;
    resourceCount: number;
    discussionCount: number;
    meetingCount: number;
    upcomingMeetingCount: number;
  };
}
```

**Visual Layout**:
```
┌─────────────────────────────┐
│ Community Stats             │  // Title
│                             │
│ Members: 42                 │
│ Resources: 56               │
│ Discussions: 18             │
│ Meetings: 8 (2 upcoming)    │
└─────────────────────────────┘
```

**Styling**:
- White background, rounded corners, light shadow
- Grid or list layout
- Icons next to each stat:
  - 👥 Members
  - 📄 Resources
  - 💬 Discussions
  - 📅 Meetings
- Emphasize "upcoming" in bold

---

### Component: `EngagementMetrics.tsx`

**Purpose**: Show engagement trends and top contributors

**Props**:
```typescript
interface EngagementMetricsProps {
  engagement: {
    thisMonthMessages: number;
    lastMonthMessages: number;
    growth: string;
  };
  topContributors: Array<{
    user: { id: string; name: string; email: string };
    messageCount: number;
  }>;
}
```

**Visual Layout**:
```
┌────────────────────────────────────┐
│ Engagement (Last 30 Days)          │
│                                    │
│ This Month: 45 messages            │  // Bold
│ Last Month: 32 messages            │
│ Growth: ↑ 40.6%                    │  // Green if positive
│                                    │
│ ─────────────────────────────────  │
│                                    │
│ Most Active Members:               │
│ 1. Bob Smith (34 messages)         │
│ 2. Sarah Lee (28 messages)         │
│ 3. Michael J (22 messages)         │
│ 4. Jane Doe (18 messages)          │
│ 5. Alex K (15 messages)            │
└────────────────────────────────────┘
```

**Features**:
- Show this month vs last month comparison
- Show growth % (with color: green if positive, red if negative)
- Show top 5 contributors with message counts
- If no data: show "No activity yet"

---

### Component: `ImpactSummary.tsx`

**Purpose**: Show what the community has built (motivational section)

**Props**:
```typescript
interface ImpactSummaryProps {
  stats: {
    resourceCount: number;
    discussionCount: number;
    meetingCount: number;
    memberCount: number;
  };
  communityName: string;
}
```

**Visual Layout**:
```
┌────────────────────────────────────────────┐
│ Impact Summary                             │
│                                            │
│ Your community has built:                  │  // Large, inviting
│                                            │
│ • 56 resources shared                      │  // Count dynamically
│ • 18 active discussions                    │
│ • 8 meetings facilitated                   │
│                                            │
│ You've brought together 42 educators       │
│ working toward equitable curriculum.       │
│                                            │
│ "This community represents X hours of      │  // Estimate from stats
│ collaborative work and shared expertise."  │
└────────────────────────────────────────────┘
```

**Logic**:
- Count resources = resourceCount
- Count discussions = discussionCount
- Count meetings = meetingCount
- Member count = memberCount
- Generate estimated "hours of collaboration" (rough estimate)
- Show inspiring message to curator about impact

---

### Component: `PendingActions.tsx`

**Purpose**: Show action items (new members, flagged content, etc.)

**Props**:
```typescript
interface PendingActionsProps {
  recentMembers: Array<{
    id: string;
    user: { id: string; name: string; email: string };
    joinedAt: string;
  }>;
  upcomingMeetingCount: number;
}
```

**Visual Layout**:
```
┌──────────────────────────────────┐
│ Pending Actions                  │
│                                  │
│ 3 New Members                    │
│ • Alex K (joined Sep 8)          │  // Link to member profile
│ • Chris P (joined Sep 5)         │
│ • Sarah L (joined Sep 2)         │
│                                  │
│ 2 Upcoming Meetings              │  // Link to meetings page
│ [View All]                       │
│                                  │
│ No flagged content               │  // If nothing flagged
│                                  │
└──────────────────────────────────┘
```

**Features**:
- Show recent members (max 3)
- Show upcoming meetings count
- Show flagged content count (if any)
- Click member name → Open member profile (Week 4)
- Click [View All] → Navigate to meetings page

---

## SHARED COMPONENTS

### Hook: `useFetch.ts`

**Purpose**: Generic fetch hook for API calls

```typescript
interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface UseFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useFetch<T>(url: string, options?: UseFetchOptions): UseFetchResult<T> {
  // Implementation
}
```

**Features**:
- Auto-fetch on mount
- Handle loading state
- Handle errors gracefully
- Provide refetch function
- Type-safe responses

---

### Hook: `useTimeFormat.ts`

**Purpose**: Format dates and times consistently

```typescript
function useTimeFormat() {
  const formatDate = (date: string | Date): string => {
    // e.g., "Oct 15, 2026"
  };
  
  const formatTime = (date: string | Date): string => {
    // e.g., "6:00 PM"
  };
  
  const formatDateTime = (date: string | Date): string => {
    // e.g., "Oct 15, 6:00 PM"
  };
  
  const formatRelative = (date: string | Date): string => {
    // e.g., "2 days ago", "in 3 hours"
  };
  
  return { formatDate, formatTime, formatDateTime, formatRelative };
}
```

---

### Component: `LoadingSpinner.tsx`

**Purpose**: Reusable loading indicator

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}
```

**Visual**:
- Animated spinner
- Optional loading message below

---

### Component: `ErrorAlert.tsx`

**Purpose**: Reusable error message display

```typescript
interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

**Visual**:
- Red background
- Error icon
- Error message
- Optional [Retry] and [Dismiss] buttons

---

### Component: `EmptyState.tsx`

**Purpose**: Show when no data available

```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Visual**:
- Large icon (📅 for meetings, 🎯 for stats, etc.)
- Title
- Description
- Optional action button

---

## TESTING CHECKPOINTS (Week 2)

### Manual API Tests (Before Week 3)

```bash
# Get all meetings (upcoming)
curl -H "Authorization: Bearer [token]" \
  "http://localhost:3000/api/communities/[slug]/meetings?sort=upcoming"

# Create meeting (as curator)
curl -X POST -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "scheduledAt": "2026-10-15T18:00:00Z", ...}' \
  "http://localhost:3000/api/communities/[slug]/meetings"

# Get curator stats
curl -H "Authorization: Bearer [token]" \
  "http://localhost:3000/api/communities/[slug]/stats"
```

### Component Tests (Week 2)

- MeetingCard renders correctly with all fields
- ScheduleMeetingForm validates inputs
- MeetingDetailModal edits notes correctly
- CuratorDashboard loads all sections
- All components responsive at 375px, 600px, 1024px
- Error states display correctly
- Loading states show spinners
- Empty states show helpful messages

---

**Implementation starts Week 3 (Sep 25) once all APIs are confirmed stable.**
