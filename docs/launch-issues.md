# Contribution issues

These issues are published in [the public issue tracker](https://github.com/LouisDeconinck/harnessfacts/issues). Each covers a substantive gap and has relevant project labels. Platform verification tasks are marked good first issue.

## [1. Verify Claude Code on Linux](https://github.com/LouisDeconinck/harnessfacts/issues/1)

Run all eight tests with a current authenticated CLI; attach unmodified results and redacted evidence; correct any documented flag drift.

## [2. Verify Gemini CLI on Linux](https://github.com/LouisDeconinck/harnessfacts/issues/2)

Exercise API-key authentication, auto_edit, both MCP transports, JSON response extraction, and repository skills.

## [3. Verify Aider root configuration](https://github.com/LouisDeconinck/harnessfacts/issues/3)

Confirm native read configuration and headless writing with an authenticated provider; document any mapping differences.

## [4. Add Cline adapter](https://github.com/LouisDeconinck/harnessfacts/issues/4)

Investigate supported executable automation, implement only practical interaction mappings, and leave GUI-only cases unknown.

## [5. Add Roo Code adapter](https://github.com/LouisDeconinck/harnessfacts/issues/5)

Determine supported headless integration; provide a documented adapter and first real result.

## [6. Add Copilot CLI adapter](https://github.com/LouisDeconinck/harnessfacts/issues/6)

Verify current official invocation and authentication, implement contract, and run nested instructions.

## [7. Add Cursor manual metadata](https://github.com/LouisDeconinck/harnessfacts/issues/7)

Document current practical automation options; keep manual documentation separate from observed harness results.

## [8. Verify Codex on Windows](https://github.com/LouisDeconinck/harnessfacts/issues/8)

Run nested, root, precedence, and headless tests; record exact Windows and CLI versions.

## [9. Verify Codex on macOS](https://github.com/LouisDeconinck/harnessfacts/issues/9)

Run the eight priority tests and include complete evidence bundles.

## [10. Verify OpenCode on Windows](https://github.com/LouisDeconinck/harnessfacts/issues/10)

Check subprocess lifecycle, paths, configuration, and structured-output extraction.

## [11. Verify Claude Code MCP on macOS](https://github.com/LouisDeconinck/harnessfacts/issues/11)

Run both transports using a documented authentication method; inspect server receipts.

## [12. Implement exit-code semantics test](https://github.com/LouisDeconinck/harnessfacts/issues/12)

Design paired deterministic success/failure invocations; distinguish provider errors from usable process semantics.

## [13. Implement hooks execution test](https://github.com/LouisDeconinck/harnessfacts/issues/13)

Use a harmless marker-writing lifecycle hook; map native configurations in adapters only.

## [14. Implement Git worktree-awareness test](https://github.com/LouisDeconinck/harnessfacts/issues/14)

Create a disposable Git repo and linked worktree; verify operation without implying security guarantees.

## [15. Implement repository scope behavior test](https://github.com/LouisDeconinck/harnessfacts/issues/15)

Use benign bounded file edits and temporary sentinels; describe observed behavior without security claims.

## [16. Add Windows process-tree cleanup](https://github.com/LouisDeconinck/harnessfacts/issues/16)

Use Job Objects or an equally contained mechanism; verify descendants terminate after a timeout without paid credentials.
