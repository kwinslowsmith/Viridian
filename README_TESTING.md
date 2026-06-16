# Viridian — Ready for Testing

**Date:** June 9, 2026
**Status:** ✅ Day 3 Phases 1 & 2 Complete
**Demo Ready:** Partial (basic learning community system)
**Target Completion:** June 25, 2026

## What's Ready to Test

### ✅ Complete Features
- **Global Learning Community Discovery** — Browse all public communities with search and filters
- **Community Management** — Create, edit, and manage communities as a curator
- **Module System** — Create and organize modules within communities
- **Community Joining** — Both open communities and approval-required communities
- **User Dashboard** — "My Communities" showing joined and pending communities
- **Join Request Management** — Curators can approve/reject membership requests
- **Authentication** — Email/password signup and login (no email verification required in dev)

### 📊 Sample Data Included
- **2 Test Communities:**
  1. "Introduction to Musical Improv" (open join, beginner level)
  2. "Advanced Improv Techniques" (approval-required, advanced level)
- **4 Sample Modules** in the intro community
- **Test Users:**
  - `kyle@example.com` — Curator/instructor
  - `maya@example.com` — Student
  - `jordan@example.com` — Student
  - `alex@example.com` — Student

## Quick Start Testing

### Step 1: Start the Dev Server
```bash
npm run dev
```
Server runs on http://localhost:3000

### Step 2: Sign Up or Use Test Account
**Login with:**
- Email: `kyle@example.com`
- Password: `test` (or sign up with new email — no verification needed)

### Step 3: Test These Flows

#### Discovery Flow
1. Click "Discover Communities" in navigation
2. Search for "Musical Improv"
3. See both test communities
4. Click on "Introduction to Musical Improv"
5. View modules, members, description

#### Join Community Flow
1. On community detail page, click "Join Community"
2. See success message
3. Go to "My Communities" dashboard
4. See community in "Joined" tab

#### Curator Panel
1. Click "Curator" in navigation
2. See list of communities you curate
3. Click "Modules" to add/edit modules
4. Click "Edit" to modify community details
5. Create a new community with "Create Community" button

#### Advanced: Approval-Required Community
1. Ask someone else to test joining "Advanced Improv Techniques"
2. They should see "Request to Join" button
3. In Curator panel → Join Requests, approve their request
4. They'll be added as member

## File Structure

```
/app
├── discover/
│   ├── page.tsx              # Community discovery page
│   └── [slug]/page.tsx        # Community detail page
├── communities/
│   └── page.tsx              # My Communities dashboard
├── curator/
│   ├── page.tsx              # Curator panel (create communities)
│   ├── [slug]/
│   │   ├── edit/page.tsx      # Edit community
│   │   ├── modules/page.tsx   # Manage modules
│   │   └── join-requests/page.tsx
├── api/
│   ├── curator/communities/   # Get curator's communities
│   ├── communities/           # All community APIs
│   └── me/communities/        # User's communities

/prisma
├── schema.prisma              # Database schema
└── seed.ts                    # Test data

/TESTING_CHECKLIST.md          # Detailed test checklist
```

## API Endpoints (For Reference)

### Discovery
- `GET /api/communities?scope=&topic=&search=` — List communities
- `GET /api/communities/[slug]` — Get community details

### Community Management
- `POST /api/communities` — Create community
- `PATCH /api/communities/[slug]` — Update community
- `DELETE /api/communities/[slug]` — Archive community

### Modules
- `POST /api/communities/[slug]/modules` — Create module
- `PATCH /api/communities/[slug]/modules/[id]` — Edit module
- `DELETE /api/communities/[slug]/modules/[id]` — Delete module

### Membership
- `POST /api/communities/[slug]/join` — Join community
- `DELETE /api/communities/[slug]/join` — Leave community
- `GET /api/communities/[slug]/members` — Get members

### Join Requests
- `GET /api/communities/[slug]/join-requests` — Get pending requests
- `POST /api/communities/[slug]/join-requests/[id]/approve` — Approve
- `POST /api/communities/[slug]/join-requests/[id]/reject` — Reject

### User
- `GET /api/me/communities` — Get user's communities
- `GET /api/curator/communities` — Get curator's communities

## Known Limitations

### By Design (Development Mode)
- Email verification is disabled (users can join without verifying email)
- Error handling uses browser alerts instead of toast notifications
- Module sequencing is auto-increment (not manually reorderable yet)
- No module content/lessons view (just module metadata)

### Not Yet Implemented
- Module lessons/content within modules
- Progress tracking across modules
- Community member promotion (all members are "member" role)
- Community moderation tools
- Community messaging/chat
- Bulk operations
- Module scheduling/deadlines

## Testing Checklist

See `TESTING_CHECKLIST.md` for the complete testing guide with all expected behaviors for each feature.

## Troubleshooting

### "Unauthorized" errors
- Ensure you're logged in
- Check that you're the curator of the community (for edit/delete operations)

### Communities not appearing
- Check filters (Scope filter might be set to "Organization" only)
- Clear search field
- Refresh page

### Can't create modules
- Must be logged in as the community curator
- Use the "Modules" button on a community in Curator panel

## Next Steps

### Immediate (Today/Tomorrow)
1. ✅ Test all flows manually in browser
2. ✅ Report any bugs or UX issues
3. ✅ Verify data persists across sessions
4. Create sample/demo communities with real content

### Day 4: Integration & Testing
1. Connect with existing Phase 1 components
2. Test progress tracking
3. Create end-to-end demo flow
4. Performance and security testing

### Pre-Demo (By June 25)
1. Populate with curated content
2. Create teacher + student demo accounts
3. Practice demo flow
4. Polish UI/UX based on testing feedback

## Questions?

Check the code comments in:
- `/app/api/communities/route.ts` — Architecture decisions
- `/app/page.tsx` — Navigation structure
- `/prisma/schema.prisma` — Data model

---

**Ready to test? Start the dev server and begin with the Discovery flow!**

```bash
npm run dev
# Then visit http://localhost:3000
```
