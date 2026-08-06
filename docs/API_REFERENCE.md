# Viridian API Reference

**Version**: 1.0  
**Last Updated**: August 6, 2026  
**Base URL**: `https://viridian.vercel.app` (production) or `http://localhost:3000` (local)

---

## Table of Contents

1. [Authentication](#authentication)
2. [K12 Standards Endpoints](#k12-standards-endpoints)
3. [Polymath Magazine Endpoints](#polymath-magazine-endpoints)
4. [Improv Mastery Tracker Endpoints](#improv-mastery-tracker-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

All endpoints except public Polymath content require authentication via NextAuth.

### Session Management
```bash
# Get current session
GET /api/auth/session

# Login
POST /auth/login

# Signup
POST /auth/signup

# Logout
POST /api/auth/signout
```

**Headers**:
```
Authorization: Bearer <session_token>
Content-Type: application/json
```

---

## K12 Standards Endpoints

### Get Standards for Class

```
GET /api/organizations/:slug/k12-classes/:classId/standards
```

**Parameters**:
- `slug` (path): Organization slug
- `classId` (path): K12 Class ID

**Response**:
```json
{
  "standards": [
    {
      "id": "std_123",
      "code": "CCSS.ELA-LITERACY.RL.9-10.1",
      "name": "Cite Textual Evidence",
      "type": "content",
      "objectives": [
        {
          "id": "obj_123",
          "label": "A",
          "text": "Identify explicit details from text"
        }
      ]
    }
  ]
}
```

---

### Get Standards by Unit

```
GET /api/k12-classes/:classId/standards-by-unit
```

**Response**:
```json
{
  "units": [
    {
      "unit": "1",
      "name": "Unit 1: Reading Foundations",
      "standards": [...]
    }
  ]
}
```

---

### Update Objective Mandatory Status

```
PATCH /api/standards/:standardId/objectives/:objectiveId
```

**Body**:
```json
{
  "isMandatory": true
}
```

**Response**:
```json
{
  "objective": {
    "id": "obj_123",
    "isMandatory": true,
    "label": "A",
    "text": "Identify explicit details from text"
  }
}
```

---

### Get Class Mastery Summary

```
GET /api/improv/classes/:classId/progress-summary
```

**Response**:
```json
{
  "classId": "class_123",
  "className": "American Lit, Period 3",
  "totalStudents": 28,
  "standards": [
    {
      "id": "std_123",
      "name": "Cite Textual Evidence",
      "masteredCount": 18,
      "nearMasteryCount": 7,
      "inProgressCount": 3,
      "masteryPercentage": 64.3
    }
  ],
  "classAverageMastery": 58.5
}
```

---

## Polymath Magazine Endpoints

### Get All Published Content (Public)

```
GET /api/polymath/magazine
```

**Query Parameters**:
- `topic` (optional): Filter by topic
- `type` (optional): Filter by content type (article | tool | module | collection)
- `limit` (optional, default 20): Items per page
- `offset` (optional, default 0): Pagination offset

**Response**:
```json
{
  "content": [
    {
      "id": "article_123",
      "type": "article",
      "title": "How to Analyze Literature",
      "abstract": "A guide to literary analysis...",
      "author": {
        "name": "Sarah Johnson",
        "tier": "expert",
        "verified": true
      },
      "publishedAt": "2026-08-04T12:00:00Z",
      "community": {
        "slug": "literary-analysis",
        "name": "Literary Analysis Community"
      }
    }
  ],
  "total": 45,
  "offset": 0,
  "limit": 20
}
```

---

### Create Article (Curator Only)

```
POST /api/communities/:slug/polymath/articles
```

**Body**:
```json
{
  "title": "How to Analyze Literature",
  "abstract": "A comprehensive guide...",
  "content": "# How to Analyze Literature\n\n## Introduction\n...",
  "topic": "education",
  "tags": "literature,analysis,writing",
  "status": "draft"
}
```

**Response**: `201 Created`
```json
{
  "id": "article_123",
  "communityId": "comm_123",
  "status": "draft",
  "createdAt": "2026-08-06T10:00:00Z"
}
```

---

### Publish Article

```
PATCH /api/communities/:slug/polymath/articles/:articleId
```

**Body**:
```json
{
  "status": "published"
}
```

---

### Get Article Detail

```
GET /api/polymath/magazine/articles/:articleId
```

**Response**:
```json
{
  "id": "article_123",
  "title": "How to Analyze Literature",
  "content": "# How to Analyze Literature\n...",
  "author": {...},
  "publishedAt": "2026-08-04T12:00:00Z",
  "relatedContent": [...]
}
```

---

## Improv Mastery Tracker Endpoints

### Get Class Skills

```
GET /api/improv/classes/:classId/skills
```

**Response**:
```json
{
  "skills": [
    {
      "id": "skill_123",
      "name": "Yes And",
      "description": "Agreement and building...",
      "category": "foundation",
      "objectives": [
        {
          "id": "obj_123",
          "text": "Respond with 'Yes And' in scene",
          "isMandatory": true
        }
      ]
    }
  ]
}
```

---

### Submit Skill Assessment

```
POST /api/improv/classes/:classId/assessments
```

**Body**:
```json
{
  "studentId": "user_123",
  "skillId": "skill_123",
  "level": 3,
  "feedback": "Excellent engagement in this scene"
}
```

**Response**: `201 Created`

---

### Get Student Progress

```
GET /api/improv/classes/:classId/students/:studentId/progress
```

**Response**:
```json
{
  "studentId": "user_123",
  "classId": "class_123",
  "skills": [
    {
      "skillId": "skill_123",
      "name": "Yes And",
      "currentLevel": 3,
      "targetLevel": 4,
      "progress": 75
    }
  ]
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error message here",
  "status": 400,
  "timestamp": "2026-08-06T10:00:00Z"
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Example Error

```bash
curl -X GET http://localhost:3000/api/standards/invalid

{
  "error": "Standard not found",
  "status": 404
}
```

---

## Rate Limiting

Current limits (may change):
- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **File uploads**: 10 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1691138460
```

---

## Best Practices

### 1. Pagination
Always use pagination for list endpoints:
```bash
GET /api/polymath/magazine?limit=20&offset=0
```

### 2. Filtering
Use specific query parameters to reduce payload:
```bash
GET /api/polymath/magazine?topic=education&type=article
```

### 3. Error Handling
Always check HTTP status code before processing response:
```javascript
const res = await fetch('/api/standards/123');
if (!res.ok) {
  const error = await res.json();
  console.error(error.error);
}
```

### 4. Caching
Cache public Polymath content (5-minute TTL):
```javascript
const cache = new Map();
const getCachedContent = async () => {
  if (cache.has('polymath')) {
    return cache.get('polymath');
  }
  const res = await fetch('/api/polymath/magazine');
  const data = await res.json();
  cache.set('polymath', data);
  setTimeout(() => cache.delete('polymath'), 5 * 60 * 1000);
  return data;
};
```

---

## Webhooks

Polymath Magazine fires webhooks for content events:
- `article.published`
- `article.updated`
- `article.archived`
- `tool.published`
- `module.published`

Configure webhook URL in organization settings.

---

## Support

- **Documentation**: `/docs`
- **Status Page**: `https://status.viridian.app`
- **Email**: support@viridian.app
- **GitHub Issues**: https://github.com/yourname/viridian/issues
