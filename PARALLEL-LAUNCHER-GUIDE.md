# Jeeves 4-Pane Claude Launcher

**One keystroke. Four parallel AI agents. A shared whiteboard.**

---

## Quick Start

### Open 4 parallel Claude instances
```bash
t
```

A new iTerm2 window opens with 4 panes, each running Claude Code with optimized effort levels.

### Initialize the whiteboard for a task
```bash
bash scripts/start-parallel.sh "your goal here"
```

This creates a fresh `session-state.md` with sections for task assignments, findings, blockers, and file locks.

---

## The 4 Panes

```
┌─────────────────────┬─────────────────────┐
│  T1 — Orchestrator  │  T2 — Worker        │
│  --effort high      │  --effort high      │
│  Coordinates goal,  │  Heavy parallel     │
│  dispatches tasks   │  task (research,    │
│  reads all output   │  build, analysis)   │
├─────────────────────┼─────────────────────┤
│  T3 — Worker        │  T4 — Monitor       │
│  --effort medium    │  --effort low       │
│  Secondary tasks,   │  Quick lookups,     │
│  supporting work    │  file reads, refs   │
└─────────────────────┴─────────────────────┘
```

| Pane | Role | Effort | Best For |
|------|------|--------|----------|
| **T1** | Orchestrator | High | Coordinate goal, assign tasks, synthesize findings, make decisions |
| **T2** | Worker | High | Heavy lifting (deep research, builds, complex analysis) |
| **T3** | Worker | Medium | Supporting tasks, drafts, secondary research |
| **T4** | Monitor | Low | Quick lookups, file reads, status checks |

---

## Coordination Commands

### `/sync` — Read the whiteboard
Each pane should start by reading `session-state.md` to understand:
- The shared goal
- Their assigned task
- What other panes are working on
- Current blockers/findings

### `/checkpoint` — Write findings back
When a pane completes a subtask or discovers something important, write it back to `session-state.md` so other panes know.

---

## File Locks

Before editing any file, claim it in the whiteboard:

```markdown
## File Locks
session-state.md — T1
api/standards/route.ts — T2
components/ObjectivesPanel.tsx — T3
```

**Only the pane that owns a file should edit it.** This prevents merge conflicts.

---

## Worktrees Mode (Parallel Editing)

If two or more panes need to edit the **same files simultaneously**, initialize with:

```bash
bash scripts/start-parallel.sh "goal" --worktrees
```

This creates isolated git branches:
- T2 works in: `/tmp/jeeves-t2` (branch: `parallel-2026-08-04-t2`)
- T3 works in: `/tmp/jeeves-t3` (branch: `parallel-2026-08-04-t3`)

T1 coordinates and merges at the end.

Clean up when done:
```bash
git worktree remove /tmp/jeeves-t2
git worktree remove /tmp/jeeves-t3
```

---

## Real Example: Build K12 Standards Phase 2

**Goal:** Add mandatory/optional objective logic + mastery calculations

```
T1: bash scripts/start-parallel.sh "K12 Standards Phase 2: mandatory objectives + mastery calc"

Assignments:
  T2: Research mastery calculation thresholds (80% mandatory = mastery?)
  T3: Design UI for marking objectives mandatory/optional
  T4: Look up existing standard definitions in schema

Then T1 synthesizes findings and writes final implementation plan.
```

**Wall-clock time:** Same as slowest pane. All three work in parallel.

---

## Why This Works

✅ **No context pollution** — Each Claude is independent, won't crowd each other  
✅ **Tuned effort per task** — Heavy work gets high effort, quick lookups don't waste it  
✅ **Explicit coordination** — File locks + whiteboard = clear handoffs, no surprises  
✅ **Resumable** — session-state.md persists. Pick up where you left off  
✅ **Parallel speedup** — 3 workers running simultaneously beats sequential  

---

## Setup Checklist

- [x] iTerm2 installed
- [x] `~/.jeeves-launch.sh` created and executable
- [x] Alias `t` added to `~/.zshrc`
- [x] `scripts/start-parallel.sh` created and executable
- [ ] Test: Type `t` in terminal and verify 4 panes open
- [ ] Test: Run `bash scripts/start-parallel.sh "test goal"` and verify `session-state.md` created

---

## Troubleshooting

**iTerm2 not installed?**
Download from https://iterm2.com

**Alias `t` not working?**
Run: `source ~/.zshrc`

**AppleScript error in pane creation?**
Make sure iTerm2 is allowed to run AppleScripts in System Preferences → Security & Privacy.

**Worktrees cleanup stuck?**
Run: `git worktree list` to see all active worktrees, then remove by path.

---

## Future Enhancements

- Sync findings to Claude's memory system (so panes remember findings across sessions)
- Auto-merge worktrees after T1 reviews
- Slack integration (notify on checkpoint/blocker)
- Web dashboard showing live whiteboard state

