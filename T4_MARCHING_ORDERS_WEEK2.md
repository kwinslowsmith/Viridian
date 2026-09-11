# T4 Curator Experience - Week 2 Marching Orders

**Date:** September 11, 2026  
**Owner:** T4 Curator Experience Agent  
**Status:** Ready to execute  
**Timeline:** September 13-20, 2026  

---

## 🎯 Mission

Build the Curator Dashboard using T1's stats endpoint. By Friday Sep 20, curators should see community impact, engagement metrics, and member/resource management.

---

## 📋 Priority 1 - Curator Dashboard (Sep 13-18)

### Context: What Curators Need

**Curators are:** Directors of Curriculum (10 in Boston pilot)

**Their Pain Points:**
- Can't see who's contributing (need top contributors list)
- Can't track engagement (need activity metrics)
- Hard to know if community is thriving (need impact metrics)
- Tedious to manage members (need quick actions)

**Solution:** Curator Dashboard showing stats + quick actions

---

### Task 1: Build Curator Dashboard Page

**File:** `app/polymath/communities/[slug]/curator/page.tsx`

**Layout (4 Sections):**

```
┌─────────────────────────────────────────┐
│  Community: Boston Curriculum (Curator)  │
├─────────────────────────────────────────┤
│ SECTION 1: Impact Cards (Stats)          │
│ ┌─────────────────────────────────────┐  │
│ │ Members: 42 │ Discussions: 18 │      │  │
│ │ Messages: 234 │ Meetings: 5 │        │  │
│ └─────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ SECTION 2: Engagement Trend              │
│ ┌─────────────────────────────────────┐  │
│ │ This Month: 89 messages (↑ 58.9%)   │  │
│ │ Last Month: 56 messages              │  │
│ └─────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ SECTION 3: Top Contributors              │
│ ┌─────────────────────────────────────┐  │
│ │ 1. Alice (42 messages)               │  │
│ │ 2. Bob (28 messages)                 │  │
│ │ 3. Carol (15 messages)               │  │
│ └─────────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ SECTION 4: Quick Actions                 │
│ ┌─────────────────────────────────────┐  │
│ │ [Schedule Meeting] [Invite Member] │  │
│ │ [View Resources] [View Discussions] │  │
│ └─────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### Step 1: Create Page Structure

**File:** `app/polymath/communities/[slug]/curator/page.tsx`

```typescript
import { useState, useEffect } from 'react';
import { getCommunityStats } from '@/lib/polymath-api';

export default function CuratorDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { slug } = await params;
        const data = await getCommunityStats(slug);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [params]);
  
  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  
  return (
    <div className="curator-dashboard">
      <h1>Community Dashboard: {stats.community.name}</h1>
      
      <section className="impact-cards">
        {/* Task 2 */}
      </section>
      
      <section className="engagement-trend">
        {/* Task 3 */}
      </section>
      
      <section className="top-contributors">
        {/* Task 4 */}
      </section>
      
      <section className="quick-actions">
        {/* Task 5 */}
      </section>
    </div>
  );
}
```

**Test Checklist:**
- [ ] Page loads without errors
- [ ] Skeleton/loading state shows
- [ ] Data loads from API
- [ ] Error handling works

---

### Step 2: Build Impact Cards Section

**Component:** `ImpactCards.tsx`

**Shows:** memberCount, discussionCount, messageCount, upcomingMeetingCount

```typescript
interface ImpactCardsProps {
  memberCount: number;
  discussionCount: number;
  messageCount: number;
  upcomingMeetingCount: number;
}

