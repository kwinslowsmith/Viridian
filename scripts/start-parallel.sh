#!/bin/bash
# Initialize parallel session whiteboard
# Usage: bash scripts/start-parallel.sh "your goal here" [--worktrees]

GOAL="$1"
WORKTREES_MODE="${2:-}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SESSION_FILE="session-state.md"

if [ -z "$GOAL" ]; then
    echo "Usage: bash scripts/start-parallel.sh \"goal\" [--worktrees]"
    exit 1
fi

# Create fresh whiteboard
cat > "$SESSION_FILE" << EOF
# Parallel Session Whiteboard
**Started:** $TIMESTAMP
**Goal:** $GOAL
**Mode:** ${WORKTREES_MODE:+Worktrees}${WORKTREES_MODE:-Shared}

---

## T1 — Orchestrator (High Effort)
**Task:** Coordinate workflow, synthesize findings, make final decisions
**Status:** Waiting for /sync

---

## T2 — Worker (High Effort)
**Task:** [Assign heavy task]
**Status:** Waiting for /sync

---

## T3 — Worker (Medium Effort)
**Task:** [Assign supporting task]
**Status:** Waiting for /sync

---

## T4 — Monitor (Low Effort)
**Task:** [Assign quick lookups]
**Status:** Waiting for /sync

---

## Shared Findings
(Updated via /checkpoint)

---

## File Locks
\`\`\`
session-state.md — T1
\`\`\`

---

## Pending Decisions
(Decisions T1 needs to make)

---

## Blockers
(Anything blocking progress?)

---

## Done List
(Subtasks completed)
EOF

echo "✅ Session initialized: $SESSION_FILE"
echo "Goal: $GOAL"
echo ""
echo "Next steps:"
echo "  T1: Run '/sync' to read this whiteboard"
echo "  T1: Update task assignments for T2, T3, T4"
echo "  Others: Run '/sync' to see your assignments"
echo "  Anyone: Run '/checkpoint' to write findings back"

# Optional: Create worktree branches
if [ "$WORKTREES_MODE" = "--worktrees" ]; then
    echo ""
    echo "Creating worktrees for parallel editing..."
    git worktree add "/tmp/jeeves-t2" -b "parallel-${TIMESTAMP}-t2"
    git worktree add "/tmp/jeeves-t3" -b "parallel-${TIMESTAMP}-t3"
    echo "✅ Worktrees created:"
    echo "  T2: /tmp/jeeves-t2 (branch: parallel-${TIMESTAMP}-t2)"
    echo "  T3: /tmp/jeeves-t3 (branch: parallel-${TIMESTAMP}-t3)"
    echo ""
    echo "Cleanup when done:"
    echo "  git worktree remove /tmp/jeeves-t2"
    echo "  git worktree remove /tmp/jeeves-t3"
fi
