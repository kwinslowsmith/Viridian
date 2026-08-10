# T3: Parent Experience — Browser Verification Test Plan

**Date:** 2026-08-10  
**Instance:** T3 (Parent Experience)  
**Environment:** https://viridian.vercel.app (Production Deployment)  
**Tester:** Claude Code (T3)  

---

## Test Credentials

| Field | Value |
|-------|-------|
| Email | parent0@example.com |
| Password | TestPassword123! |
| Parent Name | Parent 1 |
| Parent ID | cmsjazgo6003dugctxexleb21 |

### Linked Children

| Child | ID | Class | Teacher |
|-------|--|-------|---------|
| Student 1 Chen | cmsjazbgb0003ugct0889inmo | American Literature, Period 3 | Teacher 1 Rodriguez |
| Student 2 Johnson | cmsjazbkg0004ugctvy6zdjwz | American Literature, Period 3 | Teacher 1 Rodriguez |

---

## Test Plan

### Phase 1: Authentication & Navigation

- [ ] **Step 1:** Navigate to https://viridian.vercel.app
- [ ] **Step 2:** Click "Sign In" / login button
- [ ] **Step 3:** Enter email: parent0@example.com
- [ ] **Step 4:** Enter password: TestPassword123!
- [ ] **Step 5:** Click "Sign In"
- [ ] **Step 6:** Verify dashboard loads (should show parent view, not admin/teacher/student)
- [ ] **Step 7:** Navigate to Parent Dashboard (/app/parents/child/cmsjazbgb0003ugct0889inmo/dashboard-k12)

### Phase 2: Parent Dashboard — Header Section

**URL:** `/app/parents/child/cmsjazbgb0003ugct0889inmo/dashboard-k12`

#### Expected: Purple/blue gradient header with child info
- [ ] **2.1** Header loads without errors
- [ ] **2.2** Child name displays: "Student 1 Chen's Learning Progress"
- [ ] **2.3** Grade level displays correctly
- [ ] **2.4** Class name displays: "American Literature, Period 3"
- [ ] **2.5** Teacher info section appears on right side:
  - [ ] Teacher name: "Teacher 1 Rodriguez"
  - [ ] Teacher email link: teacher1@riverside.edu
  - [ ] Email link is clickable (mailto: link)
- [ ] **2.6** Last updated timestamp displays (should be recent)
- [ ] **2.7** No console errors in browser developer tools

**Plain Language Check:**
- [ ] "Learning Progress" is clear, not jargon
- [ ] "Grade" and "Class" are plain language
- [ ] Teacher section is clear

### Phase 3: Standards Overview Section

**Expected:** Grid of standards with status pills and progress bars

- [ ] **3.1** "Learning Standards Overview" section title visible
- [ ] **3.2** Subtitle explains context in plain language (mentions standards + success)
- [ ] **3.3** Standards grid displays (should show 2-4 standards based on class)
- [ ] **3.4** For each standard:
  - [ ] Status pill visible (Green "On Track" OR Amber "Needs Support" OR Gray "Not Started")
  - [ ] Standard name readable and clear
  - [ ] Standard description visible
  - [ ] Mastery percentage displayed (0-100%)
  - [ ] Progress bar visible (fills proportionally to %)
  - [ ] Expand arrow (▶) visible, clickable

**Plain Language Check:**
- [ ] Standard names are clear
- [ ] Descriptions avoid K12 jargon
- [ ] Status labels are plain: "On Track", "Needs Support", "Not Started"

### Phase 4: Expandable Standard Details

**Expected:** When expanding a standard, show detailed info + tips

- [ ] **4.1** Click expand arrow on first standard
- [ ] **4.2** Standard details expand (no jumping/flickering)
- [ ] **4.3** Details section shows:
  - [ ] **"What is this?"** section with description
  - [ ] **"What does mastery mean?"** section with explanation
  - [ ] **"How can I help at home?"** section with bullet-pointed tips
  - [ ] **"What's [Child] learning?"** section with objectives list
  - [ ] **Resources** section with links (if any)

**Detail Content Check:**
- [ ] **4.4** "What does mastery mean?" uses plain language like:
  - ❌ DON'T say: "Student demonstrates proficiency on standards alignment"
  - ✅ DO say: "Mastery means Alex can apply these skills in real situations and explain their understanding"
- [ ] **4.5** "How can I help?" tips are actionable:
  - Example: "Ask them to explain what they've learned"
  - Example: "Find real-world examples together"
  - Example: "Practice the skills at home"
- [ ] **4.6** Objectives list shows with status icons:
  - [ ] ✓ for mastered (green)
  - [ ] → for in-progress (blue)
  - [ ] ○ for not-started (gray)
  - [ ] Each has text explaining the objective
  - [ ] Core Skill badges visible for mandatory objectives (blue badge)
- [ ] **4.7** Resources section shows helpful links with icons:
  - [ ] 📹 Video
  - [ ] 📄 Article
  - [ ] 🎮 Interactive
  - [ ] ✏️ Practice

