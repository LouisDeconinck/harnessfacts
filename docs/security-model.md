# Security model

HarnessFacts executes coding agents that can run commands, edit files, and contact their model provider. **A temporary directory is not a sandbox.** Do not run untrusted adapters or fixtures on a machine with valuable accessible data. OS-level isolation and untrusted-code certification are outside v0.1.

## Execution setup

Fixtures are copied to fresh OS temporary directories; the source checkout is never supplied as the agent's working directory. Each run has an isolated HOME, configuration/data/cache directories, and temporary directory. Only PATH, OS process-launch essentials, locale, and explicitly selected provider credentials are inherited. User agent configuration is not copied.

Codex copies only its auth.json into a temporary CODEX_HOME and uses workspace-write; the fixture's get_token MCP tool is explicitly approved, without changing user settings. Claude Code accepts edits and allowlists fixture tools; Gemini uses auto_edit; OpenCode allows local edits/bash and denies external-directory access. These controls are product settings, not independent containment. Aider operates without Git commits. Run only trusted fixtures.

Credential forwarding: Codex uses its login file and OPENAI_API_KEY; Claude uses its credential file, ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN; Gemini currently uses GEMINI_API_KEY; OpenCode uses its auth file or OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY; Aider uses OPENAI_API_KEY or ANTHROPIC_API_KEY. Temporary credential copies are removed after completion. Authentication files may contain refreshable sessions: use disposable runner accounts where possible. Hard termination of the entire harness may leave a temporary directory; remove abandoned harnessfacts-* directories after confirming no active runs own them.

## Evidence and limits

The process runner closes stdin, sets an explicit cwd, captures bounded output, and kills the process group on timeout on POSIX. Windows uses the direct process kill; descendant containment needs a Windows Job Object or container before stronger claims. Artifacts must resolve inside the fixture and must be regular bounded files. Only evaluator-requested artifacts and harness receipts are saved, never a recursive copy of the agent home.

Known environment secret values and common token formats are redacted before evidence is hashed. Redaction is best effort, not a promise that arbitrary agent output cannot contain private data. Review logs before sharing. No HarnessFacts telemetry or credential-dependent project CI is present. Agent vendors' own network and telemetry behavior remains governed by those products.

MCP HTTP binds only 127.0.0.1, uses an unpredictable per-run endpoint, validates Origin, limits request bodies, and shuts down after the run. It exposes only a random token. Non-MCP fixtures do not ask for network operations; model-provider traffic is still necessary. Stdio MCP uses the same tiny server and receipt format. Neither test attempts OAuth or validates general protocol compliance.
