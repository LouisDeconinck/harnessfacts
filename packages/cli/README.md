# HarnessFacts

Tested facts about AI coding agents.

HarnessFacts runs small reproducible conformance tests against coding agents and records what actually happened. No rankings, synthetic scores, or assumption that documentation equals runtime behavior.

## Quick start

Requires Bun 1.3.10+ and Git. Install and authenticate your preferred agent separately.

```sh
bun install --frozen-lockfile
bun run hf doctor
bun run hf tests
bun run hf run codex instructions.nested
bun run hf run opencode --all
bun run hf compare codex opencode
bun run hf show codex --json
bun run validate
bun run build
```

Agent runs may consume an existing subscription or API credits. Project tests and builds need no agent credentials. Fixtures run in temporary directories; **this is not a security sandbox**. Read [the security model](docs/security-model.md).

## Current agents and tests

Five adapters: Claude Code, Codex, Gemini CLI, OpenCode, Aider. Only Codex and OpenCode have been executed in this checkout. Other adapters follow official CLI references and require independent verification. Aider currently maps root instructions and headless execution; other interactions are skipped.

Eight executable tests: root instructions, nested instructions, precedence, headless execution, structured output, MCP stdio, MCP HTTP, and skill discovery. Twelve capabilities are catalogued; hooks, exit semantics, and Git behavior tests are deferred as allowed by the MVP scope. Missing results stay unknown.

Real run JSON and redacted evidence live under `results/`. Repeated runs measure repeatability on the same environment; they do not imply additional agent or platform coverage. Failures and timeouts are retained. See [initial observations](docs/initial-observations.md).

## Data and website

`bun run build` validates evidence, builds the dependency-free JavaScript data package, prepares the Bun CLI distribution, and builds the static Astro website in `apps/web/dist/`.

```ts
import { getAgent, compareAgents, latest } from '@harnessfacts/data';
console.log(getAgent('codex')?.capabilities['instructions.nested'].observed);
console.log(compareAgents(['codex', 'opencode']));
```

Run the website locally with `bun run --cwd apps/web dev` after building data. All comparison data comes from the generated data package. The CLI uses repository data directly. `--json` emits machine-readable output; `--timeout` sets a run's deadline in milliseconds. `HARNESSFACTS_RESULTS_DIR` selects a different local results directory.

## Contribute and roadmap

Read [methodology](docs/methodology.md), [contribution guide](CONTRIBUTING.md), [adding an agent](docs/adding-an-agent.md), and [adding a test](docs/adding-a-test.md). [Sixteen ready-to-file issues](docs/launch-issues.md) cover genuine gaps.

Next: verify the remaining adapters and Windows/macOS, add hooks/worktree/exit-code tests, then consider scheduled runners. OAuth, signed attestations, rankings, databases, and hosted APIs are outside v0.1.

Release steps are in [docs/releasing.md](docs/releasing.md). The public repository is https://github.com/LouisDeconinck/harnessfacts and the website is https://louisdeconinck.github.io/harnessfacts/. GitHub Actions checks and deploys main automatically. npm publication remains a separate release action.
