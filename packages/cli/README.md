# harnessfacts

The open compatibility test suite for coding agents. Runs tiny deterministic fixtures and records exact versions, environments, outcomes and hashed evidence. No scores or rankings.

Requires Bun 1.3.10+ and Git. After v0.1.0 publication:

```sh
bun add --global harnessfacts@0.1.0
harnessfacts tests
harnessfacts doctor
# Install and authenticate your agent separately before running a fixture:
harnessfacts run codex instructions.nested
harnessfacts show codex --json
harnessfacts validate
```

The package ships its adapters and fixtures. `show`, `compare` and `validate` read **your local results**, not the public snapshot; use [@harnessfacts/data](https://www.npmjs.com/package/@harnessfacts/data) or the [website](https://louisdeconinck.github.io/harnessfacts/) to inspect published observations. Runs write to `./results/` (override with `HARNESSFACTS_RESULTS_DIR`). `--all` runs all tests for one agent; `--timeout` is milliseconds.

Authenticate an existing agent at your own discretion; executions can consume subscriptions or API credits. Project checks need no model credentials. Fixtures run in temporary directories and homes, **not a security sandbox**. Review all result JSON and evidence before sharing; failures and errors are useful too.

[Contribute one observation](https://github.com/LouisDeconinck/harnessfacts/blob/v0.1.0/docs/contributing.md) · [Security model](https://github.com/LouisDeconinck/harnessfacts/blob/v0.1.0/docs/security-model.md) · [Methodology](https://github.com/LouisDeconinck/harnessfacts/blob/v0.1.0/docs/methodology.md)

Apache-2.0 licensed. v0.1.0 is a release candidate until published.
