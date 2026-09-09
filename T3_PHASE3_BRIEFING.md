# T3 Phase 3 Briefing: Parent Alerts & Risk Indicators

**Status:** Backend APIs ready ✅ | UI work: START NOW

---

## YOUR MISSION

Add 2 new features to parent experience:
1. **At-Risk Widget** — Show which objectives child needs help with + mastery progress
2. **Intervention Alerts** — Notify parents when child added to support group

**Timeline:** Sept 9-20 (2 weeks)  
**Dependency:** T1 Mastery + Intervention APIs (READY ✅)

---

## WHAT TO BUILD

### 1. At-Risk Widget

**Location:** Parent dashboard (existing `/parents/dashboard`)

**Features:**
- Summary box showing:
  - ⚠️ "Your child is working on [N] objectives" (risk count)
  - 🎯 Intervention groups child is in (list them)
  - Timeline: "Estimated 2 weeks to reach 80% mastery"
- Click to expand → see which specific objectives + current scores
- Color-coded: green (on track), yellow (needs help), red (critical)
- Responsive (375px+)

**API to Use:**
```
GET /api/k12-classes/[classId]/students/[studentId]/mastery
  Returns: { standards: [{ masteryPercent, passed, reason, objectives: [...] }] }

GET /api/k12-classes/[classId]/intervention-groups
  Returns: [{ id, name, objectiveId, studentCount, meetingSchedule }]
```

**Component Structure:**
```
<AtRiskWidget childId={childId}>
  <RiskSummary>
    - Risk count, intervention groups, timeline
  <RiskDetails>
    - Expand to see specific objectives at risk
    - Show mastery % for each
    - Link to learning resources
```

**Example Display:**
```
⚠️ At-Risk Summary
Your child is currently working on 2 objectives in American Literature.

🎯 Intervention Groups
- "Theme Analysis Support" - Meets Tuesdays at 2pm

📈 Mastery Progress
- Analyze Literary Themes: 65% (need 80%)
- Estimate 2 weeks to mastery

[See Details] [Contact Teacher]
```

---

### 2. Intervention Alerts

**Location:** Parent messaging inbox + email notification

**Features:**
- When child added to intervention group, parent gets:
  - In-app notification in `/parents/messages` inbox
  - Email notification (use existing Resend integration)
- Alert shows: objective name, why child needs help, meeting schedule, teacher contact
- "Acknowledge" button to mark alert read

**Example Alert:**
```
📌 NEW: [StudentName] joined "Theme Analysis Support"

Your child has been added to a support group for:
Objective: Analyze Literary Themes (American Literature)

Meeting: Tuesdays at 2pm
Taught by: Teacher 1 Rodriguez

This is a collaborative session to help your child master this skill.
Contact teacher for questions: [teacher email]

[Acknowledge] [Message Teacher]
```

**API to Use:**
```
POST /api/k12-classes/[classId]/intervention-groups
  Body includes: { name, objectiveId, studentIds[], meetingSchedule }
  → When student added, create alert
```

**Component Structure:**
```
<InterventionNotification groupId={id}>
  - Objective info
  - Meeting schedule
  - Teacher contact
  - Acknowledge button
```

**Implementation:**
- Hook into T1's intervention group POST endpoint
- Create Conversation message when group is created
- Use existing messaging infrastructure (already built in Phase 2)
- Email via Resend (template already exists)

---

### 3. Progress Benchmarking Text

**Update:** Parent dashboard overview section

**Add to each standard:**
- Current mastery %
- Pass threshold (e.g., "80%")
- Gap analysis: "Your child is 15% below the goal"
- Encouraging message based on trajectory (if improving, say so)

**API to Use:**
```
GET /api/k12-parents/children/[childId]/progress
  → Already exists from Phase 1, just enhance with mastery API call
```

**Example:**
```
American Literature: Analyze Literary Themes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current: 65% | Target: 80%

Your child is 15% below the mastery goal.
Good news: progress has improved 5% this week!
Estimated time to mastery: 2 weeks

🎯 Keep going!
```

---

## DEPENDENCIES

✅ All APIs ready:
- `/api/k12-classes/[classId]/students/[studentId]/mastery`
- `/api/k12-classes/[classId]/intervention-groups`

✅ Infrastructure ready:
- Messaging system (Phase 2)
- Email templates (Resend integration)
- Parent authentication & child linking

✅ Test data seeded:
- 2 intervention groups per class
- Students with varying mastery scores

---

## WORK SCHEDULE

**Week 1 (Sept 9-15):**
- Sept 9-10: Design At-Risk widget, integrate Mastery API
- Sept 11-12: Build RiskSummary + RiskDetails components
- Sept 13-15: Build Intervention notification component

**Week 2 (Sept 16-20):**
- Sept 16-17: Integrate notifications into messaging inbox
- Sept 18-19: Email notifications (hook to T1 intervention API)
- Sept 20: Bug fixes, testing, mobile responsive verification

---

## SUCCESS CRITERIA

- [ ] At-Risk widget displays on parent dashboard
- [ ] Widget shows child's mastery % + pass threshold
- [ ] Intervention groups listed with meeting schedule
- [ ] Click "See Details" expands to show objectives
- [ ] Color-coding works (green/yellow/red)
- [ ] Intervention alerts appear in messaging inbox
- [ ] Email notifications send when child added to group
- [ ] Mobile responsive (375px+)
- [ ] TypeScript: 0 errors
- [ ] Plain language (no K12 jargon)

---

## INTEGRATION POINTS

- **Dashboard Route:** `/parents/dashboard` (add At-Risk widget)
- **Messaging Route:** `/parents/messages` (show intervention alerts)
- **API Calls:** useEffect + fetch pattern (same as Phase 2)
- **Email:** Use existing Resend integration + template

---

## NOTES

- Keep language parent-friendly (no "mastery threshold" → use "goal")
- Emphasize encouragement over alarm
- Provide actionable next steps (contact teacher, see study materials)
- Consider parent workload: don't over-notify

---

**Ready? Start building and push to main. Vercel auto-deploys.**

