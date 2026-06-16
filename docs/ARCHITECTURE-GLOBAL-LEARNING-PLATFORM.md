# Viridian Global Learning Platform — Complete Architecture

**Last Updated:** June 9, 2026  
**Status:** Architecture Blueprint (Ready for Implementation)  
**Target Launch:** June 25, 2026  
**Scope:** Authentication + Global/Org Communities + Discovery + Curation

---

## 1. VISION & DESIGN PRINCIPLES

### Core Model
**Two-tier community system:**
- **Global Communities:** Public, discoverable by anyone (e.g., "Learn How to Do Taxes", "Digital Literacy")
- **Organization Communities:** Private to specific orgs (e.g., "Match High School Book Club", "Improv Asylum Level 3")
- **Cross-promotion:** Orgs can promote their communities to global discovery to attract learners

### Philosophy
- Open-source foundation with safety guardrails
- Human curation first, personalization second
- Organizations as curators and content providers
- Free + premium tiers (payment deferred; infrastructure ready)
- Accessible globally while respecting org boundaries

---

## 2. DATABASE SCHEMA CHANGES

### Updated Models

#### User (Enhanced)
```prisma
model User {
  id                     String   @id @default(cuid())
  email                  String   @unique
  name                   String
  passwordHash           String?  // For auth
  role                   String   @default("learner") // global role
  
  // Auth
  emailVerified          Boolean  @default(false)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  // Relations
  organizationRoles      OrganizationRole[]
  learningCommunityMemberships LearningCommunityMember[]
  curatedCommunities     LearningCommunity[] @relation("CuratedBy")
  studentPreferences     StudentPreference[]
}
```

#### LearningCommunity (Restructured)
```prisma
model LearningCommunity {
  id                     String   @id @default(cuid())
  
  // Core identity
  slug                   String   @unique // URL-friendly: "learn-taxes"
  name                   String   // "Learn How to Do Taxes"
  description            String?
  coverImage             String?  // URL
  
  // Scope & access
  scope                  String   // "global" | "organization"
  organizationId         String?  // NULL if global, orgId if org-scoped
  organization           Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Curation & moderation
  curatorId              String
  curator                User     @relation("CuratedBy", fields: [curatorId], references: [id], onDelete: Cascade)
  status                 String   @default("draft") // "draft" | "pending-approval" | "active" | "archived"
  approvedAt             DateTime?
  approvedById           String?
  
  // Access control
  isPublic               Boolean  @default(true) // Can be discovered
  requiresApprovalToJoin Boolean  @default(false) // Curator must approve members
  
  // Metadata
  topic                  String?  // "education", "career", "life-skills", etc.
  difficulty             String?  // "beginner", "intermediate", "advanced"
  estimatedHours         Int?     // Time to complete all modules
  
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  // Relations
  modules                LearningModule[]
  members                LearningCommunityMember[]
  resources              StandardResource[] // Curated materials
  joinRequests           CommunityJoinRequest[]

  @@unique([organizationId, slug])
  @@index([scope])
  @@index([status])
  @@index([topic])
  @@index([curatorId])
}
```

#### LearningCommunityMember (Updated)
```prisma
model LearningCommunityMember {
  id                     String   @id @default(cuid())
  communityId            String
  community              LearningCommunity @relation(fields: [communityId], references: [id], onDelete: Cascade)

  userId                 String
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  role                   String   @default("member") // "member" | "curator" | "moderator"
  status                 String   @default("active") // "active" | "suspended" | "left"
  joinedAt               DateTime @default(now())
  progress               Float    @default(0) // % complete (0-100)

  @@unique([communityId, userId])
  @@index([communityId])
  @@index([userId])
  @@index([status])
}
```

#### NEW: CommunityJoinRequest
```prisma
model CommunityJoinRequest {
  id                     String   @id @default(cuid())
  communityId            String
  community              LearningCommunity @relation(fields: [communityId], references: [id], onDelete: Cascade)

  userId                 String
  user                   User     @relation(fields: [userId], references: [id])

  status                 String   @default("pending") // "pending" | "approved" | "rejected"
  requestedAt            DateTime @default(now())
  respondedAt            DateTime?
  respondedById          String?

  @@unique([communityId, userId])
  @@index([communityId])
  @@index([status])
}
```

#### LearningModule (Unchanged)
```prisma
model LearningModule {
  id                     String   @id @default(cuid())
  communityId            String
  community              LearningCommunity @relation(fields: [communityId], references: [id], onDelete: Cascade)

  title                  String
  description            String?
  sequenceNum            Int
  estimatedHours         Int?

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@unique([communityId, sequenceNum])
  @@index([communityId])
}
```

