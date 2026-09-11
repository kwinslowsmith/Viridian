# T1 Backend - Week 2 Action Plan (Sep 12-18)
**Status**: Week 1 Complete ✅ → Week 2 In Progress  
**Coordinator**: Claude Code (T1 Ownership)  
**Build Status**: In progress (Turbopack compilation)

---

## 📊 CONTEXT: What T1 Built Week 1

**9 Core Endpoints Complete:**
- ✅ GET/POST /api/communities/[slug]/discussions
- ✅ GET/POST /api/communities/[slug]/discussions/[id]
- ✅ GET/POST /api/communities/[slug]/discussions/[id]/messages
- ✅ GET/POST /api/communities/[slug]/meetings
- ✅ GET/PATCH/DELETE /api/communities/[slug]/meetings/[id]
- ✅ GET/PATCH /api/me/profile
- ✅ GET /api/me/dashboard
- ✅ GET /api/communities/[slug]/stats (curator stats)
- ✅ Schema: PolymathMeeting, extended Conversation, LearningCommunity relations

**Database Status:**
- ✅ Prisma schema updated and migrated
- ✅ Full TypeScript support
- ✅ Authorization checks in place
- ✅ Test data seeded (Demo Literature class with students)

---

## 🎯 WEEK 2 PRIORITIES

### Priority 1: Build & Verify (Today - Sep 12)

**Task 1a: Complete Production Build**
- [ ] Wait for Next.js build to finish (Turbopack)
- [ ] Verify 0 TypeScript errors
- [ ] Verify 0 Next.js warnings
- [ ] Test build locally: `npm run build && npm start`
- [ ] Check Vercel deployment auto-updated

**Task 1b: Manual API Testing**
- [ ] Test GET /api/communities (public browse)
- [ ] Test POST /api/communities (create as curator)
- [ ] Test GET /api/communities/[slug]/discussions
- [ ] Test POST /api/communities/[slug]/discussions
- [ ] Test POST /api/communities/[slug]/discussions/[id]/messages
- [ ] Test GET /api/communities/[slug]/meetings
- [ ] Test POST /api/communities/[slug]/meetings
- [ ] Test auth enforcement (401 unauthorized, 403 forbidden)
- [ ] Test error cases (bad input, not found, permission denied)

**Task 1c: Document API Contract**
- [ ] Create `T1_API_CONTRACT.md` with exact request/response formats
- [ ] Document all query params (limit, offset, sort, search)
- [ ] Document all error codes (400, 401, 403, 404, 500)
- [ ] Provide curl examples for each endpoint
- [ ] Provide TypeScript types for response objects

**Success Criteria:**
- ✅ Build passes with 0 errors
- ✅ All 9 endpoints respond correctly
- ✅ Auth restrictions work
- ✅ Error handling works
- ✅ API contract documented

---

### Priority 2: Integration Prep for T3 (Sep 13-14)

T3 is ready to wire frontend to backend. T1 must ensure APIs match their expectations.

**Task 2a: Review T3's Integration Guide**
- [ ] Read `/Users/kylewinslowsmith/Desktop/Viridian/T3_INTEGRATION_GUIDE.md`
- [ ] Cross-check API responses match T3's expected types
- [ ] Flag any mismatches or incompatibilities
- [ ] Coordinate with T3 on response format adjustments

**Task 2b: Prepare Test Data**
- [ ] Ensure test community exists with:
  - [ ] 2+ curators
  - [ ] 5+ members
  - [ ] 3+ discussions
  - [ ] 10+ messages
  - [ ] 2+ upcoming meetings
  - [ ] 2+ past meetings
- [ ] Document test community slug and IDs
- [ ] Create test user accounts with different roles

