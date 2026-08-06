# Polymath Content API - Getting Started Guide

## What Was Built

A complete REST API for creating, managing, and approving educational content across 4 content types with multi-stakeholder authoring and approval workflows.

### 14 Endpoints Created

**Articles** (5 endpoints)
- POST /api/polymath/articles
- GET /api/polymath/articles
- PUT /api/polymath/articles/[id]
- PATCH /api/polymath/articles/[id]/approve
- PATCH /api/polymath/articles/[id]/reject

**Modules** (4 endpoints)
- POST /api/polymath/modules
- GET /api/polymath/modules
- PATCH /api/polymath/modules/[id]/approve
- PATCH /api/polymath/modules/[id]/reject

**Tools** (3 endpoints)
- POST /api/polymath/tools
- GET /api/polymath/tools
- PATCH /api/polymath/tools/[id]/approve
- PATCH /api/polymath/tools/[id]/reject

**Collections** (2 endpoints)
- POST /api/polymath/collections
- GET /api/polymath/collections
- PATCH /api/polymath/collections/[id]/approve
- PATCH /api/polymath/collections/[id]/reject

**Approval Queue** (1 endpoint)
- GET /api/polymath/approval-queue

---

## Quick Start

### 1. Verify Setup

All endpoints are ready to use. No additional setup needed.

```bash
# Navigate to project directory
cd /Users/kylewinslowsmith/Desktop/Viridian

# Start dev server
npm run dev

# Server should be running on http://localhost:3000
```

### 2. Make Your First Request

#### Individual Article (Auto-Published)

```bash
curl -X POST http://localhost:3000/api/polymath/articles \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "title": "How to Learn Improv",
    "content": "# Learning Improv\n\nStart with the basics...",
    "authorType": "individual",
    "authorId": "user_123",
    "visibility": "public"
  }'
```

Response:
```json
{
  "id": "article_abc123",
  "title": "How to Learn Improv",
  "status": "published",
  "visibility": "public",
  "publishedAt": "2026-08-04T14:30:00Z"
}
```

#### Organization Article (Requires Approval)

```bash
curl -X POST http://localhost:3000/api/polymath/articles \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "title": "School Announcement",
    "content": "We are launching...",
    "authorType": "organization",
    "authorId": "org_456",
    "organizationId": "org_456",
    "visibility": "organization"
  }'
```

Response:
```json
{
  "id": "article_def456",
  "title": "School Announcement",
  "status": "pending_approval",
  "approvalChain": ["admin_001", "admin_002"],
  "publishedAt": null
}
```

### 3. Approve Content

```bash
# Admin 1 approves
curl -X PATCH http://localhost:3000/api/polymath/articles/article_def456/approve \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt

# Response shows 1 of 2 approvals done
{
  "approvalProgress": {
    "approved": 1,
    "total": 2,
    "remaining": 1
  }
}

# Admin 2 approves (auto-publishes when complete)
curl -X PATCH http://localhost:3000/api/polymath/articles/article_def456/approve \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt

# Response shows article is now published
{
  "status": "published",
  "publishedAt": "2026-08-04T14:35:00Z"
}
```

---

## Documentation Files

Read these in order for comprehensive understanding:

### 1. POLYMATH_IMPLEMENTATION_SUMMARY.md
**Start here for architecture overview**
- Feature summary
- Workflow diagrams
- Database integration
- Testing strategy
- Performance considerations

### 2. POLYMATH_API_DOCS.md
**Complete API reference**
- All endpoints documented
- Request/response formats
- Error codes and meanings
- Authorization rules
- Status lifecycle

### 3. POLYMATH_API_EXAMPLES.md
**12 practical examples**
- Working cURL commands
- Real request/response samples
- Complete workflows
- Testing checklist
- Error examples

---

## Key Concepts

### Author Types

| Type | Who Can Post | Auto-Published? | Requires | Approval Chain |
|------|-------------|-----------------|----------|---|
| individual | The user themselves | Yes | User is authenticated | None |
| organization | Org SuperAdmin/SchoolAdmin | No | User has org role | All org admins |
| community | Community curator/moderator | No | User has curator role | Community curator |
| event | Event creator | No | User created event | Event creator |

