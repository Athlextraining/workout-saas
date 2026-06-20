---
name: dec-close
description: Close a DEC on merge to main — resolves the DEC from the dec-NNN branch convention, marks it Done, and records the merge commit
user_invocable: true
---

# Close a DEC

Mark a decision Done once its work has merged to `main`.

## Steps

1. **Resolve the DEC.** Read the current git branch (`git rev-parse
   --abbrev-ref HEAD`).
   - If it matches `dec-NNN-*`, that is the DEC.
   - If it is `main`, inspect the most recent merge commit
     (`git log --merges -1 --pretty=%s`) for a `dec-NNN` reference and use it.
   - If still ambiguous, ask the user for the DEC code.

2. **Verify the merge.** Confirm the DEC's branch is merged into `main`
   (`git branch --merged main` lists it, or the merge commit is on `main`). If it
   is not merged yet, warn the user and ask whether to continue anyway.

3. **Open tasks.** If the DEC has unchecked `- [ ]` tasks, list them and ask
   whether to tick them all or leave them. Tick them only with the user's OK.

4. **Close.** Set `Status: Done`. Append a note line under the metadata, e.g.
   `- Merged: <short-sha> on YYYY-MM-DD`, using the merge commit hash and date.

5. **Regenerate the status board** so the DEC shows `Done`.

6. **Confirm:** `DEC-NNN — <title> closed (Done), merged <short-sha>.`

## Notes

- Do not renumber or reorder.
- Commit only if asked; Conventional Commit subject, no AI co-author trailer.
