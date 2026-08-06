# Standards & Objectives System: Comprehensive Audit & Remediation Report

**Date:** August 6, 2026  
**Scope:** Student, Teacher, and Admin experiences with mastery-based learning interface  
**Status:** Pre-launch critical issues identified  
**Priority Level:** HIGH - Recommend addressing before production launch

---

## Executive Summary

The Standards & Objectives system has solid foundational architecture but suffers from **three critical broken feedback loops** that will limit adoption and effectiveness across all user roles:

1. **Students** don't see meaningful progress or understand why objectives are "required"
2. **Teachers** face cognitive overload and workflow friction that makes grading inefficient
3. **Admins** see data but lack decision-support tools to manage at scale

**Estimated scope:** 4-6 weeks of work across frontend, UX, and possibly data modeling. **High impact:** Addresses adoption barriers for all user roles.

### Key Findings by Role

| Role | Current State | Critical Gap | Impact on Adoption |
|------|---------------|--------------|-------------------|
| **Student** | Can submit work, see status | No progress visibility, confusing terminology | 50% engagement drop if unmotivated |
| **Teacher** | Can grade individually | No class overview, tedious workflow | Likely to abandon system for Google Classroom |
| **Admin** | Can view mastery matrix | No actionable insights, no trends | Can't make evidence-based decisions |

---

## Part 1: Student Experience Issues & Fixes

### Issue #1: Confusing & Discouraging Language
**Severity:** HIGH | **Effort:** LOW | **Impact:** HIGH

#### Problem
- "Mandatory" badge appears threatening, not encouraging
- "Required Objectives" feels formal and distant
- No context for *why* some objectives are required
- Struggling students see red badges as "warning" not "foundation"

#### Current State
- StudentObjectiveList.tsx: Shows "Mandatory" in red badge (line 209-220)
- StudentObjectiveSubmission.tsx: Shows "Mandatory" in subtitle (line 134)
- No explanation provided to students

#### Recommended Fix
**Change terminology and add context:**

```
CHANGE FROM          →  CHANGE TO              +  ADD CONTEXT
"Mandatory"          →  "Core Skill"           +  "You need this one"
"Learning Objectives" → "What You'll Learn"    +  Subtitle: "Master these skills"
"Required for mastery" → "Core Objective"      +  Help text explaining why
```

**Specific Implementation:**
1. Rename terminology throughout UI:
   - `isMandatory` → `isRequired` (data model OK, just display layer)
   - Show badge as "Core" not "Mandatory" with blue accent (support) not red (threat)
   - Add microcopy: "This is essential for demonstrating mastery"

2. Add "Why" section to StudentObjectiveSubmission modal:
   ```
   "Why This Matters"
   Students who master this skill can [benefit statement]
   E.g., "...can clearly express ideas in front of audiences"
   ```

3. Update ObjectivesPanel header:
   - From: "Learning Objectives" → To: "What You'll Learn in This Standard"
   - From: "Required Objectives (5)" → To: "Core Skills to Master (5)"
   - From: "Optional Objectives (3)" → To: "Challenge Objectives (3)"

**Files to modify:**
- `app/components/StudentObjectiveSubmission.tsx`
- `app/components/StudentObjectiveList.tsx`
- `app/components/ObjectivesPanel.tsx`
- Consider adding constants for terminology in `/app/modules/improv/design/copy.ts` (new file)

**Estimated effort:** 2-3 hours

---

### Issue #2: No Progress Visibility
**Severity:** CRITICAL | **Effort:** MEDIUM | **Impact:** CRITICAL

#### Problem
- Students see individual objectives but no sense of overall progress
- No visual indicator of "how close am I to mastery?"
- No celebration or encouragement when progress is made
- Struggling students have no motivation to continue

#### Current State
- StudentObjectiveList shows status per objective (Not Started / Submitted / Graded)
- No class-level progress, no mastery percentage, no visual progress bar
- No feedback shown during grading process

#### Recommended Fix

**1. Add Progress Header to StudentObjectiveList (NEW)**
```
┌─────────────────────────────────────────────┐
│ Your Progress in [Skill Name]               │
│                                              │
│ Mastery Progress: ████████░░ 80%            │
│ Core Skills Completed: 4 of 5               │
│                                              │
│ You're close! One more core skill to master.│
└─────────────────────────────────────────────┘
```

**2. Add Skill Mastery Card (NEW)**
Before objectives list, show:
- `[Skill Name]: 80% → ✓ MASTERED` (when complete)
- `[Skill Name]: 60% → On Track` (when progressing)
- `[Skill Name]: 20% → Not Started` (when behind)

**3. Upgrade StudentObjectiveSubmission Modal**
After grading, show:
```
🎉 Your work has been graded!

Strengths: [2-3 things done well]
Next Steps: [specific improvement area]

Progress: ████████░░ 80% → ████████░░ 85%
          ↑ Just improved!
```

**4. Add Mastery Celebration (NEW)**
When student completes all required objectives:
```
🎉 You've mastered [Skill Name]!
You demonstrated mastery on: [list core objectives]

Share your achievement →
Move to next skill →
```

**Files to modify/create:**
- `app/components/StudentObjectiveList.tsx` (add header + skill cards)
- `app/components/StudentObjectiveSubmission.tsx` (add post-grade feedback)
- `app/hooks/useStudentProgress.ts` (NEW - calculate progress %)
- Create `SkillMasteryCard.tsx` component

