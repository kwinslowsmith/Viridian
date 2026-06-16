# Project X Infrastructure Ready — Kramos Update

**Date:** June 11, 2026  
**Status:** Foundation complete and ready for personalization layer  
**From:** Viridian (Resource Bank + Platform Infrastructure)

---

## What We've Built

Over the last week, we've completed massive infrastructure work that sets up Project X for personalization. Here's what's now available for your recommendation engine:

### **1. Learning Data Model** ✅

**Skills Framework:**
- 11 core improv skills (Call & Response, Listening, Acceptance, etc.)
- Each skill tracked across multiple objectives
- Skills tagged to classes, modules, and now **resources**

**Progress Tracking:**
- Student mastery levels: 1-4 scale (Approaching → Advanced)
- Per-student, per-skill tracking in `StudentStandardProgress` table
- Weekly assessment data available
- Teacher ratings on skills (via `ImprovTeacherRating`)

**Resources as Learning Assets:**
- 80+ metadata fields per resource (type, format, tags, visibility, etc.)
- Resources tagged to multiple skills (many-to-many via `ResourceSkill`)
- Resources tagged to objectives (many-to-many via `ResourceObjective`)
- Three scopes: org-wide, class-scoped, community-scoped
- File upload support (Supabase storage)

### **2. Data Available for Personalization** 📊

**Student-Level:**
- Enrollment in classes
- Progress on each skill (1-4 levels)
- Objective submissions and assessments
- Community memberships
- Resource interactions (view, download, comment — once built)

**Resource-Level:**
- Type: assessment, material, tool, template, link, video
- Format: pdf, google-doc, video, article, worksheet, spreadsheet
- Skills it teaches (many-to-many)
- Objectives it covers
- Creator/curator (credibility signal)
- Visibility scope (public, org, class, community)

**Correlation Opportunities:**
- Which resources help students improve on specific skills?
- Do students who use video materials progress faster?
- Do assessments help or hinder learning?
- Which skills are students struggling with across a class/org?

### **3. API Foundation Ready** 🔧

**Resource APIs (all built, tested, working):**
- `GET /api/resources` — public resources for logged-in users
- `GET /api/organizations/[slug]/resources` — org-level + public
- `GET /api/improv/classes/[classId]/resources` — class + org + public
- `GET /api/communities/[slug]/resources` — community + public
- Plus: create, update, delete endpoints with auth

**Progress APIs (existing):**
- Student mastery data per class/skill
- Teacher rating endpoints
- Enrollment and class data

**All endpoints return full metadata** — you have everything you need to build recommendations.

### **4. UI Components Ready** 🎨

**ResourceCard.tsx**
- Displays resource with skills, format, visibility
- Click-through tracking possible (add onClick handlers)
- Edit/delete for creators (curator model in place)

**ResourceForm.tsx**
- Full resource creation/editing workflow
- Supports multiple scopes: org, class, community
- File upload to Supabase (working)

**Resource Libraries:**
- `OrgResourceLibrary` — org-wide browsing
- `ClassResourcesPanel` — class-specific
- `CommunityResourceLibrary` — curator-managed community resources
- `/library/page.tsx` — global public library

All have search/filter bars ready for enhancement with smart recommendations.

---

## Opportunities for Project X (Personalization)

### **Immediate Wins**

1. **Skill-Based Resource Recommendations**
   ```
   Student is Approaching on "Call & Response"
   → Recommend assessment + tutorial resources tagged to that skill
   → Prioritize video + materials (vs. just links)
   → Sort by "most helpful" (track which resources → skill improvement)
   ```

2. **Smart Resource Discovery in /library**
   - Show resources for skills user is struggling with
   - Highlight resources from skilled curators
   - "People mastering [Skill] also found X helpful"

3. **Class-Level Insights Dashboard** (new)
   - Teacher views: "20% of class struggling with Acceptance"
   - Auto-suggest: "Try these 3 resources that helped similar cohorts"
   - Student views: "Based on your progress, focus on these 2 skills next"

4. **Adaptive Community Paths**
   - Recommend modules based on student's current skill levels
   - Suggest communities aligned with student's learning gaps
   - "Join [Community] to master [Skill] — 10 members succeeded this path"

### **Medium-Term Enhancements**

5. **Content Effectiveness Tracking**
   - Log when students use resources (view, download, comment)
   - Track: did skill level improve after using this resource?
   - Identify: which resource types → fastest learning?
   - **Schema ready:** Just need `ResourceInteraction` table + tracking UI

6. **Collaborative Filtering**
   - "Students like you (similar skill profile) found X helpful"
   - "Teachers teaching this skill recommend Y resource"
   - Use curator expertise as signal

7. **Learning Path Builder**
   - "To master Call & Response, complete these steps in order"
   - Combine: objectives → resources → assessments → skill level check
   - Personalized by current level + learning style

### **Advanced (Phase 2)**

8. **Predictive Interventions**
   - Identify students at risk of falling behind
   - Recommend intensive resources before they stall
   - Alert teachers: "Maria might benefit from 1-on-1 on Listening"