**Plain Language Check:**
- [ ] No "standard-aligned", "proficiency", "mastery level" jargon
- [ ] Tips are clear, actionable, parent-friendly
- [ ] Objective text is clear

### Phase 5: Messages Section

**Expected:** Quick access widget showing recent teachers

- [ ] **5.1** "Messages" section visible between Standards and Calendar
- [ ] **5.2** Messages widget displays:
  - [ ] Teacher name: "Teacher 1 Rodriguez"
  - [ ] Unread count (0 if no messages yet)
  - [ ] "View all messages →" link
- [ ] **5.3** Click "View all messages" → navigates to /app/parents/messages
- [ ] **5.4** Full Messages page loads:
  - [ ] Header: "Messages" title with subtitle "Communicate with your child's teachers"
  - [ ] Child selector showing both children
  - [ ] First child (Student 1 Chen) highlighted
  - [ ] Teachers list for that child showing "Teacher 1 Rodriguez"
- [ ] **5.5** Click teacher → message thread opens
  - [ ] Message input area visible
  - [ ] Send button disabled (no text)
  - [ ] No previous messages yet (empty thread)
- [ ] **5.6** Type a test message: "Hello, how is Student 1 doing?"
- [ ] **5.7** Click Send button
- [ ] **5.8** Message appears in thread:
  - [ ] Your name/label visible
  - [ ] Message text displays
  - [ ] Timestamp shows "Just now"
- [ ] **5.9** Go back to dashboard → Messages widget shows message preview
- [ ] **5.10** No console errors

### Phase 6: Master Calendar Section

**Expected:** Table showing upcoming assessments

- [ ] **6.1** "Upcoming Assessments" section visible at bottom
- [ ] **6.2** Subtitle explains assessments in plain language
- [ ] **6.3** Calendar table displays with columns:
  - [ ] Date
  - [ ] Assessment name
  - [ ] Type (Major Assessment, High Stakes, Quiz, Project)
  - [ ] Standards Covered
- [ ] **6.4** At least 1-3 assessment events visible
- [ ] **6.5** Dates are readable and in future (or current year)
- [ ] **6.6** Type badges are color-coded and labeled

**Plain Language Check:**
- [ ] Assessment descriptions are clear
- [ ] Type labels are non-technical

### Phase 7: Mobile Responsiveness

**Expected:** Dashboard adapts to mobile viewport (375px width)

- [ ] **7.1** Open browser dev tools (F12)
- [ ] **7.2** Set viewport to 375px width (mobile)
- [ ] **7.3** Reload page
- [ ] **7.4** Verify layout changes (no horizontal scroll):
  - [ ] Header: Text still readable
  - [ ] Standards: Grid becomes single column or wraps
  - [ ] Progress bars: Still visible
  - [ ] Status pills: Still readable
  - [ ] Message input: Accessible without scrolling
- [ ] **7.5** Text size is readable (minimum 14px body, 16px on mobile)
- [ ] **7.6** Buttons and links are touch-friendly (44px+ min-height)
- [ ] **7.7** No layout breaking

### Phase 8: No Jargon Verification

**Full Page Scan — Look for K12/education jargon**

Search the entire dashboard for these terms and mark if found:
- [ ] ❌ "Standards-aligned" — should say plain name instead
- [ ] ❌ "Proficiency level" — should say "On Track / Needs Support"
- [ ] ❌ "Mastery threshold" — should say "can do X"
- [ ] ❌ "Learning objectives" — should say "skills" or "what to learn"
- [ ] ❌ "Competency" — use simpler word
- [ ] ❌ "Taxonomy" — explain simply
- [ ] ❌ "Differentiation" — use plain language
- [ ] ❌ "SLO" or acronyms without explanation
- [ ] ❌ "Performance level" — say "On Track" instead
- [ ] ❌ "Benchmark" — explain what it means

**Expected:** 0 instances of above jargon

---

## Issue Tracking

### Issues Found

| # | Section | Issue | Severity | Status |
|---|---------|-------|----------|--------|
| (report any) | | | | |

### Blockers

| # | Issue | Impact | Workaround |
|---|-------|--------|-----------|
| (report any) | | | |

---

## Summary

### Checklist Status
- [ ] All authentication tests pass
- [ ] Dashboard header loads correctly
- [ ] Standards overview shows all sections
- [ ] Expandable details work and use plain language
- [ ] Messages section functional (send/receive test message)
- [ ] Master calendar displays
- [ ] Mobile responsive at 375px
- [ ] Zero jargon found on page

### Sign-Off

**T3 Verification Status:** ✅ PASS / ❌ FAIL  
**Date Verified:** 2026-08-10  
**Issues Found:** 0 / X  
**Ready for User Testing:** YES / NO  

---

## Next Steps (If Issues Found)

1. Document all issues with screenshots
2. Prioritize by severity (blocking vs. nice-to-have)
3. File bugs for T1 (backend) or styling issues
4. Retest after fixes
5. Update this document with results
