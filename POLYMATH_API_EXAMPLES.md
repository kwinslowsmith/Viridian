# Polymath API - Usage Examples

## Setup

All examples assume:
- Base URL: `http://localhost:3000/api/polymath`
- User is authenticated with NextAuth session

## 1. Create Individual Article (Auto-Published)

**Request:**
```bash
curl -X POST http://localhost:3000/api/polymath/articles \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "title": "10 Tips for Better Improv",
    "content": "# Tips\n\n1. Listen first...",
    "abstract": "A quick guide to improve your improv skills",
    "topic": "improvisation",
    "tags": "improv,comedy,performance",
    "coverImage": "https://example.com/cover.jpg",
    "authorType": "individual",
    "authorId": "user_123abc",
    "visibility": "public"
  }'
```

**Response:**
```json
{
  "id": "article_456def",
  "title": "10 Tips for Better Improv",
  "content": "# Tips\n\n1. Listen first...",
  "abstract": "A quick guide to improve your improv skills",
  "topic": "improvisation",
  "tags": "improv,comedy,performance",
  "coverImage": "https://example.com/cover.jpg",
  "authorType": "individual",
  "authorId": "user_123abc",
  "organizationId": null,
  "communityId": null,
  "eventId": null,
  "visibility": "public",
  "status": "published",
  "requiresApproval": false,
  "approvalChain": [],
  "publishedAt": "2026-08-04T14:30:00Z",
  "createdAt": "2026-08-04T14:30:00Z",
  "updatedAt": "2026-08-04T14:30:00Z",
  "author": {
    "id": "user_123abc",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "organization": null,
  "community": null
}
```

---

## 2. Create Organization Article (Requires Approval)

**Request:**
```bash
curl -X POST http://localhost:3000/api/polymath/articles \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "title": "Summer Programs Announcement",
    "content": "This year we are launching...",
    "abstract": "Learn about our new summer offerings",
    "authorType": "organization",
    "authorId": "org_789xyz",
    "organizationId": "org_789xyz",
    "visibility": "organization"
  }'
```

**Response:**
```json
{
  "id": "article_abc123",
  "title": "Summer Programs Announcement",
  "content": "This year we are launching...",
  "abstract": "Learn about our new summer offerings",
  "authorType": "organization",
  "authorId": "org_789xyz",
  "organizationId": "org_789xyz",
  "visibility": "organization",
  "status": "pending_approval",
  "requiresApproval": true,
  "approvalChain": ["admin_001", "admin_002"],
  "publishedAt": null,
  "createdAt": "2026-08-04T14:30:00Z",
  "updatedAt": "2026-08-04T14:30:00Z",
  "organization": {
    "id": "org_789xyz",
    "name": "Match High School"
  }
}
```

---

## 3. Fetch Articles with Filters

**Request:**
```bash
curl "http://localhost:3000/api/polymath/articles?status=published&visibility=public&limit=10&offset=0" \
  -c cookies.txt \
  -b cookies.txt
```

**Response:**
```json
{
  "articles": [
    {
      "id": "article_456def",
      "title": "10 Tips for Better Improv",
      "status": "published",
      "visibility": "public",
      "publishedAt": "2026-08-04T14:30:00Z",
      "author": { "id": "user_123abc", "name": "Jane Smith", "email": "jane@example.com" }
    },
    {
      "id": "article_ghi789",
      "title": "Understanding Comedy Timing",
      "status": "published",
      "visibility": "public",
      "publishedAt": "2026-08-03T10:15:00Z",
      "author": { "id": "user_def456", "name": "Mike Johnson", "email": "mike@example.com" }
    }
  ],
  "count": 2
}
```

---

## 4. Approve Organization Article - Admin 1

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/polymath/articles/article_abc123/approve \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt
```

**Response:**
```json
{
  "id": "article_abc123",
  "title": "Summer Programs Announcement",
  "status": "pending_approval",
  "approvalChain": ["admin_002"],
  "approvalProgress": {
    "approved": 1,
    "total": 2,
    "remaining": 1
  },
  "publishedAt": null,
  "updatedAt": "2026-08-04T14:35:00Z"
}
```

---

## 5. Approve Article - Admin 2 (Auto-Publishes)

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/polymath/articles/article_abc123/approve \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt
```

