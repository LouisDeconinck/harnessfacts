# Initial observations — 2026-09-08

The initial dataset contains **35 real runs: 28 pass, 5 fail, 2 error**. That is 33 completed observations, including failures. These cover two agent versions and one Linux x64 environment, not 35 distinct configurations.

| Agent | Exact version | Pass | Fail | Error |
| --- | --- | ---: | ---: | ---: |
| Codex | 0.153.4 | 12 | 5 | 1 |
| OpenCode | 1.18.29 | 16 | 0 | 1 |

Both agents were available and authenticated on the implementation machine. Claude Code, Gemini CLI, and Aider were not installed and have no fabricated runtime results. Their adapters need community verification.

The first Codex nested-instructions run passed before other adapters were added. Subsequent full suites and a second OpenCode suite checked repeated behavior. Two suites overlapped during initial verification; the timeouts therefore do not establish a standalone performance limitation. No performance ranking is inferred.

Two Codex precedence runs wrote ROOT where the test expected NESTED. OpenCode wrote NESTED in both completed precedence runs. This is evidence of behavior under this exact prompt/configuration, not a universal statement about either product.

Three early Codex MCP runs failed because the fixture tool required approval under noninteractive execution. After the adapter explicitly approved only its harmless get_token tool, both transports passed. Those earlier setup-dependent failures remain in the history. The initial adapter revision was not recorded in result JSON; the logs and this note distinguish that configuration change. Future runs should record adapter revisions before comparing configuration-sensitive behavior over time.

The second OpenCode suite passed all eight tests. One Codex headless run and one OpenCode headless run timed out; other headless attempts passed. Error remains distinct from fail. All records and evidence hashes pass validation. Mocks from project checks are stored only in disposable test directories and never enter this dataset.
