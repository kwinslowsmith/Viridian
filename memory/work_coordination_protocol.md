---
name: work-coordination-protocol
description: Rules for coordinating work across parallel Claude instances
metadata:
  type: reference
---

# Work Coordination Protocol

**Purpose**: Prevent duplicate work and maintain context across parallel Claude instances.

## The Rule

1. **Before starting significant work**: Read `/WORK_LOG.md`
   - Check "Active Tasks" for conflicting work
   - Check "Blocked" for dependencies
   - If you see active work in your area, ask for direction before proceeding

2. **When starting work**: Add to WORK_LOG.md "Active Tasks" with:
   - Task name and description
   - Timestamp (ISO 8601)
   - Instance identifier (if available)
   - Status: `in_progress`
   - Brief notes

3. **When completing work**: Update WORK_LOG.md
   - Move task from "Active Tasks" to "Completed This Session"
   - Change status to `✅ Completed`
   - Add follow-up work notes
   - Update "Next Priorities" if things shifted

4. **If work is blocked**: Mark as `paused` with reason
   - "Waiting on X"
   - "Blocked by Y"
   - "Deprioritized for Z"

## When to Log

- **Always log**: Major refactors, new features, architectural changes, database migrations
- **Don't log**: Minor fixes, reviewing code, reading files, small tweaks

## Memory System

All work context is in `/memory/`:
- Architecture decisions
- Implementation notes
- User preferences and feedback
- Project context and deadlines

Check memory before starting. It's persistent across all instances.

## Conflict Resolution

If you find conflicting active work:
1. Note the conflict in WORK_LOG.md
2. Ask the user for direction
3. Do not proceed until clarified

Example: "CONFLICT: Parent Dashboard also active on Console 1. Stopping work, need clarification."
