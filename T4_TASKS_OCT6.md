# T4 Features - Meetings UI & Curator Dashboard (Oct 6)

**Your Mission**: Build complete Meetings UI and Curator Dashboard while backend is being fixed tonight.

**Timeline**: 4-6 hours today → Integration testing tomorrow

---

## Quick Start

1. Open `/app/polymath/components/` directory
2. Create new component files as listed below
3. Build each component with mock data
4. Test all components at 3 breakpoints: 375px (mobile), 768px (tablet), 1200px (desktop)
5. No API wiring yet—all with mock data for now

---

## Priority 1: MEETINGS COMPONENTS (Critical Path)

### ScheduleMeetingForm Component
**File**: `components/ScheduleMeetingForm.tsx`

**Fields**:
```
[ ] Title input
    - Placeholder: "Meeting title"
    - Required: yes
    - Max length: 100 chars
    - Validation: Show error if empty
    
[ ] Description textarea
    - Placeholder: "Describe the meeting..."
    - Required: no
    - Max length: 500 chars
    - Auto-grow as user types
    
[ ] Date picker
    - Disable past dates
    - Default: tomorrow
    
[ ] Time picker
    - Format: HH:MM (24-hour)
    - Default: now + 1 hour
    - Step: 15 minutes
    
[ ] Zoom URL input
    - Placeholder: "https://zoom.us/j/..."
    - Required: no
    - Validation: Must be valid URL or Zoom link
    
[ ] Location input
    - Placeholder: "Conference room or address"
    - Required: no
    
[ ] Submit button
    - Text: "Schedule Meeting"
    - Loading state: show spinner
    - Success state: "✓ Scheduled!", then reset form
    
[ ] Cancel button
    - Text: "Cancel"
    - Clears form without submitting
```

**States**:
- [ ] Default (all fields empty)
- [ ] Filled (all fields have values)
- [ ] Validation error (e.g., title too long)
- [ ] Loading (spinner on submit button)
- [ ] Success (checkmark, then reset)
- [ ] Error (show error message from API)

**Test Data**:
```javascript
const testMeeting = {
  title: "Team Sync",
  description: "Discuss Q4 goals",
  date: "2026-10-10",
  time: "14:30",
  zoomUrl: "https://zoom.us/j/123456789",
  location: "Conference Room A",
};
```

### MeetingCard Component
**File**: `components/MeetingCard.tsx`

**Display**:
```
┌─────────────────────────────────────┐
│ Oct 10 at 2:30 PM    [Upcoming]     │  ← Status badge (blue)
│                                     │
│ Team Sync Meeting                   │  ← Title (bold)
│ Conference Room A / zoom.us/j/...   │  ← Location or Zoom link
│                                     │
│ Hosted by: Kyle W                   │  ← Host name + avatar
│ 12 people attending                 │  ← Attendee count
│                                     │
│ [Join Meeting]  [Edit]  [Delete]    │  ← Action buttons
└─────────────────────────────────────┘
```

**Status Badge Colors**:
- Upcoming: blue
- Today: orange
- Past: gray (disabled)

**Responsive**:
- [ ] Mobile (375px): full-width cards, stack layout
- [ ] Tablet (768px): 2-column grid
- [ ] Desktop (1200px): 3-column grid

**Test Data**:
```javascript
const testMeetings = [
  {
    id: '1',
    title: 'Team Sync',
    date: '2026-10-10',
    time: '14:30',
    location: 'Conference Room A',
    zoomUrl: 'https://zoom.us/j/123456789',
    host: { name: 'Kyle W', avatar: '...' },
    attendeeCount: 12,
    status: 'upcoming',
  },
  // ... more meetings
];
```

### MeetingList Component
**File**: `components/MeetingList.tsx`

**Features**:
```
[ ] Filter tabs at top
    - All (show all meetings)
    - Upcoming (future meetings, sorted by date)
    - Today (meetings happening today)
    - Past (previous meetings)
    
[ ] Search box
    - Filter by meeting title
    - Real-time search (no submit button)
    
[ ] Grid of MeetingCards
    - Responsive: 1-col (mobile), 2-col (tablet), 3-col (desktop)
    
[ ] Empty state
    - Show when no meetings match
    - Message: "No meetings scheduled"
    - Icon: calendar with cross
    
[ ] Loading state
    - Show skeleton cards while loading
    - Shimmer animation
    
[ ] Sorting
    - Default: by date (upcoming first)
    - Options: by date, by attendees, by recently added
```

