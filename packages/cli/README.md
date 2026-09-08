# HarnessFacts

The open compatibility test suite for coding agents.

Reproducible tests for instructions, skills, MCP, Git, hooks, CI, and other agent behavior across Codex, Antigravity CLI, OpenCode, and other coding agents.

HarnessFacts records evidence-backed observations from exact agent versions and environments. Documentation is stored separately and never counts as runtime evidence. There are no subjective scores or rankings.

## Quick start

Requires Bun 1.3.10+ and Git. Install and authenticate your preferred agent separately.

```sh
bun install --frozen-lockfile
bun run hf doctor
bun run hf tests
bun run hf run codex instructions.nested
bun run hf run antigravity-cli --all
bun run hf run opencode --all
bun run hf compare codex opencode
bun run hf show codex --json
bun run validate
bun run build
```

Agent runs may consume an existing subscription or API credits. Project tests and builds need no agent credentials. Fixtures run in temporary directories; **this is not a security sandbox**. Read [the security model](docs/security-model.md).

## Current agents and tests

The adapter catalog includes Antigravity CLI (`agy`), Claude Code, Codex, Gemini CLI, OpenCode, and Aider. Antigravity CLI, Codex, and OpenCode have real Linux observations. Gemini CLI remains a separate, unverified adapter; its executable is unavailable in this environment. Verification refers to recorded tests and versions, not every listed capability.

| Agent | Adapter | Runtime verified | Platforms |
| --- | --- | --- | --- |
| Codex | yes | yes | Linux |
| Antigravity CLI (`agy`) | yes | yes | Linux |
| Gemini CLI | yes | no | — |
| OpenCode | yes | yes | Linux |
| Claude Code | yes/partial | no | — |
| Copilot CLI | planned/documented | no | — |
| Aider | partial | no | — |

Twelve executable tests cover root/nested/precedence instructions, headless and structured execution, exit semantics, MCP stdio/HTTP, skill discovery, Git worktrees, and repository scope. Hooks remain deferred until a supported agent exposes a deterministic noninteractive lifecycle configuration. Missing results stay unknown.

Real run JSON and redacted evidence live under `results/`. Repeated runs measure repeatability on the same environment; they do not imply additional agent or platform coverage. Failures and timeouts are retained. See [initial observations](docs/initial-observations.md).

## Data and website

`bun run build` validates evidence, builds the dependency-free JavaScript data package, prepares the Bun CLI distribution, and builds the static Astro website in `apps/web/dist/`.

```ts
import { getAgent, getObservations, latestObservation } from '@harnessfacts/data';
console.log(getAgent('codex')?.capabilities['instructions.nested'].observed);
console.log(getObservations({ agent: 'codex', platform: 'linux' }));
console.log(latestObservation({ agent: 'codex', capability: 'instructions.nested' }));
```

Run the website locally with `bun run --cwd apps/web dev` after building data. All comparison data comes from the generated data package. The CLI uses repository data directly. `--json` emits machine-readable output; `--timeout` sets a run's deadline in milliseconds. `HARNESSFACTS_RESULTS_DIR` selects a different local results directory.

## Contribute and roadmap

Read [methodology](docs/methodology.md), [contribution guide](CONTRIBUTING.md), [adding an agent](docs/adding-an-agent.md), and [adding a test](docs/adding-a-test.md). [Eighteen contribution issues](docs/launch-issues.md) cover genuine gaps.

Next: expand Antigravity CLI, Codex, and OpenCode coverage to Windows/macOS, verify the remaining adapters, and add hooks where a real supported mechanism can be tested. OAuth, signed attestations, rankings, databases, and hosted APIs are outside v0.1.

Release steps are in [docs/releasing.md](docs/releasing.md). The public repository is https://github.com/LouisDeconinck/harnessfacts and the website is https://louisdeconinck.github.io/harnessfacts/. GitHub Actions checks and deploys main automatically. npm publication remains a separate release action.
