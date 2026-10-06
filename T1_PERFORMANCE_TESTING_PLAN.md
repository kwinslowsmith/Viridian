# T1 Backend - Performance Testing Plan (Oct 7-8)

**Purpose**: Verify API performance, identify bottlenecks, and validate scaling  
**Status**: 🟡 READY - Execute once Priority 2 testing passes  
**Execution Time**: ~2-3 hours

---

## Performance Targets

| Endpoint | Target | Acceptable Range |
|----------|--------|------------------|
| GET /api/communities | < 500ms | < 1s |
| GET /api/communities/[slug] | < 200ms | < 500ms |
| GET /api/communities/[slug]/discussions | < 500ms | < 1s |
| POST /api/communities/[slug]/discussions | < 500ms | < 1s |
| GET /api/communities/[slug]/discussions/[id]/messages | < 500ms | < 1s |
| POST /api/communities/[slug]/discussions/[id]/messages | < 500ms | < 1s |
| GET /api/communities/[slug]/meetings | < 500ms | < 1s |
| POST /api/communities/[slug]/meetings | < 500ms | < 1s |
| **GET /api/communities/[slug]/stats** | < **2s** | < **3s** |

---

## Test 1: Response Time Benchmarking

### 1.1 Single Request Timing

For each endpoint, measure response time:

```bash
#!/bin/bash

# Measure response time for GET /api/communities
time curl -s https://viridian.vercel.app/api/communities \
  -H "Content-Type: application/json" > /dev/null

# Output example:
# real    0m0.523s
# user    0m0.089s
# sys     0m0.045s
# ^ Response time is 523ms
```

**Acceptance**: All endpoints < 1s (except stats < 2s)

### 1.2 Average Response Time (Run 10 times)

```bash
#!/bin/bash

# Measure average response time
total_time=0
iterations=10

for i in {1..10}; do
  start=$(date +%s%N)
  curl -s https://viridian.vercel.app/api/communities > /dev/null
  end=$(date +%s%N)
  
  elapsed=$(( ($end - $start) / 1000000 ))  # Convert to ms
  total_time=$(( $total_time + $elapsed ))
  
  echo "Request $i: ${elapsed}ms"
done

average=$(( $total_time / $iterations ))
echo "Average: ${average}ms"
```

**Acceptance**: Average < 500ms for most endpoints

---

## Test 2: N+1 Query Detection

### 2.1 Check Database Query Logs

```bash
# On Vercel, check Function Logs for query patterns:
# 1. Excessive number of queries for single endpoint
# 2. Similar queries run multiple times
# 3. Queries not using indexes

# Example of N+1:
# GET /api/communities/[slug]/discussions should run ~3 queries:
#   1. SELECT discussions WHERE communityId = ?
#   2. SELECT users WHERE id IN (creatorIds)  -- batch fetch
#   3. SELECT COUNT(messages) WHERE discussionId IN (discussionIds)
#
# NOT:
#   1. SELECT discussions WHERE communityId = ?
#   2. SELECT user WHERE id = ? (repeated for each discussion) ← N+1 PROBLEM
```

### 2.2 Enable Prisma Query Logging (Already Enabled)

In `lib/prisma.ts`, logging is configured:

```typescript
new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});
```

**Check logs after each request** to verify queries are efficient.

**Red Flags**:
- More than 5 queries per endpoint
- Same query run multiple times
- Full table scans (no WHERE clause)
- Missing indexes

---

## Test 3: Pagination Performance

### 3.1 Test with Different Limits

```bash
# Test pagination with different limits
for limit in 10 20 50 100; do
  echo "Testing limit=$limit"
  time curl -s "https://viridian.vercel.app/api/communities?limit=$limit" \
    -H "Content-Type: application/json" > /dev/null
done

# Expected: Response time should increase slightly, but stay < 1s
# If limit=100 takes > 2s, pagination logic may be inefficient
```

### 3.2 Test Offset Performance

```bash
# Test offset with large values
for offset in 0 100 500 1000; do
  echo "Testing offset=$offset"
  time curl -s "https://viridian.vercel.app/api/communities?offset=$offset" \
    -H "Content-Type: application/json" > /dev/null
done

# Expected: Response time should remain ~consistent
# If offset=1000 is significantly slower, OFFSET may not be using indexes properly
```

---

## Test 4: Concurrent Request Load Testing

### 4.1 Simulate Multiple Users (5 Concurrent)

```bash
#!/bin/bash

# Run 5 concurrent requests
for i in {1..5}; do
  (curl -s https://viridian.vercel.app/api/communities > /dev/null &)
done
wait

# Check if all succeeded
# Expected: All requests complete within ~1s
```

### 4.2 Simulate Heavy Load (20 Concurrent)

```bash
#!/bin/bash

# Run 20 concurrent requests
for i in {1..20}; do
  (curl -s https://viridian.vercel.app/api/communities > /dev/null &)
done
wait

# Expected: All requests complete without 500 errors
# If some fail, we may have connection pool issues
```

### 4.3 Burst Load (50 Requests in Rapid Succession)

```bash
#!/bin/bash

# Fire 50 requests as fast as possible
for i in {1..50}; do
  curl -s https://viridian.vercel.app/api/communities > /dev/null &
done
wait

# Monitor for:
# - Database connection pool exhaustion
# - Vercel concurrent execution limits
# - Rate limiting issues
```

---

## Test 5: Large Payload Performance

### 5.1 Long Discussion Threads (100+ messages)

