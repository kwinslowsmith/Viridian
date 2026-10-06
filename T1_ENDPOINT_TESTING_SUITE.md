# T1 Backend - Endpoint Testing Suite (Ready to Run Oct 7)

**Purpose**: Comprehensive test suite for all 9 Polymath API endpoints  
**Status**: 🟡 READY - Execute once backend is live  
**Execution Time**: ~15-20 minutes for full suite

---

## Pre-Test Checklist

Before running tests:
- [ ] Backend is live: `curl https://viridian.vercel.app/api/health` returns 200
- [ ] Have test community slug (e.g., "test-community")
- [ ] Have test auth token (create test user first)

---

## Test 1: Public Endpoints (No Auth Required)

### 1.1 GET /api/communities (List all communities)

```bash
# Test: List communities
curl -X GET https://viridian.vercel.app/api/communities \
  -H "Content-Type: application/json"

# Expected Response: 200 OK
# Response Format:
{
  "communities": [
    {
      "id": "cmuxxxxxxxx",
      "name": "Learn Taxes",
      "slug": "learn-taxes",
      "description": "...",
      "scope": "global",
      "isPublic": true,
      "createdAt": "2026-10-01T...",
      "curator": { "id": "...", "name": "...", "email": "..." },
      "_count": { "members": 5, "modules": 2 }
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0,
  "hasMore": false
}

# Test Cases:
✓ Status code is 200
✓ communities array is present
✓ Each community has required fields
✓ Pagination fields present (total, limit, offset, hasMore)
```

### 1.2 GET /api/communities?limit=5&offset=0 (Pagination)

```bash
curl -X GET "https://viridian.vercel.app/api/communities?limit=5&offset=0" \
  -H "Content-Type: application/json"

# Expected: 200 OK with limit=5 in response
# Test Cases:
✓ Returns max 5 items
✓ limit field is 5
✓ offset field is 0
✓ hasMore is false if total < 5
```

### 1.3 GET /api/communities/[slug] (Get specific community)

```bash
# Replace [slug] with actual community slug
curl -X GET https://viridian.vercel.app/api/communities/learn-taxes \
  -H "Content-Type: application/json"

# Expected Response: 200 OK
{
  "id": "cmuxxxxxxxx",
  "name": "Learn Taxes",
  "slug": "learn-taxes",
  "description": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "curator": { ... },
  "_count": { ... }
}

# Test Cases:
✓ Status code is 200
✓ Returns correct community data
✓ All fields match /api/communities result
```

### 1.4 GET /api/communities/invalid-slug (Non-existent community)

```bash
curl -X GET https://viridian.vercel.app/api/communities/invalid-slug-xyz \
  -H "Content-Type: application/json"

# Expected Response: 404 Not Found
{
  "error": "Community not found"
}

# Test Cases:
✓ Status code is 404
✓ Error message is clear
✓ No community data returned
```

---

## Test 2: Auth-Protected Endpoints (Require Login)

### 2.1 Verify 401 Unauthorized (No Auth Token)

```bash
# Try to get discussions without auth
curl -X GET https://viridian.vercel.app/api/communities/learn-taxes/discussions \
  -H "Content-Type: application/json"

# Expected Response: 401 Unauthorized
{
  "error": "Unauthorized"
}

# Test Cases:
✓ Status code is 401
✓ Error message indicates auth required
✓ No data returned
```

### 2.2 GET /api/communities/[slug]/discussions (With Auth)

```bash
# First, get auth token
# Option A: Use NextAuth session cookie (automatic if logged in)
curl -X GET https://viridian.vercel.app/api/communities/learn-taxes/discussions \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN"

# Expected Response: 200 OK
{
  "discussions": [
    {
      "id": "disc_xxxxxxxx",
      "title": "How to File Taxes",
      "description": "...",
      "createdBy": { "id": "...", "name": "..." },
      "createdAt": "...",
      "_count": { "messages": 3 }
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0,
  "hasMore": false
}

# Test Cases:
✓ Status code is 200 (with valid auth)
✓ discussions array present
✓ Pagination fields present
✓ Each discussion has required fields
```

