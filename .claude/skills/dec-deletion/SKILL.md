---
name: dec-deletion
description: Reject a DEC in DECISIONS.md — sets its status to Rejected without renumbering or reordering the chain
user_invocable: true
---

# Reject a DEC

Mark a decision as rejected. The DEC stays in place; nothing is renumbered.

## Steps

1. **Identify the DEC.** Accept a DEC code (`DEC-007`) or a free-text
   description to search by title/body. Confirm the match with the user. If
   nothing matches, say so and stop.

2. **Confirm intent.** Show the DEC title and current status and confirm the user
   wants to reject it.

3. **Reject.** Set `Status: Rejected` on that DEC. Do NOT delete the block,
   renumber, reorder, or change any other DEC. Optionally note the reason in the
   `### Context` section if the user gives one.

4. **Regenerate the status board** (the DEC keeps its row, now showing
   `Rejected`).

5. **Confirm:** `DEC-NNN — <title> set to Rejected.`

## Notes

- Numbers are never reused; a later DEC still continues from `max+1`.
- Commit only if asked; Conventional Commit subject, no AI co-author trailer.