#### StudentPreference (Updated)
```prisma
model StudentPreference {
  id                     String   @id @default(cuid())
  userId                 String
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  organizationId         String?  // NULL = user preferences; orgId = org-specific prefs
  organization           Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Material preferences
  preferredMaterialTypes String?  // "video,article,worksheet"
  learningInterests      String?  // "economics,history,math"
  
  // Community preferences
  preferredTopics        String?  // "career,education,life-skills"
  
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@unique([userId, organizationId])
  @@index([userId])
}
```

#### Organization (Updated)
```prisma
model Organization {
  id                     String   @id @default(cuid())
  name                   String   @unique
  slug                   String   @unique
  description            String?
  logo                   String?

  // Curator info
  curatorName            String?
  curatorBio             String?

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  // Relations
  users                  OrganizationRole[]
  improvClasses          ImprovClass[]
  k12Classes             K12Class[]
  standardsDistributions StandardsDistribution[]
  teacherStandardAssignments TeacherStandardAssignment[]
  interventionBlocks     InterventionBlock[]
  studySessions          StudySession[]
  learningCommunities    LearningCommunity[] // Communities they curate
  studentPreferences     StudentPreference[]

  @@index([slug])
}
```

---

## 3. AUTHENTICATION & SIGNUP FLOW

### Current State → New State
**Before:** Manual role selection button (no auth)  
**After:** Email/password signup, session-based auth

### Signup Flow
```
1. User lands on homepage → "Sign Up" or "Login" button
2. Signup form: Email, Name, Password (optional: organization code)
   - Email verified via confirmation link
3. User redirected to "Discover Communities"
4. If org code provided, auto-join organization
5. Session created (JWT or session cookie)
```

### Database for Auth
- Use `User.passwordHash` (bcrypt)
- Session table (or JWT tokens stored in cookie)
- Email verification tokens (temporary records)

### API Endpoints (Auth)
```
POST /api/auth/signup
  Body: { email, name, password }
  Returns: { user, authToken }

POST /api/auth/login
  Body: { email, password }
  Returns: { user, authToken }

POST /api/auth/logout
  Returns: { success: true }

GET /api/auth/me
  Returns: { user } (current user from session)
```

---

## 4. COMMUNITY DISCOVERY & BROWSING

### Top-Level Navigation
```
User Dashboard:
├── 📚 My Classes (organization classes they're enrolled in)
├── 🌍 Discover Communities (global + discoverable org communities)
├── ✅ My Communities (joined communities)
├── 👤 Profile & Preferences
└── ⚙️ Settings
```

### Discovery Interface
```
GET /api/communities
  Query params:
    - scope: "global" | "organization" | "all" (default: all)
    - organizationId: filter by org
    - topic: filter by topic
    - search: keyword search
    - limit: pagination
  Returns: { communities: [...], total }

GET /api/communities/[slug]
  Returns: { community, modules, memberCount, curator }

GET /api/communities/featured
  Returns: { communities: [...] } (orgs promoted to global)
```

### Community Card Display
- Name, description, cover image
- Curator org name
- Member count
- Topic/difficulty tags
- "Join" or "Already Joined" button
- If requires approval: "Request to Join" button

---

## 5. COMMUNITY SCOPES & ACCESS CONTROL

### Global Communities
- **Created by:** Any user with "curator" role
- **Discovery:** Public (appears in global discovery)
- **Access:** Anyone can join (open) or request to join (approval required)
- **Promotion:** Can be featured by organizations to attract learners
- **Status workflow:** draft → pending-approval (SuperAdmin review) → active

### Organization Communities
- **Created by:** Organization admins or designated curators
- **Discovery:** 
  - Private to org members (if `isPublic: false`)
  - Public but org-scoped (if `isPublic: true`)
- **Access:** Depends on org membership or explicit join approval
- **Status workflow:** draft → active (org admin approval)

### Status Workflow
```
draft ──> pending-approval ──> active ──> archived
         (SuperAdmin review)
```

---

## 6. CURATION & CURATOR ROLES

### Curator Capabilities
- Create communities (global or org-scoped)
- Add/edit modules within communities
- Add/tag resources to modules
- Approve join requests (if approval required)
- View member progress
- Suspend/remove members
- Archive community when complete

### SuperAdmin Curation
- Approve global communities before they go live
- Flag/remove unsafe communities
- Manage curator privileges
- View moderation queue

### Moderation (Deferred)
- Placeholder: `CommunityModerator` model (not implemented yet)
- Reporting system (not implemented yet)
- Content flags (not implemented yet)

---

## 7. API ENDPOINTS (COMMUNITIES)

