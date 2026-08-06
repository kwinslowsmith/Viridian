# Phase 1: Critical Fixes - Detailed Task Breakdown

**Timeline:** 2-3 weeks (Weeks 1-3 before launch)  
**Total Effort:** 74-82 hours (up from 40-50 due to parent features)  
**Team Size:** 3-4 engineers (increased from 2-3)  
**Target:** Complete before production launch  
**Critical Addition:** Parent features are NOT optional—they determine system success

---

## Week 1: Foundation (20-24 hours)

### Task 1.1: Create Terminology Configuration (2 hours)
**Owner:** Frontend Lead  
**PR:** `feat(terminology): centralize user-facing copy`

**Checklist:**
- [ ] Create `/app/config/terminology.ts` with all user-facing strings
- [ ] Define for students: objectives, mastery, submission, success messages
- [ ] Define for teachers: assessment, grading, pass/fail language
- [ ] Define for admins: standards, classes, students, health metrics
- [ ] Export as constants for use throughout app
- [ ] Add comments with reasoning for each terminology choice

**Files:**
- NEW: `app/config/terminology.ts`

**Testing:**
- [ ] All strings use constants (grep to verify no hardcoded terms)
- [ ] No visual regressions in UI

---

### Task 1.2: Update Student Display Language (3 hours)
**Owner:** Frontend - Student Experience  
**PR:** `fix(student): improve objective language and motivation`

**Checklist:**
- [ ] Change "Learning Objectives" header to "What You'll Learn"
- [ ] Change "Mandatory" badge to "Core Skill" (use blue accent instead of red)
- [ ] Change "Required Objectives" section to "Core Skills to Master"
- [ ] Change "Optional Objectives" section to "Challenge Objectives"
- [ ] Add context text explaining "Core" vs "Challenge"
- [ ] Update StudentObjectiveList.tsx terminology
- [ ] Update StudentObjectiveSubmission.tsx terminology
- [ ] Update ObjectivesPanel.tsx terminology

**Files:**
- MODIFY: `app/components/StudentObjectiveList.tsx`
- MODIFY: `app/components/StudentObjectiveSubmission.tsx`
- MODIFY: `app/components/ObjectivesPanel.tsx`

**Testing:**
- [ ] Verify badge colors changed correctly
- [ ] Check copy on all student views
- [ ] Ensure no breaking changes to data model

---

### Task 1.3: Add Skill Mastery Card Component (5 hours)
**Owner:** Frontend - Student Experience  
**PR:** `feat(student): add skill mastery progress cards`

**Checklist:**
- [ ] Create new component `SkillMasteryCard.tsx`
- [ ] Props: skillName, masteryPercent, status (notStarted/inProgress/mastered)
- [ ] Visual: Progress bar + text (e.g., "72% toward mastery")
- [ ] Color: Gray (not started) → Yellow (in progress) → Green (mastered)
- [ ] Show "You're close! One more core skill to master" for ~80% mastery
- [ ] Add hover state showing required objectives count
- [ ] Make reusable for multiple skills

**Files:**
- NEW: `app/components/SkillMasteryCard.tsx`

**Testing:**
- [ ] Progress bar updates correctly (0, 25, 50, 75, 100%)
- [ ] Colors match design system
- [ ] Responsive on mobile

---

### Task 1.4: Add Progress Header to StudentObjectiveList (4 hours)
**Owner:** Frontend - Student Experience  
**PR:** `feat(student): add progress summary header`

**Checklist:**
- [ ] Modify StudentObjectiveList.tsx to calculate overall mastery
- [ ] Add header section before objectives list
- [ ] Show: "Your Progress in [Skill Name]"
- [ ] Show progress bar: "████████░░ 80%"
- [ ] Show status: "Core Skills Completed: 4 of 5"
- [ ] Add encouraging message based on progress level
- [ ] Fetch mastery data from API or calculate locally

**Files:**
- MODIFY: `app/components/StudentObjectiveList.tsx`
- NEW: `app/hooks/useStudentMastery.ts` (if needed)

**API Needed (if not exists):**
- `GET /api/improv/classes/[classId]/student/[studentId]/mastery-summary`

**Testing:**
- [ ] Mastery % calculates correctly
- [ ] Header displays at top of list
- [ ] Encouragement text updates with progress
- [ ] Works with 0%, 25%, 50%, 75%, 100% mastery