**Estimated effort:** 8-10 hours

---

### Issue #3: No Resubmit/Retry Path
**Severity:** MEDIUM | **Effort:** MEDIUM | **Impact:** HIGH

#### Problem
- If student doesn't pass an objective, interface doesn't show clear "try again" path
- No way to see feedback and resubmit in the same flow
- Breaks mastery-based learning model (should allow reattempts)

#### Current State
- StudentObjectiveSubmission shows "✓ Submitted" when graded
- No "Resubmit" button
- No difference between "needs improvement" and "mastered"

#### Recommended Fix

**1. Track submission status more granularly**
Update grading modal to show:
- "Mastered" (pass) → show encouragement
- "Needs Improvement" (fail) → show feedback + "Try Again" button
- "Resubmitted" (after first attempt) → show progress

**2. Add Resubmit Flow**
In StudentObjectiveSubmission modal:
```
IF status === "needs_improvement":
  Show: [Teacher Feedback] 
  Show: "Here's what to work on:" + [specific improvement areas]
  Show: "Ready to try again?" + [Resubmit Button]

IF status === "mastered":
  Show: ✓ Mastered! [Encouragement]
  Show: Challenge objectives
```

**3. Update status tracking**
Modify StudentObjectiveSubmission to show:
- First attempt: "Submit"
- After teacher grades as "needs improvement": "Try Again" (clear call-to-action)
- After successful resubmit: "✓ Mastered"
- Attempt count: "Attempt 1/3" (shows students they can retry)

**Files to modify:**
- `app/components/StudentObjectiveSubmission.tsx`
- Database: Ensure `assessmentStatus` tracks attempt number and feedback
- `app/api/improv/classes/[classId]/objectives/[objectiveId]/assessments/route.ts`

**Estimated effort:** 6-8 hours

---

### Issue #4: Assessment Guidance Not in Submission Flow
**Severity:** MEDIUM | **Effort:** LOW | **Impact:** MEDIUM

#### Problem
- Assessment guidance (rubric/criteria) is in ObjectivesPanel but not in submission interface
- Students have to navigate away from submission to see guidance
- Teacher guidance set during setup is invisible during student work

#### Current State
- `StudentObjectiveSubmission.tsx` shows optional guidance link (line 153-172)
- But guidance is small, easy to miss, separate from the actual submission form

#### Recommended Fix

**Make guidance prominent in submission modal:**

```
BEFORE:                              AFTER:
┌──────────────────┐               ┌──────────────────────────┐
│ [Guidance] ↗     │               │ Your Objective           │
│ Objective Text   │        →      │ [Objective text]         │
│ [Submission form]│               │                          │
│ [Feedback form]  │               │ ✓ Here's What Success   │
│ [Submit]         │               │   Looks Like:           │
└──────────────────┘               │ - Clear and specific     │
                                   │ - Supported by evidence  │
                                   │ - [Example/Rubric]       │
                                   │                          │
                                   │ Your Submission:         │
                                   │ [form]                   │
                                   │                          │
                                   │ [Submit]                 │
                                   └──────────────────────────┘
```

**Implementation:**
1. Make "Here's What Success Looks Like" a prominent section
2. Always show if guidance exists
3. Option: Show examples/rubric directly (not just a link)

**Files to modify:**
- `app/components/StudentObjectiveSubmission.tsx` (reorganize modal layout)

**Estimated effort:** 2-3 hours

---

## Part 2: Teacher Experience Issues & Fixes

### Issue #1: Grading Workflow is Too Deep/Nested
**Severity:** CRITICAL | **Effort:** HIGH | **Impact:** CRITICAL

#### Problem
Current path: Class → Grading Tab → Expand Skill → Expand Objective → See Submissions  
- Requires 5+ clicks and multiple screen expansions to grade one submission
- No overview of pending work
- Teachers likely to abandon system

#### Current State
- TeacherGradingDashboard.tsx: Nested structure (skills → objectives → submissions)
- Each level requires expansion/click
- No "show me what needs grading" view

#### Recommended Fix

**NEW: Create "Grading Inbox" Dashboard (replaces TeacherGradingDashboard)**

```
┌────────────────────────────────────────────────────────────────┐
│ GRADING INBOX                                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PENDING (5) | GRADED (23) | ALL (28)                          │
│                                                                 │
│ Sort: [ By Skill ▼ ] Filter: [ All Students ▼ ]               │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Objective: Voice Projection (Skill: Public Speaking)     │  │
│ │ Pending: 3 submissions                                   │  │
│ │                                                           │  │
│ │ • Sarah Martinez - [Grade] - submitted 2h ago           │  │
│ │ • Marcus Johnson - [Grade] - submitted 1d ago           │  │
│ │ • Priya Patel - [Grade] - submitted 2d ago (OVERDUE)   │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Objective: Eye Contact (Skill: Public Speaking)          │  │
│ │ Pending: 2 submissions                                   │  │
│ │                                                           │  │
│ │ • [Grade] Alex Kim                                       │  │
│ │ • [Grade] Jordan Lee                                     │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ [Load more submissions...]                                     │
└────────────────────────────────────────────────────────────────┘
```