**Response:**
```json
{
  "id": "article_abc123",
  "title": "Summer Programs Announcement",
  "status": "published",
  "approvalChain": [],
  "approvalProgress": {
    "approved": 2,
    "total": 2,
    "remaining": 0
  },
  "publishedAt": "2026-08-04T14:40:00Z",
  "updatedAt": "2026-08-04T14:40:00Z"
}
```

---

## 6. Reject Article with Feedback

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/polymath/articles/article_abc123/reject \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "feedback": "Please update the dates for the programs. Some are incorrect."
  }'
```

**Response:**
```json
{
  "id": "article_abc123",
  "title": "Summer Programs Announcement",
  "status": "rejected",
  "approvalChain": [],
  "rejectionFeedback": "Please update the dates for the programs. Some are incorrect.",
  "rejectedBy": "admin_001",
  "rejectedAt": "2026-08-04T14:45:00Z",
  "updatedAt": "2026-08-04T14:45:00Z"
}
```

---

## 7. Creator Edits Rejected Article

**Request:**
```bash
curl -X PUT http://localhost:3000/api/polymath/articles/article_abc123 \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "content": "This year we are launching with updated dates..."
  }'
```

**Response:**
```json
{
  "id": "article_abc123",
  "title": "Summer Programs Announcement",
  "content": "This year we are launching with updated dates...",
  "status": "rejected",
  "updatedAt": "2026-08-04T14:50:00Z"
}
```

---

## 8. Create Module with Lessons

**Request:**
```bash
curl -X POST http://localhost:3000/api/polymath/modules \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "title": "Introduction to Improv",
    "description": "Learn the fundamentals of improv comedy",
    "lessonsJson": [
      {
        "title": "Yes, And...",
        "description": "The foundational principle of improv",
        "estimatedHours": 2
      },
      {
        "title": "Character Work",
        "description": "Developing believable characters",
        "estimatedHours": 3
      }
    ],
    "estimatedHours": 5,
    "difficulty": "beginner",
    "topic": "improvisation",
    "authorType": "community",
    "authorId": "community_001",
    "communityId": "community_001",
    "visibility": "community"
  }'
```

**Response:**
```json
{
  "id": "module_xyz789",
  "title": "Introduction to Improv",
  "description": "Learn the fundamentals of improv comedy",
  "lessonsJson": [
    {
      "title": "Yes, And...",
      "description": "The foundational principle of improv",
      "estimatedHours": 2
    },
    {
      "title": "Character Work",
      "description": "Developing believable characters",
      "estimatedHours": 3
    }
  ],
  "estimatedHours": 5,
  "difficulty": "beginner",
  "status": "pending_approval",
  "requiresApproval": true,
  "approvalChain": ["curator_001"],
  "publishedAt": null,
  "createdAt": "2026-08-04T15:00:00Z",
  "community": {
    "id": "community_001",
    "name": "Learn Improv Hub"
  }
}
```

---

## 9. Create Tool

**Request:**
```bash
curl -X POST http://localhost:3000/api/polymath/tools \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "name": "Scene Builder Pro",
    "description": "Interactive tool for planning improv scenes",
    "toolType": "interactive",
    "iframeUrl": "https://tools.example.com/scene-builder",
    "difficulty": "intermediate",
    "estimatedUsageTime": 30,
    "languages": "en,es,fr",
    "accessibilityFeatures": "keyboard-nav,screen-reader,captions",
    "topic": "improvisation",
    "tags": "improv,interactive,education",
    "authorType": "individual",
    "authorId": "user_123abc",
    "visibility": "public"
  }'
