# Contribution issues

Audited against [the public tracker](https://github.com/LouisDeconinck/harnessfacts/issues) on 2026-09-08: issues #1–#16 exist and are open. #12, #14 and #15 are implemented; closure notes below are prepared for the maintainer. The others remain genuine gaps, not v0.1.0 blockers. Complex adapter and test work should not be labeled good first issue.

GitHub #17 and #18 are dependency pull requests, **not** Action/example issues. The [Action](../check/README.md) and [package example](../examples/data-consumer) are implemented in this release pass; no artificial replacement issues are needed.

## [1. Verify Claude Code on Linux](https://github.com/LouisDeconinck/harnessfacts/issues/1)

Run all twelve tests with a current authenticated CLI; attach unmodified results and redacted evidence; correct any documented flag drift.

## [2. Verify Gemini CLI on Linux](https://github.com/LouisDeconinck/harnessfacts/issues/2)

Runtime remains unknown. Verify the existing API-key mapping, `--approval-mode yolo`, MCP transports, JSON extraction and skills using suitable existing access. Account eligibility may require enterprise/Cloud or paid API access, but the adapter only forwards `GEMINI_API_KEY`. Do not buy access or spend paid API credits for this task. Antigravity CLI is separate. This task includes adapter/auth diagnosis and is not a good first issue.

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

Run the twelve priority tests and include complete evidence bundles.

## [10. Verify OpenCode on Windows](https://github.com/LouisDeconinck/harnessfacts/issues/10)

Check subprocess lifecycle, paths, configuration, and structured-output extraction.

## [11. Verify Claude Code MCP on macOS](https://github.com/LouisDeconinck/harnessfacts/issues/11)

Run both transports using a documented authentication method; inspect server receipts.

## [12. Implement exit-code semantics test](https://github.com/LouisDeconinck/harnessfacts/issues/12)

Design paired deterministic success/failure invocations; distinguish provider errors from usable process semantics.

**Prepared closure:** `execution.exit-success@1.0.0` checks the success marker and zero exit; `execution.exit-failure@1.0.0` checks that the failure task was reached before judging non-zero exit. Unreached tasks, timeouts and adapter-reported execution errors are ERROR, not task-semantic PASS. Generic-core regression checks cover these paths. Real Linux runs for Codex, OpenCode and Antigravity retain the observed zero-exit failure behavior. See [success](../tests/execution/exit-success/evaluate.ts), [failure](../tests/execution/exit-failure/evaluate.ts) and [observations](initial-observations.md). Scope: process exit signaling, not universal recognition of provider failures after the marker; adapters must report native execution errors. Close as completed once this pass is reviewed.

## [13. Implement hooks execution test](https://github.com/LouisDeconinck/harnessfacts/issues/13)

Use a harmless marker-writing lifecycle hook; map native configurations in adapters only.

## [14. Implement Git worktree-awareness test](https://github.com/LouisDeconinck/harnessfacts/issues/14)

Create a disposable Git repo and linked worktree; verify operation without implying security guarantees.

**Prepared closure:** [worktree setup/evaluator](../tests/git/worktree) create a disposable primary checkout and detached linked worktree. The evaluator requires the worktree token, unchanged primary token and recorded Git root. Generic-core checks and real Linux observations exercise it. This proves only the requested file behavior, not instruction resolution or security isolation. Close as completed.

## [15. Implement repository scope behavior test](https://github.com/LouisDeconinck/harnessfacts/issues/15)

Use benign bounded file edits and temporary sentinels; describe observed behavior without security claims.

**Prepared closure:** [scope setup/evaluator](../tests/git/scope) create a temporary Git repo, nested target, and parent/sibling sentinels. The evaluator requires the target token and preserved sentinel contents; regression checks and real Linux observations exist. This observes selected files, not every possible write or a security boundary. Close as completed.

## [16. Add Windows process-tree cleanup](https://github.com/LouisDeconinck/harnessfacts/issues/16)

Use Job Objects or an equally contained mechanism; verify descendants terminate after a timeout without paid credentials.