**Mock Data**: Use 6-10 test meetings (mix of upcoming, today, past)

### MeetingDetail Page (Optional, Nice-to-Have)
**File**: `app/polymath/meetings/[meetingId]/page.tsx`

**Sections**:
```
[ ] Meeting header
    - Large title
    - Date/time formatted nicely
    - Status badge
    
[ ] Action buttons
    - "Join Meeting" (launches Zoom)
    - "Edit" (for curator)
    - "Delete" (for curator)
    
[ ] Meeting details card
    - Host name + avatar
    - Description (markdown rendered)
    - Location
    - Zoom link
    - Attendee count
    
[ ] Attendees list
    - Grid of attendee avatars
    - Click to see attendee details
    
[ ] Comments section (Future feature - can skip)
    - Show comments about meeting
```

---

## Priority 2: CURATOR DASHBOARD (Critical Path)

### CuratorDashboard Component
**File**: `components/CuratorDashboard.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Community Dashboard                             │
├─────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┐                 │
│ │ 127 Members  │ 45 Discuss.  │                 │
│ │ ↑ 5 this mo. │ ↑ 12 this mo.│                 │
│ ├──────────────┼──────────────┤                 │
│ │ 1.2K Msgs    │ 8 Meetings   │                 │
│ │ ↑ 200 th mo. │ Next: Oct 10 │                 │
│ └──────────────┴──────────────┘                 │
├─────────────────────────────────────────────────┤
│ Engagement (This Month vs Last)                 │
│ ┌─────────────────────────────────────────┐    │
│ │ [Bar Chart - Messages/Day]              │    │
│ │ This Month: 45/day  |  Last Month: 32/d│    │
│ └─────────────────────────────────────────┘    │
├─────────────────────────────────────────────────┤
│ Top Contributors                                │
│ ┌──────────────────────────────────────┐        │
│ │ #1 Sarah M      · 247 messages       │        │
│ │ #2 John D       · 189 messages       │        │
│ │ #3 Lisa T       · 156 messages       │        │
│ │ #4 Mike B       · 134 messages       │        │
│ │ #5 Emma J       · 112 messages       │        │
│ └──────────────────────────────────────┘        │
├─────────────────────────────────────────────────┤
│ Recent Activity                                 │
│ 2h ago    ✨ New member joined: Alex K          │
│ 4h ago    💬 New discussion: Q4 Planning        │
│ 1d ago    📅 New meeting: Team Sync             │
│ 2d ago    ✨ New member joined: Jordan S        │
└─────────────────────────────────────────────────┘
```

**Sections**:

#### Stats Cards (4 cards in 2x2 grid)
```
[ ] Total Members card
    - Large number (127)
    - Growth indicator ("↑ 5 this month")
    - Growth color: green if positive, red if negative
    
[ ] Total Discussions card
    - Large number (45)
    - Growth indicator ("↑ 12 this month")
    
[ ] Total Messages card
    - Large number (1.2K - abbreviated)
    - Growth indicator ("↑ 200 this month")
    
[ ] Upcoming Meetings card
    - Large number (8)
    - Preview text ("Next: Oct 10 at 2:30 PM")
```

#### Engagement Chart
```
[ ] Title: "Engagement (This Month vs Last)"

[ ] Bar chart showing:
    - X-axis: Days of month (1-31)
    - Y-axis: Messages/day count
    - Blue bars: This month
    - Gray bars: Last month
    - Hover to see exact numbers
    
[ ] Summary stats below chart:
    - This month avg: 45/day
    - Last month avg: 32/day
    - Change: +41% (green if positive)
    
[ ] Use Chart library: Recharts or Chart.js
```

#### Top Contributors
```
[ ] Title: "Top Contributors"

[ ] List of 5 members:
    - Rank badge (#1, #2, etc.)
    - Member avatar (small circle)
    - Member name (clickable)
    - Message count (right-aligned)
    - Option to view member profile
```