### Visibility Levels

| Level | Who Sees It | Notes |
|-------|-----------|-------|
| public | Everyone | Default, searchable |
| organization | Org members only | Filtered by organizationId |
| community | Community members only | Filtered by communityId |
| event | Event participants | Filtered by eventId |
| private | Creator/approvers only | Not in feeds |

### Status Transitions

```
Individual Content:
  draft → published

Organization/Community/Event Content:
  draft → pending_approval → published
  OR
  pending_approval → rejected → (edit) → pending_approval

Archived:
  Any status → archived
```

---

## Common Workflows

### 1. Create and Publish Individual Content

```bash
# Create (auto-publishes)
POST /api/polymath/articles {
  "title": "...",
  "content": "...",
  "authorType": "individual",
  "authorId": "user_123"
}

# Immediately published and visible
# No approval needed
```

### 2. Create Organization Content with Approval

```bash
# Create
POST /api/polymath/articles {
  "title": "...",
  "content": "...",
  "authorType": "organization",
  "authorId": "org_123",
  "organizationId": "org_123"
}
# Status: pending_approval, approvalChain: [admin1, admin2]

# Admin 1 approves
PATCH /api/polymath/articles/{id}/approve
# Status still pending_approval, approvalChain: [admin2]

# Admin 2 approves
PATCH /api/polymath/articles/{id}/approve
# Status: published, approvalChain: [], publishedAt: now
```

### 3. Reject with Feedback and Edit

```bash
# Admin rejects with feedback
PATCH /api/polymath/articles/{id}/reject {
  "feedback": "Please update the dates"
}
# Status: rejected

# Creator edits
PUT /api/polymath/articles/{id} {
  "content": "Updated content with correct dates"
}
# Status: still rejected (until resubmitted)

# Resubmit (create new version or change status)
# Ideally show UI to "Resubmit" which resets status
```

### 4. Build a Resource Collection

```bash
# Create collection with linked resources
POST /api/polymath/collections {
  "name": "Essential Resources",
  "description": "...",
  "resources": ["resource_1", "resource_2", "resource_3"],
  "authorType": "individual",
  "authorId": "user_123"
}

# Get back collection with all resources populated
{
  "id": "collection_123",
  "name": "Essential Resources",
  "resources": [
    { "id": "resource_1", "title": "PDF Guide", "type": "material" },
    { "id": "resource_2", "title": "Video", "type": "material" },
    { "id": "resource_3", "title": "Tool", "type": "tool" }
  ],
  "status": "published"
}
```

### 5. View Approval Queue

```bash
# Organization admin views all pending approvals
GET /api/polymath/approval-queue?organizationId=org_123

# Response shows all pending articles, modules, tools, collections
{
  "articles": [{ 3 pending articles }],
  "modules": [{ 1 pending module }],
  "tools": [],
  "collections": []
}

# Filter by content type
GET /api/polymath/approval-queue?organizationId=org_123&contentType=articles

# Response shows only articles as flat array
{
  "queue": [{ pending articles }],
  "count": 3
}
```

---

## Testing the API

### Test 1: Individual Content Auto-Publishing

```bash
curl -X POST http://localhost:3000/api/polymath/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content","authorType":"individual","authorId":"user_test"}' | \
  jq '.status'
# Expected: "published"
```

### Test 2: Organization Content Approval Chain

```bash
# Create
curl -X POST http://localhost:3000/api/polymath/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Org Content",
    "content":"...",
    "authorType":"organization",
    "authorId":"org_test",
    "organizationId":"org_test"
  }' | jq '.approvalChain'
# Expected: Array of org admin IDs

# Check approval queue
curl "http://localhost:3000/api/polymath/approval-queue?organizationId=org_test" | \
  jq '.articles | length'
# Expected: 1
```

### Test 3: Permission Checks

```bash
# Try to post as org without admin role (should fail)
curl -X POST http://localhost:3000/api/polymath/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"...","content":"...","authorType":"organization","authorId":"org_test","organizationId":"org_test"}' | \
  jq '.error'
# Expected: "You do not have permission to post as this organization"
```

