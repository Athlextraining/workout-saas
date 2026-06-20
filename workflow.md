# Workflow — the DEC chain

This repo tracks decisions and the work they spawn in a **DEC chain**. If you are
a collaborator, this is how you propose, own, and close work.

## What is a DEC?

A **DEC** (Decision) is one numbered record in `DECISIONS.md` that captures:

- **why** a choice was made (`Context`),
- **what** will be done (`Decision`),
- a **checklist** of related tasks (`Tasks`),
- **who owns it** (`Assignee`, a single `@handle`),
- **where it stands** (`Status`).

Codes are `DEC-001`, `DEC-002`, … — zero-padded, sequential, **never reused or
renumbered**. One DEC = one number = one owner = one status, holding one or more
related tasks.

## The files

| File | Purpose |
|------|---------|
| `DECISIONS.md` | The chain: a status board on top, one detailed block per DEC below. |
| `contributors.md` | The list of valid assignees (`@handle`, name, role). Add yourself before taking a DEC. |

Manage both with the skills below — **don't hand-edit** `DECISIONS.md`, so the
status board stays in sync.

## Statuses

`Pending` → `In Progress` → `Done` are the normal path.
`Blocked` = waiting on another DEC or external thing.
`Rejected` = cancelled (via `/dec-deletion`).
`Superseded` = replaced by a newer, contradicting DEC.

## The skills

| Command | Use it to |
|---------|-----------|
| `/dec-creation` | Propose a new DEC. It scans active DECs for contradictions first; if it finds one, it asks whether to supersede the old DEC (which then links to the new one). Assigns the next number, sets `Pending`, and offers to create the `dec-NNN-slug` branch. |
| `/dec-amend` | Change an existing DEC — find it by code or description, then edit fields, tasks, status, or assignee. |
| `/dec-deletion` | Reject a DEC. Sets `Status: Rejected` in place; never renumbers the chain. |
| `/dec-close` | Close a DEC once its work merged to `main`. Reads the `dec-NNN` branch, marks it `Done`, records the merge commit. |

## End-to-end flow

1. **Propose.** Run `/dec-creation`, describe the decision/work, pick an assignee
   (must be in `contributors.md`). Accept the offered `dec-NNN-slug` branch.
2. **Work.** On that branch, do the tasks. Use `/dec-amend` to set
   `In Progress`, tick tasks, or adjust scope as you go.
3. **Review & merge.** Open a PR, get it reviewed, merge to `main`.
4. **Close.** Run `/dec-close` — it marks the DEC `Done` and stamps the merge
   commit.

## Rules of thumb

- Add yourself to `contributors.md` before you can be assigned a DEC.
- One owner per DEC. Split unrelated work into separate DECs.
- Never edit a DEC's number, and never renumber the chain.
- Changed your mind about an old decision? Don't delete it — create a new DEC and
  let it supersede the old one, preserving the history of why.
- Commits follow Conventional Commits, subject only, no AI co-author trailer
  (see `AGENTS.md`).