**Key Features:**
1. **Flat list** of submissions, not nested tree
2. **"Pending" tab** shows only ungraded (1 click to see work)
3. **Overdue highlighting** (red) for submissions waiting >X days
4. **Quick grade** button opens grading modal
5. **Sort/Filter** by skill, status, date
6. **Bulk actions** (select multiple → mark for review, send message)

**Architecture:**
- New component: `TeacherGradingInbox.tsx`
- New API endpoint: `GET /api/improv/classes/[classId]/submissions/pending`
- Modified grading modal to work standalone

**Files to modify/create:**
- Create `app/components/TeacherGradingInbox.tsx` (replaces TeacherGradingDashboard)
- `app/api/improv/classes/[classId]/submissions/pending/route.ts` (NEW)
- `app/components/SubmissionGradingModal.tsx` (extract modal to reusable component)
- Update `app/organization/[slug]/class/[classId]/page.tsx` tab routing

**Estimated effort:** 12-16 hours

---

### Issue #2: No Class Progress Overview
**Severity:** CRITICAL | **Effort:** MEDIUM | **Impact:** CRITICAL

#### Problem
- Teachers can't answer: "How is my class doing overall?"
- No visibility into: mastery rates, stuck students, struggling objectives
- Can't see patterns (all students fail objective X?)

#### Current State
- No class-level dashboard
- Must infer class progress from grading dashboard (tedious)
- No metrics displayed anywhere

#### Recommended Fix

**NEW: Add "Class Progress" Tab (replaces Overview or becomes dedicated tab)**

```
┌──────────────────────────────────────────────────────────────┐
│ CLASS PROGRESS: Improv 101                                   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│ Overall Mastery: ███████░░░ 72%  (30 of 42 students)          │
│ Target: 80%  |  Trend: ↑ +8% (last 2 weeks)                  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ SKILLS PERFORMANCE                                       │  │
│ │                                                           │  │
│ │ Yes & And ..................... 95% ✓ Strong           │  │
│ │ Listening ...................... 88% ✓ Good            │  │
│ │ Character Work ................. 72%   On Track         │  │
│ │ Emotional Availability ......... 45% ⚠ Needs Work      │  │
│ │ Group Games .................... 38% ⚠ Needs Work      │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ REQUIRED OBJECTIVES STATUS                              │  │
│ │                                                           │  │
│ │ ✓ Core Skills Mastered: 32/42 (76%)                     │  │
│ │ ◐ Core Skills In Progress: 8/42 (19%)                   │  │
│ │ ✗ Core Skills Not Started: 2/42 (5%)                    │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ STUDENT GROUPS                                           │  │
│ │                                                           │  │
│ │ Mastered (80%+): 18 students                            │  │
│ │ On Track (50-79%): 20 students                          │  │
│ │ Needs Support (<50%): 4 students  [View List] [Export]  │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ RECENT ACTIVITY                                          │  │
│ │ • 8 submissions graded today                             │  │
│ │ • 3 students didn't submit week 5 [View]               │  │
│ │ • Objective "Character Work" has low pass rate [Details]│  │
│ └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Key Features:**
1. **Overall mastery %** with trend
2. **Skills breakdown** showing performance + alert status
3. **Required objectives status** (mastered/in-progress/not started)
4. **Student grouping** by mastery level
5. **Quick actions**: View students needing support, export data
6. **Alerts**: Low pass rate objectives, high non-submission rates

**Data needed:**
- Calculate mastery % per student = (required objectives passed / total required)
- Calculate mastery % per skill = (students mastering skill / total students)
- Group students by mastery level
- Track trends over time

**Files to create:**
- `app/components/ClassProgressDashboard.tsx` (NEW)
- `app/components/SkillPerformanceCard.tsx` (NEW)
- `app/hooks/useClassMastery.ts` (NEW)
- `app/api/classes/[classId]/progress-summary/route.ts` (likely exists, may need enhancement)

**Estimated effort:** 12-14 hours

---

### Issue #3: Assessment Guidance Disappears During Grading
**Severity:** MEDIUM | **Effort:** LOW | **Impact:** MEDIUM

#### Problem
- Teacher sets assessment guidance (rubric) when creating objectives
- But grading modal doesn't show it
- Teacher grades against criteria they wrote but don't see
- Inconsistent grading standards

#### Current State
- SkillObjectiveManager.tsx: Teachers can add assessmentGuidance (lines 203-221)
- TeacherGradingDashboard: Grading modal doesn't display guidance
- Guidance is stored but disconnected from grading workflow

#### Recommended Fix

**Add Assessment Guidance section to SubmissionGradingModal:**

```
┌────────────────────────────────────────────┐
│ GRADE SUBMISSION                           │
├────────────────────────────────────────────┤
│                                             │
│ Student: Sarah Martinez                    │
│ Objective: Voice Projection                │
│                                             │
│ ─── YOUR CRITERIA ──────────────────────   │
│ ✓ Speaks with clear articulation          │
│ ✓ Projects voice to back of room          │
│ ✓ Maintains consistent volume              │
│ ✓ Uses pauses effectively                  │
│                                             │
│ Scoring rubric: [Link to Google Doc]      │
│ ────────────────────────────────────────   │
│                                             │
│ Student Submission: [text/link shown]     │
│ Student Reflection: [shown]                │
│                                             │
│ Your Feedback: [textarea]                  │
│ Passed? [checkbox]                         │
│                                             │
│ [Save Grade] [Cancel]                      │
└────────────────────────────────────────────┘
```

**Implementation:**
1. Fetch objective data (with assessmentGuidance) in grading modal
2. Display guidance as collapsible section above submission
3. If guidance is a URL, show link; if text, show text

**Files to modify:**
- `app/components/TeacherGradingDashboard.tsx` → SubmissionGradingModal

**Estimated effort:** 2-3 hours

---

### Issue #4: Can't Mark Objectives as "Needs Reteach"
**Severity:** MEDIUM | **Effort:** MEDIUM | **Impact:** MEDIUM

#### Problem
- Teacher sees 30 students fail same objective
- No way to flag it for reteaching or bulk reassignment
- No way to communicate to class "we're revisiting this"

#### Current State
- Can only mark individual submissions as pass/fail
- No "bulk action" capability
- No "flag for reteach" or "send reminder" functionality

#### Recommended Fix

**Add "Objective Alerts" System:**

1. **At class level:** Show objectives with low pass rates
   ```
   ⚠ Emotional Availability: 45% pass rate (19/42)
   Options: [View struggling students] [Notify class] [Mark for reteach]
   ```

2. **On student card:** Show which required objectives student needs to redo
   ```
   Sarah Martinez - Mastery: 72%
   Needs to redo: Voice Projection, Character Work
   [Send reminder] [Assign intervention]
   ```

3. **Bulk actions:** Select multiple students → Send reminder, assign tutoring resource, flag for 1-on-1

**Implementation:**
- Calculate pass rate per objective: (students passed / total attempted)
- Flag objectives below threshold (default 70%)
- Add "Actions" menu to both class and student views

**Files to create/modify:**
- Extend `ClassProgressDashboard.tsx` with objective alerts
- Create `ObjectiveAlertCard.tsx` component
- Add endpoint: `POST /api/improv/classes/[classId]/objectives/[objectiveId]/mark-for-reteach`

**Estimated effort:** 8-10 hours

---

### Issue #5: Required vs Optional Distinction Lost by Grading Time
**Severity:** MEDIUM | **Effort:** LOW | **Impact:** MEDIUM

#### Problem
- Teacher marks objectives as "required for mastery" at setup
- But during grading, can't see which ones are required
- Leads to equal weight given to required vs optional

#### Current State
- `isMandatory` field exists in database
- SkillObjectiveManager shows distinction (required/optional sections)
- TeacherGradingDashboard doesn't display `isMandatory` status

#### Recommended Fix

**Display mandatory status in grading interface:**

```
Grading Inbox:
┌──────────────────────────────────────────────────┐
│ • Sarah Martinez - [Grade]                       │
│   Objective: Voice Projection ⭐ (Core Skill)    │
│   submitted 2h ago                               │
└──────────────────────────────────────────────────┘