### Community CRUD
```
POST /api/communities
  Body: { name, description, scope, organizationId?, topic, isPublic }
  Returns: { community }

GET /api/communities
  Query: { scope, topic, search, limit, offset }
  Returns: { communities, total }

GET /api/communities/[slug]
  Returns: { community, modules, members: count }

PATCH /api/communities/[slug]
  Body: { name, description, coverImage, isPublic, ... }
  Returns: { community }

DELETE /api/communities/[slug]
  Returns: { success: true }
```

### Community Membership
```
POST /api/communities/[slug]/join
  Body: {} (optional approval)
  Returns: { member } or { joinRequest } if approval required

POST /api/communities/[slug]/leave
  Returns: { success: true }

POST /api/communities/[slug]/join-requests/[requestId]/approve
  Returns: { member }

POST /api/communities/[slug]/join-requests/[requestId]/reject
  Returns: { success: true }

GET /api/communities/[slug]/members
  Returns: { members: [...] }
```

### Modules
```
POST /api/communities/[slug]/modules
  Body: { title, description, sequenceNum }
  Returns: { module }

GET /api/communities/[slug]/modules
  Returns: { modules: [...] }

PATCH /api/communities/[slug]/modules/[moduleId]
  Body: { title, description }
  Returns: { module }
```

---

## 8. USER JOURNEYS

### Journey 1: Sign Up & Discover Communities
```
1. User lands on homepage (unauthenticated)
2. Clicks "Sign Up"
3. Enters email, name, password
4. Receives confirmation email
5. Verifies email → redirected to "Discover Communities"
6. Browses global communities by topic
7. Clicks community → sees modules + members
8. Clicks "Join" → added as member
9. Now appears in "My Communities" tab
10. Can start learning modules
```

### Journey 2: Organization Admin Curates Communities
```
1. Org admin logs in
2. Goes to "Curator Panel" (within org settings)
3. Creates new community: "Match High School Debate"
   - Scope: organization
   - Status: draft
4. Adds modules: "Argumentation 101", "Cross-examination"
5. Adds resources/materials to each module
6. Publishes community → status: active
7. Organization members can now join/discover
8. Can optionally promote to global sphere
   - Marks `featuredAt` timestamp
   - Appears in "Featured by Organizations" in global discovery
```

### Journey 3: Join Org Community
```
1. User logged in, browsing "My Communities"
2. Organization admin invites them to "Improv Asylum Level 3"
3. Community appears in "Available Communities" (org-scoped)
4. User clicks "Join"
5. If approval required: sends join request → curator approves
6. If open: joins immediately
7. Can now view modules and track progress
```

---

## 9. UI/UX STRUCTURE

### Main Navigation (Authenticated)
```
Top nav:
├── Logo/Home
├── Search Communities
├── My Communities (dropdown)
├── Discover (nav to global discovery)
├── My Classes (org-specific)
├── Profile (dropdown: settings, preferences, logout)
└── Notifications (join approvals, etc.)
```

### Pages

**1. Discover Communities**
- Filter sidebar: Topic, Difficulty, Organization
- Search bar
- Featured communities carousel
- Grid of community cards
- Each card: name, curator org, member count, "Join" button

**2. Community Detail**
- Hero: cover image, name, description, curator info
- Join/Joined button
- Tabs:
  - Modules (list of modules)
  - Members (member list, role indicators)
  - Resources (materials tagged to modules)
  - About (community description, rules)
- If curator: Admin button → edit community, approve joins, manage modules

**3. Module Detail**
- Module title, description, estimated time
- Learning objectives
- Resources (grouped by material type)
- Discussion/feedback (placeholder for later)
- Mark complete button

**4. My Communities**
- Cards of joined communities
- Progress bar per community
- "Leave" button
- Link to continue learning

**5. Curator Panel** (org admin only)
- Create community button
- List of communities they curate
- Status indicator (draft, pending, active)
- Edit, delete, view analytics buttons
- Manage members / approve joins

---

## 10. DATA ISOLATION & SECURITY

### Multi-tenant Rules
- **Org communities:** Only org members can see (unless `isPublic: true`)
- **Global communities:** Anyone can see
- **User preferences:** Visible only to self + curators managing their learning
- **Join approvals:** Only curator can see pending requests

### Authorization Matrix
```
┌─────────────────────┬─────────┬────────────┬─────────┐
│ Action              │ Learner │ Curator    │ SuperAdmin
├─────────────────────┼─────────┼────────────┼─────────┤
│ View global comm.   │ ✅      │ ✅         │ ✅
│ Join community      │ ✅      │ ✅         │ ✅
│ Create community    │ ❌      │ ✅         │ ✅
│ Edit community      │ ❌      │ ✅*        │ ✅
│ Delete community    │ ❌      │ ❌         │ ✅
│ Approve global      │ ❌      │ ❌         │ ✅
│ Approve joins       │ ❌      │ ✅*        │ ✅
└─────────────────────┴─────────┴────────────┴─────────┘
* = If approval required & curator
```