---

### Task 1.5: Extract Grading Modal to Reusable Component (3 hours)
**Owner:** Backend/Frontend - Teacher  
**PR:** `refactor(grading): extract submission modal to reusable component`

**Checklist:**
- [ ] Copy SubmissionGradingModal from TeacherGradingDashboard.tsx
- [ ] Create new file `SubmissionGradingModal.tsx`
- [ ] Extract modal logic to standalone component
- [ ] Props: submission, onClose, onGrade
- [ ] Add assessment guidance display section
- [ ] Maintain current functionality (feedback, pass/fail, save)

**Files:**
- NEW: `app/components/SubmissionGradingModal.tsx`
- MODIFY: `app/components/TeacherGradingDashboard.tsx` (to import instead of define)

**Testing:**
- [ ] Modal opens/closes correctly
- [ ] Grading functionality unchanged
- [ ] Can be imported and used elsewhere

---

### Task 1.6: Create Teacher Grading Inbox (6-8 hours)
**Owner:** Frontend - Teacher  
**PR:** `feat(teacher): replace nested grading dashboard with flat inbox`

**Checklist:**
- [ ] Create new component `TeacherGradingInbox.tsx`
- [ ] Fetch pending submissions from new API endpoint
- [ ] Display flat list (not nested by skill/objective)
- [ ] Show: Objective name, Student name, submission date, [Grade] button
- [ ] Add "Pending" and "Graded" tabs
- [ ] Add sort options (by skill, by date, by student)
- [ ] Add filter for status/skill
- [ ] Highlight overdue submissions (>X days)
- [ ] Click [Grade] opens SubmissionGradingModal
- [ ] Show submission count in tabs ("5 Pending", "23 Graded")

**Files:**
- NEW: `app/components/TeacherGradingInbox.tsx`
- MODIFY: `app/organization/[slug]/class/[classId]/page.tsx` (route to new component)

**API Needed:**
- NEW: `GET /api/improv/classes/[classId]/submissions/pending`
  - Returns: array of {objectiveId, objectiveText, skillId, skillName, studentId, studentName, submittedAt, status}

**Testing:**
- [ ] List displays correctly
- [ ] Filters work (pending/graded tabs)
- [ ] Sort works (by skill, by date)
- [ ] Overdue highlighting works
- [ ] Click [Grade] opens modal
- [ ] Modal submission updates list

---

## Week 2: Build & Integration (20-26 hours)

### Task 2.1: Create Class Progress Dashboard (12-14 hours)
**Owner:** Frontend - Teacher  
**PR:** `feat(teacher): add class-level progress dashboard`

**Checklist:**
- [ ] Create component `ClassProgressDashboard.tsx`
- [ ] Fetch class mastery data from API
- [ ] Show overall mastery % with trend indicator (↑ +8%, ↓ -5%, → no change)
- [ ] Show skills performance breakdown (table with %, status)
- [ ] Color code: Green (>80%), Yellow (50-80%), Red (<50%)
- [ ] Show required objectives status (% mastered, % in progress, % not started)
- [ ] Show student groups (mastered, on track, needs support)
- [ ] Show recent activity (submissions graded, students not submitting)
- [ ] Add [View List] buttons for each group

**Files:**
- NEW: `app/components/ClassProgressDashboard.tsx`
- NEW: `app/components/SkillPerformanceTable.tsx`
- NEW: `app/components/StudentGroupCard.tsx`
- MODIFY: `app/organization/[slug]/class/[classId]/page.tsx` (add Overview tab using this)

**API Needed:**
- NEW: `GET /api/classes/[classId]/progress-summary`
  - Returns: {
      classId, className,
      overallMastery: {percent, trend},
      skillsPerformance: [{skillId, skillName, masteryPercent, status}],
      requiredObjectivesStatus: {mastered, inProgress, notStarted},
      studentGroups: {mastered: [], onTrack: [], needsSupport: []},
      recentActivity: {submissionsToday, overdueSubmissions, ...}
    }

**Testing:**
- [ ] All metrics calculate correctly
- [ ] Colors display correctly
- [ ] Links to student groups work
- [ ] Trends display (up/down/flat)
- [ ] Mobile responsive

**Dependencies:**
- Must complete Task 1.6 (understand grading system first)