#### Recent Activity
```
[ ] Title: "Recent Activity"

[ ] Timeline of 10 most recent events:
    - Event type icon (✨ for new member, 💬 for discussion, 📅 for meeting)
    - Relative timestamp ("2h ago", "1d ago")
    - Event description
    - Click to view more details
    
[ ] Event types to show:
    - New member joined
    - New discussion created
    - New meeting scheduled
    - Member reached milestone (e.g., 100 messages)
```

**Mock Data**:
```javascript
const mockStats = {
  members: 127,
  membersTrend: +5,
  discussions: 45,
  discussionsTrend: +12,
  messages: 1247,
  messagesTrend: +200,
  upcomingMeetings: 8,
  nextMeeting: { title: 'Team Sync', date: '2026-10-10', time: '14:30' },
};

const mockTopContributors = [
  { rank: 1, name: 'Sarah M', messages: 247 },
  // ... 4 more
];

const mockRecentActivity = [
  { type: 'member_joined', description: 'Alex K joined', timestamp: '2h ago' },
  // ... 9 more
];
```

---

## Priority 3: DESIGN & POLISH

### Styling
- [ ] All cards have consistent shadow (elevation)
- [ ] All spacing uses 8px grid (8, 16, 24, 32px)
- [ ] All text sizes consistent (h1, h2, p, caption)
- [ ] All colors match brand palette

### Responsive Design
- [ ] Desktop (1200px): 2-column layout (stats + chart on left, top contributors + activity on right)
- [ ] Tablet (768px): single column, cards stack vertically
- [ ] Mobile (375px): single column, optimal for portrait

### Loading States
- [ ] Skeleton cards with shimmer animation
- [ ] Placeholder text: "Loading..."

### Error States
- [ ] Show error message if data fails to load
- [ ] Provide retry button

### Animations
- [ ] Growth indicators: subtle fade-in when numbers update
- [ ] Chart: bars animate in from bottom
- [ ] Hover effects on interactive elements

---

## Testing Checklist

**Component Tests**:
- [ ] ScheduleMeetingForm renders all fields
- [ ] Form validation works (error states)
- [ ] MeetingCard displays all info
- [ ] MeetingCard responsive at 375px/768px/1200px
- [ ] MeetingList filters work (click tabs)
- [ ] MeetingList search works
- [ ] CuratorDashboard renders all sections
- [ ] Stats cards display correctly
- [ ] Chart renders (may need mock library)

**Manual Testing**:
- [ ] Test at 375px (mobile) - all components fit
- [ ] Test at 768px (tablet) - 2-column layouts work
- [ ] Test at 1200px (desktop) - 3-column layouts work
- [ ] Click all buttons (loading state appears)
- [ ] Fill out all forms (success/error states work)
- [ ] Scroll long lists (no jank/lag)

**Browser Compatibility**:
- [ ] Chrome/Edge (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS 15+)
- [ ] Chrome Mobile (Android 12+)

---

## Files to Create

```
app/polymath/components/
  ├── ScheduleMeetingForm.tsx (new)
  ├── MeetingCard.tsx (new)
  ├── MeetingList.tsx (new)
  ├── CuratorDashboard.tsx (new)
  └── __tests__/
      ├── MeetingCard.test.tsx (new)
      └── CuratorDashboard.test.tsx (new)

app/polymath/app/meetings/ (new folder)
  ├── page.tsx (MeetingList page)
  └── [meetingId]/
      └── page.tsx (MeetingDetail page - optional)

app/polymath/app/curator/ (new folder)
  └── dashboard/
      └── page.tsx (CuratorDashboard page)
```

---

## Success Criteria

✅ ScheduleMeetingForm complete with validation  
✅ MeetingCard displays all info correctly  
✅ MeetingList responsive at 3+ breakpoints  
✅ CuratorDashboard with all 4 sections  
✅ Engagement chart renders (Recharts or Chart.js)  
✅ No console errors or warnings  
✅ Components work with mock data  
✅ Ready for API integration tomorrow  

---

## Tomorrow (Oct 7)

- Wire MeetingList to GET /api/communities/[slug]/meetings
- Wire ScheduleMeetingForm to POST /api/communities/[slug]/meetings
- Wire CuratorDashboard to GET /api/communities/[slug]/stats
- Test real data flows

**Let's ship this! 🚀**
