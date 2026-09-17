# Agent Work Assignments — Real-Time Coordination

**Purpose:** Prevent file conflicts and duplicate work between multiple Claude instances  
**Last Updated:** 2026-09-16  
**Active Branch:** `claude/keen-gates-663i5d` (PR #21)  

---

## Current Assignments

| Agent | Files/Areas | Task | Status | Start | Notes |
|-------|----------|------|--------|-------|-------|
| Claude (Main) | [TBD] | [TBD] | Ready | TBD | Reviewing & merging Friend Claude's PRs |
| Claude-Friend | [TBD] | [TBD] | Ready | TBD | Add assignment BEFORE starting work |
| ChatGPT | [TBD] | [TBD] | Ready | TBD | Strategy/ideation only, no direct code |

---

## Before You Start

**IMPORTANT: Fill this table BEFORE touching any files**

### Step 1: Identify Your Files
List the specific files/directories you will touch:
```
backend/src/routes/[area]/
frontend/src/services/[client].js
backend/src/services/[service].js
.ai/
```

### Step 2: Check for Conflicts
```bash
# See what others are working on
cat .ai/tasks/AGENT_ASSIGNMENTS.md

# Look for overlaps with your list
# If there's overlap, pick different files
```

### Step 3: Add Your Assignment
```bash
# Add yourself to the table above
# Commit this file
git add .ai/tasks/AGENT_ASSIGNMENTS.md
git commit -m "docs: assignment - [who] working on [files]"
git push origin feature/claude-friend-work
```

### Step 4: Work Without Conflicts
Now you know:
- ✅ No one else is touching your files
- ✅ You won't conflict with active work
- ✅ Others know what you're doing

---

## Assignment Rules

**DO:**
- ✅ Add assignment BEFORE starting work
- ✅ Be specific about files/directories
- ✅ Check for overlaps with existing assignments
- ✅ Update status as you work (In Progress → Done)
- ✅ Remove assignment when done

**DON'T:**
- ❌ Work on files not listed in your assignment
- ❌ Touch another agent's files without asking
- ❌ Work on the same area as someone else
- ❌ Commit changes to files outside your assignment

---

## Example Assignment Entry

```markdown
| Claude-Friend | backend/src/routes/marketIntelligence/ <br/> frontend/src/services/marketIntelligenceAPI.js | Wire market intelligence service and API client | In Progress | 2026-09-16 14:30 | Branch: feature/claude-friend-work. Do not touch: index.js route mounting (handled by Main Claude). Blocked by: Nothing |
```

---

## Status Values

- **Ready** — Ready to start
- **In Progress** — Currently working
- **Blocked** — Waiting on something
- **Done** — Work complete, awaiting review/merge
- **Merged** — Merged to claude/keen-gates-663i5d

---

## How to Update

**When you start work:**
```bash
git fetch origin claude/keen-gates-663i5d
git checkout feature/claude-friend-work
# Edit .ai/tasks/AGENT_ASSIGNMENTS.md
# Add your row with status: In Progress
git add .ai/tasks/AGENT_ASSIGNMENTS.md
git commit -m "docs: assignment - [name] starting work on [area]"
git push origin feature/claude-friend-work
```

**When you finish work:**
```bash
# Edit .ai/tasks/AGENT_ASSIGNMENTS.md
# Change your status to: Done
git add .ai/tasks/AGENT_ASSIGNMENTS.md
git commit -m "docs: assignment - [name] completed work on [area]"
git push origin feature/claude-friend-work
```

---

## Conflict Resolution

**If assignments overlap:**

1. **Check who started first**
   - Look at timestamp in table
   - Earlier assignment has priority

2. **Negotiate scope**
   - Split the area differently
   - One agent takes 50%, other takes 50%
   - Document in "Notes" column

3. **Example:**
   ```markdown
   | Claude-A | backend/src/routes/auth/ | Implement auth routes | In Progress | 2026-09-16 10:00 | Taking: login/register |
   | Claude-B | backend/src/routes/auth/ | Implement auth routes | In Progress | 2026-09-16 11:00 | Taking: MFA/2FA only. Coordinate with Claude-A |
   ```

---

## Known Files Already In Progress

From `.ai/tasks/2026-09-15-nextgen-vision-todo.md`:

### Already Fixed (Do NOT re-touch)
- ✅ `backend/src/services/__tests__/weatherAdvisoryService.test.js` — tests created
- ✅ `backend/src/services/aiService/__tests__/creditRisk.js` — fabrication removed
- ✅ 42 real services mounted in `backend/src/index.js`
- ✅ 76 files: logger export destructuring fixed
- ✅ Frontend build: UI primitives restored
- ✅ CI/CD: cache-dependency-path fixed

### In Active Development
- ⚠️ `backend/src/index.js` — route mounting (may be touched by Main Claude)
- ⚠️ `frontend/src/services/api.js` — API client methods (may be touched by Main Claude)
- ⚠️ `.ai/tasks/` — documentation (actively maintained)

### Still To Do
- 127 API client mismatches remaining (see `.ai/tasks/2026-09-15-nextgen-vision-todo.md`)
- PostgreSQL database startup
- Payment system integration
- Notification system wiring

---

## Communication

When you need to coordinate:

1. **In commit message:**
   ```bash
   git commit -m "fix(area): work description
   
   Note: Coordinates with [other agent] on [area]
   Assignment: See .ai/tasks/AGENT_ASSIGNMENTS.md"
   ```

2. **In this file:**
   ```markdown
   | Agent | Files | Task | Notes |
   | ... | ... | ... | Waiting for Agent-X to finish [area], will merge then |
   ```

3. **In handoff:**
   ```bash
   # Create .ai/handoffs/SESSION_[timestamp].md
   # Include: "Do not re-touch: [list areas already handled by others]"
   ```

---

## Quick Checklist Before Starting

- [ ] Read `.ai/tasks/2026-09-15-nextgen-vision-todo.md` to see what's already done
- [ ] Read `.ai/tasks/AGENT_ASSIGNMENTS.md` to see current assignments
- [ ] Identify YOUR specific files/areas
- [ ] Check for overlaps with others' assignments
- [ ] Add yourself to assignments table
- [ ] Commit the update
- [ ] Start work

---

**Remember:** One agent per area. No overlaps. Update the table. Coordinate before starting.

This prevents: conflicts, duplicate work, merge disasters, and wasted time. ✅