### 2.3 POST /api/communities/[slug]/discussions (Create discussion)

```bash
curl -X POST https://viridian.vercel.app/api/communities/learn-taxes/discussions \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Test Discussion",
    "description": "This is a test discussion"
  }'

# Expected Response: 201 Created
{
  "id": "disc_xxxxxxxx",
  "title": "Test Discussion",
  "description": "This is a test discussion",
  "createdBy": { "id": "...", "name": "..." },
  "createdAt": "2026-10-07T...",
  "_count": { "messages": 0 }
}

# Test Cases:
✓ Status code is 201
✓ New discussion has id
✓ createdBy is current user
✓ _count.messages is 0 (new discussion)
```

### 2.4 POST /api/communities/[slug]/discussions (Missing required field)

```bash
curl -X POST https://viridian.vercel.app/api/communities/learn-taxes/discussions \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN" \
  -d '{
    "description": "Missing title"
  }'

# Expected Response: 400 Bad Request
{
  "error": "Title is required"
}

# Test Cases:
✓ Status code is 400
✓ Error message indicates missing field
✓ No discussion created
```

---

## Test 3: Messages Endpoints

### 3.1 GET /api/communities/[slug]/discussions/[discussionId]/messages

```bash
curl -X GET https://viridian.vercel.app/api/communities/learn-taxes/discussions/disc_xxxxxxxx/messages \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN"

# Expected Response: 200 OK
{
  "messages": [
    {
      "id": "msg_xxxxxxxx",
      "text": "Great question!",
      "createdBy": { "id": "...", "name": "..." },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0,
  "hasMore": false
}

# Test Cases:
✓ Status code is 200
✓ messages array present
✓ Pagination fields present
```

### 3.2 POST /api/communities/[slug]/discussions/[discussionId]/messages (Create message)

```bash
curl -X POST https://viridian.vercel.app/api/communities/learn-taxes/discussions/disc_xxxxxxxx/messages \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN" \
  -d '{
    "text": "This is a test message"
  }'

# Expected Response: 201 Created
{
  "id": "msg_xxxxxxxx",
  "text": "This is a test message",
  "createdBy": { "id": "...", "name": "..." },
  "createdAt": "2026-10-07T..."
}

# Test Cases:
✓ Status code is 201
✓ New message has id
✓ createdBy is current user
```

---

## Test 4: Meetings Endpoints

### 4.1 GET /api/communities/[slug]/meetings (List meetings)

```bash
curl -X GET https://viridian.vercel.app/api/communities/learn-taxes/meetings \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN"

# Expected Response: 200 OK
{
  "meetings": [
    {
      "id": "meet_xxxxxxxx",
      "title": "Team Sync",
      "scheduledAt": "2026-10-10T14:30:00Z",
      "zoomUrl": "https://zoom.us/j/...",
      "host": { "id": "...", "name": "..." },
      "createdAt": "..."
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0,
  "hasMore": false
}

# Test Cases:
✓ Status code is 200
✓ meetings array present
✓ Each meeting has required fields
```

### 4.2 POST /api/communities/[slug]/meetings (Create meeting)

```bash
curl -X POST https://viridian.vercel.app/api/communities/learn-taxes/meetings \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Q4 Planning",
    "description": "Discuss Q4 goals",
    "scheduledAt": "2026-10-15T15:00:00Z",
    "zoomUrl": "https://zoom.us/j/123456789",
    "location": "Conference Room A"
  }'

# Expected Response: 201 Created
{
  "id": "meet_xxxxxxxx",
  "title": "Q4 Planning",
  "scheduledAt": "2026-10-15T15:00:00Z",
  "host": { "id": "...", "name": "..." },
  "createdAt": "..."
}

# Test Cases:
✓ Status code is 201
✓ New meeting has id
✓ host is current user
✓ scheduledAt is preserved
```

---

## Test 5: User Profile Endpoint

### 5.1 GET /api/me/profile (Get current user profile)