---

### Task 2.2: Add Post-Grade Feedback in Student Modal (4 hours)
**Owner:** Frontend - Student  
**PR:** `feat(student): add encouragement after grading`

**Checklist:**
- [ ] Modify StudentObjectiveSubmission.tsx
- [ ] When submission is graded, show celebration section
- [ ] Display: Status (Mastered/Needs Improvement)
- [ ] Show strengths: "Here's what you did well"
- [ ] Show next steps: "Here's what to work on"
- [ ] Show progress change: "Your progress improved from 72% to 80%"
- [ ] Add action button: "Try next objective" or "View challenge objectives"
- [ ] Design with encouraging tone and positive colors

**Files:**
- MODIFY: `app/components/StudentObjectiveSubmission.tsx`

**Testing:**
- [ ] Celebration section appears when graded
- [ ] Correct status and feedback shown
- [ ] Progress calculation accurate
- [ ] Action buttons work

---

### Task 2.3: Update Teacher Grading Modal with Guidance (2 hours)
**Owner:** Frontend - Teacher  
**PR:** `fix(teacher): show assessment guidance in grading modal`

**Checklist:**
- [ ] Modify SubmissionGradingModal to fetch objective data with guidance
- [ ] Add guidance section at top: "YOUR CRITERIA"
- [ ] Show guidance as bullet points if text, or link if URL
- [ ] Make guidance collapsible/always-visible
- [ ] Style differently from submission (light background)
- [ ] Add label: "Scoring rubric: [link]" if URL provided

**Files:**
- MODIFY: `app/components/SubmissionGradingModal.tsx`

**API Change:**
- Ensure objective fetch includes `assessmentGuidance` field

**Testing:**
- [ ] Guidance displays correctly
- [ ] Both text and URL guidance work
- [ ] Doesn't obscure submission area

---

### Task 2.4: Required vs Optional Display in Grading (1 hour)
**Owner:** Frontend - Teacher  
**PR:** `fix(teacher): show mandatory status in grading`

**Checklist:**
- [ ] Add `isMandatory` field to submission object in grading modal
- [ ] Display ⭐ CORE SKILL badge if `isMandatory` is true
- [ ] Add text: "This is required for mastery"
- [ ] Place at top of modal, clearly visible

**Files:**
- MODIFY: `app/components/SubmissionGradingModal.tsx`

**API Change:**
- Ensure submission fetch includes objective's `isMandatory` field

**Testing:**
- [ ] Badge displays for core skills
- [ ] Badge missing for optional objectives

---

### Task 2.5: API Endpoint Implementation (3-4 hours)
**Owner:** Backend  
**PR:** `feat(api): add endpoints for Phase 1 dashboards`

**Checklist:**
- [ ] Create `GET /api/improv/classes/[classId]/submissions/pending`
  - Filter: status != 'graded'
  - Include: objective, student, submission metadata
  - Sort: by submitted date (newest first)
- [ ] Create/enhance `GET /api/classes/[classId]/progress-summary`
  - Calculate: overall mastery %, skill mastery %, objective status breakdown
  - Group students by mastery level
  - Track recent activity

**Files:**
- NEW: `app/api/improv/classes/[classId]/submissions/pending/route.ts`
- NEW/MODIFY: `app/api/classes/[classId]/progress-summary/route.ts`

**Logic:**
```typescript
// Pending submissions
const submissions = await db.query(`
  SELECT 
    ias.*, 
    io.text as objectiveText, 
    io.skillId,
    s.name as skillName,
    u.name as studentName
  FROM ImprovObjectiveAssessment ias
  JOIN ImprovObjective io ON io.id = ias.objectiveId
  JOIN ImprovSkill s ON s.id = io.skillId
  JOIN User u ON u.id = ias.studentId
  WHERE ias.classId = $1 AND ias.status != 'graded'
  ORDER BY ias.submittedAt DESC
`)

// Class mastery
const studentMastery = [] // for each student:
// mastery% = (required_objectives_passed / total_required_objectives) * 100
```

**Testing:**
- [ ] Query performance acceptable
- [ ] Returns correct data structure
- [ ] Filters work correctly
- [ ] Sorting correct

---

### Task 2.6: Update Tab Routing (1 hour)
**Owner:** Frontend  
**PR:** `refactor(class): update tab routing for new dashboards`

