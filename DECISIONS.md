# Decisions (DEC chain)

This file records project decisions and the work they spawn. Each **DEC** is one
numbered record with a single owner and a status. Manage it with the skills
`/dec-creation`, `/dec-amend`, `/dec-deletion`, `/dec-close` — avoid editing by
hand so the status board stays consistent.

**Statuses:** `Pending` · `In Progress` · `Blocked` · `Done` · `Rejected` · `Superseded`

**Rules:** codes are zero-padded and never reused or renumbered; assignee is a
single `@handle` from `contributors.md` (or `Unassigned`); a contradicting new
DEC supersedes the old one (bidirectional link).

## Status board

| DEC     | Title                  | Status | Assignee |
|---------|------------------------|--------|----------|
| DEC-001 | Adopt the DEC chain    | Done   | @patri   |

---

## DEC-001 — Adopt the DEC chain

- Status: Done
- Assignee: @patri
- Created: 2026-06-20
- Branch: —
- Supersedes: —
- Superseded by: —
- Related: —

### Context

The repository is opening to outside collaborators and needs a lightweight,
git-native way to record decisions, track their status, and assign ownership.

### Decision

Adopt a single-file DEC chain (`DECISIONS.md`) plus a `contributors.md` table and
four management skills. See `docs/superpowers/specs/2026-06-20-dec-chain-design.md`.

### Tasks

- [x] Define the on-disk format
- [x] Seed the contributors table
- [x] Provide the management skills
