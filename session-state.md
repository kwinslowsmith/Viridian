# Parallel Session Whiteboard
**Started:** 2026-08-04_13-52-57
**Goal:** Polymath Phases 1-4: Multi-stakeholder content posting model (orgs/communities/individuals/events)
**Mode:** Shared

---

## T1 — Orchestrator (High Effort)
**Task:** Research multi-stakeholder content models. Define permission framework: who can create/edit articles, modules, collections? What's different about org-posted vs individual-posted vs event-posted content? Synthesize architecture decision.
**Status:** ✅ COMPLETE
**Key Decision:** authorType + authorId model. Individuals publish directly; Orgs/Communities require approval. Different credibility signals per type.
**Report:** T1_POLYMATH_STAKEHOLDER_ARCHITECTURE.md

---

## T2 — Worker (High Effort)
**Task:** Data model deep dive. How to structure Article/Module/Collection to track: author (individual/org/event/community), ownership, permissions, visibility. What fields need to be added? Check: does Article have authorType/authorId? Does Module track owner? Can Collections be owned by events?
**Status:** ✅ COMPLETE
**Findings:** PolymathArticle/Module/Tool/Collection exist. All have: status, authorId (userId only). All MISSING: authorType, organizationId, eventId, visibility, approvalChain. Reference model PolymathPost has correct multi-stakeholder pattern.
**Gap Count:** 6 fields per model × 4 models = 24 total schema additions needed

---

## T3 — Worker (Medium Effort)
**Task:** UI/UX design for content posting. How should post form differ by stakeholder type? Org posts → org branding, team approval? Individual posts → personal bio, credibility? Event posts → event details, date? Design 3 posting flows + permission indicator UI.
**Status:** ✅ COMPLETE
**Deliverables:** 4 full posting flows (Individual/Org/Community/Event) with ASCII mockups, approval queues, status displays, credibility badges. 10 components needed. Permission check logic defined.
**Key Design Pattern:** Status badges (✓/⏳/✗), role indicators (👤/🏢/📚/📅), approval progress bars

---

## T4 — Monitor (Low Effort)
**Task:** Audit Polymath API schema. Check: ExampleArticle/Article model - what author/ownership fields exist? Module model - how is it linked to creator? Collection model - can it be owned by different entity types? List gaps vs requirements.
**Status:** ✅ COMPLETE
**Models Found:** PolymathArticle (1600), PolymathTool (1635), PolymathModule (1675), PolymathResourceCollection (1714). All community-scoped only. ExampleArticle/ExampleModule: DO NOT EXIST.
**Schema Gap Summary:** All 4 models missing: authorType, organizationId, eventId, visibility, approvalChain fields

---

## Shared Findings

**Polymath Overview (The Polymath Saloon):**
- Community platform for sharing ideas, skills, knowledge
- 4 Phases: Magazine (3-tier), Collections, Modules, Community/Teachers
- Key challenge: Support multi-stakeholder posting (orgs/communities/individuals/events)

**T1 - Architecture Decision (FINAL):**
- **Ownership Model:** `authorType` (individual/org/community/event) + `authorId`
- **Approval Logic:**
  - Individuals: Publish directly (no approval)
  - Orgs/Communities/Events: Require admin/moderator approval
- **Credibility by Type:**
  - Individual: Credentials + contribution history
  - Org: Verification badge + org reputation
  - Community: Moderator curation signal
  - Event: Event association + speaker expertise
- **RBAC:** Organization/community/event-scoped roles (owner/admin/editor/member)
- **Full Report:** See T1_POLYMATH_STAKEHOLDER_ARCHITECTURE.md

---

## File Locks
```
session-state.md — T1
```

---

## Pending Decisions
(Decisions T1 needs to make)

---

## Blockers
(Anything blocking progress?)

---

## Done List
- [x] T1: Multi-stakeholder architecture research + design decision
- [x] T2: Data model audit (4 Polymath models reviewed, 6 field gaps per model identified)
- [x] T3: UI/UX design (4 complete posting flows with mockups, 10 components scoped)
- [x] T4: Schema audit (confirmed PolymathArticle/Tool/Module/Collection locations and gaps)

**READY FOR:** Schema migration planning (add authorType, organizationId, eventId, visibility, approvalChain to 4 models)

---

## Implementation Progress

**✅ SCHEMA MIGRATION COMPLETE**

### Changes Applied:
1. **PolymathArticle** - Added: authorType, organizationId, eventId, visibility, requiresApproval, approvalChain
2. **PolymathTool** - Added: authorType, organizationId, eventId, visibility, requiresApproval, approvalChain
3. **PolymathModule** - Added: authorType, organizationId, eventId, visibility, requiresApproval, approvalChain
4. **PolymathResourceCollection** - Added: authorType, organizationId, eventId, visibility, requiresApproval, approvalChain
5. **Organization** - Added relations to all 4 Polymath content types

### Status:
- Database synced: ✅
- Prisma client regenerated: ✅
- Ready for API implementation

**Next Track:** API endpoints for posting, approvals + UI components