```bash
# Test GET /api/communities/[slug]/discussions/[id]/messages
# with limit=100 (maximum allowed)

curl -s "https://viridian.vercel.app/api/communities/test/discussions/disc_abc/messages?limit=100" \
  -H "Content-Type: application/json"

# Expected: < 1s response time
# Check:
# - Memory usage (JSON payload size)
# - Network transfer time
# - Database query performance
```

### 5.2 Large Community (1000+ members)

```bash
# Create test data or find large community
# Test GET /api/communities/[slug]/stats

time curl -s https://viridian.vercel.app/api/communities/large-community/stats \
  -b "sessionToken=$TOKEN" \
  -H "Content-Type: application/json"

# Expected: < 2s response time (stats endpoint is heavier)
# Check:
# - Count queries for members, discussions, messages
# - Aggregation queries (top contributors, engagement metrics)
```

---

## Test 6: Database Connection Pooling

### 6.1 Verify Connection Reuse

```bash
# Run 100 requests sequentially
# Each should reuse existing connection from pool

for i in {1..100}; do
  curl -s https://viridian.vercel.app/api/communities > /dev/null
  echo "Request $i"
done

# Expected:
# - Consistent response time (no new connection overhead)
# - No connection errors
# - Database connection pool maintains 5-10 active connections
```

### 6.2 Connection Pool Saturation

```bash
# If 100 concurrent requests cause failures,
# we may have hit Supabase connection limits

# Supabase connection pool limits:
# - Free tier: 3 concurrent connections
# - Pro tier: 10 concurrent connections

# Our pool URL (port 6543) should handle ~20 connections per Vercel instance
# If bottleneck reached, need to:
# 1. Optimize query performance
# 2. Implement connection pooling on Vercel
# 3. Upgrade Supabase tier
```

---

## Test 7: Auth Performance

### 7.1 Time to Get Session

```bash
# Measure how long it takes to fetch auth session

time curl -s https://viridian.vercel.app/api/me/profile \
  -b "sessionToken=$TOKEN" \
  -H "Content-Type: application/json"

# Expected: < 200ms
# If > 500ms, NextAuth session lookup may be slow
```

---

## Automated Performance Test Script

Save as `perf_test.sh`:

```bash
#!/bin/bash

BASE_URL="https://viridian.vercel.app"
RESULTS_FILE="perf_results.txt"

echo "🚀 T1 Backend Performance Testing Suite"
echo "========================================"
echo "Start Time: $(date)" > $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test 1: Single endpoint timing
echo "Test 1: Single Request Timing"
echo "----------------------------"

for endpoint in "/api/communities" "/api/communities/test" "/api/health"; do
  total_time=0
  iterations=5

  for i in {1..5}; do
    start=$(date +%s%N)
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    end=$(date +%s%N)
    
    elapsed=$(( ($end - $start) / 1000000 ))
    total_time=$(( $total_time + $elapsed ))
  done

  average=$(( $total_time / iterations ))
  echo "$endpoint: ${average}ms (HTTP $http_code)" | tee -a $RESULTS_FILE
done

echo "" >> $RESULTS_FILE

# Test 2: Concurrent load
echo "Test 2: Concurrent Load (5 requests)"
echo "------------------------------------"

start=$(date +%s%N)
for i in {1..5}; do
  (curl -s "$BASE_URL/api/communities" > /dev/null &)
done
wait
end=$(date +%s%N)

elapsed=$(( ($end - $start) / 1000000 ))
echo "5 concurrent requests: ${elapsed}ms" | tee -a $RESULTS_FILE

echo "" >> $RESULTS_FILE

# Test 3: Burst load
echo "Test 3: Burst Load (20 rapid requests)"
echo "-------------------------------------"

start=$(date +%s%N)
for i in {1..20}; do
  curl -s "$BASE_URL/api/communities" > /dev/null &
done
wait
end=$(date +%s%N)

elapsed=$(( ($end - $start) / 1000000 ))
echo "20 rapid requests: ${elapsed}ms" | tee -a $RESULTS_FILE

echo "" >> $RESULTS_FILE
echo "End Time: $(date)" >> $RESULTS_FILE

echo "Results saved to $RESULTS_FILE"
```

---

## Performance Debugging Checklist

If performance is poor:

- [ ] Check Vercel CPU usage (may be throttled)
- [ ] Check Supabase query logs for slow queries
- [ ] Check Prisma query logs for N+1 patterns
- [ ] Verify database indexes exist
- [ ] Check connection pool settings
- [ ] Profile slow endpoints with APM tool (if available)
- [ ] Look for memory leaks in Prisma client

---

## Success Criteria

✅ All endpoints < 1s (except stats < 2s)  
✅ Average response time < 500ms  
✅ No N+1 queries detected  
✅ Pagination scales to 1000+ items  
✅ 20 concurrent requests complete without errors  
✅ Connection pool working efficiently  
✅ Auth performance < 200ms  

---

## Optimization Priorities (If Needed)

| Issue | Priority | Fix |
|-------|----------|-----|
| N+1 queries | P1 | Use Prisma include/select |
| Slow stats endpoint | P1 | Add database indexes, cache counts |
| Connection pool exhaustion | P2 | Configure PgBouncer on Supabase |
| Large payloads | P2 | Implement pagination limits |
| Cache issues | P3 | Add Redis caching layer |

---

**Ready to execute Oct 8 morning after Priority 2 passes! 🚀**
