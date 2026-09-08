# Gemini CLI adapter

Invocation follows the [official headless CLI reference](https://geminicli.com/docs/cli/headless/) (consulted 2026-09-08): `--prompt`, JSON output, and `--approval-mode yolo` for noninteractive tool use. MCP is configured through `mcpServers` in the temporary `~/.gemini/settings.json`; skills use the project `.gemini/skills` directory and instructions use `GEMINI.md`.

Platform flags describe intended adapter targets, not verified support. Runs use a temporary home and an explicitly forwarded `GEMINI_API_KEY`; see [security model](../../docs/security-model.md). Unmapped interactions are SKIPPED, not evidence of unsupported capability. The evaluator is shared across agents. This checkout has no `gemini` executable, so it contains no Gemini runtime observations.