**Checklist:**
- [ ] Update ClassDetailPage.tsx tab routing
- [ ] Change "Grading" tab to use TeacherGradingInbox instead of Dashboard
- [ ] Change "Overview" tab to use ClassProgressDashboard for teachers
- [ ] Ensure tab structure clear and logical
- [ ] Update tab labels if needed
- [ ] Test all tabs route correctly

**Files:**
- MODIFY: `app/organization/[slug]/class/[classId]/page.tsx`

**Testing:**
- [ ] All tabs clickable
- [ ] Correct component renders
- [ ] No errors in console
- [ ] Back button works

---

## Week 3: Parent Features (34-38 hours) — CRITICAL FOR SYSTEM SUCCESS

### Why Parent Features Matter

**Without parent engagement, the entire system fails.** Parents who don't understand standards-based learning will:
- Undermine the system at home ("Why don't you get an A?")
- Request exceptions and push back on mastery model
- Become skeptics instead of advocates
- Create community pressure to abandon the system

With parent features, parents understand the system and become powerful advocates for student success.

---

### Task 3.1: Create Parent Dashboard Component (6 hours)
**Owner:** Frontend - Parent Experience  
**PR:** `feat(parent): create parent dashboard for student progress`

**Checklist:**
- [ ] Create new component `ParentDashboard.tsx`
- [ ] Display child's overall progress (e.g., "72% toward mastery in Math")
- [ ] Show skill breakdown (table with skill name, mastery %, status)
- [ ] Color code: Green (>80%), Yellow (50-80%), Red (<50%)
- [ ] Show objectives status (count: Mastered / In Progress / Not Started)
- [ ] Show recent activity: "Submitted work on 2 objectives today"
- [ ] Add [View Details] link for each skill
- [ ] Mobile-responsive (parents check on phones)
- [ ] Accessible (plain language, no jargon)

**Files:**
- NEW: `app/components/ParentDashboard.tsx`
- NEW: `app/components/SkillProgressCard.tsx` (reusable card for each skill)
- MODIFY: Parent routing (add route `/parent/student/[studentId]/dashboard`)

**API Needed:**
- `GET /api/parent/student/[studentId]/progress-summary`
  - Returns: {
      studentName, classId, className,
      overallMastery: {percent, trend},
      skillsPerformance: [{skillId, skillName, masteryPercent, status, objectivesCount}],
      recentActivity: {submissionsThisWeek, lastUpdate}
    }

**Testing:**
- [ ] Displays correct student progress
- [ ] Colors match design system
- [ ] Mobile responsive
- [ ] No performance issues with multiple skills
- [ ] Handles 0% mastery gracefully

---

### Task 3.2: Build Parent Learning Hub (12-14 hours)
**Owner:** Frontend/Content - Parent Education  
**PR:** `feat(parent): create learning hub with objective explanations`

**Checklist:**
- [ ] Create component `ParentLearningHub.tsx`
- [ ] For each objective, display:
  - **What:** "Your child is learning how to write persuasive essays"
  - **Why:** "This skill is important because..." (2-3 sentences, plain language)
  - **How:** "Here's what mastery looks like:" (show examples or rubric)
  - **Support:** "How you can help at home:" (3-5 specific tips)
  - **Stuck:** "If your child is struggling, try..." (common approaches)
  - **Resources:** Links to videos, practice activities, external resources
- [ ] Organized by skill (Skills → Objectives within each)
- [ ] Search/filter by skill or status
- [ ] Add glossary toggle: explain terms like "mastery", "standards", "objective"
- [ ] Add FAQ section:
  - "How is this different from grades?"
  - "Will this affect college applications?"
  - "What if my child is falling behind?"
  - "How is progress measured?"
- [ ] Print-friendly format for parent reference
- [ ] Available in simple text view (accessibility)

**Files:**
- NEW: `app/components/ParentLearningHub.tsx`
- NEW: `app/components/ObjectiveExplanation.tsx` (card for each objective)
- NEW: `app/components/ParentGlossary.tsx`
- NEW: `app/components/ParentFAQ.tsx`
- NEW: `app/data/parent-explanations.ts` (content for objectives)
- NEW: `app/data/parent-faq.ts` (FAQ content)

