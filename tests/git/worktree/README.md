# Git worktree awareness

The harness turns the fixture into a primary Git checkout, creates a detached linked worktree at the agent's working directory, and leaves `PRIMARY` in the primary checkout. PASS requires `WORKTREE` in the agent worktree, `PRIMARY` in the primary checkout, and a worktree root ending in `fixture`.

This is an observation of repository context, not a security guarantee.
