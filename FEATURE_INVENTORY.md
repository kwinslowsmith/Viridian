# Complete Feature Inventory

## 1. IMPROV SYSTEM (Skills-Based Learning)

### Pages
- `/app/polymath/page.tsx` - Magazine main view
- `/app/polymath/landing/page.tsx` - Landing page
- `/app/polymath/feed/page.tsx` - Feed view
- `/app/polymath/article/page.tsx` - Article detail
- `/app/polymath/collections/[collectionId]/page.tsx` - Collection detail
- `/app/polymath/modules/[moduleId]/page.tsx` - Module detail
- `/app/polymath/tools/[toolId]/page.tsx` - Tool detail
- `/app/polymath/approvals/page.tsx` - Approval queue
- `/app/test/polymath-posting/page.tsx` - Test posting form
- `/app/curator/polymath/page.tsx` - Curator view

### API Endpoints - Core
- `GET/POST /api/improv/classes` - List/create classes
- `GET /api/improv/classes/[classId]` - Get class details
- `GET /api/improv/classes/[classId]/skills` - Get class skills
- `GET /api/improv/classes/[classId]/objectives` - Get class objectives
- `GET /api/improv/classes/[classId]/weeks/[weekNum]` - Get week data
- `GET /api/improv/classes/[classId]/weeks/[weekNum]/skills` - Get week skills

### API Endpoints - Student Progress (PHASE 1)
- `GET /api/improv/classes/[classId]/progress-dashboard` - Class mastery grid
- `GET /api/improv/classes/[classId]/progress-summary` - Class summary
- `GET /api/improv/student/[studentId]/dashboard` - Student progress
- `GET /api/improv/classes/[classId]/students/[studentId]/progress` - Student progress (class-scoped)
- `GET /api/improv/classes/[classId]/students/[studentId]/assessments` - Student assessments

### API Endpoints - Grading (PHASE 1)
- `GET /api/improv/classes/[classId]/grading-inbox` - Pending submissions (flat list)
- `GET/POST/PUT /api/improv/classes/[classId]/objectives/[objectiveId]/assessments` - Submission handling
- `GET/POST /api/improv/classes/[classId]/assessments` - Class assessments
- `GET/PUT /api/improv/classes/[classId]/assessments/[assessmentId]` - Assessment detail

### API Endpoints - Ratings
- `GET/POST /api/improv/student-ratings` - Student self-ratings
- `GET/PUT /api/improv/student-ratings/[ratingId]` - Rating detail
- `GET/POST /api/improv/teacher-ratings` - Teacher ratings
- `GET/PUT /api/improv/teacher-ratings/[ratingId]` - Rating detail
- `GET /api/improv/classes/[classId]/students/[studentId]/ratings-comparison` - Comparison

### API Endpoints - Resources & Feedback
- `GET/POST /api/improv/feedback` - Feedback management
- `GET/PUT /api/improv/feedback/[feedbackId]` - Feedback detail
- `GET /api/improv/classes/[classId]/resources` - Class resources
- `GET/POST /api/improv/skills/[skillId]` - Skill detail
- `GET/POST /api/improv/objectives/[objectiveId]` - Objective detail

### Components
- `GradingInbox` - Flat-list submission grading interface (PHASE 1)
- `ClassProgressDashboard` - Class mastery grid view (PHASE 1)
- `StudentObjectiveList` - Student objective list with progress
- `StudentObjectiveSubmission` - Student submission form
- `PostGradeFeedback` - Feedback display after grading
- `TeacherGradingDashboard` - Old nested grading view (DEPRECATED)

### Database Models
- `ImprovClass`, `ImprovEnrollment`
- `ImprovSkill`, `ImprovObjective`, `ExampleObjective`
- `ImprovWeek`, `ImprovWeekSkill`, `ImprovClassSkill`
- `ImprovObjectiveAssessment`, `ImprovStudentRating`, `ImprovTeacherRating`
- `ImprovFeedback`

---

## 2. K12 SYSTEM (Standards-Based Learning)

### Pages
- `/app/organization/[slug]/k12-class/[classId]/page.tsx` - Class page
- `/app/teachers/class/[classId]/dashboard/page.tsx` - Teacher dashboard

