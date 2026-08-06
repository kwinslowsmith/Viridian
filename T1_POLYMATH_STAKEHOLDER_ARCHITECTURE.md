# T1 Research: Polymath Multi-Stakeholder Content Architecture

**Status:** Complete  
**Date:** 2026-08-04

---

## 1. Multi-Stakeholder Posting Requirements

Polymath must support content creation by **4 primary stakeholder types:**

1. **Organizations** (Schools, nonprofits, companies)
   - Post on behalf of the org with org branding
   - Require approval workflows (org owner/admin must approve)
   - Content reflects org credibility/expertise
   - Org profile/bio displays as author

2. **Communities** (Groups within Viridian platform)
   - Post collections/modules curated by community
   - Community moderators control visibility
   - Content tagged with community origin
   - Drives community engagement & expertise

3. **Individuals** (Teachers, educators, learners)
   - Post personal articles/resources
   - Credibility based on credentials/bio
   - Can post independently or as community member
   - Personal brand/reputation matters

4. **Events** (Workshops, conferences, seminars)
   - Post event-specific resources/outcomes
   - Linked to event date/location/participants
   - Content related to event theme
   - Event organizer controls visibility

---

## 2. Proposed Data Model Architecture

### Content Ownership Layer
```
Article/Module/Collection:
  - id
  - title, description, content
  - createdAt, updatedAt
  
  # Ownership (ONE OF these is set):
  authorType: enum['individual', 'organization', 'community', 'event']
  authorId: string (userId | orgId | communityId | eventId)
  
  # For individuals: track credibility/expertise
  authorProfile?: {
    credentials: string,
    bio: string,
    profileUrl: string
  }
  
  # For organizations: track org info
  organizationId?: string
  organizationProfile?: {
    name: string,
    logo: string,
    verified: boolean
  }
  
  # For communities: track community context
  communityId?: string
  
  # For events: track event context
  eventId?: string
  eventDate?: datetime
  
  # Permissions & Visibility
  status: enum['draft', 'pending_approval', 'published', 'archived']
  visibility: enum['private', 'org_only', 'community', 'public']
  requiresApproval: boolean
  approvalChain?: [userId] # Org admins who must approve
  
  # Credibility/Tiering (for Magazine concept)
  tier: enum['introduction', 'intermediate', 'expert']
  credibilityScore: number # Reputation/expertise indicator
```

### Permission Model (RBAC)

**Organization-level roles:**
- `org_owner` → Can create/publish/approve all content as org
- `org_admin` → Can create/publish/approve org content
- `org_editor` → Can create org content (needs approval)
- `org_viewer` → Can only view published org content

**Community-level roles:**
- `community_moderator` → Can create/publish community content + approve submissions
- `community_member` → Can submit content to community (needs moderator approval)
- `community_viewer` → Can only view published community content

**Event-level roles:**
- `event_organizer` → Can create/publish event-specific content
- `event_speaker` → Can post content related to event they speak at
- `event_attendee` → Can submit content (needs organizer approval)

**Individual:**
- Personal articles/resources: No approval needed (publish directly)
- Credibility based on credentials in profile

---

## 3. Key Differences by Stakeholder Type

| Aspect | Individual | Organization | Community | Event |
|--------|-----------|--------------|-----------|-------|
| **Creation** | Self | Org admin/owner | Moderator/members | Organizer |
| **Approval** | None (auto-publish) | Org admin approval | Moderator review | Organizer review |
| **Branding** | Personal bio + profile pic | Org logo + name | Community badge | Event logo + date |
| **Visibility** | Public by default | Org-private default | Community access | Event attendees + public |
| **Credibility** | Personal credentials/bio | Org verification | Community endorsement | Event association |
| **Magazine Tier** | Any tier (individual expert) | Any tier (org experts) | Community-curated tier | Event-specific tier |
| **Edit Rights** | Author only | Org admins can edit | Moderators can edit | Organizers can edit |

---

## 4. Proposed Posting Flows