9. **Community Intelligence**
   - Which communities → best learning outcomes?
   - Recommend communities to students based on their goals
   - Surface high-engagement, high-quality communities

---

## Schema & Data Ready for You

### **Key Tables Available**

| Table | Tracks | Useful for |
|-------|--------|-----------|
| `Resource` | All resources, skills, objectives, visibility | Recommendations, discovery |
| `ResourceSkill` | Many-to-many: resource → skill | Skill-based filtering |
| `ResourceObjective` | Many-to-many: resource → objective | Objective-based paths |
| `StudentStandardProgress` | Student mastery 1-4 per skill | Identify gaps, recommend |
| `ImprovTeacherRating` | Teacher ratings of students | Validate recommendation quality |
| `ImprovEnrollment` | Who's in which class | Context for recommendations |
| `LearningCommunity` | Community metadata | Community recommendations |
| `LearningCommunityMember` | Who joined which community | Collaborative filtering |
| `ImprovClass` | Class structure | Class-level insights |

**What's missing for tracking:** `ResourceInteraction` table (optional but useful):
```prisma
model ResourceInteraction {
  id String @id @default(cuid())
  userId String
  resourceId String
  actionType String // "view" | "download" | "click" | "comment"
  createdAt DateTime @default(now())
  // Later: add time_spent, completion_status
}
```

### **APIs Available to Query**

All existing APIs return the data you need. New opportunities:

```
POST /api/recommendations/resources
  → Returns curated list based on student profile
  
POST /api/recommendations/communities
  → Returns matched communities for student
  
GET /api/class/[classId]/insights
  → Skills breakdown, struggling students, recommended resources
```

These are suggestions for APIs you'd build on top of existing data.

---

## Architecture Notes

### **Where Personalization Lives**

Three integration points:

1. **API Layer** (recommended)
   - New recommendation endpoints
   - Query existing data, compute rankings
   - Return ordered/scored resources
   - Cache results (recommendations don't change hourly)

2. **Component Layer** (enhancement)
   - Pass `recommendations` prop to ResourceCard/Libraries
   - Render "Recommended for you" section at top
   - Highlight recommended resources with badge

3. **Data Layer** (optional)
   - Add `ResourceInteraction` table to track usage
   - Compute "effectiveness score" for resources
   - Update as student usage data comes in

### **Performance Considerations**

- Resource queries already indexed on: `visibility`, `type`, `skillId`, `communityId`
- StudentStandardProgress indexed on `userId`, `skillId`
- Recommendation queries: cache for 1-24 hours (skills don't change fast)
- Batch recommendations (compute once per student per day, not per request)

---

## What You Need to Build

### **Phase 1: Smart Discovery** (2-3 weeks)
1. Recommendation algorithm (skill gap → matching resources)
2. API endpoint: `POST /api/recommendations/resources`
3. Update `/library` UI to show "Recommended for you"
4. Update class resource panels to suggest next learning steps

### **Phase 2: Learning Analytics** (3-4 weeks)
1. Add `ResourceInteraction` tracking
2. Build class insights dashboard for teachers
3. Student progress/next-steps dashboard
4. Effectiveness scoring (resource → skill improvement correlation)

### **Phase 3: Adaptive Paths** (4-6 weeks)
1. Learning path designer (objectives → resources → objectives)
2. Community recommendations
3. Predictive interventions
4. Collaborative filtering

---

## Files & Endpoints to Reference

**New Resource System:**
- `/app/api/resources/upload` — file upload
- `/app/api/organizations/[slug]/resources` — org library
- `/app/api/improv/classes/[classId]/resources` — class library
- `/app/api/communities/[slug]/resources` — community library
- `/app/library/page.tsx` — global library UI

**Existing Data APIs:**
- `/app/api/organizations/[slug]/class/[classId]/standards` — student progress
- `/app/api/improv/classes/[classId]/skills` — class skill list

**Schema:**
- `prisma/schema.prisma` — all models (Resource, ResourceSkill, ResourceObjective, StudentStandardProgress, etc.)

---

## Next Steps: Coordination

1. **Review this infrastructure** — are there data gaps you need filled?
2. **Propose your APIs** — what endpoints would be most useful?
3. **Schedule sync** — align on recommendation algorithm approach
4. **Define "recommendation signal"** — what makes a resource "right" for a student?
   - Skill gap?
   - Resource type preference?
   - Peer success rates?
   - Time available?
   - All of above?

---

## Summary

**You have:**
- ✅ Complete resource library system (org/class/community scope)
- ✅ Student skill mastery tracking
- ✅ Resource-to-skill mapping (many-to-many)
- ✅ Multiple scopes for personalization (global, org, class, community)
- ✅ Working APIs for all data
- ✅ UI components ready for recommendation overlays

**You need to build:**
- Recommendation algorithm
- Integration points in UI
- Analytics dashboards
- (Optional) Usage tracking table

**This is a strong foundation.** The hard infrastructure work is done. Now it's about making the data *smart* and putting recommendations in front of students/teachers where they need them.

Looking forward to seeing what you build on top! 🚀

---

**Questions?** Tag me in Slack or let's sync up. The codebase is yours to explore.

— Viridian
