---
name: dec-creation
description: Create a new DEC (Decision) in DECISIONS.md, checking active DECs for contradictions before adding
user_invocable: true
---

# Create a DEC

Add a new numbered decision to `DECISIONS.md` at the repo root.

## Steps

1. **Preconditions.** Confirm `DECISIONS.md` and `contributors.md` exist at the
   repo root. If either is missing, stop and tell the user to create them first.

2. **Read the request.** Take the decision/work to record from the user's prompt.
   If the prompt is empty, ask the user what the decision is.

3. **Parse the chain.** Read every `## DEC-NNN — …` block in `DECISIONS.md`.
   Compute the next code: `DEC-` + zero-padded (`max(all NNN) + 1`), counting
   every DEC including `Rejected` and `Superseded`. Never reuse a number.

4. **Contradiction scan.** Consider only DECs whose `Status` is NOT `Rejected`
   and NOT `Superseded`. Decide, by reading their `### Decision` sections,
   whether the new request directly contradicts any of them. This is a
   best-effort semantic judgement — surface it, never enforce it silently.

5. **Resolve a contradiction (if any).** Ask the user:
   *"This contradicts DEC-NNN (\<title\>). Supersede it?"*
   - If **no**: stop. Create nothing. Tell the user no DEC was added.
   - If **yes**: on the OLD DEC set `Status: Superseded` and
     `Superseded by: DEC-<new>`; on the NEW DEC set `Supersedes: DEC-<old>`.

6. **Assignee.** Ask who owns it. Validate the `@handle` against the first column
   of the `contributors.md` table. `Unassigned` is allowed. If the handle is not
   listed, offer to add a row to `contributors.md` or pick again.

7. **Body.** Collect `Context` (why), `Decision` (what), and a `Tasks` checklist
   (one or more related tasks). Ask for anything missing.

8. **Branch + date.** Slugify the title to `dec-NNN-slug`; set that as `Branch`.
   Set `Created` to today's date (`YYYY-MM-DD`).

9. **Write.** Append the new DEC block after the last DEC, using this exact shape:

   ```
   ## DEC-NNN — Title

   - Status: Pending
   - Assignee: @handle
   - Created: YYYY-MM-DD
   - Branch: dec-NNN-slug
   - Supersedes: —
   - Superseded by: —
   - Related: —

   ### Context

   …

   ### Decision

   …

   ### Tasks

   - [ ] First task
   ```

   Then regenerate the `## Status board` table: one row per DEC in numeric order,
   columns `| DEC | Title | Status | Assignee |`, including Rejected/Superseded.

10. **Offer the branch.** Ask the user whether to create the git branch now:
    `git checkout -b dec-NNN-slug`. Only run it if they agree.

11. **Confirm.** Report: `Created DEC-NNN — <title>. Status Pending, assignee @x.`
    If a DEC was superseded, mention it.

## Notes

- Do not renumber or reorder existing DECs.
- Commit is the user's call; if asked, use a Conventional Commit subject with no
  AI co-author trailer (see AGENTS.md).
