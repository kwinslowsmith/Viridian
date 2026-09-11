# T1 Polymath Backend - API Contract & Specification
**Version**: 1.0  
**Status**: ✅ Week 1 Complete  
**Last Updated**: 2026-09-11  
**Base URL**: `https://viridian.vercel.app/api` (production) | `http://localhost:3000/api` (local)

---

## Authentication

All endpoints require `Authorization: Bearer <token>` except public community listing.

**How to get token:**
1. Log in via NextAuth at `/api/auth/signin`
2. Token stored in session cookie (automatic with `getServerSession`)
3. For API calls, include session header or use environment variable

**Auth Headers:**
```bash
# Method 1: Session cookie (automatic in browser)
fetch('/api/communities')

# Method 2: Authorization header (if using direct API)
fetch('/api/communities', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## 1. Communities: List & Browse

### GET /api/communities
**Public endpoint** - No auth required

**Query Parameters:**
| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | number | 20 | 100 | Results per page |
| `offset` | number | 0 | - | Pagination offset |
| `scope` | string | all | - | Filter: "global", "organization", "all" |
| `topic` | string | - | - | Filter by topic (e.g., "ELA", "Math") |
| `search` | string | - | - | Search by name or description |
| `organizationId` | string | - | - | Filter by organization |

**Response: 200 OK**
```json
{
  "communities": [
    {
      "id": "clx1a2b3c4d5e6f7g8h9i0j",
      "name": "Boston Directors of Curriculum",
      "slug": "boston-directors",
      "description": "Directors of Curriculum collaborating on equitable curricula",
      "coverImage": "https://...",
      "topic": "ELA",
      "scope": "global",
      "isPublic": true,
      "requiresApprovalToJoin": false,
      "curator": {
        "id": "user123",
        "name": "Jane Doe",
        "email": "jane@boston.edu"
      },
      "organization": null,
      "_count": {
        "members": 42,
        "modules": 8
      },
      "createdAt": "2026-01-15T08:00:00Z",
      "updatedAt": "2026-09-11T14:00:00Z"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 400 | Invalid limit or offset | limit > 100 or negative offset |
| 500 | Failed to fetch communities | Database error |

**Example Curl:**
```bash
curl "http://localhost:3000/api/communities?limit=10&offset=0&search=curriculum"
```

---

### GET /api/communities/[slug]
**Public endpoint** - No auth required

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Community slug (e.g., "boston-directors") |

**Response: 200 OK**
```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j",
  "name": "Boston Directors of Curriculum",
  "slug": "boston-directors",
  "description": "Directors collaborating on equitable curricula",
  "coverImage": "https://...",
  "topic": "ELA",
  "scope": "global",
  "isPublic": true,
  "requiresApprovalToJoin": false,
  "curatorId": "user123",
  "curator": {
    "id": "user123",
    "name": "Jane Doe",
    "email": "jane@boston.edu"
  },
  "organization": {
    "id": "org123",
    "name": "Boston Public Schools",
    "slug": "boston-ps"
  },
  "_count": {
    "members": 42,
    "modules": 8,
    "discussions": 18,
    "meetings": 5
  },
  "createdAt": "2026-01-15T08:00:00Z",
  "updatedAt": "2026-09-11T14:00:00Z"
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 404 | Community not found | Invalid slug |
| 500 | Failed to fetch community | Database error |

**Example Curl:**
```bash
curl "http://localhost:3000/api/communities/boston-directors"
```

---

### POST /api/communities
**Authenticated endpoint** - Requires login

**Request Body:**
```json
{
  "name": "New Learning Community",
  "description": "Collaborative space for educators",
  "coverImage": "https://...",
  "scope": "global",
  "organizationId": null,
  "topic": "ELA",
  "difficulty": "intermediate",
  "estimatedHours": 20,
  "isPublic": true,
  "requiresApprovalToJoin": false
}
```

**Response: 201 Created**
```json
{
  "id": "clx_new_id_abc123",
  "name": "New Learning Community",
  "slug": "new-learning-community",
  "description": "Collaborative space for educators",
  "coverImage": "https://...",
  "topic": "ELA",
  "scope": "global",
  "isPublic": true,
  "requiresApprovalToJoin": false,
  "curatorId": "current_user_id",
  "curator": {
    "id": "current_user_id",
    "name": "Current User",
    "email": "user@example.com"
  },
  "organization": null,
  "_count": {
    "members": 1,
    "modules": 0
  },
  "createdAt": "2026-09-11T14:30:00Z",
  "updatedAt": "2026-09-11T14:30:00Z"
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 400 | Name and scope are required | Missing required field |
| 400 | Invalid scope | scope not "global" or "organization" |
| 400 | organizationId required for organization-scoped communities | scope=organization but no org ID |
| 401 | Unauthorized | Not logged in |
| 403 | You do not have permission | Not admin/curator for org |
| 500 | Failed to create community | Database error |

**Example Curl:**
```bash
curl -X POST "http://localhost:3000/api/communities" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Learning Community",
    "description": "Test community",
    "scope": "global",
    "topic": "ELA"
  }'
```

---

## 2. Discussions: Create & Browse

### GET /api/communities/[slug]/discussions
**Authenticated endpoint** - Requires community membership

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Community slug |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Results per page (1-100) |
| `offset` | number | 0 | Pagination offset |
| `sort` | string | recent | "recent", "oldest", "pinned" |

**Response: 200 OK**
```json
{
  "discussions": [
    {
      "id": "conv123",
      "title": "How do we decolonize the curriculum?",
      "type": "community",
      "isPinned": true,
      "createdBy": {
        "id": "user456",
        "name": "Alex K.",
        "email": "alex@school.edu"
      },
      "_count": {
        "messages": 12,
        "participants": 8
      },
      "messages": [
        {
          "createdAt": "2026-09-10T14:00:00Z",
          "content": "Great question! Here's my perspective...",
          "sender": {
            "name": "Alex K."
          }
        }
      ],
      "createdAt": "2026-09-08T09:00:00Z",
      "updatedAt": "2026-09-10T14:00:00Z"
    }
  ],
  "total": 18,
  "limit": 20,
  "offset": 0,
  "hasMore": false
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 401 | Unauthorized | Not logged in |
| 403 | You don't have access | Not community member |
| 404 | Community not found | Invalid slug |
| 500 | Failed to fetch discussions | Database error |

**Example Curl:**
```bash
curl -H "Cookie: sessionToken=..." \
  "http://localhost:3000/api/communities/boston-directors/discussions?sort=pinned"
```

---

### POST /api/communities/[slug]/discussions
**Authenticated endpoint** - Requires community membership

**Request Body:**
```json
{
  "title": "How should we teach critical reading?",
  "content": "Optional initial message to start the discussion"
}
```

**Response: 201 Created**
```json
{
  "id": "conv_new_id",
  "title": "How should we teach critical reading?",
  "type": "community",
  "isPinned": false,
  "createdBy": {
    "id": "current_user_id",
    "name": "Current User",
    "email": "user@example.com"
  },
  "_count": {
    "messages": 1,
    "participants": 1
  },
  "createdAt": "2026-09-11T14:30:00Z",
  "updatedAt": "2026-09-11T14:30:00Z"
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 400 | Title is required | Missing title |
| 401 | Unauthorized | Not logged in |
| 403 | You don't have access | Not community member |
| 404 | Community not found | Invalid slug |
| 500 | Failed to create discussion | Database error |

---

## 3. Discussion Messages: Thread Conversation

### GET /api/communities/[slug]/discussions/[discussionId]/messages
**Authenticated endpoint** - Requires community membership

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Community slug |
| `discussionId` | string | Discussion ID |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Results per page (1-200) |
| `offset` | number | 0 | Pagination offset |

**Response: 200 OK**
```json
{
  "messages": [
    {
      "id": "msg123",
      "content": "Here's my approach to teaching critical reading...",
      "googleDocUrl": "https://docs.google.com/...",
      "sender": {
        "id": "user456",
        "name": "Alex K.",
        "email": "alex@school.edu"
      },
      "createdAt": "2026-09-08T10:00:00Z",
      "updatedAt": "2026-09-08T10:00:00Z"
    }
  ],
  "total": 12,
  "limit": 50,
  "offset": 0,
  "hasMore": false
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 401 | Unauthorized | Not logged in |
| 403 | You don't have access | Not community member |
| 404 | Discussion not found | Invalid discussionId |
| 500 | Failed to fetch messages | Database error |

---

### POST /api/communities/[slug]/discussions/[discussionId]/messages
**Authenticated endpoint** - Requires community membership

**Request Body:**
```json
{
  "content": "I completely agree! Here's what we've done at our school...",
  "googleDocUrl": "https://docs.google.com/document/d/..." // optional
}
```

**Response: 201 Created**
```json
{
  "id": "msg_new_id",
  "content": "I completely agree! Here's what we've done at our school...",
  "googleDocUrl": "https://docs.google.com/document/d/...",
  "sender": {
    "id": "current_user_id",
    "name": "Current User",
    "email": "user@example.com"
  },
  "conversationId": "conv123",
  "createdAt": "2026-09-11T15:00:00Z",
  "updatedAt": "2026-09-11T15:00:00Z"
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 400 | Content is required | Missing message content |
| 401 | Unauthorized | Not logged in |
| 403 | You don't have access | Not community member |
| 404 | Discussion not found | Invalid discussionId |
| 500 | Failed to create message | Database error |

---

## 4. Meetings: Schedule & Attend

### GET /api/communities/[slug]/meetings
**Authenticated endpoint** - Requires community membership

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Community slug |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Results per page (1-100) |
| `offset` | number | 0 | Pagination offset |
| `sort` | string | upcoming | "upcoming" (future), "past" (completed) |

**Response: 200 OK**
```json
{
  "meetings": [
    {
      "id": "meet123",
      "communityId": "comm123",
      "title": "October Curriculum Review",
      "description": "Quarterly planning session for next semester",
      "scheduledAt": "2026-10-15T18:00:00Z",
      "zoomUrl": "https://zoom.us/j/...",
      "location": "Boston Public Library",
      "host": {
        "id": "user123",
        "name": "Jane Doe",
        "email": "jane@boston.edu"
      },
      "notes": null,
      "recordingUrl": null,
      "createdAt": "2026-09-11T14:00:00Z",
      "updatedAt": "2026-09-11T14:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0,
  "hasMore": false
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 401 | Unauthorized | Not logged in |
| 403 | You don't have access | Not community member |
| 404 | Community not found | Invalid slug |
| 500 | Failed to fetch meetings | Database error |

---

### POST /api/communities/[slug]/meetings
**Authenticated endpoint** - Curator only

**Request Body:**
```json
{
  "title": "November Curriculum Planning",
  "description": "Planning for Q4 standards alignment",
  "scheduledAt": "2026-11-05T18:00:00Z",
  "zoomUrl": "https://zoom.us/j/...",
  "location": "Optional: Virtual or Boston Public Library"
}
```

**Response: 201 Created**
```json
{
  "id": "meet_new_id",
  "communityId": "comm123",
  "title": "November Curriculum Planning",
  "description": "Planning for Q4 standards alignment",
  "scheduledAt": "2026-11-05T18:00:00Z",
  "zoomUrl": "https://zoom.us/j/...",
  "location": "Virtual or Boston Public Library",
  "host": {
    "id": "current_user_id",
    "name": "Current User",
    "email": "user@example.com"
  },
  "notes": null,
  "recordingUrl": null,
  "createdAt": "2026-09-11T15:30:00Z",
  "updatedAt": "2026-09-11T15:30:00Z"
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 400 | Title and scheduledAt are required | Missing required field |
| 401 | Unauthorized | Not logged in |
| 403 | Only the curator can schedule meetings | Not community curator |
| 404 | Community not found | Invalid slug |
| 500 | Failed to create meeting | Database error |

---

## 5. Curator Dashboard: Community Statistics

### GET /api/communities/[slug]/stats
**Authenticated endpoint** - Curator only

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `slug` | string | Community slug |

**Response: 200 OK**
```json
{
  "community": {
    "id": "comm123",
    "name": "Boston Directors of Curriculum",
    "slug": "boston-directors"
  },
  "stats": {
    "memberCount": 42,
    "discussionCount": 18,
    "messageCount": 234,
    "resourceCount": 56,
    "meetingCount": 8,
    "upcomingMeetingCount": 2
  },
  "engagement": {
    "thisMonthMessages": 45,
    "lastMonthMessages": 32,
    "growth": "40.6"
  },
  "recentMembers": [
    {
      "id": "member123",
      "user": {
        "id": "user789",
        "name": "New Member",
        "email": "new@school.edu"
      },
      "joinedAt": "2026-09-08T10:00:00Z"
    }
  ],
  "recentDiscussions": [
    {
      "id": "conv123",
      "title": "How do we decolonize the curriculum?",
      "createdBy": {
        "id": "user456",
        "name": "Alex K."
      },
      "_count": {
        "messages": 12
      },
      "lastMessageAt": "2026-09-10T14:00:00Z"
    }
  ],
  "topContributors": [
    {
      "user": {
        "id": "user456",
        "name": "Alex K.",
        "email": "alex@school.edu"
      },
      "messageCount": 34
    }
  ]
}
```

**Errors:**
| Code | Message | Cause |
|------|---------|-------|
| 401 | Unauthorized | Not logged in |
| 403 | You do not have permission to view these stats | Not curator |
| 404 | Community not found | Invalid slug |
| 500 | Failed to fetch curator stats | Database error |

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- **200 OK** - Successful GET/PATCH request
- **201 Created** - Successful POST request (resource created)
- **204 No Content** - Successful DELETE request
- **400 Bad Request** - Missing/invalid parameters
- **401 Unauthorized** - Not logged in
- **403 Forbidden** - Logged in but not authorized for this action
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Database or server error

---

## Rate Limiting

No rate limiting currently implemented. If performance becomes an issue, will add:
- 100 requests/minute per authenticated user
- 10 requests/minute per IP for public endpoints

---

## Pagination Limits

- **max limit**: 100 (some endpoints specify lower max)
- **default limit**: 20-50 depending on endpoint
- **offset**: starts at 0
- **hasMore**: boolean indicating more results available

---

## Timestamps

All timestamps in ISO 8601 format with UTC timezone:
```
2026-09-11T14:30:00Z
```

Convert to local time in frontend using JavaScript Date:
```javascript
new Date("2026-09-11T14:30:00Z").toLocaleDateString()
```

---

## TypeScript Types

For frontend integration, use these types:

```typescript
// Community
type Community = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  topic?: string;
  scope: "global" | "organization";
  isPublic: boolean;
  requiresApprovalToJoin: boolean;
  curatorId: string;
  curator: { id: string; name: string; email: string };
  organization?: { id: string; name: string; slug: string };
  _count: { members: number; modules: number };
  createdAt: string;
  updatedAt: string;
};

// Discussion
type Discussion = {
  id: string;
  title: string;
  type: "community" | "direct" | "class";
  isPinned: boolean;
  createdBy: { id: string; name: string; email: string };
  _count: { messages: number; participants: number };
  createdAt: string;
  updatedAt: string;
};

// Message
type Message = {
  id: string;
  content: string;
  googleDocUrl?: string;
  sender: { id: string; name: string; email: string };
  conversationId: string;
  createdAt: string;
  updatedAt: string;
};

// Meeting
type Meeting = {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  zoomUrl?: string;
  location?: string;
  host: { id: string; name: string; email: string };
  notes?: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## Testing Checklist

Before deploying, verify:

- [ ] GET /api/communities returns public communities
- [ ] POST /api/communities creates with current user as curator
- [ ] GET /api/communities/[slug] returns community details
- [ ] GET /api/communities/[slug]/discussions returns discussions
- [ ] POST creates discussion, can post messages
- [ ] GET /api/communities/[slug]/meetings returns meetings
- [ ] POST creates meeting (curator only)
- [ ] GET /api/communities/[slug]/stats returns stats (curator only)
- [ ] 401 returned when not authenticated
- [ ] 403 returned when not authorized (non-curator)
- [ ] 404 returned when community doesn't exist
- [ ] Pagination works (limit + offset)
- [ ] Sorting works (sort param)
- [ ] Search works (search param)
- [ ] Error messages are helpful and don't leak data

---

**Status**: ✅ API Contract Complete - Ready for T3 Integration Testing