### Individual Posting Flow
1. User clicks "Share Article/Module"
2. Form pre-filled with user's profile info
3. Select tier (Introduction/Intermediate/Expert based on credentials)
4. Write content
5. Publish → Immediate public availability
6. Can edit/delete anytime

### Organization Posting Flow
1. Org admin clicks "Post Organization Content"
2. Form shows org branding (logo, name, verified badge)
3. Can select approvers from org team
4. Write content
5. Send for approval → Selected admins review
6. After approval → Publish with org attribution
7. Only org admins can edit/delete

### Community Posting Flow
1. Community member submits content
2. Form tagged with community name/badge
3. Content enters "pending_approval" status
4. Moderators review in approval queue
5. Moderator can: publish, request changes, reject
6. Once published: tagged as "Community Resource"
7. Can be re-edited by mods or original author (with mod approval)

### Event Posting Flow
1. Event organizer/speaker creates event resource
2. Form linked to specific event (date, location, attendee list)
3. Can set visibility: "Attendees Only" or "Public"
4. Optional: Collect feedback from attendees
5. Publish with event attribution
6. Post-event: Stays available with event archive

---

## 5. Credibility & Trust Model

### Individual Credibility
- Profile credentials (degree, title, years experience)
- Contribution history (# of articles published)
- Community endorsements (likes, positive feedback)
- Credential badges (verified educator, published author)

### Organization Credibility
- Org verification status (blue checkmark)
- Org age & history
- Content quality metrics
- External validation (partnerships, accreditations)

### Community Credibility
- Moderator approval signals quality
- Community size & engagement
- Curated badge (hand-picked by mods)

### Event Credibility
- Event organizer reputation
- Event attendance numbers
- Speaker expertise
- Post-event feedback/ratings

---

## 6. Technical Considerations

### Database Queries
- Must efficiently filter content by authorType/authorId
- Need indexes on (authorType, authorId, status, visibility)
- Approval queue queries: WHERE status='pending_approval' AND approvalChain contains $userId

### API Design
- `/polymath/articles?authorType=organization&authorId=$orgId` → Get org articles
- `/polymath/articles?authorType=individual&tier=expert` → Get expert articles by individuals
- `/polymath/articles/pending-approval` → Approval queue for org admins
- `PATCH /polymath/articles/{id}` → Edit (permission checks by authorType & user role)

### Access Control Checks
- **Create:** User must have role in target org/community/event
- **Read:** Check visibility + user's org membership
- **Update:** User must be author OR have org_admin role in author org
- **Delete:** Author OR org admin OR moderator

---

## 7. Migration Path for Phases 1-4

**Phase 1 (Magazine):**
- Individual & Org articles with tier system
- Simple approval for orgs, none for individuals

**Phase 2 (Collections):**
- Collections curated by all 4 stakeholder types
- Different visibility models per collection

**Phase 3 (Modules):**
- Structured modules authored by orgs/communities
- Module templates for individuals to remix

**Phase 4 (Community/Teachers):**
- Teacher communities with shared modules
- Co-authorship model for collaborative building

---

## Sources

- [Multi-Tenant Knowledge Base Architecture (Docsie)](https://www.docsie.io/blog/articles/multi-tenant-knowledge-base-2026/)
- [Building Multi-Tenant SaaS (Logto)](https://logto.medium.com/build-a-multi-tenant-saas-application-a-complete-guide-from-design-to-implementation-d109d041f253)
- [Multi-Tenant SaaS Design (Clerk)](https://clerk.com/blog/how-to-design-multitenant-saas-architecture)
- [RBAC in SaaS Applications (Stytch)](https://stytch.com/blog/what-is-rbac/)
- [Role-Based Access Control Guide (Auth0)](https://auth0.com/docs/manage-users/access-control/rbac)
- [Stakeholder Identification Guide (Asana)](https://asana.com/resources/stakeholder-vs-shareholder)
- [Content Ownership Framework (C2 Group)](https://www.c2experience.com/blog/assigning-ownership-by-content-type-a-practical-framework)
