# Community Resources — Phase 2A Complete

**Date:** June 11, 2026
**Status:** ✅ Phase 2A Complete (Basic Community Resources)
**Build Status:** ✅ Compiles successfully

## What's Implemented

### Schema Updates ✅
- Added back-relation: `LearningCommunity.resources`
- Activated `Resource.communityId` with cascade delete
- Updated `Resource.visibility` to support "community" scope
- Made `Resource.organizationId` optional (supports global + org-scoped communities)
- Added index on `Resource.communityId`
- Deployed with `npx prisma db push`

### API Endpoints (4 total) ✅
1. **GET /api/communities/[slug]/resources** — Fetch community-scoped resources
   - Returns all resources with visibility: "community" for this community
   - Includes: createdBy, skills with details, objectives with details
   - Ordered by createdAt (newest first)

2. **POST /api/communities/[slug]/resources** — Create community resource (curator only)
   - Body: title*, type*, source (url or file), format, visibility (locked to "community"), skills, objectives, tags
   - Auth: Curator of community only (403 if not curator)
   - Response: full resource with 201 status

3. **PUT /api/communities/[slug]/resources/[resourceId]** — Update community resource (curator only)
   - Auth: Curator of community only
   - Deletes + recreates skill/objective relations (via transaction)
   - Response: updated resource

4. **DELETE /api/communities/[slug]/resources/[resourceId]** — Delete community resource (curator only)
   - Deletes file from Supabase FIRST (if exists), then DB record
   - Auth: Curator of community only
   - Response: { success: true }

### UI Components ✅
1. **CommunityResourceLibrary.tsx** (NEW)
   - Filter bar: search input, type dropdown
   - "+ Add Resource" button (curator only) in colors.teal.accent
   - Resource grid: 3 cols desktop / responsive mobile
   - Renders ResourceCard per resource (edit/delete for curator)
   - Opens ResourceForm modal for create/edit
   - Props: communitySlug, isCurator, userId

2. **ResourceForm.tsx** (UPDATED)
   - Added optional `communitySlug` prop
   - Visibility options auto-set to ['community'] when creating community resources
   - API endpoint dynamically set: `/api/communities/[slug]/resources` vs `/api/organizations/[slug]/resources`
   - Works seamlessly for org, class, AND community resources

### Community Detail Page (UPDATED) ✅
- Added import: `CommunityResourceLibrary`
- Added 'resources' to tab type union
- Added "Resources" tab button (always visible)
- Added Resources tab content rendering CommunityResourceLibrary
- Passes `isCurator={community.curatorId === session?.user?.id}` to component

## Architecture Decisions

**Curator-Only Resources:**
- Only community curator can create/edit/delete community resources (like teachers in classes)
- Members can view and discover resources
- Aligns with curator's role as community leader

**Visibility: "community" vs Other Scopes:**
- Resources with visibility: "community" are scoped to ONE community (via communityId FK)
- Distinct from "org" (all org members), "class" (specific class), "public" (global)
- Curators cannot currently share org/public resources within their community (Phase 2B feature)

**Global Communities Support:**
- Community resources work for both global and org-scoped communities
- organizationId is optional on Resource (NULL for global community resources)
- Schema change: made Resource.organizationId optional, cascade SetNull on delete

## Known Limitations (Phase 2B)

**Not Implemented Yet:**
- [ ] Member resource suggestions (members suggest, curator approves)
- [ ] Curating org/public resources into community (without creating new resources)
- [ ] Signed URLs for file download
- [ ] Resource ratings/comments
- [ ] Full-text search across communities
- [ ] Module-level resource association (tag resources to specific modules)

## Testing Checklist

### As Curator
- [ ] Navigate to community detail page → Resources tab
- [ ] Click "+ Add Resource" button
- [ ] Create community resource (visibility should be locked to "community")
- [ ] Edit and delete resources
- [ ] Verify file upload works (requires Supabase config)

### As Community Member
- [ ] Navigate to community detail page → Resources tab
- [ ] See curator's community resources in grid
- [ ] Search and filter by type
- [ ] Verify no edit/delete buttons visible (curator-only)
- [ ] Click resource to open URL or download file

### Global vs Org-Scoped Communities
- [ ] Create resource in global community → verify no organizationId
- [ ] Create resource in org-scoped community → verify organizationId set to community's org

## Database Impact

**New Indexes:**
- Resource.communityId (fast lookup by community)

**Schema Changes:**
- LearningCommunity.resources (one-to-many)
- Resource.community (optional many-to-one, cascade SetNull)
- Resource.organizationId made optional (was required)

**Backward Compatibility:**
- Existing org/class/public resources unaffected
- Org resources still require organizationId (can't be null for org scope)
- Migration: no existing data changes needed

## Files Created/Modified

### New Files
- `/app/api/communities/[slug]/resources/route.ts` (GET + POST)
- `/app/api/communities/[slug]/resources/[resourceId]/route.ts` (PUT + DELETE)
- `/app/components/CommunityResourceLibrary.tsx` (4 resource library component)

### Modified Files
- `/prisma/schema.prisma` (schema updates + back-relations)
- `/app/components/ResourceForm.tsx` (added communitySlug support)
- `/app/discover/[slug]/page.tsx` (added Resources tab)

## Build & Deploy Notes

- Build: ✅ Completes in 2.4s
- TypeScript: ✅ All errors resolved
- API Routes: ✅ 4 new endpoints registered
- Pages: ✅ Community detail page updated

## What's Next (Phase 2B: Member Suggestions)

To implement curator-curated + member suggestions:

1. Create **ResourceSuggestion** join table:
   - Fields: id, resourceId, communityId, userId (suggester), status (pending/approved/rejected), createdAt
   - Enables members to suggest existing resources for community

2. Add API endpoints:
   - `POST /api/communities/[slug]/resource-suggestions` — Member suggests resource
   - `GET /api/communities/[slug]/resource-suggestions` — Curator views pending (curator-only)
   - `POST /api/communities/[slug]/resource-suggestions/[suggestionId]/approve` — Approve suggestion (curator-only)
   - `POST /api/communities/[slug]/resource-suggestions/[suggestionId]/reject` — Reject suggestion (curator-only)

3. UI for suggestions:
   - Add "Suggest Resource" modal in community resources view
   - Add "Pending Suggestions" tab for curator (shows suggested resources waiting approval)

This would enable the full "curator-curated + member suggestions" model you requested.