export function ImpactCards({ 
  memberCount, 
  discussionCount, 
  messageCount, 
  upcomingMeetingCount 
}: ImpactCardsProps) {
  const metrics = [
    { label: 'Members', value: memberCount, icon: '👥' },
    { label: 'Discussions', value: discussionCount, icon: '💬' },
    { label: 'Messages', value: messageCount, icon: '✉️' },
    { label: 'Upcoming Meetings', value: upcomingMeetingCount, icon: '📅' }
  ];
  
  return (
    <div className="impact-cards">
      {metrics.map(m => (
        <div key={m.label} className="impact-card">
          <div className="icon">{m.icon}</div>
          <div className="value">{m.value}</div>
          <div className="label">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
```

**Styling:**
```css
.impact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.impact-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.impact-card .icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.impact-card .value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.impact-card .label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}
```

**Integration in Curator Dashboard:**
```typescript
<section className="impact-cards">
  <ImpactCards
    memberCount={stats.stats.memberCount}
    discussionCount={stats.stats.discussionCount}
    messageCount={stats.stats.messageCount}
    upcomingMeetingCount={stats.stats.upcomingMeetingCount}
  />
</section>
```

**Test Checklist:**
- [ ] All 4 metrics display
- [ ] Numbers are accurate
- [ ] Responsive on mobile (2 cards per row on 375px)
- [ ] Icons display correctly

---

### Step 3: Build Engagement Trend Section

**Component:** `EngagementTrend.tsx`

**Shows:** thisMonthMessages vs lastMonthMessages, growth percentage

```typescript
interface EngagementTrendProps {
  thisMonthMessages: number;
  lastMonthMessages: number;
  growth: string; // "58.9" or "N/A"
}

export function EngagementTrend({ 
  thisMonthMessages, 
  lastMonthMessages, 
  growth 
}: EngagementTrendProps) {
  const growthNum = parseFloat(growth);
  const isPositive = growthNum > 0;
  
  return (
    <div className="engagement-trend">
      <h3>Engagement Trend</h3>
      
      <div className="trend-comparison">
        <div className="month">
          <div className="label">This Month</div>
          <div className="value">{thisMonthMessages}</div>
          <div className="unit">messages</div>
        </div>
        
        <div className="growth">
          <div className={`arrow ${isPositive ? 'up' : 'down'}`}>
            {isPositive ? '↑' : '↓'}
          </div>
          <div className={`percentage ${isPositive ? 'positive' : 'negative'}`}>
            {growth}%
          </div>
        </div>
        
        <div className="month">
          <div className="label">Last Month</div>
          <div className="value">{lastMonthMessages}</div>
          <div className="unit">messages</div>
        </div>
      </div>
      
      <p className="insight">
        {isPositive 
          ? `Community is thriving! Engagement up ${growth}% this month.`
          : `Engagement declined ${Math.abs(growthNum)}% this month. Consider scheduling a community meeting.`
        }
      </p>
    </div>
  );
}
```

**Styling:**
```css
.engagement-trend {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 40px;
}

.engagement-trend h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.trend-comparison {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trend-comparison .month {
  flex: 1;
  text-align: center;
}

.trend-comparison .month .value {
  font-size: 24px;
  font-weight: bold;
  color: #2c5aa0;
  margin: 5px 0;
}

.trend-comparison .growth {
  flex: 1;
  text-align: center;
}

.trend-comparison .growth .arrow {
  font-size: 28px;
  margin-bottom: 5px;
}

.trend-comparison .growth .arrow.up {
  color: #4caf50;
}

.trend-comparison .growth .arrow.down {
  color: #f44336;
}

.trend-comparison .growth .percentage {
  font-size: 20px;
  font-weight: bold;
}

.trend-comparison .growth .percentage.positive {
  color: #4caf50;
}

.trend-comparison .growth .percentage.negative {
  color: #f44336;
}

.engagement-trend .insight {
  margin: 0;
  font-size: 13px;
  color: #666;
  font-style: italic;
}
```

**Test Checklist:**
- [ ] This month / last month display correctly
- [ ] Growth % shows positive (green arrow) or negative (red arrow)
- [ ] Insight message changes based on trend
- [ ] Responsive layout

---

### Step 4: Build Top Contributors Section

**Component:** `TopContributors.tsx`

**Shows:** List of top 10 contributors by message count

```typescript
interface Contributor {
  user: { id: string; name: string; email: string };
  messageCount: number;
}

interface TopContributorsProps {
  contributors: Contributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <div className="top-contributors">
      <h3>Top Contributors</h3>
      
      <div className="contributor-list">
        {contributors.map((c, idx) => (
          <div key={c.user.id} className="contributor-item">
            <div className="rank">#{idx + 1}</div>
            
            <div className="contributor-info">
              <div className="name">{c.user.name}</div>
              <div className="email">{c.user.email}</div>
            </div>
            
            <div className="message-count">
              <span className="count">{c.messageCount}</span>
              <span className="unit">messages</span>
            </div>
          </div>
        ))}
      </div>
      
      {contributors.length === 0 && (
        <div className="empty-state">No messages yet</div>
      )}
    </div>
  );
}
```

**Styling:**
```css
.top-contributors {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 40px;
}

.top-contributors h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.contributor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contributor-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  gap: 12px;
}

.contributor-item .rank {
  font-weight: bold;
  color: #2c5aa0;
  min-width: 30px;
  text-align: center;
}

.contributor-item .contributor-info {
  flex: 1;
}

.contributor-item .name {
  font-weight: 600;
  margin-bottom: 3px;
}

.contributor-item .email {
  font-size: 12px;
  color: #999;
}

.contributor-item .message-count {
  text-align: right;
}

.contributor-item .count {
  font-size: 18px;
  font-weight: bold;
  display: block;
}

.contributor-item .unit {
  font-size: 11px;
  color: #999;
  display: block;
}
```

**Test Checklist:**
- [ ] Top 10 contributors display in order
- [ ] Message counts are accurate
- [ ] Names and emails display
- [ ] Empty state shows if no contributors

---

### Step 5: Build Quick Actions Section

**Component:** `QuickActions.tsx`

**Shows:** Buttons for common curator tasks

```typescript
interface QuickActionsProps {
  slug: string;
}

export function QuickActions({ slug }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>
      
      <div className="actions-grid">
        <a href={`/polymath/communities/${slug}/discussions`} className="action-button">
          💬 View Discussions
        </a>
        
        <a href={`/polymath/communities/${slug}/meetings`} className="action-button">
          📅 Schedule Meeting
        </a>
        
        <a href={`/polymath/communities/${slug}/resources`} className="action-button">
          📚 Upload Resource
        </a>
        
        <a href={`/polymath/communities/${slug}/members`} className="action-button">
          👥 Manage Members
        </a>
      </div>
    </div>
  );
}
```

**Styling:**
```css
.quick-actions {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.quick-actions h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.action-button {
  display: block;
  padding: 16px 12px;
  background: #2c5aa0;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  transition: background 0.2s;
}

.action-button:hover {
  background: #1e3f70;
}
```

**Test Checklist:**
- [ ] All 4 buttons display
- [ ] Links navigate to correct pages
- [ ] Responsive on mobile

---

## 📋 Priority 2 - Member Management (Sep 19-20)

### Task 6: Build Members List Page

**File:** `app/polymath/communities/[slug]/members/page.tsx`

**Features:**
1. List all members with: name, email, role, join date
2. Remove member button (curator only)
3. Add member button
4. Search/filter members

**Endpoints Used:**
- `GET /api/communities/[slug]/members` - List
- `POST /api/communities/[slug]/members` - Add
- `DELETE /api/communities/[slug]/members/[memberId]` - Remove

**Component Structure:**

```typescript
export default function MembersPage({ params }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  useEffect(() => {
    fetchMembers();
  }, []);
  
  const fetchMembers = async () => {
    const { slug } = await params;
    const data = await fetch(`/api/communities/${slug}/members`);
    setMembers(data.members);
    setLoading(false);
  };
  
  const removeMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    
    const { slug } = await params;
    await fetch(`/api/communities/${slug}/members/${memberId}`, {
      method: 'DELETE'
    });
    
    fetchMembers(); // Refresh list
  };
  
  return (
    <div>
      <h1>Members</h1>
      <button onClick={() => setShowAddModal(true)}>+ Add Member</button>
      
      {showAddModal && (
        <AddMemberModal
          slug={slug}
          onSuccess={() => {
            setShowAddModal(false);
            fetchMembers();
          }}
        />
      )}
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id}>
              <td>{m.user.name}</td>
              <td>{m.user.email}</td>
              <td>{m.role}</td>
              <td>{new Date(m.joinedAt).toLocaleDateString()}</td>
              <td>
                <button 
                  onClick={() => removeMember(m.id)}
                  className="btn-danger"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Test Checklist:**
- [ ] Members list loads
- [ ] All members display
- [ ] Can remove member (with confirmation)
- [ ] Can add member (modal)
- [ ] List updates after add/remove

---

### Task 7: Build Resource Management Page

**File:** `app/polymath/communities/[slug]/resources/page.tsx`

**Features:**
1. List resources with: title, type, uploaded by, upload date
2. Delete resource button
3. Upload new resource button
4. Filter by type

**Endpoints Used:**
- `GET /api/communities/[slug]/resources` - List
- `POST /api/communities/[slug]/resources` - Upload (already exists)
- `DELETE /api/communities/[slug]/resources/[resourceId]` - Delete

---

## 📊 Completion Checklist - Week 2

**By Friday Sep 20:**

**Curator Dashboard:**
- [ ] Page loads and fetches stats
- [ ] Impact cards display all 4 metrics
- [ ] Engagement trend shows growth comparison
- [ ] Top contributors list displays
- [ ] Quick actions buttons work

**Member Management:**
- [ ] Members list page built
- [ ] Can add member
- [ ] Can remove member
- [ ] List updates on changes

**Resource Management:**
- [ ] Resources page built
- [ ] Can upload resource
- [ ] Can delete resource
- [ ] List updates on changes

**Permissions:**
- [ ] Only curators can see stats page
- [ ] Only curators can remove members
- [ ] Only curators can upload/delete resources

---

## 🚀 Friday Sep 20 Sync Report

**Report Template:**
```
T4 Curator Experience - Week 2 Completion Report

CURATOR DASHBOARD:
- Page loads: ✅ Yes
- Stats display: ✅ Yes
- Engagement trend: ✅ Yes
- Top contributors: ✅ Yes
- Quick actions: ✅ Yes

MEMBER MANAGEMENT:
- Members list: ✅ Built
- Add member: ✅ Working
- Remove member: ✅ Working

RESOURCE MANAGEMENT:
- Resources list: ✅ Built
- Upload resource: ✅ Working
- Delete resource: ✅ Working

PERMISSIONS:
- Curator-only access: ✅ Verified

BLOCKING ISSUES:
[List any issues]

READY FOR PILOT TESTING:
Yes / No [Reason]
```

---

## 💡 Tips

**API Response Format:**
```json
{
  "community": { "id", "name", "slug" },
  "stats": {
    "memberCount": 42,
    "discussionCount": 18,
    "messageCount": 234,
    "resourceCount": 12,
    "meetingCount": 5,
    "upcomingMeetingCount": 1
  },
  "engagement": {
    "thisMonthMessages": 89,
    "lastMonthMessages": 56,
    "growth": "58.9"
  },
  "recentMembers": [...],
  "recentDiscussions": [...],
  "topContributors": [
    { "user": { "id", "name", "email" }, "messageCount": 42 }
  ]
}
```

**Permission Model:**
- GET stats: curator only → return 403 for non-curator
- POST members: curator only
- DELETE members: curator only
- POST resources: curator only
- DELETE resources: curator only

---

## 📞 Questions?

- Check T1 endpoints: `/api/communities/[slug]/stats`
- Review T1_COMPLETION for API details
- Ask on Friday sync

---

**BUILD THE CURATOR DASHBOARD** 🎯
