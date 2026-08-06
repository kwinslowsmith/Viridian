# Polymath Content Posting API Documentation

## Overview

The Polymath Content Posting API provides endpoints for creating, managing, and approving educational content (articles, modules, tools, and collections) across multiple author types and organizational contexts.

## Key Features

- **Multi-stakeholder authoring**: Individual, organization, community, and event-based content creation
- **Approval workflows**: Automatic approval chain setup based on author type
- **Visibility control**: Public, organization, community, event, and private visibility levels
- **Role-based permissions**: Role checks for org admins, community curators, and event creators
- **Content filtering**: Query by author type, status, visibility, and scope
- **Approval queue**: Centralized view of all pending approvals

## Base URL

```
https://viridian.com/api/polymath
```

## Authentication

All endpoints require authentication via NextAuth. Include the session cookie with requests.

```
Cookie: next-auth.session-token=<token>
```

## Articles

### POST /api/polymath/articles

Create a new article.

**Request Body:**
```json
{
  "title": "String (required)",
  "content": "String/Markdown (required)",
  "abstract": "String (optional)",
  "topic": "String (optional)",
  "tags": "String (optional, comma-separated)",
  "coverImage": "URL (optional)",
  "authorType": "individual|organization|community|event (default: individual)",
  "authorId": "String (required) - userId|organizationId|communityId|eventId",
  "organizationId": "String (optional, required if authorType=organization)",
  "communityId": "String (optional, required if authorType=community)",
  "eventId": "String (optional, required if authorType=event)",
  "visibility": "public|organization|community|event|private (default: public)",
  "tier": "standard|premium (default: standard)"
}
```

**Authorization:**
- individual: User must post as themselves
- organization: User must be org SuperAdmin or SchoolAdmin
- community: User must be community curator or moderator
- event: User must be event creator

**Response:**
```json
{
  "id": "cuid",
  "title": "String",
  "content": "String",
  "abstract": "String|null",
  "topic": "String|null",
  "tags": "String|null",
  "coverImage": "String|null",
  "authorType": "String",
  "authorId": "String",
  "organizationId": "String|null",
  "communityId": "String|null",
  "eventId": "String|null",
  "visibility": "String",
  "status": "published|pending_approval",
  "requiresApproval": "Boolean",
  "approvalChain": [Array of user IDs],
  "publishedAt": "ISO DateTime|null",
  "createdAt": "ISO DateTime",
  "updatedAt": "ISO DateTime",
  "author": { "id", "name", "email" },
  "organization": { "id", "name" },
  "community": { "id", "name" }
}
```

### GET /api/polymath/articles

Fetch articles with filtering and pagination.

**Query Parameters:**
```
limit: number (default: 20)
offset: number (default: 0)
authorType: "individual|organization|community|event"
status: "draft|pending_approval|published|archived"
visibility: "public|organization|community|event|private"
communityId: string
organizationId: string
```

**Response:**
```json
{
  "articles": [{ article objects }],
  "count": number
}
```

### PUT /api/polymath/articles/:id

Update an article (draft or pending_approval only).

**Authorization:** User must be article creator or org admin

**Request Body:**
```json
{
  "title": "String (optional)",
  "content": "String (optional)",
  "abstract": "String (optional)",
  "topic": "String (optional)",
  "tags": "String (optional)",
  "coverImage": "String (optional)",
  "visibility": "String (optional)"
}
```

**Response:** Updated article object

### PATCH /api/polymath/articles/:id/approve

Approve an article in the approval chain.

**Authorization:** User must be in the article's approval chain

**Response:**
```json
{
  "article": { article object },
  "approvalChain": [remaining approver IDs],
  "approvalProgress": {
    "approved": number,
    "total": number,
    "remaining": number
  }
}
```

When all approvers have approved, `status` changes from `pending_approval` to `published`.

### PATCH /api/polymath/articles/:id/reject

Reject an article in the approval process.

**Authorization:** User must be in approval chain OR article creator

**Request Body:**
```json
{
  "feedback": "String (optional)"
}
```

**Response:**
```json
{
  "article": { article object with status: "rejected" },
  "rejectionFeedback": "String|null",
  "rejectedBy": "userId",
  "rejectedAt": "ISO DateTime"
}
```

## Modules

### POST /api/polymath/modules

Create a new module.

**Request Body:**
```json
{
  "title": "String (required)",
  "description": "String (optional)",
  "topic": "String (optional)",
  "tags": "String (optional)",
  "lessonsJson": [Array of {title, description, estimatedHours}] (required)",
  "estimatedHours": "Number (optional)",
  "difficulty": "beginner|intermediate|advanced (default: beginner)",
  "coverImage": "URL (optional)",
  "authorType": "individual|organization|community|event",
  "authorId": "String (required)",
  "organizationId": "String (optional)",
  "communityId": "String (optional)",
  "eventId": "String (optional)",
  "visibility": "public|organization|community|event|private (default: public)",
  "sequenceNum": "Number (default: 0)"
}
```

**Response:** Module object (similar to articles)

### GET /api/polymath/modules

Fetch modules with filtering and pagination.

**Query Parameters:** Same as articles endpoint

**Response:**
```json
{
  "modules": [{ module objects }],
  "count": number
}
```

### PATCH /api/polymath/modules/:id/approve

Approve a module in the approval chain.

**Authorization:** User must be in the module's approval chain

**Response:** Updated module with approval progress

### PATCH /api/polymath/modules/:id/reject

Reject a module.

**Authorization:** User must be in approval chain OR module creator

**Request Body:**
```json
{
  "feedback": "String (optional)"
}
```

## Tools

### POST /api/polymath/tools