### API Endpoints - Class Management
- `GET /api/k12-classes/[classId]/class-dashboard` - Dashboard data (PHASE 1)
- `GET /api/k12-classes/[classId]/student-progress` - Student progress tracking
- `GET /api/k12-classes/[classId]/objectives` - Objectives management
- `GET/PUT/DELETE /api/k12-classes/[classId]/objectives/[objectiveId]` - Objective detail
- `GET /api/k12-classes/[classId]/standards` - Standards management
- `GET /api/k12-classes/[classId]/standards-manager` - Standards configuration
- `GET /api/k12-classes/[classId]/standards-by-unit` - Standards by unit

### API Endpoints - Day Management
- `GET/POST /api/classes/k12/[classId]/days` - Days management
- `GET/PUT /api/classes/k12/[classId]/days/[dayId]` - Day detail

### Components
- `TeacherClassDashboard` - K12 teacher overview (PHASE 1)

### Database Models
- `K12Class`, `K12Enrollment`
- `Standard`, `Unit`, `StudentStandardProgress`
- Day/scheduling models

---

## 3. POLYMATH SYSTEM (Content Creation & Discovery)

### Pages
- `/app/polymath/page.tsx` - Magazine main (also feeds articles/tools/modules/collections)
- `/app/polymath/feed/page.tsx` - Alternative feed view
- `/app/polymath/landing/page.tsx` - Landing page
- `/app/polymath/article/page.tsx` - Article detail view
- `/app/polymath/tools/[toolId]/page.tsx` - Tool detail
- `/app/polymath/modules/[moduleId]/page.tsx` - Module detail
- `/app/polymath/collections/[collectionId]/page.tsx` - Collection detail
- `/app/polymath/approvals/page.tsx` - Approval workflow queue
- `/app/test/polymath-posting/page.tsx` - Test posting form
- `/app/curator/polymath/page.tsx` - Curator management

### API Endpoints - Articles
- `GET/POST /api/polymath/articles` - List/create articles
- `GET/PUT /api/polymath/articles/[id]` - Article detail
- `POST /api/polymath/articles/[id]/approve` - Approve article
- `POST /api/polymath/articles/[id]/reject` - Reject article

### API Endpoints - Tools
- `GET/POST /api/polymath/tools` - List/create tools
- `GET/PUT /api/polymath/tools/[id]` - Tool detail
- `POST /api/polymath/tools/[id]/approve` - Approve tool
- `POST /api/polymath/tools/[id]/reject` - Reject tool

### API Endpoints - Modules
- `GET/POST /api/polymath/modules` - List/create modules
- `GET/PUT /api/polymath/modules/[id]` - Module detail
- `POST /api/polymath/modules/[id]/approve` - Approve module
- `POST /api/polymath/modules/[id]/reject` - Reject module

### API Endpoints - Collections
- `GET/POST /api/polymath/collections` - List/create collections
- `GET/PUT /api/polymath/collections/[id]` - Collection detail
- `POST /api/polymath/collections/[id]/approve` - Approve collection
- `POST /api/polymath/collections/[id]/reject` - Reject collection

### API Endpoints - Discovery & Curation
- `GET /api/polymath/magazine` - Magazine feed (combines all types)
- `GET /api/polymath/approval-queue` - Approval queue
- `GET/POST /api/polymath/posts` - Posts (alternate content type?)
- `GET/PUT /api/polymath/posts/[id]` - Post detail

### Components
- `PolymathPostingForm` - Multi-author posting (individual/org/community/event)
- `IndividualPostForm` - Personal posting
- `OrgPostForm` - Organization posting
- `CommunityPostForm` - Community posting
- `EventPostForm` - Event posting
- `PolymathHero`, `PolymathSearchBar`, `PolymathCard`, `PolymathFooter` - UI components

### Database Models
- `PolymathPost`, `PolymathArticle`, `PolymathTool`, `PolymathModule`, `PolymathCollection`
- Approval workflow models

---

## 4. COMMUNITIES SYSTEM

### Pages
- `/app/communities/page.tsx` - Communities directory

### API Endpoints - Community Management
- `GET/POST /api/communities` - List/create communities
- `GET/PUT /api/communities/[slug]` - Community detail
- `GET /api/communities/my` - My communities
- `GET /api/me/communities` - My communities (duplicate?)
- `POST /api/curator/communities` - Curator creation
- `GET /api/organizations/[slug]/communities` - Org communities

### API Endpoints - Membership
- `GET/POST /api/communities/[slug]/join` - Join community
- `GET/POST /api/communities/[slug]/join-requests` - Join requests
- `POST /api/communities/[slug]/join-requests/[requestId]/approve` - Approve request
- `POST /api/communities/[slug]/join-requests/[requestId]/reject` - Reject request
- `GET /api/communities/[slug]/members` - Community members

