# Viridian Day 3 Testing Checklist

**Status:** Day 3 Phases 1 & 2 Complete — Ready for Testing
**Build Date:** 2026-06-09
**Target Deadline:** June 25, 2026

## What's Built

### Discovery Interface
- ✅ `/discover` — Browse all public communities (with search, topic/scope filters, pagination)
- ✅ `/discover/[slug]` — Community detail page (modules, members, overview tabs)

### User Community Management
- ✅ `/communities` — "My Communities" dashboard (joined vs pending tabs)
- ✅ Join/Leave community functionality
- ✅ Integration with discovery interface

### Curator Tools
- ✅ `/curator` — Curator Panel (create communities, view owned communities)
- ✅ `/curator/[slug]/edit` — Edit community details
- ✅ `/curator/[slug]/modules` — Manage modules (create, edit, delete)
- ✅ `/curator/[slug]/join-requests` — Approve/reject join requests

### Navigation
- ✅ Updated home page with links to: Discover Communities, My Communities, Curator
- ✅ Navigation links appear on authenticated dashboard

## Test Flows

### 1. Authentication Flow
- [ ] Sign up with email (any test email)
- [ ] Verify login works (no email verification required in dev mode)
- [ ] Verify session persists across page navigation
- [ ] Logout works and redirects to login page

### 2. Discovery Flow
- [ ] Visit `/discover` - should load community grid
- [ ] Search for a community by name
- [ ] Filter by Scope (All/Global/Organization)
- [ ] Filter by Topic
- [ ] Pagination works (Previous/Next buttons)
- [ ] Click on a community card → routes to `/discover/[slug]`

### 3. Community Detail Flow
- [ ] View community info: name, description, stats
- [ ] Switch between tabs: Overview, Modules, Members
- [ ] Overview tab shows description + estimated hours
- [ ] Modules tab lists all modules with sequence numbers
- [ ] Members tab shows community members
- [ ] Join button appears if not a member
- [ ] Leave button appears if already a member

### 4. Join Community Flow (Open)
- [ ] Find a public community that doesn't require approval
- [ ] Click "Join Community" button
- [ ] Should see "Joined community!" message
- [ ] Join button changes to "Leave Community"
- [ ] Community appears in `/communities` dashboard under "Joined" tab

### 5. Join Community Flow (Approval Required)
- [ ] Find a community with "Requires Approval" setting
- [ ] Click "Request to Join" button
- [ ] Should see "Join request sent!" message
- [ ] Community appears in `/communities` dashboard under "Pending" tab

### 6. Curator: Create Community
- [ ] Go to `/curator`
- [ ] Click "+ Create Community" button
- [ ] Fill in: name, description, topic, difficulty, estimated hours
- [ ] Toggle "Require approval to join" if desired
- [ ] Click "Create Community"
- [ ] Should see success message
- [ ] New community appears in curator's community list

### 7. Curator: Edit Community
- [ ] From `/curator`, click "Edit" on a community you created
- [ ] Modify fields (name, description, topic, etc.)
- [ ] Click "Save Changes"
- [ ] Changes should be visible immediately

### 8. Curator: Manage Modules
- [ ] From `/curator`, click "Modules (n)" on a community
- [ ] Click "+ Add Module" button
- [ ] Fill in: title, description, estimated hours
- [ ] Click "Create Module"
- [ ] Module appears in list with sequence number
- [ ] Click "Edit" to modify module
- [ ] Click "Delete" to remove module
- [ ] Modules show in community detail page under "Modules" tab

### 9. Curator: Join Requests
- [ ] Create a community with "Require approval to join" enabled
- [ ] Have another user (or different browser) request to join
- [ ] From `/curator`, click "Join Requests (n)"
- [ ] See pending request with user info
- [ ] Click "Approve" → user becomes member
- [ ] Click "Reject" → request is removed

### 10. My Communities Dashboard
- [ ] Visit `/communities`
- [ ] See "Joined" tab with communities you've joined
- [ ] See "Pending" tab with communities awaiting approval
- [ ] Click "View" → routes to community detail page
- [ ] Click "Leave" → removes you from community
- [ ] Community disappears from "Joined" tab

## Known Limitations (Dev Mode)

- Email verification is skipped (users can log in without verifying email)
- Some error handling uses browser alerts instead of toast notifications
- Module sequencing doesn't allow reordering yet (auto-increments on creation)

## Integration Checklist (For Day 4)

- [ ] Test with existing Phase 1 components (StudentCalendarView, etc.)
- [ ] Test module content viewing (lessons, resources)
- [ ] Test progress tracking across modules
- [ ] Test community member status changes
- [ ] Test concurrent user actions

## Endpoints Created

### GET Endpoints
- `GET /api/communities` — List communities with filters
- `GET /api/communities/[slug]` — Get community details
- `GET /api/communities/[slug]/members` — Get community members
- `GET /api/communities/[slug]/modules` — Get community modules
- `GET /api/communities/[slug]/join-requests` — Get pending join requests (curator only)
- `GET /api/me/communities` — Get user's communities
- `GET /api/curator/communities` — Get curator's communities

### POST Endpoints
- `POST /api/communities` — Create community (authenticated user)
- `POST /api/communities/[slug]/join` — Join community
- `POST /api/communities/[slug]/modules` — Create module (curator only)
- `POST /api/communities/[slug]/join-requests/[id]/approve` — Approve join request
- `POST /api/communities/[slug]/join-requests/[id]/reject` — Reject join request

### PATCH Endpoints
- `PATCH /api/communities/[slug]` — Update community (curator/admin only)
- `PATCH /api/communities/[slug]/modules/[id]` — Update module (curator only)

### DELETE Endpoints
- `DELETE /api/communities/[slug]` — Archive community (curator/admin only)
- `DELETE /api/communities/[slug]/join` — Leave community
- `DELETE /api/communities/[slug]/modules/[id]` — Delete module (curator only)

## Success Criteria

✅ All test flows pass
✅ No console errors or warnings
✅ Authentication gates work correctly
✅ Data persists across sessions
✅ UI matches design system (colors, spacing, typography)
✅ Navigation is intuitive and responsive

---

**Next Steps After Testing:**
1. Fix any bugs found during testing
2. Prepare sample communities and modules for demo
3. Create demo account with test data
4. Day 4: Full integration testing with Phase 1 components
5. June 25: Ready for public demo!
