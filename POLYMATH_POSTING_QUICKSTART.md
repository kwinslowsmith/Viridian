# Polymath Posting Components - Quick Start Guide

**Quick reference for using the posting components.**

---

## Import All Components

```typescript
import {
  PolymathPostingForm,
  IndividualPostForm,
  OrgPostForm,
  CommunityPostForm,
  EventPostForm,
  ApprovalQueue,
  StatusBadge,
  CredibilityBadge,
  ApprovalProgressBar,
  ContentForm,
} from '@/app/components/index.polymath-posting';
```

---

## 5-Minute Setup

### Option A: Full Form (Recommended)

```tsx
<PolymathPostingForm
  userId={currentUser.id}
  organizations={userOrganizations}
  communities={userCommunities}
  userName={currentUser.name}
  userAvatar="👤"
  onSuccess={(postId) => {
    console.log('Posted!', postId);
    router.push(`/polymath/article/${postId}`);
  }}
/>
```

### Option B: Individual Form Only

```tsx
<IndividualPostForm
  userId={currentUser.id}
  userName={currentUser.name}
  userCredentials={["PhD Education", "10 years teaching"]}
  onSuccess={(postId) => router.push(`/polymath/${postId}`)}
/>
```

---

## Component Usage Quick Reference

### PolymathPostingForm (Router)
```tsx
<PolymathPostingForm
  userId={string}
  authorType?={'individual' | 'organization' | 'community' | 'event'}
  organizations={[{ id, name, logo?, isVerified? }]}
  communities={[{ id, name, badge?, moderatorName? }]}
  userName?={string}
  userAvatar?={string}
  userTier?={'Expert' | 'Intermediate' | 'Beginner'}
  userCredentials={string[]}
  onSuccess={(postId: string) => void}
/>
```

### IndividualPostForm
```tsx
<IndividualPostForm
  userId={string}
  userName?={string}
  userAvatar?={string}
  userTier?={'Expert' | 'Intermediate' | 'Beginner'}
  userCredentials={string[]}
  onSuccess={(postId: string) => void}
/>
```

### OrgPostForm
```tsx
<OrgPostForm
  organizationId={string}
  organizationName?={string}
  organizationLogo?={string}
  isVerified?={boolean}
  userId={string}
  onSuccess={(postId: string) => void}
/>
```

### CommunityPostForm
```tsx
<CommunityPostForm
  communityId={string}
  communityName?={string}
  communityBadge?={string}
  moderatorName?={string}
  userId={string}
  onSuccess={(postId: string) => void}
/>
```

### EventPostForm
```tsx
<EventPostForm
  userId={string}
  onSuccess={(postId: string) => void}
/>
```

### ApprovalQueue
```tsx
<ApprovalQueue
  organizationId?={string}
  communityId?={string}
  onApprove={(itemId: string) => void}
  onReject={(itemId: string, feedback: string) => void}
  pollingIntervalMs?={number}  // default 5000
/>
```

### StatusBadge
```tsx
<StatusBadge
  status?={'published' | 'pending_approval' | 'rejected' | 'draft'}
  visibility?={'public' | 'organization' | 'community' | 'class' | 'private'}
  authorType?={'individual' | 'organization' | 'community' | 'event'}
  size?={'sm' | 'md' | 'lg'}  // default 'md'
/>
```

### CredibilityBadge
```tsx
<CredibilityBadge
  authorType={'individual' | 'organization' | 'community' | 'event'}
  authorId={string}
  organizationId?={string}
  communityId?={string}
  eventId?={string}
  compact?={boolean}  // default false
/>
```

### ApprovalProgressBar
```tsx
<ApprovalProgressBar
  totalApprovers={number}
  approvedCount={number}
  approverNames?={string[]}
  approverDetails?={[{ name, approved, approvedAt? }]}
/>
```

### ContentForm
```tsx
<ContentForm
  value={string}
  onChange={(content: string) => void}
  placeholder?={string}
  maxLength?={number}  // default 10000
  minHeight?={string}  // default 'min-h-64'
/>
```

---

## Common Patterns

### Pattern 1: Embed in Modal
```tsx
const [showModal, setShowModal] = useState(false);

<>
  <button onClick={() => setShowModal(true)}>Create Post</button>
  
  {showModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={() => setShowModal(false)} className="text-xl mb-4">✕</button>
        <PolymathPostingForm
          userId={user.id}
          organizations={orgs}
          communities={communities}
          onSuccess={(postId) => {
            setShowModal(false);
            showToast('Published!');
          }}
        />
      </div>
    </div>
  )}
</>
```