Grading Modal:
┌──────────────────────────────────────────────────┐
│ Objective: Voice Projection  ⭐ CORE SKILL       │
│                                                   │
│ This is required for students to demonstrate     │
│ mastery of "Public Speaking"                     │
└──────────────────────────────────────────────────┘
```

**Implementation:**
- Add `isMandatory` field to submission/objective data in modal
- Show visual indicator (⭐ or badge) if core skill
- Add note: "This is required for mastery"

**Files to modify:**
- `SubmissionGradingModal.tsx` 
- Ensure objective data includes `isMandatory` when fetched

**Estimated effort:** 1-2 hours

---

## Part 3: Admin/Leadership Experience Issues & Fixes

### Issue #1: No Actionable Dashboard
**Severity:** CRITICAL | **Effort:** HIGH | **Impact:** CRITICAL

#### Problem
- K12StandardsInterface shows data but not insights
- Admins see numbers, not decision support
- Can't answer: "Which classes need help? Which standards are struggling?"
- Can't report upward: "Here's our progress trend"

#### Current State
- K12StandardsInterface exists with Standards/Classes/Students views
- Shows mastery matrix but no trends, no alerts, no comparisons
- Mock vs real data toggle confusing
- Limited admin capabilities

#### Recommended Fix

**NEW: Create "Admin Dashboard" (redesign K12StandardsInterface)**

```
┌─────────────────────────────────────────────────────────────┐
│ LEARNING STANDARDS: Department Overview                    │
│ [Org Name] - Last updated 2h ago                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ DEPARTMENT MASTERY                                          │
│ ────────────────────────────────────────────────────────────│
│                                                              │
│ Overall: ██████████░░ 74%                                   │
│ Target:  ██████████░░ 80%                                   │
│ Trend:   ↑ +6% (vs. last month)                            │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ BY GRADE LEVEL                    BY STANDARD        │   │
│ │ Grade 9: 68%                      Literacy.1: 82%   │   │
│ │ Grade 10: 75%                     Literacy.2: 71% ⚠ │   │
│ │ Grade 11: 79%                     Math.1: 65% ⚠⚠   │   │
│ │ Grade 12: 82%                     Science.1: 78%    │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ MASTERY TREND (Last 12 weeks)                              │
│ [Line chart showing upward trend]                          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ ALERTS & ACTIONS                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 🔴 URGENT: Math.1 has 45% fail rate (5 classes affected)   │
│    [View Classes] [View Students] [Schedule PLC]           │
│                                                              │
│ 🟡 WARNING: Period 3 classes trending down (-8%)            │
│    [View Classes] [Reach Out to Teachers]                  │
│                                                              │
│ 🟢 SUCCESS: Mrs. Park's classes reached 92% mastery!       │
│    [Share Practices] [Feature in Newsletter]               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ CLASSES BY PERFORMANCE                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Sort: [Performance ▼] Filter: [All ▼]                      │
│                                                              │
│ ✓ Mrs. Park Period 2 (Lit 101) ......... 92% MASTERED     │
│ ✓ Mr. Chen Period 1 (Lit 101) .......... 88%              │
│ ◐ Mrs. Smith Period 3 (Math 101) ....... 71% ON TRACK     │
│ ◐ Mr. Rodriguez Period 4 (Math 101) ... 68% ON TRACK      │
│ ⚠ Mr. Wilson Period 5 (Lit 102) ....... 52% NEEDS SUPPORT │
│                                                              │
│ [View all classes]                                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ TEACHER IMPLEMENTATION HEALTH                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Mrs. Park: ✓ Excellent                                     │
│   - 92% avg mastery, prompt grading, high engagement      │
│                                                              │
│ Mr. Chen: ✓ Good                                           │
│   - 88% avg mastery, consistent grading                    │
│                                                              │
│ Mrs. Smith: ⚠ Needs Support                                │
│   - 45 pending submissions, no grades in 4 days            │
│   [Reach out] [Offer training]                             │
│                                                              │
│ Mr. Wilson: 🔴 Critical                                     │
│   - Not using system regularly                             │
│   [Schedule check-in] [Provide training]                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
1. **Department-level mastery** with trend line
2. **Alerts** for struggling standards/classes
3. **Quick actions** (view details, schedule PLC, reach out)
4. **Teacher health** (who's implementing well, who needs support)
5. **Success highlights** (celebrate good work)
6. **Drill-down capability** (click any metric to see details)

**Data Architecture Needed:**
- Mastery aggregate by department, grade, standard, teacher
- Trend tracking (week-over-week, month-over-month)
- Alert system (mastery <threshold, submission lag, no grading activity)
- Teacher implementation scoring (avg mastery, grading speed, system usage)

**Files to create/modify:**
- Redesign `app/components/K12StandardsInterface.tsx`
- Create `AdminDashboard.tsx` (main view)
- Create `AdminAlerts.tsx` component
- Create `TeacherHealthCard.tsx` component
- New endpoints:
  - `GET /api/admin/departments/[deptId]/mastery-summary`
  - `GET /api/admin/departments/[deptId]/mastery-trend`
  - `GET /api/admin/teachers/[teacherId]/health-score`
  - `GET /api/admin/alerts`

**Estimated effort:** 20-24 hours

---

### Issue #2: No Student Intervention Pipeline
**Severity:** HIGH | **Effort:** MEDIUM | **Impact:** HIGH

#### Problem
- Admin can't see "which students need help right now"
- Can't group students by struggling standard
- Can't allocate tutoring resources effectively
- Can't identify if intervention is working

#### Current State
- Individual student mastery data exists
- No aggregated "students needing help" view
- No way to tag interventions or track their impact

#### Recommended Fix

**NEW: "Student Support" View in Admin Dashboard**

```
┌───────────────────────────────────────────────────┐
│ STUDENTS NEEDING SUPPORT                          │
│                                                    │
│ Filter: [Standard ▼] [Grade ▼] [Status ▼]        │
│                                                    │
│ 142 students below 50% mastery                    │
│                                                    │
│ Grouped by Standard:                              │
│ ┌──────────────────────────────────────────────┐ │
│ │ Math.1 (53 students)  ⚠ CRITICAL             │ │
│ │ • Alex Kim (12%) → Period 1                  │ │
│ │ • Bailey Smith (28%) → Period 2              │ │
│ │ • Charlie Davis (35%) → Period 3             │ │
│ │ [Schedule tutoring] [Notify teachers]        │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ Literacy.2 (38 students)                     │ │
│ │ • [list students]                            │ │
│ │ [Schedule tutoring] [Assign resource]        │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ Science.1 (51 students)                      │ │
│ │ [list students]                              │ │
│ └──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

**Features:**
1. **Filter by standard, grade, mastery level**
2. **Group by standard** to see concentration
3. **Quick actions:** Schedule tutoring, assign resource, notify teacher
4. **Track interventions:** Tag which students got help, monitor progress

**Implementation:**
- Query: Students where (mastery % < threshold)
- Group by standard
- Link to intervention resources
- Track intervention → mastery improvement

**Files to create:**
- `AdminStudentSupportView.tsx` (NEW)
- `StudentInterventionCard.tsx` (NEW)
- `app/api/admin/students/at-risk/route.ts` (NEW)

**Estimated effort:** 10-12 hours

---

### Issue #3: No Trend/Progress Tracking
**Severity:** HIGH | **Effort:** MEDIUM | **Impact:** HIGH

#### Problem
- Can see current mastery but not progress over time
- Can't measure impact of interventions
- Can't show principal evidence of improvement
- Can't identify if system is working

#### Current State
- No historical data storage
- No trend calculation
- No time-series views

#### Recommended Fix

**Add Historical Mastery Tracking:**

1. **Data Model:** Create `MasterySnapshot` table
   ```sql
   CREATE TABLE MasterySnapshot (
     id UUID PRIMARY KEY,
     standardId STRING,
     classId STRING,
     studentId STRING,
     masteryPercentage FLOAT,
     snapshotDate DATETIME,
     createdAt DATETIME
   )
   ```

2. **Auto-snapshot:** Capture mastery metrics weekly
   - After each grading session, calculate current mastery
   - Store snapshot for trend analysis

3. **Trend UI:** Show progress over time
   ```
   Standard: Literacy.1
   
   Weekly Progress:
   Week 1:  ███░░░░░░░ 30%
   Week 2:  ████░░░░░░ 40%
   Week 3:  █████░░░░░ 50%
   Week 4:  ███████░░░ 70%  ← Reteach conducted
   Week 5:  █████████░ 90%  ← Significant improvement
   ```

4. **Export capability:** Admin can export trend data for reporting

**Files to create/modify:**
- Database migration: Add `MasterySnapshot` table
- `app/jobs/snapshot-mastery.ts` (scheduled job - weekly)
- `AdminTrendChart.tsx` component (NEW)
- Update `AdminDashboard.tsx` to show trend line

**Estimated effort:** 10-12 hours

---

### Issue #4: Teacher Workload Not Visible
**Severity:** MEDIUM | **Effort:** MEDIUM | **Impact:** MEDIUM

#### Problem
- Admin can't see which teachers are overwhelmed
- Can't allocate support proactively
- Can't identify burnout risk
- Can't measure implementation success

#### Current State
- No teacher workload metrics
- No submission lag tracking
- No grading speed metrics

#### Recommended Fix

**Add Teacher Implementation Health Score:**

```
Teacher Health Dashboard:

Mrs. Park: 🟢 EXCELLENT
├─ Avg Class Mastery: 92%
├─ Grading Speed: 1.2 days avg
├─ Active Submissions: 0 (all current)
├─ System Usage: High (daily)
└─ Recommendation: Share practices with team

Mr. Chen: 🟢 GOOD
├─ Avg Class Mastery: 88%
├─ Grading Speed: 2.1 days avg
├─ Active Submissions: 3 (manageable)
├─ System Usage: Regular
└─ Recommendation: None needed

Mrs. Smith: 🟡 NEEDS SUPPORT
├─ Avg Class Mastery: 71%
├─ Grading Speed: 5.2 days avg ⚠
├─ Active Submissions: 45 (BACKLOG) ⚠
├─ System Usage: Sporadic
└─ Recommendation: [Reach out] [Offer training] [Share resources]

Mr. Wilson: 🔴 CRITICAL
├─ Avg Class Mastery: 52%
├─ Grading Speed: No activity (7 days)
├─ Active Submissions: 62 (CRITICAL BACKLOG)
├─ System Usage: Minimal
└─ Recommendation: [Schedule check-in] [Provide intensive support]
```

**Metrics to track:**
- Average class mastery %
- Grading turnaround time (avg days to grade)
- Pending submissions count
- Last system activity
- Implementation score (composite)

**Implementation:**
- Calculate metrics from existing data
- Create alert thresholds
- Provide quick "reach out" actions

**Files to create:**
- `TeacherHealthCard.tsx` (already mentioned for dashboard)
- `app/api/admin/teachers/[teacherId]/metrics/route.ts` (NEW)

**Estimated effort:** 6-8 hours

---

### Issue #5: Can't Compare Across Teachers/Classes
**Severity:** MEDIUM | **Effort:** MEDIUM | **Impact:** MEDIUM

#### Problem
- Admin can't see which teachers are most effective
- Can't identify best practices to share
- Can't benchmark class performance
- Hides high performers

#### Current State
- Individual class/teacher data exists
- No comparative view
- No ranking or benchmarking

#### Recommended Fix

**Add Comparison Views:**

1. **Classes by Performance (Leaderboard)**
   ```
   CLASS PERFORMANCE LEADERBOARD
   
   1. Mrs. Park Period 2 (Lit 101) ........ 92%
   2. Mr. Chen Period 1 (Lit 101) ........ 88%
   3. Mrs. Johnson Period 3 (Lit 101) .... 85%
   ...
   42. Mr. Wilson Period 5 (Lit 102) ..... 52%
   ```

2. **Teachers by Avg Performance**
   ```
   TEACHER EFFECTIVENESS
   
   1. Mrs. Park .......................... 92% avg
   2. Mr. Chen ........................... 88% avg
   3. Mrs. Johnson ....................... 85% avg
   ...
   15. Mr. Wilson ........................ 52% avg
   ```

3. **Peer Learning Recommendations**
   ```
   "Mrs. Park's Period 2 class (92% mastery) 
    would make excellent peer coaches for 
    Mr. Wilson's Period 5 class (52% mastery).
    [Schedule observation] [Set up peer mentoring]"
   ```

**Implementation:**
- Calculate aggregate metrics per teacher/class
- Sort/rank by performance
- Show comparison option

**Files to modify:**
- `AdminDashboard.tsx` (add comparison view)
- Create `TeacherComparisonTable.tsx` component

**Estimated effort:** 6-8 hours

---

## Part 4: Cross-Cutting Improvements

### Issue #1: Terminology Consistency
**Severity:** MEDIUM | **Effort:** LOW | **Impact:** MEDIUM

#### Problem
- Different terms used across student/teacher/admin views
- "Mandatory" vs "Required" vs "Core" vs "Essential"
- "Learning Objectives" vs "Skills" vs "Learning Goals"
- Confusion across all roles

#### Recommended Fix

**Standardize terminology in new file: `/app/config/terminology.ts`**

```typescript
export const TERMINOLOGY = {
  objectives: {
    label: 'What You'll Learn',
    singularLabel: 'Learning Goal',
    required: 'Core Skill',
    optional: 'Challenge Skill',
    requiredExplanation: 'Essential to demonstrate mastery',
    optionalExplanation: 'Advance your skills beyond requirements',
  },
  standards: {
    label: 'Learning Standards',
    descriptor: 'What defines mastery in this area',
  },
  mastery: {
    label: 'Mastery Progress',
    notStarted: 'Not Yet Started',
    inProgress: 'Making Progress',
    demonstrated: 'Mastered',
    threshold: 'Mastery Threshold',
  },
  submission: {
    label: 'Your Work',
    successMessage: 'Work Submitted!',
    gradedMessage: 'Graded',
    needsImprovement: 'Needs Improvement',
  },
  grading: {
    label: 'Assessment',
    passMessage: 'Passed',
    needsWorkMessage: 'Needs More Work',
  },
};
```

**Apply consistently across all components**

**Files to create:**
- `app/config/terminology.ts` (NEW)

**Files to modify (import and use):**
- All student components
- All teacher components
- All admin components

**Estimated effort:** 8-10 hours (with refactoring)

---

### Issue #2: Missing Data Validations
**Severity:** MEDIUM | **Effort:** MEDIUM | **Impact:** MEDIUM

#### Problem
- System doesn't validate required data before showing to students
- Teachers can create objectives without guidance
- Assessment rubrics can be missing
- Confusing experience when data is incomplete

#### Recommended Fix

**Add Pre-Launch Validation Checklist:**

Teachers see checklist before launching class:
```
CLASS READINESS CHECKLIST
═══════════════════════════════════════

□ Skills configured (4/4 ✓)
□ All objectives have assessment guidance (6/8 ✓)
  - Missing: "Emotional Availability", "Group Games"
  - [Add guidance]
□ Required objectives marked (need 3) (1/3 ✗)
  - [Mark as required]
□ All objectives have descriptions (8/8 ✓)

⚠ Class not ready to launch

[Fix Issues] [Preview as Student] [Launch Anyway]
```

**Implementation:**
- Create validation rules in SkillObjectiveManager
- Check before students can enroll
- Provide clear action items

**Estimated effort:** 4-6 hours

---

## Part 5: Implementation Roadmap

### Phase 1: CRITICAL (Weeks 1-2) - 40-50 hours
Must complete before launch. These are adoption blockers.

1. **Student Progress Visibility** (Issue S2)
   - Add progress header to StudentObjectiveList
   - Add skill mastery cards
   - Add post-grade feedback
   - **Effort:** 8-10 hours
   - **Impact:** CRITICAL - Students see progress

2. **Teacher Grading Inbox** (Issue T1)
   - Redesign grading interface
   - Flatten nested structure
   - Add pending view
   - **Effort:** 12-16 hours
   - **Impact:** CRITICAL - Teachers adopt system

3. **Class Progress Dashboard** (Issue T2)
   - Add class overview
   - Show skills performance
   - Show student groups
   - **Effort:** 12-14 hours
   - **Impact:** CRITICAL - Teachers know class status

4. **Terminology & Language** (Parts 1 & 4 Issue 1)
   - Change "Mandatory" → "Core Skill"
   - Update all copy
   - Add context/explanations
   - **Effort:** 2-3 hours
   - **Impact:** HIGH - All roles benefit

**Subtotal Phase 1:** 34-43 hours

### Phase 2: HIGH PRIORITY (Weeks 3-4) - 35-45 hours
Important for quality but not absolute blockers.

1. **Admin Dashboard** (Issue A1)
   - Department-level overview
   - Trend visualization
   - Alerts system
   - **Effort:** 20-24 hours
   - **Impact:** HIGH - Admins can lead

2. **Teacher Health Metrics** (Issue A4)
   - Health score system
   - Workload visibility
   - Support notifications
   - **Effort:** 6-8 hours
   - **Impact:** HIGH - Admin can proactively support

3. **Student Intervention Pipeline** (Issue A2)
   - At-risk student view
   - Intervention tracking
   - Impact measurement
   - **Effort:** 10-12 hours
   - **Impact:** HIGH - Targeted support

**Subtotal Phase 2:** 36-44 hours

### Phase 3: MEDIUM PRIORITY (Weeks 5-6) - 25-30 hours
Nice-to-have enhancements.

1. **Resubmit Workflow** (Issue S3)
   - **Effort:** 6-8 hours

2. **Trend Tracking** (Issue A3)
   - Historical snapshots
   - Progress visualization
   - **Effort:** 10-12 hours

3. **Assessment Guidance Visibility** (Issues S4, T3)
   - Show in submission
   - Show in grading
   - **Effort:** 4-6 hours

4. **Objective Alerts for Teachers** (Issue T4)
   - Low pass rate alerts
   - Bulk actions
   - **Effort:** 8-10 hours

**Subtotal Phase 3:** 28-36 hours

### Phase 4: LOW PRIORITY (After launch)
Polish and advanced features.

1. **Teacher Comparison/Leaderboards** (Issue A5)
2. **Validation Checklist** (Issue C2)
3. **Advanced Filtering/Sorting**
4. **Bulk Operations**

---

## Part 6: Technical Requirements

### Database Schema Additions
```sql
-- For mastery snapshots (Phase 3)
CREATE TABLE MasterySnapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standardId STRING NOT NULL,
  classId STRING,
  studentId STRING,
  masteryPercentage FLOAT,
  snapshotDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  FOREIGN KEY (standardId) REFERENCES Standard(id),
  FOREIGN KEY (classId) REFERENCES ImprovClass(id) OR K12Class(id),
  FOREIGN KEY (studentId) REFERENCES User(id)
);

