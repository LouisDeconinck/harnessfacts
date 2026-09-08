# Codex adapter

Uses `codex exec` with workspace-write, an isolated CODEX_HOME, ephemeral execution, and no inherited user config or execpolicy rules. Copies only auth.json from the existing CODEX_HOME. Current flags verified with Codex 0.153.4 local help. MCP configuration follows https://developers.openai.com/codex/mcp/. A run may use your existing subscription. No other local config is copied.