```bash
curl -X GET https://viridian.vercel.app/api/me/profile \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN"

# Expected Response: 200 OK
{
  "id": "user_xxxxxxxx",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "curator",
  "createdAt": "...",
  "updatedAt": "..."
}

# Test Cases:
✓ Status code is 200
✓ Returned user is current user
✓ All profile fields present
```

### 5.2 PATCH /api/me/profile (Update profile)

```bash
curl -X PATCH https://viridian.vercel.app/api/me/profile \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "John Smith"
  }'

# Expected Response: 200 OK
{
  "id": "user_xxxxxxxx",
  "name": "John Smith",
  "email": "user@example.com",
  ...
}

# Test Cases:
✓ Status code is 200
✓ name field updated
✓ Other fields unchanged
```

---

## Test 6: Curator Dashboard (Stats Endpoint)

### 6.1 GET /api/communities/[slug]/stats (Only for curator)

```bash
curl -X GET https://viridian.vercel.app/api/communities/learn-taxes/stats \
  -H "Content-Type: application/json" \
  -b "sessionToken=YOUR_SESSION_TOKEN"

# Expected Response (if curator): 200 OK
{
  "communityId": "cmu_xxxxxxxx",
  "memberCount": 127,
  "discussionCount": 45,
  "messageCount": 1247,
  "meetingCount": 8,
  "topContributors": [
    { "userId": "...", "name": "Sarah M", "messageCount": 247 },
    ...
  ],
  "recentActivity": [...],
  "engagementMetrics": {
    "thisMonth": { "messagesPerDay": 45 },
    "lastMonth": { "messagesPerDay": 32 }
  }
}

# Expected Response (if NOT curator): 403 Forbidden
{
  "error": "Only curators can view community stats"
}

# Test Cases:
✓ Status code is 200 (if curator)
✓ All stats fields present
✓ Returns 403 if not curator
✓ topContributors is sorted by messageCount
```

---

## Automated Test Runner Script

Save as `test_all_endpoints.sh`:

```bash
#!/bin/bash

BASE_URL="https://viridian.vercel.app"
SESSION_TOKEN="YOUR_SESSION_TOKEN_HERE"
COMMUNITY_SLUG="learn-taxes"

echo "🧪 T1 Backend - Comprehensive Endpoint Testing Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected_status=$4
  local data=$5
  local auth_required=$6

  echo "Testing: $name"
  
  if [ "$auth_required" == "yes" ]; then
    if [ "$method" == "GET" ]; then
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -b "sessionToken=$SESSION_TOKEN")
    else
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -b "sessionToken=$SESSION_TOKEN" \
        -d "$data")
    fi
  else
    if [ "$method" == "GET" ]; then
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json")
    else
      response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data")
    fi
  fi

  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$status_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
    echo "  Response: $body"
    ((FAILED++))
  fi
  echo ""
}

# Run tests
test_endpoint "List Communities" "GET" "/api/communities" 200 "" "no"
test_endpoint "Get Community" "GET" "/api/communities/$COMMUNITY_SLUG" 200 "" "no"
test_endpoint "List Discussions (401 without auth)" "GET" "/api/communities/$COMMUNITY_SLUG/discussions" 401 "" "no"
test_endpoint "List Discussions (200 with auth)" "GET" "/api/communities/$COMMUNITY_SLUG/discussions" 200 "" "yes"

# Print summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Test Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
```

---

## Summary Checklist

When backend is live tomorrow, run:

```bash
# Test 1: Health check
curl https://viridian.vercel.app/api/health

# Test 2: Run full test suite
bash test_all_endpoints.sh

# Test 3: Manual spot checks (if automated fails)
# Follow individual test cases above
```

---

## Expected Success Criteria

✅ All 9 endpoints return correct status codes  
✅ All public endpoints return 200  
✅ All protected endpoints return 401 without auth  
✅ All protected endpoints return 200 with auth  
✅ All POST endpoints return 201 on success  
✅ All error responses have clear error messages  
✅ All pagination fields present  
✅ Auth enforcement working (401/403 as expected)

---

**Ready to execute Oct 7 morning once backend is live! 🚀**
