# Polymath - Cooperative Educator Platform

**Status**: Week 1 Complete ✅ | Component Library Production Ready  
**Next Phase**: Week 2-3 API Integration with T3

---

## Quick Start for Developers

### 1. Understanding the Structure

```
/app/polymath/
├── layout.tsx              # Main layout with navbar + sidebar
├── dashboard/page.tsx      # User home & my communities
├── communities/
│   ├── page.tsx           # Browse all communities
│   ├── create/page.tsx    # Create community form
│   └── [slug]/
│       ├── page.tsx                  # Community dashboard
│       ├── resources/page.tsx        # Resource gallery
│       ├── discussions/page.tsx      # Discussion threads
│       ├── meetings/page.tsx         # Meeting list
│       └── members/page.tsx          # Member management
├── profile/page.tsx       # User profile
└── curator/[communityId]/ # Curator dashboard

/app/components/polymath/  # All reusable components
```

### 2. Using Components

Import from the index:
```typescript
import {
  Button,
  Card,
  TextInput,
  EmptyState,
  LoadingState,
  CommunityCard,
} from '@/app/components/polymath';
```

### 3. Common Page Pattern

Every page follows this structure:
```typescript
'use client';

import { useParams } from 'next/navigation';
import { LoadingState, EmptyState, Button } from '@/app/components/polymath';

export default function PageName() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/endpoint');
      if (res.ok) {
        const data = await res.json();
        setData(data.items);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (data.length === 0) return <EmptyState title="No data" />;

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

---

## Component Usage Examples

### Button
```typescript
<Button variant="primary" size="md">
  Create
</Button>

<Button variant="danger" size="sm">
  Delete
</Button>

<Button variant="secondary" isFullWidth>
  Cancel
</Button>
```

### Card with Subcomponents
```typescript
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Input with Validation
```typescript
<TextInput
  label="Community Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={error ? "Name is required" : ""}
  placeholder="Enter name..."
  required
/>
```

### Empty State
```typescript
{items.length === 0 ? (
  <EmptyState
    icon="📭"
    title="No items"
    description="Create your first item to get started"
    actionLabel="Create Item"
    onAction={handleCreate}
  />
) : (
  /* Render items */
)}
```

### Tabs
```typescript
<Tabs
  tabs={[
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'members', label: 'Members', content: <MembersTab /> },
    { id: 'resources', label: 'Resources', content: <ResourcesTab /> },
  ]}
  defaultTabId="overview"
/>
```

---

## Data Flow Patterns

### Fetching Data
```typescript
const [data, setData] = useState<Data[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  fetchData();
}, [slug]);

const fetchData = async () => {
  try {
    setLoading(true);
    const res = await fetch(`/api/endpoint/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const json = await res.json();
    setData(json.data || []);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Submitting Forms
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const res = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error('Failed to submit');
    const result = await res.json();
    router.push(`/path/${result.id}`);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

## Key Pages & Their Purposes

### Dashboard (`/polymath/dashboard`)
- User's personalized home
- Shows their communities
- Quick action buttons
- Recent activity feed

**APIs Needed**:
- GET `/api/communities/my` - User's communities

### Communities List (`/polymath/communities`)
- Browse all communities
- Search/filter
- Join new communities
- Create community button

**APIs Needed**:
- GET `/api/communities` - All communities
- GET `/api/communities?search=...` - Filtered communities

### Community Detail (`/polymath/communities/[slug]`)
- Tabbed interface: Overview | Resources | Discussions | Meetings | Members
- Community stats
- Role-based actions

**APIs Needed**:
- GET `/api/communities/[slug]` - Community info
- GET `/api/communities/[slug]/stats` - Community stats

### Resources (`/polymath/communities/[slug]/resources`)
- Grid of resources
- Filter by type
- Upload button
- Resource cards with metadata

**APIs Needed**:
- GET `/api/communities/[slug]/resources` - All resources
- GET `/api/communities/[slug]/resources?type=...` - Filtered resources
- POST `/api/communities/[slug]/resources` - Upload resource