```

**Response:**
```json
{
  "id": "tool_abc789",
  "name": "Scene Builder Pro",
  "description": "Interactive tool for planning improv scenes",
  "toolType": "interactive",
  "iframeUrl": "https://tools.example.com/scene-builder",
  "difficulty": "intermediate",
  "estimatedUsageTime": 30,
  "languages": "en,es,fr",
  "accessibilityFeatures": "keyboard-nav,screen-reader,captions",
  "status": "published",
  "visibility": "public",
  "approvalChain": [],
  "publishedAt": "2026-08-04T15:15:00Z",
  "createdAt": "2026-08-04T15:15:00Z",
  "author": {
    "id": "user_123abc",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

---

## 10. Create Resource Collection

**Request:**
```bash
curl -X POST http://localhost:3000/api/polymath/collections \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -b cookies.txt \
  -d '{
    "name": "Essential Improv Resources",
    "description": "Curated collection of improv learning materials",
    "topic": "improvisation",
    "tags": "improv,collection,learning",
    "resources": ["resource_001", "resource_002", "resource_003"],
    "authorType": "individual",
    "authorId": "user_123abc",
    "visibility": "public"
  }'
```

**Response:**
```json
{
  "id": "collection_def456",
  "name": "Essential Improv Resources",
  "description": "Curated collection of improv learning materials",
  "topic": "improvisation",
  "tags": "improv,collection,learning",
  "resources": [
    {
      "id": "resource_001",
      "title": "Improv Basics PDF",
      "type": "material",
      "format": "pdf"
    },
    {
      "id": "resource_002",
      "title": "Yes, And... Video",
      "type": "material",
      "format": "video"
    },
    {
      "id": "resource_003",
      "title": "Scene Builder Tool",
      "type": "tool",
      "format": "interactive"
    }
  ],
  "status": "published",
  "visibility": "public",
  "approvalChain": [],
  "publishedAt": "2026-08-04T15:30:00Z",
  "createdAt": "2026-08-04T15:30:00Z",
  "author": {
    "id": "user_123abc",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

---

## 11. Fetch Approval Queue

**Request:**
```bash
curl "http://localhost:3000/api/polymath/approval-queue?organizationId=org_789xyz" \
  -c cookies.txt \
  -b cookies.txt
```

**Response:**
```json
{
  "articles": [
    {
      "id": "article_abc123",
      "title": "Summer Programs Announcement",
      "status": "pending_approval",
      "approvalChain": ["admin_002"],
      "approvalProgress": {
        "pending": 1,
        "total": 0
      },
      "createdAt": "2026-08-04T14:30:00Z"
    }
  ],
  "modules": [
    {
      "id": "module_xyz789",
      "title": "Introduction to Improv",
      "status": "pending_approval",
      "approvalChain": ["curator_001"],
      "approvalProgress": {
        "pending": 1,
        "total": 0
      },
      "createdAt": "2026-08-04T15:00:00Z"
    }
  ],
  "tools": [],
  "collections": []
}
```

---

## 12. Fetch Specific Content Type from Queue

**Request:**
```bash
curl "http://localhost:3000/api/polymath/approval-queue?organizationId=org_789xyz&contentType=articles" \
  -c cookies.txt \
  -b cookies.txt
```

**Response:**
```json
{
  "queue": [
    {
      "id": "article_abc123",
      "title": "Summer Programs Announcement",
      "type": "article",
      "status": "pending_approval",
      "approvalChain": ["admin_002"]
    }
  ],
  "count": 1
}
```

---

## Error Examples

### 403 Forbidden - Insufficient Permissions
```json
{
  "error": "You do not have permission to post as this organization",
  "status": 403
}
```

### 400 Bad Request - Missing Fields
```json
{
  "error": "Missing required fields: title, content",
  "status": 400
}
```

### 404 Not Found
```json
{
  "error": "Article not found",
  "status": 404
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

---

## Testing Checklist

- [ ] Create individual article → auto-published
- [ ] Create org article → pending_approval with chain
- [ ] Fetch articles with filters
- [ ] Approve article as first admin
- [ ] Approve article as second admin → auto-published
- [ ] Reject article with feedback
- [ ] Edit rejected article
- [ ] Create module with lessons
- [ ] Create tool with iframe
- [ ] Create collection with resources
- [ ] Fetch approval queue by org
- [ ] Verify permission checks (403 errors)
- [ ] Test all content types (articles, modules, tools, collections)
- [ ] Test pagination (limit, offset)