### Test 4: Approval Workflow

```bash
ARTICLE_ID="article_from_test_2"

# Approve as first admin
curl -X PATCH http://localhost:3000/api/polymath/articles/$ARTICLE_ID/approve | \
  jq '.approvalProgress.remaining'
# Expected: 1

# Approve as second admin
curl -X PATCH http://localhost:3000/api/polymath/articles/$ARTICLE_ID/approve | \
  jq '.status'
# Expected: "published"
```

---

## Error Scenarios

### Missing Required Fields
```json
{
  "error": "Missing required fields: title, content",
  "status": 400
}
```

### Permission Denied
```json
{
  "error": "You do not have permission to post as this organization",
  "status": 403
}
```

### Not Authenticated
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

### Content Not Found
```json
{
  "error": "Article not found",
  "status": 404
}
```

### Invalid Status Transition
```json
{
  "error": "Cannot edit articles with status \"published\"",
  "status": 400
}
```

---

## File Locations

### API Routes
```
/app/api/polymath/
├── articles/
├── modules/
├── tools/
├── collections/
└── approval-queue/
```

### Documentation
```
/POLYMATH_API_DOCS.md (Full spec)
/POLYMATH_API_EXAMPLES.md (12 examples)
/POLYMATH_IMPLEMENTATION_SUMMARY.md (Architecture)
/POLYMATH_API_GETTING_STARTED.md (This file)
```

---

## Next Steps

### For Frontend Integration
1. Read POLYMATH_API_DOCS.md for endpoint spec
2. Use POLYMATH_API_EXAMPLES.md for request patterns
3. Handle auth with NextAuth session
4. Parse JSON responses and show status to users

### For Testing
1. Follow testing checklist in POLYMATH_API_EXAMPLES.md
2. Test all auth scenarios
3. Test approval workflow with multiple users
4. Test visibility rules and filtering

### For Deployment
1. Ensure Prisma migrations are applied
2. Verify NextAuth is configured
3. Set up logging/monitoring
4. Configure rate limiting if needed
5. Test end-to-end approval workflow

### For Enhancements
- See POLYMATH_IMPLEMENTATION_SUMMARY.md "Future Enhancements" section
- Phase 2: Notifications, email alerts, scheduled publishing
- Phase 3: Comments, templates, full-text search
- Phase 4: Analytics, SLA tracking, multi-language

---

## Database Schema

All endpoints use existing Prisma models (no new tables needed):

**PolymathArticle**
- id, title, content, abstract, topic, tags
- authorType, authorId, organizationId, communityId, eventId
- visibility, status, requiresApproval, approvalChain
- publishedAt, createdAt, updatedAt

**PolymathModule**
- id, title, description, lessonsJson, estimatedHours, difficulty
- authorType, authorId, organizationId, communityId, eventId
- visibility, status, requiresApproval, approvalChain
- publishedAt, createdAt, updatedAt

**PolymathTool**
- id, name, description, toolType, toolUrl, iframeUrl
- authorType, authorId, organizationId, communityId, eventId
- visibility, status, requiresApproval, approvalChain
- publishedAt, createdAt, updatedAt

**PolymathResourceCollection**
- id, name, description, resources (junction table)
- authorType, authorId, organizationId, communityId, eventId
- visibility, status, requiresApproval, approvalChain
- publishedAt, createdAt, updatedAt

---

## Support Resources

- **Questions about endpoints?** → POLYMATH_API_DOCS.md
- **Need code examples?** → POLYMATH_API_EXAMPLES.md
- **Architecture questions?** → POLYMATH_IMPLEMENTATION_SUMMARY.md
- **Can't get started?** → This file (POLYMATH_API_GETTING_STARTED.md)

---

## Summary

The Polymath Content Posting API is now ready for:
- Creating educational content (articles, modules, tools, collections)
- Managing multi-stakeholder authoring (individual, org, community, event)
- Automated approval workflows with role-based permissions
- Filtering and searching published content
- Centralized approval queue for admins

All endpoints are implemented, documented, and ready for frontend integration and testing.
