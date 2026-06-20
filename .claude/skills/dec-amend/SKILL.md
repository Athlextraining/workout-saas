---
name: dec-amend
description: Amend an existing DEC in DECISIONS.md — find it by code or description, then edit its fields, tasks, status, or assignee
user_invocable: true
---

# Amend a DEC

Edit an existing decision in `DECISIONS.md`.

## Steps

1. **Identify the DEC.** Accept either a DEC code (`DEC-007`) or a free-text
   description. If given a description, search `DECISIONS.md` by title and
   `### Context`/`### Decision` text and confirm the match with the user before
   editing. If nothing matches, say so and stop.

2. **Ask what to change.** Any of: `Context`, `Decision`, the `Tasks` checklist
   (add / edit / tick / untick), `Status` (one of the six), `Assignee`,
   `Related`, or the title. Make exactly the edits the user asks for.

3. **Validate.** If `Status` changes, it must be one of `Pending`, `In Progress`,
   `Blocked`, `Done`, `Rejected`, `Superseded`. If `Assignee` changes, validate
   the `@handle` against `contributors.md` (or `Unassigned`).

4. **Regenerate the status board** so any title/status/assignee change is
   reflected in the top table.

5. **Confirm** the fields that changed.

## Notes

- Do not change the DEC code, and do not renumber or reorder.
- To reject a DEC, prefer the `/dec-deletion` skill. To close one on merge,
  prefer `/dec-close`.
- Commit only if asked; Conventional Commit subject, no AI co-author trailer.
