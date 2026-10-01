# T2: Frontend Verification Strategy
**Week 4 (Oct 2-6, 2026)**  
**Owner**: T2 Frontend Agent  
**Status**: WAITING FOR T1 BACKEND FIX

---

## Objective
Verify all Polymath frontend pages load and display REAL API data (not mock data).

---

## Prerequisites (Blocked Until T1 Fixes)
- ❌ Backend APIs working on Vercel
- ❌ DATABASE_URL configured correctly
- ❌ All 9 endpoints returning 200/201 instead of 500

**Current Status**: Backend returning `FUNCTION_INVOCATION_FAILED` - T1 working on DATABASE_URL fix.

---

## Priority 1: Verify Data Loading (Oct 2-3)

Once backend is fixed, execute these tests in order:

### Test 1: Communities List Page
**Route**: `/polymath/communities`  
**Expected**: Load list of communities from API

**Steps**:
1. Navigate to https://viridian.vercel.app/polymath/communities
2. Wait for page to load
3. **Verify**:
   - [ ] LoadingState appears briefly (shows "Loading communities...")
   - [ ] Community cards appear (grid layout)
   - [ ] Each card shows: name, description, member count
   - [ ] Search box is functional (filter by name/description)
   - [ ] "Create Community" button visible and clickable

**Expected Data**:
- Communities loaded from `GET /api/communities`
- Should show list of existing communities (check what's in Supabase)
- No mock data - all real from API

**Screenshots to Take**:
- Full page loaded with communities
- Empty state (if no communities)
- Search results

---

### Test 2: Create Community Form
**Route**: `/polymath/communities/create`  
**Expected**: Form to create new community

**Steps**:
1. Click "+ Create Community" button from communities list
2. Fill form:
   - Name: "Test Community"
   - Description: "Testing T2 verification"
   - Scope: "global"
3. Submit form
4. **Verify**:
   - [ ] Success message appears
   - [ ] Redirected back to communities list
   - [ ] New community appears in list
   - [ ] New community shows in API response

**Expected Behavior**:
- POST to `/api/communities` succeeds
- Community created in Supabase
- Appears in list when page reloads

**Screenshots**:
- Form filled out
- Success state
- Community in list after creation

---

### Test 3: Community Detail Page
**Route**: `/polymath/communities/[slug]`  
**Expected**: Full community dashboard with tabs

**Steps**:
1. Click on a community card
2. Navigate to community detail page
3. **Verify each tab loads real data**:

**Tab 1: Overview**
- [ ] Community name displays
- [ ] Description displays
- [ ] Stats show (members, resources, discussions count)
- [ ] Curator info shows (if curator exists)
- [ ] "Join Community" button works

**Tab 2: Resources**
- [ ] Fetch real resources from `GET /api/communities/[slug]/resources`
- [ ] Display resources with title, description, type, creator
- [ ] "Upload Resource" button accessible
- [ ] Empty state if no resources

**Tab 3: Discussions**
- [ ] Fetch real discussions from `GET /api/communities/[slug]/discussions`
- [ ] Display discussion cards with title, creator, date
- [ ] Pinned discussions separated from recent
- [ ] "Start Discussion" button works
- [ ] Clicking discussion links to detail page

**Tab 4: Meetings**
- [ ] Fetch real meetings from `GET /api/communities/[slug]/meetings`
- [ ] Display upcoming and past meetings separated
- [ ] Show date, time, location, host
- [ ] "Schedule Meeting" button accessible

**Tab 5: Members**
- [ ] Fetch real members from `GET /api/communities/[slug]/members`
- [ ] Display members in grid (curators separate from members)
- [ ] Show name, email, join date
- [ ] Links to member profiles

**Screenshots**:
- Each tab fully loaded
- Error state (if applicable)
- Empty states

---

### Test 4: Discussion Thread Detail Page
**Route**: `/polymath/communities/[slug]/discussions/[discussionId]`  
**Expected**: Full discussion with message thread

**Steps**:
1. From community discussions tab, click on a discussion
2. Navigate to discussion detail page
3. **Verify**:
   - [ ] Discussion title, description, creator info displays
   - [ ] All messages show in chronological order
   - [ ] Each message shows: author, content, timestamp
   - [ ] Reply form at bottom is visible
   - [ ] Can type and submit reply
   - [ ] New message appears in thread after posting
   - [ ] Empty state if no messages yet

**Expected Data**:
- Discussion fetched from `GET /api/communities/[slug]/discussions/[discussionId]`
- Messages fetched from `GET /api/communities/[slug]/discussions/[discussionId]/messages`
- New message posts to `POST /api/communities/[slug]/discussions/[discussionId]/messages`

**Screenshots**:
- Full thread display
- Reply form
- New message after posting

---

### Test 5: Error State Verification
**Test invalid/unauthorized access**:

1. **Invalid community slug**:
   - Navigate to `/polymath/communities/invalid-slug-xyz`
   - **Verify**: Error message shows "Community not found"
   - **Verify**: "Back to Communities" link works

2. **Unauthorized API call** (if applicable):
   - Try accessing protected endpoint
   - **Verify**: Proper error message (401 Unauthorized)
   - **Verify**: User redirected to login

3. **Server error** (simulate):
   - If API returns 500, **verify**: Error message displays
   - **Verify**: "Back to Communities" link available

---

## Priority 2: Edge Cases (Oct 4-5)

### Empty State Testing
- [ ] Empty communities list (no data)
- [ ] Empty discussions in community
- [ ] Empty members list
- [ ] Empty messages in discussion thread

**Expected**: EmptyState component shows with contextual message and action button

### Error State Testing
- [ ] Invalid community ID
- [ ] Unauthorized access (if permission system in place)
- [ ] Network timeout
- [ ] API returns 500

**Expected**: Error message displays with recovery action (back button)

### Responsive Design Testing
**Test at breakpoints**: 375px (mobile), 768px (tablet), 1200px (desktop)

Checklist:
- [ ] Text readable (no overflow, proper line wrapping)
- [ ] Buttons/forms usable on mobile (touch targets 48px+)
- [ ] Grids adapt properly (1 col → 2 cols → 3 cols)
- [ ] Modals fit within viewport
- [ ] No horizontal scrolling
- [ ] Images/cards scale appropriately

---

## Priority 3: Final Polish (Oct 6)

### Performance
- [ ] Pages load within 2 seconds
- [ ] No console errors
- [ ] No memory leaks (open DevTools → Performance tab)

### Accessibility
- [ ] Color contrast sufficient (text readable)
- [ ] Alt text on images (if any)
- [ ] Form labels associated with inputs
- [ ] Keyboard navigation works

### UI Polish
- [ ] All buttons are clickable and respond
- [ ] Loading states feel smooth (not jarring)
- [ ] Error messages are helpful
- [ ] Success messages appear and auto-dismiss

---

## Test Data Needed

For comprehensive testing, Supabase should have:
- ✅ At least 2-3 communities
- ✅ At least 5-10 discussions across communities
- ✅ At least 3-5 resources
- ✅ At least 2 meetings
- ✅ At least 3-5 members per community

Ask T1 for seeded test data or manually create via API.

---

## Reporting

Once all tests pass, create `T2_VERIFICATION_REPORT.md` with:
- Test date/time
- All screenshots
- Pass/fail for each test
- Any bugs found
- Performance metrics
- Accessibility notes

**Report Format**:
```
# T2 Frontend Verification Report
**Date**: Oct X, 2026
**Tester**: T2 Frontend Agent
**Status**: ✅ ALL TESTS PASSED (or list failures)

## Test Results
### Communities List: ✅ PASS
- [x] Page loads with real data
- [x] Search works
- [x] Create button accessible
- Screenshots: [attached]

### Create Community: ✅ PASS
...
```

---

## Blocked Items

Currently blocked on:
- [ ] T1: Fix DATABASE_URL on Vercel
- [ ] T1: Deploy working APIs
- [ ] T1: Seed test data in Supabase

Once T1 completes these, T2 can execute this verification plan within 2 days.

---

## Ready to Execute

This plan is ready to execute immediately once:
1. ✅ Vercel APIs return 200 (not 500)
2. ✅ Test data exists in Supabase
3. ✅ Database connection confirmed working

**Estimated Time**: 4-6 hours (all tests, screenshots, report)

