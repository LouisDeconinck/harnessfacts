# Antigravity CLI (`agy`)

Run `bun run hf run antigravity-cli --all` after installing and signing into `agy` interactively. `doctor` detects the executable version; authentication remains unknown until a run succeeds.

The adapter uses the [official headless interface](https://antigravity.google/docs/cli/headless/) (consulted 2026-09-08): `--print`, `--output-format json`, `--print-timeout`, and `--dangerously-skip-permissions`. Automatic approval applies to disposable fixtures; HarnessFacts is not a security sandbox. Structured tests use `--json-schema` and extract only a successful envelope's `structured_output`.

Instructions retain native `AGENTS.md` filenames. Skills are placed in `.agents/skills/hf-token/SKILL.md`. MCP is configured in the temporary home's `.gemini/config/mcp_config.json`: `command`/`args` for stdio and `serverUrl` for HTTP. These mappings follow the [official migration guide](https://antigravity.google/docs/cli/gcli-migration/), the installed CLI's bundled customization documentation, and `agy mcp add --help`.

[Account authentication](https://antigravity.google/docs/cli/install/) uses the operating system keyring. On Linux the adapter forwards only `DBUS_SESSION_BUS_ADDRESS` for Secret Service access, while retaining the temporary home and sanitized environment. It does not copy your settings, conversations, plugins, or credential files. API-key authentication is not mapped by this adapter.

Platform flags describe intended targets; consult run evidence for verified environments. Missing observations remain unknown.

The adapter requires the native JSON envelope to report `SUCCESS` without an error. A native error is returned to the core as an execution error even if the process exit code is zero; the actual exit code is preserved. During the first suite, the precedence run wrote the expected token but reported an interrupted stream. Its classification was corrected from the captured stdout to ERROR without changing evidence bytes.