### Pattern 2: Page Component
```tsx
export default function CreatePostPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Content</h1>
      <PolymathPostingForm
        userId={user.id}
        organizations={user.organizations}
        communities={user.communities}
        userName={user.name}
        onSuccess={(postId) => router.push(`/polymath/article/${postId}`)}
      />
    </div>
  );
}
```

### Pattern 3: Org Admin Dashboard
```tsx
export default function OrgApprovalDashboard() {
  const { organization } = useOrganization();
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Approvals</h2>
        <ApprovalQueue
          organizationId={organization.id}
          pollingIntervalMs={5000}
          onApprove={() => showToast('Approved!')}
          onReject={() => showToast('Rejected')}
        />
      </div>
    </div>
  );
}
```

---

## API Endpoints to Implement

```typescript
// Create post
POST /api/polymath/posts
Request: {
  title: string;
  content: string;
  authorType: "user" | "organization" | "community" | "event";
  authorId: string;
  tier: "introduction" | "intermediate" | "expert";
  tags?: string[];
  status: "draft" | "published" | "pending_approval";
  visibility: "public" | "organization" | "community" | "class" | "private";
  approvalChain?: string[];
  organizationId?: string;
  communityId?: string;
  eventId?: string;
}
Response: { id, title, createdAt, ... }

// Get approval queue
GET /api/polymath/approval-queue?organizationId=X&communityId=Y
Response: [{
  id, title, type, submittedBy, submittedAt, status,
  approvalChain, approvedBy, totalApprovers, approvedCount
}]

// Approve item
PATCH /api/polymath/articles/:id/approve
Response: { id, status: "published" }

// Reject item
PATCH /api/polymath/articles/:id/reject
Request: { feedback: string }
Response: { id, status: "rejected" }
```

---

## Mock Data Already Included

All forms include mock data for development:
- **OrgPostForm:** 3 sample org admins (Sarah, Tom, Maria)
- **EventPostForm:** 3 sample events
- **ApprovalQueue:** 3 sample pending items
- **CredibilityBadge:** Mock credibility data by type

No additional setup needed - components work immediately!

---

## Replace Mock Data with Real API

Find mock data in each component, marked with comments:
```typescript
// Mock data for now - replace with actual API call
const mockEvents: EventOption[] = [...]
```

Simply replace with:
```typescript
const response = await fetch(`/api/events?userId=${userId}`);
const events = await response.json();
```

---

## Styling & Customization

All components use:
- **Tailwind CSS** classes
- **Design system colors** (variables in globals-polymath.css)
- **PolymathButton** component for buttons

To customize:
1. Modify Tailwind classes in component JSX
2. Update color variables in globals-polymath.css
3. Components automatically use design tokens

---

## Troubleshooting

### Form not submitting?
- Check required fields are filled (title, content, etc.)
- Verify at least 1 approver selected (org forms)
- Check console for validation messages

### Dropdowns not showing?
- May need z-index adjustment if in modal
- Add `z-50` to parent container

### Styling looks off?
- Ensure globals-polymath.css is imported
- Check Tailwind config includes component directory
- Verify design token colors in CSS

### Mock data not showing?
- All components include mock data by default
- Look for "Mock data for now" comments
- Replace with real API calls when ready

---

## File Locations

| Component | Path |
|-----------|------|
| All exports | `/app/components/index.polymath-posting.ts` |
| Individual components | `/app/components/[ComponentName].tsx` |
| Documentation | `/POLYMATH_POSTING_COMPONENTS.md` |
| Build summary | `/POLYMATH_POSTING_BUILD_SUMMARY.md` |

---

## Support Resources

- **Full Documentation:** See `POLYMATH_POSTING_COMPONENTS.md`
- **Build Summary:** See `POLYMATH_POSTING_BUILD_SUMMARY.md`
- **Component Props:** Check TypeScript interfaces in component files
- **Examples:** Check usage examples in this file

---

## Next Steps

1. ✅ Components built and committed
2. **→ Integrate API endpoints** (replace mock data)
3. Add tests (Jest + React Testing Library)
4. Create Storybook stories
5. Deploy and test with real data

---

**Ready to use! Start with Option A or B above.** 🚀