**Content Needed (coordinate with subject matter experts):**
- Explanation for each objective in the system
- 5-10 FAQ questions + answers
- 20-30 support tips organized by skill area
- Resource links (Khan Academy, etc.) per objective

**Testing:**
- [ ] All objectives have explanations
- [ ] No jargon in parent-facing text
- [ ] Glossary covers all technical terms
- [ ] FAQ answers clear and actionable
- [ ] Links to resources work
- [ ] Mobile responsive
- [ ] Print preview looks good

---

### Task 3.3: Implement Parent Notification System (6-8 hours)
**Owner:** Backend/Frontend - Notifications  
**PR:** `feat(parent): add email notification system for progress updates`

**Checklist:**
- [ ] Create notification queue system (database + background jobs)
- [ ] Implement weekly digest emails:
  - Summary: "Here's what [Child] worked on this week"
  - Highlight: Objectives submitted, progress made
  - Status: Which skills on track vs need support
  - Celebration: "Mastered [Objective]! 🎉" for any objectives mastered
- [ ] Implement alert emails:
  - "Alert: [Child] needs support in [Skill]" (when mastery <50%)
  - "Alert: [Child] hasn't submitted in 5 days"
- [ ] Allow parent customization:
  - Frequency: Weekly, bi-weekly, daily (not default)
  - Types: Summaries, celebrations, alerts only
  - Delivery time: Choose when to receive (morning/evening)
- [ ] Create email templates with encouraging tone
- [ ] Add [View in App] button to drive traffic to parent dashboard
- [ ] Implement opt-out mechanism

**Files:**
- NEW: `app/api/parent/notifications/digest/route.ts` (weekly digest API)
- NEW: `app/api/parent/notifications/preferences/route.ts` (parent preferences)
- NEW: `app/services/notifications/email-templates.ts` (email templates)
- NEW: `app/services/notifications/queue.ts` (notification queue logic)
- NEW: `app/components/ParentNotificationPreferences.tsx` (settings UI)
- MODIFY: Database schema to add parent notification preferences

**API/DB Needed:**
- Table: `ParentNotificationPreferences` (parentId, frequency, alertTypes, deliveryTime)
- Background job: "Send weekly notification digests" (runs Sunday evening)
- Background job: "Check for students needing support" (runs daily)

**Testing:**
- [ ] Weekly digest sends at correct time
- [ ] Celebrations trigger when objectives mastered
- [ ] Alerts trigger when mastery <50% or submission overdue
- [ ] Parent can customize preferences
- [ ] Email templates render correctly
- [ ] Links in email work
- [ ] Unsubscribe works

---

### Task 3.4: Create Parent Resources Hub (4-6 hours)
**Owner:** Frontend/Content - Parent Education  
**PR:** `feat(parent): add parent resources and support guides`

**Checklist:**
- [ ] Create component `ParentResourcesHub.tsx`
- [ ] Section 1: Understanding Standards-Based Learning
  - "What are learning standards?"
  - "How does mastery-based grading work?"
  - "How is this different from traditional A/B/C grades?" (comparison chart)
- [ ] Section 2: Supporting Your Child
  - "How to talk to your child about their learning"
  - "What to do if they're struggling"
  - "How to celebrate progress"
  - "When to reach out to the teacher"
- [ ] Section 3: College & Beyond
  - "Will this affect college applications?" (with research)
  - "How to explain this on transcripts"
  - "Talking points for colleges"
- [ ] Section 4: Glossary
  - All terms: Mastery, Objective, Standard, Core Skill, Challenge, etc.
  - Plain language definitions with examples
- [ ] Section 5: Getting Help
  - "Contact the teacher" link with response time expectation
  - "School contact information"
  - "Tutoring resources" (if applicable)
- [ ] Add downloadable PDF guides for offline reference

**Files:**
- NEW: `app/components/ParentResourcesHub.tsx`
- NEW: `app/components/ParentGlossary.tsx` (or enhance from 3.2)
- NEW: `app/data/parent-resources.md` (content for all sections)
- NEW: `public/guides/standards-based-learning-guide.pdf` (downloadable)

**Content Needed:**
- 3-5 page explanation of standards-based learning vs traditional grades
- Research citations on effectiveness of mastery-based models
- College application guidance (coordinate with college counselors)

