# HarnessFacts

The open compatibility test suite for coding agents.

Does your agent follow nested instructions, discover skills, call MCP tools, or behave as expected in Git worktrees and CI? HarnessFacts records deterministic tests with exact versions, environments and inspectable evidence—not subjective scores or rankings. Documentation never counts as runtime evidence.

**Inspect compatibility:** [browse agents, tests and runs](https://louisdeconinck.github.io/harnessfacts/) or query the data package. **Contribute:** [run one test with an existing agent and submit its evidence](docs/contributing.md); no core-code changes required.

## Use the v0.1.0 packages

These commands become available **after npm publication**:

```sh
npm install @harnessfacts/data@0.1.0
# CLI requires Bun 1.3.10+ and Git:
bun add --global harnessfacts@0.1.0
harnessfacts tests
harnessfacts doctor
```

```ts
import { getAgent, getCapability, getObservations, latestObservation } from '@harnessfacts/data';
console.log(getAgent('codex')?.name);
console.log(getCapability('instructions.nested'));
const query = { agent: 'codex', capability: 'instructions.nested', platform: 'linux' };
console.log(getObservations(query));
console.log(latestObservation(query));
```

[Copyable Node/TypeScript project](examples/data-consumer). The data package contains the public snapshot; CLI `show`/`compare` read local results.

## Check assumptions in CI

After the release tag is published:

```yaml
- uses: LouisDeconinck/harnessfacts/check@v0.1.0
  with:
    agent: codex
    version: '0.153.4'
    platform: linux
    require: |
      instructions.root
      mcp.stdio
```

This asserts the release's dataset, **not your repository's runtime**. It uses one version/environment for every requirement; only `PASS` succeeds. `UNKNOWN` remains distinct from `FAIL`. [Selection rules](check/README.md) · [Complete workflow](examples/compatibility.yml).

## Current coverage

Twelve executable tests cover root/nested/precedence instructions, skills, MCP stdio/HTTP, headless/structured execution, paired exit semantics, Git worktrees and bounded repository edits. The 73 real runs include Codex, OpenCode and Antigravity CLI (`agy`) on Linux only. This is evidence for recorded configurations, not universal support.

Claude Code, Gemini CLI and Aider adapters remain runtime **unknown**; Copilot CLI is planned/documented, not verified. Gemini CLI and Antigravity CLI are independent adapters. Hooks remain deferred. All failures, errors and historical runs are retained. [Initial observations](docs/initial-observations.md) · [Methodology](docs/methodology.md).

## Contribute one observation

```sh
git clone https://github.com/LouisDeconinck/harnessfacts.git
cd harnessfacts
bun install --frozen-lockfile
# Install/authenticate your existing agent before continuing.
bun run hf doctor
bun run hf run codex instructions.nested
# Inspect the printed JSON path and its entire evidence directory.
bun run validate
```

One test on one agent/version/OS is useful. Agent runs may consume subscriptions or API credits; project checks are credential-free. Temporary fixtures are **not a security sandbox**. [Contribution workflow](docs/contributing.md) · [Security model](docs/security-model.md) · [Real tracker opportunities](docs/launch-issues.md).

[Release checklist](docs/releasing.md) · [v0.1.0 notes](docs/releases/v0.1.0.md) · Apache-2.0