Create a new tool.

**Request Body:**
```json
{
  "name": "String (required)",
  "description": "String (optional)",
  "toolType": "interactive|simulator|builder|analyzer|reader (required)",
  "toolUrl": "URL (optional)",
  "iframeUrl": "URL (optional)",
  "codeRepository": "URL (optional)",
  "thumbnail": "URL (optional)",
  "difficulty": "beginner|intermediate|advanced (optional)",
  "estimatedUsageTime": "Number in minutes (optional)",
  "languages": "String comma-separated (optional)",
  "accessibilityFeatures": "String comma-separated (optional)",
  "topic": "String (optional)",
  "tags": "String (optional)",
  "authorType": "individual|organization|community|event",
  "authorId": "String (required)",
  "organizationId": "String (optional)",
  "communityId": "String (optional)",
  "eventId": "String (optional)",
  "visibility": "public|organization|community|event|private (default: public)"
}
```

**Response:** Tool object

### GET /api/polymath/tools

Fetch tools with filtering.

**Query Parameters:**
```
limit: number (default: 20)
offset: number (default: 0)
authorType: string
status: string
visibility: string
communityId: string
organizationId: string
toolType: "interactive|simulator|builder|analyzer|reader"
```

**Response:**
```json
{
  "tools": [{ tool objects }],
  "count": number
}
```

### PATCH /api/polymath/tools/:id/approve

Approve a tool in the approval chain.

### PATCH /api/polymath/tools/:id/reject

Reject a tool.

## Collections

### POST /api/polymath/collections

Create a new resource collection.

**Request Body:**
```json
{
  "name": "String (required)",
  "description": "String (optional)",
  "topic": "String (optional)",
  "tags": "String (optional)",
  "resources": ["resourceId1", "resourceId2"] (optional array of resource IDs)",
  "coverImage": "URL (optional)",
  "authorType": "individual|organization|community|event",
  "authorId": "String (required)",
  "organizationId": "String (optional)",
  "communityId": "String (optional)",
  "eventId": "String (optional)",
  "visibility": "public|organization|community|event|private (default: public)"
}
```

**Response:** Collection object with linked resources

### GET /api/polymath/collections

Fetch collections with filtering.

**Query Parameters:** Same as articles endpoint

**Response:**
```json
{
  "collections": [{ collection objects }],
  "count": number
}
```

### PATCH /api/polymath/collections/:id/approve

Approve a collection in the approval chain.

### PATCH /api/polymath/collections/:id/reject

Reject a collection.

## Approval Queue

### GET /api/polymath/approval-queue

Fetch all pending approvals for an organization (or global).

**Query Parameters:**
```
organizationId: string (optional)
contentType: "articles|modules|tools|collections" (optional)
limit: number (default: 50)
offset: number (default: 0)
```

**Authorization:** User must be org SuperAdmin or SchoolAdmin

**Response:**
```json
{
  "articles": [{ article objects }],
  "modules": [{ module objects }],
  "tools": [{ tool objects }],
  "collections": [{ collection objects }]
}
```

If `contentType` is specified, returns a flat array:
```json
{
  "queue": [{ mixed content objects }],
  "count": number
}
```

## Status Lifecycle

**Individual Content:**
- draft (optional) → published

**Organization/Community/Event Content:**
- draft (optional) → pending_approval → published
- pending_approval → rejected (at any point)

**States:**
- `draft`: Unpublished content
- `pending_approval`: Waiting for approvers
- `published`: Live and visible to audience
- `rejected`: Rejected by approver, can be edited and resubmitted
- `archived`: Hidden from view

## Approval Chain Logic

1. When org/community/event content is created, all relevant admins/curators are added to the approval chain
2. Each approver must explicitly approve the content
3. When all approvers have approved, the content is automatically published
4. Approvers can reject content at any time with optional feedback
5. Creators can also reject their own pending content

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "details": "Additional context (in development)"
}
```

**Status Codes:**
- 201: Created
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

## Example Workflows

### Individual Article Creation
```bash
POST /api/polymath/articles
{
  "title": "How to Learn Improv",
  "content": "...",
  "authorType": "individual",
  "authorId": "user123",
  "visibility": "public"
}
# Response: status="published" immediately
```

### Organization Article Approval
```bash
# Create
POST /api/polymath/articles
{
  "title": "School Announcement",
  "content": "...",
  "authorType": "organization",
  "authorId": "org123",
  "organizationId": "org123"
}
# Response: status="pending_approval", approvalChain=[admin1, admin2]

# Approve as admin1
PATCH /api/polymath/articles/{id}/approve
# Response: approvalChain=[admin2], status="pending_approval"

# Approve as admin2
PATCH /api/polymath/articles/{id}/approve
# Response: approvalChain=[], status="published"
```

### Rejection Workflow
```bash
# Create
POST /api/polymath/articles { ... }
# Response: status="pending_approval"

# Reject with feedback
PATCH /api/polymath/articles/{id}/reject
{
  "feedback": "Please revise the tone of this article"
}
# Response: status="rejected"

# Creator edits
PUT /api/polymath/articles/{id}
{
  "content": "Revised content..."
}

# Creator resubmits (would need to change status/create new version)
```

## Implementation Notes

- **JSON parsing**: approvalChain is stored as JSON string, parsed in responses
- **Timezone**: All timestamps are ISO 8601 format in UTC
- **Pagination**: Use limit/offset for pagination (not cursor-based)
- **Concurrency**: Multiple approvers can approve simultaneously without conflicts
- **Cascade behavior**: Deleting organization/community/event cascades to content
- **Permission inheritance**: Org admin can edit any org content; creators always can edit draft/pending