**Testing:**
- [ ] All sections load correctly
- [ ] Links work (to glossary, resources, contact)
- [ ] PDF downloads correctly
- [ ] Mobile responsive
- [ ] No jargon; feedback from non-education parents

---

## Integration & Testing (4-6 hours)

### Task 2.7: End-to-End Testing (2-3 hours)
**Owner:** QA / Lead Engineer

**Test Scenarios:**
- [ ] **Student Flow:**
  - View class objectives
  - See progress bar updated
  - Submit work
  - Receive grade + encouragement
  - Progress bar updates

- [ ] **Teacher Flow:**
  - Navigate to Grading tab
  - See pending submissions inbox
  - Click [Grade]
  - See assessment guidance
  - See core skill indicator
  - Grade and save
  - See progress change

- [ ] **Data Flow:**
  - Submission created → inbox shows it
  - Graded → moves to graded tab
  - Mastery % updates after each grade
  - Class dashboard reflects changes

---

### Task 2.8: Documentation & Deployment (1-2 hours)
**Owner:** Tech Lead

**Checklist:**
- [ ] Create teacher guide for new grading interface
- [ ] Create student guide for progress visualization
- [ ] Document new API endpoints
- [ ] Update database schema docs if needed
- [ ] Create deployment checklist
- [ ] Plan rollout strategy (pilot group first?)
- [ ] Prepare support FAQ

---

## Success Criteria

### Functional - Student & Teacher Core
- [ ] All language changed to agreed terminology
- [ ] Student can see progress % on objectives list
- [ ] Teacher can grade any submission in <2 clicks from inbox
- [ ] Teacher can see class progress dashboard
- [ ] Post-grade student feedback shown with encouragement
- [ ] All tests passing
- [ ] No visual regressions

### Functional - Parent Features (CRITICAL)
- [ ] Parents can see child's progress on dashboard
- [ ] Parents can understand each objective via learning hub
- [ ] Weekly notifications sent and customizable
- [ ] Parent resources hub accessible and clear
- [ ] All explanations use plain language (no jargon)
- [ ] Parent FAQs address college, grading, and support questions

### Performance
- [ ] Grading inbox loads in <2 seconds
- [ ] Class dashboard loads in <2 seconds
- [ ] Student progress loads immediately with objectives
- [ ] Parent dashboard loads in <2 seconds
- [ ] Notification emails send within 5 minutes of trigger

### User Experience
- [ ] Teachers report grading is "much faster"
- [ ] Students report seeing "clear progress"
- [ ] Parents report understanding their child's learning
- [ ] No confusion about terminology
- [ ] All features mobile friendly
- [ ] Parents report feeling equipped to support learning

---

## Risk Mitigation

### Risk: Database queries slow with large datasets
**Mitigation:** Add pagination to inbox (load 20 at a time), lazy load dashboards, optimize queries with indexes

### Risk: Terminology change breaks existing references
**Mitigation:** Only change UI layer, keep data model unchanged, use constants to ensure consistency

### Risk: Teachers confused during transition
**Mitigation:** Email guide before launch, in-app tour of new grading interface, Slack support channel, virtual training session

### Risk: Deployment breaks existing functionality
**Mitigation:** Comprehensive test plan, rollout to pilot group first, have rollback plan, feature flags for gradual rollout

### Risk: Parent dashboard slow or errors with many students/skills
**Mitigation:** Add caching for parent data (24hr TTL), optimize parent dashboard queries, error boundaries with graceful fallback

### Risk: Email notifications don't deliver or go to spam
**Mitigation:** Use verified email domain, test with multiple email providers, include unsubscribe link, monitor delivery rates

### Risk: Parent confusion despite explanations and resources
**Mitigation:** User test parent dashboard and hub with 5-10 parents before launch, iterate based on feedback, provide live chat support first week

### Risk: Parents overwhelmed by too much information
**Mitigation:** Keep parent dashboard simple at first, detailed explanations optional/progressive disclosure, progressive onboarding sequence

### Risk: Timeline slips due to parent feature scope
**Mitigation:** Prioritize ruthlessly (parent dashboard > hub > notifications in priority order), timeline contingency for critical path items

---

## Deliverables