### API Endpoints - Community Content
- `GET/POST /api/communities/[slug]/resources` - Resources
- `GET/PUT /api/communities/[slug]/resources/[resourceId]` - Resource detail
- `GET/POST /api/communities/[slug]/modules` - Modules
- `GET/PUT /api/communities/[slug]/modules/[moduleId]` - Module detail
- `GET/POST /api/communities/[slug]/polymath/articles` - Community articles
- `GET/PUT /api/communities/[slug]/polymath/articles/[articleId]` - Article detail
- `GET/POST /api/communities/[slug]/polymath/tools` - Community tools
- `GET/PUT /api/communities/[slug]/polymath/tools/[toolId]` - Tool detail
- `GET/POST /api/communities/[slug]/polymath/modules` - Community modules
- `GET/PUT /api/communities/[slug]/polymath/modules/[moduleId]` - Module detail
- `GET/POST /api/communities/[slug]/polymath/collections` - Community collections
- `GET/PUT /api/communities/[slug]/polymath/collections/[collectionId]` - Collection detail

### Database Models
- `LearningCommunity`, `LearningCommunityMember`
- `CommunityJoinRequest`

---

## 5. STANDARDS & SKILLS MANAGEMENT

### API Endpoints - Standards Management
- `GET/POST /api/standards` - Standards list/create
- `GET /api/standards/[standardId]` - Standard detail
- `GET/POST /api/standards/[standardId]/resources` - Standard resources
- `GET/POST /api/standards/[standardId]/objectives/[objectiveId]` - Objective under standard
- `GET /api/classes/[classId]/mastery-summary` - Mastery grid (PHASE 1)
- `POST /api/classes/[classId]/mastery-summary/bulk-update` - Bulk update mastery
- `GET /api/organizations/[slug]/import-standards` - Standards import
- `GET /api/organizations/[slug]/standards` - Org standards
- `GET /api/organizations/[slug]/k12-classes/[classId]/standards` - Class standards

### API Endpoints - Standards Banks
- `GET/POST /api/standards-banks` - Standards banks list
- `GET/PUT /api/standards-banks/[bankId]` - Bank detail
- `GET /api/standards-banks/[bankId]/standards` - Bank standards

### Database Models
- `Standard`, `StandardsDistribution`, `StandardResource`
- `Unit`, `SkillCategory`
- `StudentStandardProgress`
- `TeacherStandardAssignment`

---

## ISSUES IDENTIFIED

### Fragmentation & Duplication
1. **Multiple entry points for same data**
   - `/polymath/page.tsx` vs `/polymath/feed/page.tsx` vs `/polymath/landing/page.tsx`
   - Multiple standards endpoints with similar functionality

2. **Unclear navigation flow**
   - Communities content (articles/tools/modules/collections) has separate endpoints from Polymath content
   - User might be confused whether to use `/polymath` or `/communities/[slug]/polymath`

3. **Two parallel systems (IMPROV vs K12)**
   - Skills-based (IMPROV) and Standards-based (K12) have different structures
   - Progress dashboards are separate implementations
   - Grading workflows are different

4. **Polymath content confusion**
   - Posts, Articles, Tools, Modules, Collections all seem similar
   - Unclear distinction between these types
   - Community-specific polymath endpoints duplicate global ones

5. **API organization**
   - Some endpoints deeply nested (e.g., `/communities/[slug]/polymath/articles/[articleId]/`)
   - Some at top level (e.g., `/polymath/articles/[id]/`)
   - Inconsistent URL patterns

### PHASE 1 Features (Recently Added)
- `GradingInbox` + grading-inbox API
- `ClassProgressDashboard` + progress-dashboard API
- `TeacherClassDashboard` + class-dashboard API
- `StudentObjectiveSubmission` + PostGradeFeedback
- Mastery-summary with bulk updates
- Student dashboard with progress tracking

### Components Needing Integration
- Many components exist but unclear where they're actually used
- Some old components (TeacherGradingDashboard) deprecated but still in codebase
- Terminology config created but might not be used consistently

---

## RECOMMENDED NEXT STEPS

1. **Consolidate Polymath** - Decide: one magazine or separate community magazines?
2. **Clarify IMPROV vs K12** - Are they both needed? Can they share infrastructure?
3. **Audit component usage** - Find orphaned/duplicate components
4. **Standardize API patterns** - Consistent URL structure
5. **Simplify navigation** - Fewer entry points to same data