-- For tracking attempt counts
ALTER TABLE ImprovObjectiveAssessment 
ADD COLUMN attemptNumber INT DEFAULT 1;

ALTER TABLE ImprovObjectiveAssessment 
ADD COLUMN previousStatus STRING DEFAULT 'not-started'; -- tracks last status

-- Add column to track intervention
ALTER TABLE ImprovObjectiveAssessment
ADD COLUMN interventionApplied BOOLEAN DEFAULT false;
ADD COLUMN interventionType STRING; -- 'tutoring', 'resource', 'reteach', etc.
```

### API Endpoints Needed

**Phase 1:**
- `GET /api/improv/classes/[classId]/submissions/pending` - Grading inbox
- `GET /api/classes/[classId]/progress-summary` - Class progress (may already exist)
- `GET /api/improv/classes/[classId]/mastery-by-skill` - Skill performance

**Phase 2:**
- `GET /api/admin/departments/[deptId]/mastery-summary` - Department overview
- `GET /api/admin/departments/[deptId]/mastery-trend` - Trends
- `GET /api/admin/teachers/[teacherId]/health-score` - Teacher metrics
- `GET /api/admin/alerts` - System alerts

**Phase 3:**
- `POST /api/mastery-snapshots` - Create snapshots (scheduled job)
- `GET /api/mastery-trends/[studentId|classId|standardId]` - Trend data

### Frontend Components Summary

| Component | Purpose | Phase | Effort |
|-----------|---------|-------|--------|
| SkillMasteryCard | Show progress per skill | 1 | 3h |
| ClassProgressDashboard | Class overview | 1 | 12h |
| TeacherGradingInbox | Flatten grading workflow | 1 | 14h |
| AdminDashboard | Department view | 2 | 20h |
| TeacherHealthCard | Teacher workload | 2 | 8h |
| AdminStudentSupportView | At-risk students | 2 | 10h |
| AdminTrendChart | Progress over time | 3 | 10h |

---

## Part 7: Success Metrics

Once implemented, measure:

### For Students
- [ ] Engagement: % of students who check progress section
- [ ] Clarity: Survey question "Do you understand what you need to do?" (target >85%)
- [ ] Resubmit rate: % of students who resubmit after feedback (target >60%)
- [ ] Motivation: Self-reported motivation score (target +20 points on 0-100)

### For Teachers
- [ ] Adoption: % of teachers using grading inbox (target >95%)
- [ ] Efficiency: Avg grading time per submission (target <3 min)
- [ ] Frequency: % of classes with updated mastery data (target >90%)
- [ ] Satisfaction: Teacher survey (target >4/5 stars)

### For Admins
- [ ] Insight: Ability to answer "Which students need help?" in <1 min
- [ ] Support: Ability to identify struggling teacher in <2 min
- [ ] Leadership: Can generate dept mastery report in <5 min
- [ ] Impact: Can measure intervention effectiveness

---

## Appendix A: Risks & Mitigation

### Risk 1: Terminology Change Breaks Existing Data
**Mitigation:** Only change display layer, not data model. `isMandatory` stays in DB.

### Risk 2: Mastery Calculation Complexity
**Mitigation:** Start with simple formula (% of required objectives passed), can enhance later.

### Risk 3: Performance Issues with Large Class Sizes
**Mitigation:** Implement pagination in grading inbox, lazy load submissions.

### Risk 4: Teachers Confused During Transition
**Mitigation:** Provide guided tour of new grading interface, create video tutorial.

### Risk 5: Historical Data Not Available for Phase 3
**Mitigation:** Start snapshots now (even if just storing current state), can backfill if needed.

---

## Appendix B: Recommendations for Handoff

1. **Create Feature Branches:** One per phase
2. **User Testing:** Recruit 2-3 teachers, 5-6 students for Phase 1 before full rollout
3. **Rollout Plan:** Phase 1 with pilot cohort, Phase 2 with early adopters, Phase 3 after stabilization
4. **Documentation:** Create teacher guide and admin guide for each phase
5. **Monitoring:** Add event tracking for key actions (grading, progress view, class alerts)
6. **Support:** Plan support for teachers during transition to new grading workflow

---

## Summary

This system has strong **architectural foundations** but needs **workflow refinement** before launch. The three critical changes are:

1. **Student:** Add progress visibility → dramatically improves motivation
2. **Teacher:** Flatten grading workflow → enables adoption
3. **Admin:** Build decision-support dashboard → enables data-driven leadership

**Total estimated effort:** 85-105 hours across 6 weeks

**Recommended start:** Immediately on Phase 1 to ensure launch readiness

**Expected impact:** 60%+ adoption increase, 40%+ improvement in teacher satisfaction, clear mastery trends visible within 2 months