### Discussions (`/polymath/communities/[slug]/discussions`)
- List of discussion threads
- Pinned discussions at top
- Start discussion button

**APIs Needed**:
- GET `/api/communities/[slug]/discussions` - All discussions
- POST `/api/communities/[slug]/discussions` - Create discussion

### Meetings (`/polymath/communities/[slug]/meetings`)
- Upcoming meetings
- Past meetings (archived)
- Schedule meeting button

**APIs Needed**:
- GET `/api/communities/[slug]/meetings` - All meetings
- POST `/api/communities/[slug]/meetings` - Schedule meeting

### Members (`/polymath/communities/[slug]/members`)
- List all members
- Curators section
- Regular members section
- Member roles & expertise

**APIs Needed**:
- GET `/api/communities/[slug]/members` - All members
- DELETE `/api/communities/[slug]/members/[id]` - Remove member

### Curator Dashboard (`/polymath/curator/[communityId]`)
- Community statistics
- Pending approvals
- Impact report
- Settings & analytics

**APIs Needed**:
- GET `/api/communities/[id]/stats` - Community stats
- GET `/api/communities/[id]/pending-approvals` - Pending items

### Profile (`/polymath/profile`)
- Edit name, email, bio
- Manage expertise tags
- Connected accounts

**APIs Needed**:
- GET `/api/users/profile` - Current user profile
- PUT `/api/users/profile` - Update profile

---

## Design Decisions

### Color System
- **Primary (Teal)**: #20B2AA - Main actions, primary buttons
- **Text**: #3C3C3C (dark), #666666 (muted), #999999 (light)
- **Background**: #FAFAFA (light), #FFFFFF (surface)
- **Danger**: #DC2626 (red) - Delete actions
- **Success**: #10B981 (green) - Positive actions

### Responsive Breakpoints
- **Mobile**: 375px - 767px (1 column, full width)
- **Tablet**: 768px - 1199px (2 columns)
- **Desktop**: 1200px+ (3+ columns)

### Loading Strategy
1. Show spinner while fetching
2. Show skeletons for known content areas
3. Empty state when no data
4. Error state with retry option

---

## Common Tasks

### Adding a New Page

1. Create folder: `/app/polymath/new-page/`
2. Create `page.tsx` with standard pattern
3. Use existing components
4. Follow naming conventions

### Adding a New Component

1. Create in `/app/components/polymath/NewComponent.tsx`
2. Add TypeScript interfaces
3. Export from `index.ts`
4. Add to `COMPONENT_LIBRARY.md`

### Connecting to API

1. Add fetch call in `useEffect`
2. Use LoadingState while fetching
3. Use EmptyState if no data
4. Show error message if failed
5. Transform data if needed

---

## Deployment Notes

- Next.js 16 with App Router
- Client components only (`'use client'`)
- No server-side rendering needed
- Static assets optimized with Next.js Image component
- Tailwind CSS compiled at build time

---

## Troubleshooting

### Button not styling correctly?
Check variant: `primary` | `secondary` | `danger` | `ghost` | `icon`

### Form not submitting?
Verify:
- Input `name` attributes match form data
- `handleChange` updates state correctly
- `handleSubmit` prevents default

### Component not found?
Make sure it's:
1. Created in `/app/components/polymath/`
2. Exported from `index.ts`
3. Imported correctly with path `/app/components/polymath`

### API endpoint returning wrong data?
Transform data in the fetch callback:
```typescript
const json = await res.json();
const transformed = json.data.map(item => ({...}));
```

---

## Next Steps

**Week 2-3**: T3 will wire all pages to T1 APIs

**Week 4**: Polish, testing, deployment

---

## Resources

- **Component Library**: `/app/components/polymath/COMPONENT_LIBRARY.md`
- **Week 1 Log**: `POLYMATH_WEEK1_LOG.md`
- **T2→T3 Handoff**: `POLYMATH_T2_T3_HANDOFF.md`
- **Viridian Colors**: `/app/design/colors.ts`

---

**Status**: Production Ready ✅
