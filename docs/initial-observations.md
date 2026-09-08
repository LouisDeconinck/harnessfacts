# Initial observations — 2026-09-08

The local dataset contains **73 real runs: 62 pass, 8 fail, 3 error**. That is 70 completed observations, including failures. These cover three agent versions and one Linux x64 environment, not 73 distinct configurations.

| Agent | Exact version | Pass | Fail | Error |
| --- | --- | ---: | ---: | ---: |
| Codex | 0.153.4 | 23 | 6 | 1 |
| OpenCode | 1.18.29 | 27 | 1 | 1 |
| Antigravity CLI | 1.1.27 | 12 | 1 | 1 |

Codex was available and authenticated; OpenCode ran successfully but its adapter authentication check remains unknown. Claude Code, Gemini CLI, and Aider were not installed and have no fabricated runtime results. Their adapters need community verification.

The first Codex nested-instructions run passed before other adapters were added. Subsequent full suites and a second OpenCode suite checked repeated behavior. Two suites overlapped during initial verification; the timeouts therefore do not establish a standalone performance limitation. No performance ranking is inferred.

Two Codex precedence runs wrote ROOT where the test expected NESTED. OpenCode wrote NESTED in both completed precedence runs. This is evidence of behavior under this exact prompt/configuration, not a universal statement about either product.

Three early Codex MCP runs failed because the fixture tool required approval under noninteractive execution. After the adapter explicitly approved only its harmless get_token tool, both transports passed. Those earlier setup-dependent failures remain in the history. The initial adapter revision was not recorded in result JSON; the logs and this note distinguish that configuration change. Future runs should record adapter revisions before comparing configuration-sensitive behavior over time.

The latest real suites exercised twelve tests per agent. Both agents passed the success, worktree, scope, instruction, MCP, skill, headless, and structured-output tests. Both reached the deterministic failure script but returned process exit code `0`, so those two results are recorded as FAIL. Earlier headless timeouts remain errors, distinct from task failures. All records and evidence hashes pass validation. Mocks from project checks are stored only in disposable test directories and never enter this dataset.

Antigravity CLI was subsequently added as `antigravity-cli`, using installed `agy` 1.1.27 and native OS keyring authentication with temporary homes. Its 14 runs comprise an initial headless check, the twelve-test suite, and a precedence retry. All eleven tests other than failure-exit semantics have a passing observation. The failure script was reached, but both the process exit (`0`) and native envelope (`SUCCESS`) reported success.

The first Antigravity precedence attempt wrote the expected token but its JSON envelope reported `ERROR` and an interrupted stream despite process exit `0`. Evidence review corrected that classification to ERROR without altering stdout, stderr, artifacts, or their hashes. The adapter now surfaces native execution errors to the core; the retry reported SUCCESS and passed. This history is retained. No model was explicitly selected, and the JSON envelopes do not expose the default model identifier.