---

## 11. INTEGRATION WITH EXISTING SYSTEMS

### Keeps Working As-Is
- Organization structure (SuperAdmin, OrgAdmin, Teachers, Students)
- Class management (improv, K-12)
- Standards & objectives
- Ratings & feedback
- Admin dashboard

### Changes
- User login page (replaces role selector button)
- Student dashboard gets "Discover Communities" tab
- Teacher dashboard can create org communities
- "My Classes" becomes org-scoped alongside "My Communities"

### Data Flow
```
User → Auth (session/JWT) → Org Role check → 
├── If in org: show classes + org communities
└── Show global communities + joined communities
```

---

## 12. IMPLEMENTATION ROADMAP (4 Days)

### Day 1: Auth & Schema
- [ ] Add User auth fields (password, emailVerified)
- [ ] Create auth API endpoints (signup, login, logout, me)
- [ ] Update LearningCommunity schema (scope, status, curator)
- [ ] Create CommunityJoinRequest model
- [ ] Update StudentPreference (org-optional)
- [ ] Database migration

### Day 2: Community CRUD & Discovery
- [ ] Implement community CRUD endpoints
- [ ] Create discovery endpoint (filtering, search, pagination)
- [ ] Build join/leave mechanics
- [ ] Create join request approval flow
- [ ] Update existing communities to have scope/status

### Day 3: UI & Discovery Interface
- [ ] Build auth pages (signup, login)
- [ ] Build "Discover Communities" page
- [ ] Build community detail page
- [ ] Build "My Communities" page
- [ ] Integrate into main navigation
- [ ] Add curator panel (create/edit communities)

### Day 4: Integration & Testing
- [ ] Connect signup to community discovery flow
- [ ] Test end-to-end: signup → discover → join → view modules
- [ ] Test org communities (private vs public)
- [ ] Test curator approval workflow
- [ ] Bug fixes & polish
- [ ] Prepare for June 25 demo

---

## 13. DEFER TO LATER

### Payment & Subscriptions
- Pricing model (free vs premium communities)
- Stripe integration
- Access control by tier
- Refund/cancellation flow

### Moderation Tools
- Content flagging system
- Automated safety checks
- Moderator queue
- Ban/suspension workflows

### Analytics
- Community growth metrics
- Member engagement tracking
- Module completion rates
- Certification tracking

### Advanced Features
- Community recommendations (ML-based)
- Discussion forums (threaded discussions)
- Live sessions/video conferencing
- Badges & gamification
- Progress tracking UI

---

## 14. SUCCESS METRICS (June 25 Demo)

✅ Users can sign up and log in  
✅ Discover global communities by topic  
✅ Join communities (open or approval-required)  
✅ View modules within communities  
✅ Organizations can create communities  
✅ Global community approval workflow  
✅ Data isolation working (orgs see their communities)  
✅ Curator can manage communities  
✅ Integration with existing class system  
✅ Clean, intuitive UI for discovery & joining

---

## 15. TECH STACK DECISIONS ✅ LOCKED

- **Auth:** NextAuth.js (production-ready, OAuth-ready, contributor-friendly)
- **Email verification:** Resend (simple API, beautiful templates, free tier sufficient)
- **Database:** Keep Prisma + Supabase (no changes)
- **Frontend:** React components (existing system)
- **UI:** Keep using existing color system & design
- **Search:** Start with SQL LIKE (upgrade to full-text search later)

## 16. ORG COMMUNITY VISIBILITY ✅ LOCKED

**Decision: Show ALL public org communities in global discovery**

Rationale:
- Supports the vision: "organizations promote their communities to global sphere"
- Creates network effects and incentivizes quality
- Simple MVP (no complex filtering yet)
- Future: Add credibility signals (verified orgs, member count, completion rates)

All org communities with `isPublic: true` appear in global discovery alongside global communities.
Org communities with `isPublic: false` only visible to org members.

---

## END OF ARCHITECTURE DOCUMENT

**Next Step:** User approval on this architecture → Begin Day 1 build (Auth & Schema)

**Questions to address before starting:**
1. Which auth library? (NextAuth.js, custom JWT, or other?)
2. Email verification service? (Resend, SendGrid, test with console for now?)
3. Should we hide org communities from global discovery by default, or show them?
4. Curator role: created by SuperAdmin only, or can OrgAdmins designate curators?