By end of Week 2 (Core Features):
1. ✅ Terminology configuration file
2. ✅ Updated student components with new language
3. ✅ Skill mastery card component
4. ✅ Student progress header component
5. ✅ Reusable grading modal component
6. ✅ Teacher grading inbox component
7. ✅ Class progress dashboard component
8. ✅ Post-grade encouragement in student modal
9. ✅ Assessment guidance in grading modal
10. ✅ Core skill indicator in grading modal
11. ✅ API endpoints for pending submissions
12. ✅ API endpoints for class progress

By end of Week 3 (Parent Features):
13. ✅ Parent dashboard component
14. ✅ Skill progress card component
15. ✅ Parent learning hub with objective explanations
16. ✅ Parent glossary and FAQ
17. ✅ Parent resources hub with college guidance
18. ✅ Parent notification preferences UI
19. ✅ Weekly digest email system
20. ✅ Alert notification system (mastery <50%, overdue submissions)
21. ✅ Email template styling
22. ✅ API endpoints for parent progress
23. ✅ API endpoints for notifications
24. ✅ Database schema for parent preferences

By end of Week 3 (Testing & Documentation):
25. ✅ End-to-end testing (student, teacher, parent flows)
26. ✅ Parent user testing with 5-10 parents
27. ✅ Student guide documentation
28. ✅ Teacher guide documentation
29. ✅ Parent onboarding guide
30. ✅ Parent FAQ guide
31. ✅ All tests passing
32. ✅ Ready for full launch with all stakeholders confident

---

## Team Assignment Suggestion (3-4 Engineers for 2-3 Weeks)

**Frontend Engineer 1 - Student & Teacher UX (40-50 hrs):**
- Tasks: 1.2, 1.3, 1.4, 2.1, 2.2, 2.4, 2.6
- Skills: React, UX sensitivity, data visualization
- Timeline: Weeks 1-2

**Frontend Engineer 2 - Parent Experience (24-28 hrs):**
- Tasks: 3.1, 3.2, 3.4 (learning hub, dashboard, resources)
- Skills: React, component architecture, content management
- Timeline: Week 3 (parallel with student/teacher wrap-up)

**Backend Engineer (14-18 hrs):**
- Tasks: 2.5, 3.3 (API endpoints, notification system)
- Skills: SQL, API design, background job processing
- Timeline: Weeks 1-3

**Frontend/Content Lead (optional, 6-8 hrs):**
- Tasks: 3.2 content coordination, glossary, FAQ curation
- Skills: Content strategy, parent communication, plain language
- Timeline: Week 3 or concurrent with development

**QA/Testing (4-6 hrs):**
- Task: 2.7 (end-to-end testing across all features)
- Skills: Testing, attention to detail, user empathy
- Timeline: Week 3

**Alternative: Smaller Team (2-3 Engineers, Extended Timeline)**
If unable to allocate 3-4 engineers, extend to 4-5 weeks with serial work:
- Weeks 1-2: Core features (Frontend 1 + Backend)
- Weeks 3-4: Parent dashboard + hub (Frontend 2 + Backend part-time)
- Week 5: Notifications + wrap-up (Backend)

---

## Timeline

| Week | Focus | Hours | Deliverables |
|------|-------|-------|--------------|
| 1 | Foundation & setup | 20-24 | Terminology, student UI updates, modal extraction, grading inbox |
| 2 | Dashboards & integration | 20-26 | Class dashboard, API endpoints, student feedback, testing |
| 3 | Parent features | 34-38 | Parent dashboard, learning hub, resources, notifications |
| **Total** | **Complete Phase 1** | **74-82** | **Ready for launch with all stakeholders** |

Estimated completion: **21 calendar days** with 3-4 engineers (can be compressed to 14 days with focused effort or 4-5 weeks with 2-3 engineers)

### Timeline Option: Parallel Execution (Recommended)
If 3-4 engineers available:
- Weeks 1-2: Frontend 1 + Backend work on core features (Student/Teacher)
- Week 3: Frontend 2 + Backend work on parent features in parallel
- All completed by end of Week 3
- Test and validate in parallel throughout

### Timeline Option: Extended Execution (2-3 Engineers)
If limited team:
- Weeks 1-2: Core features (Frontend 1 + Backend)
- Weeks 3-4: Parent dashboard + hub (Frontend 2 + Backend)
- Week 5: Notifications + resources (Backend)
- Completion: 5 weeks instead of 3