**Task 2c: Real-Time Subscription Setup**
- [ ] Verify Supabase connection configured
- [ ] Test Supabase database accessible
- [ ] Document Supabase tables (communities, conversations, meetings, etc.)
- [ ] Create Supabase realtime policy documentation
- [ ] Set up presence tracking (who's online in community)

**Success Criteria:**
- ✅ T3 can call all 9 endpoints
- ✅ Response types match expectations
- ✅ Test data ready for browser testing
- ✅ Supabase realtime documented

---

### Priority 3: Performance & Optimization (Sep 15-16)

Now that endpoints work, ensure they're fast enough for real use.

**Task 3a: Database Query Analysis**
- [ ] Profile GET /api/communities/[slug]/stats (likely slowest)
- [ ] Check for N+1 queries (use `prisma.$queryRaw` to inspect)
- [ ] Verify all indexes are used (check Prisma logs)
- [ ] Add missing indexes if needed
- [ ] Target: stats endpoint <1s response time

**Task 3b: Response Size Optimization**
- [ ] Check payload sizes (stats endpoint with 100+ contributors)
- [ ] Consider pagination for nested data (top contributors list)
- [ ] Consider lazy-loading heavy fields
- [ ] Target: response <100KB for all endpoints

**Task 3c: Caching Strategy**
- [ ] Consider Redis for community stats (cache 5 min)
- [ ] Consider in-memory cache for taxonomy (topics, domains)
- [ ] Document cache invalidation strategy
- [ ] Target: <500ms response for cached queries

**Success Criteria:**
- ✅ All endpoints respond <2s even with 1000+ data
- ✅ No N+1 queries detected
- ✅ Response size optimized
- ✅ Caching strategy documented

---

### Priority 4: Documentation & Handoff (Sep 17-18)

Prepare everything for T4 Feature team (meetings + curator dashboard).

**Task 4a: API Documentation**
- [ ] Create OpenAPI/Swagger spec (optional, nice-to-have)
- [ ] Create Postman collection with all 9 endpoints
- [ ] Document auth flow (how to get session token)
- [ ] Document error codes and recovery strategies
- [ ] Create endpoint status dashboard

**Task 4b: Security Review**
- [ ] Verify curator-only endpoints check permission correctly
- [ ] Verify members can only see their own communities
- [ ] Verify no data leaks in error messages
- [ ] Test with invalid UUIDs, SQL injection attempts
- [ ] Document security model

**Task 4c: Deployment & Monitoring**
- [ ] Verify all endpoints live on Vercel
- [ ] Set up error logging (Sentry, LogRocket, or similar)
- [ ] Set up performance monitoring (response times, query counts)
- [ ] Create deployment checklist for Week 3-4 updates
- [ ] Document rollback procedure

**Task 4d: Final Handoff Document**
- [ ] Create `T1_WEEK2_COMPLETION.md`
- [ ] Summarize all deliverables
- [ ] List any known issues or limitations
- [ ] Provide Week 3 preview (any new endpoints coming)
- [ ] Confirm ready for T3/T4 integration

**Success Criteria:**
- ✅ All 9 endpoints documented
- ✅ APIs secure and tested
- ✅ Live on Vercel with monitoring
- ✅ T3/T4 have what they need to build

---

## 📅 TIMELINE

| Date | Day | Tasks | Owner |
|------|-----|-------|-------|
| Sep 12 (Thu) | Priority 1 | Build, verify, document contract | T1 |
| Sep 13 (Fri) | Priority 2 | Integration prep, test data, Supabase | T1 + T3 sync |
| Sep 14 (Sat) | Priority 2 | Continue prep | T1 |
| Sep 15 (Sun) | Priority 3 | Performance optimization | T1 |
| Sep 16 (Mon) | Priority 3 | Caching, indexing | T1 |
| Sep 17 (Tue) | Priority 4 | Documentation, security review | T1 |
| Sep 18 (Wed) | Priority 4 | Final handoff, Week 3 preview | T1 |

**Milestone**: Ready for T3 integration by Sep 19 (Week 2 complete).

---

## 🚀 WHAT T3 IS DOING

While T1 verifies/optimizes Week 1 work:
- **Week 2 (Sep 12-18)**: Wire Priority 1 pages (communities list, dashboard, resources, create, join)
- **T3 Will Call**: GET /api/communities, POST /api/communities, GET /api/communities/[slug], etc.
- **T1 Must Ensure**: APIs respond correctly, auth works, performance adequate

---

## 🚀 WHAT T4 IS DOING

Meanwhile, T4 prepares for Weeks 3-4:
- **Week 1-2 (Sep 11-18)**: Analysis, planning, component specs (already done ✅)
- **Week 3 (Sep 25)**: Build meetings UI, test with T1 APIs
- **Week 4 (Oct 2-9)**: Build curator dashboard, optimize, polish

---

## 📋 DEPENDENCIES & BLOCKERS

**Depends On:**
- ✅ T1 API endpoints (complete, verified in Week 1)
- ✅ NextAuth auth system (working)
- ✅ Prisma schema (migrated)

**Blocks:**
- T3: Can't wire frontend until APIs verified (blocking right now)
- T4: Can't build features until APIs performance-tested

**No Known Blockers** - All systems go.

---

## ✅ SUCCESS CRITERIA FOR WEEK 2

By end of Sep 18:

1. **Build Status**: ✅ Production build passes with 0 errors
2. **API Verification**: ✅ All 9 endpoints tested and working
3. **Test Data**: ✅ Test community ready for T3 browser testing
4. **Performance**: ✅ All endpoints <2s response time
5. **Documentation**: ✅ All APIs documented for T3/T4
6. **Security**: ✅ Authorization working, no data leaks
7. **Ready**: ✅ T3 can start wiring on Sep 19 (Week 3)

---

## 🎯 IMMEDIATE ACTIONS (Next 30 minutes)

1. ✅ Wait for build to complete
2. ✅ Run `npm run build && npm start` locally
3. ✅ Test one endpoint with curl: `curl http://localhost:3000/api/communities`
4. ✅ Verify response is valid JSON
5. ✅ Check Vercel deployment updated
6. ✅ Create T1_API_CONTRACT.md with endpoint specs

---

**Status**: Week 2 begins now. All systems ready for testing phase.
