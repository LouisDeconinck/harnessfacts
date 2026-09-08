# Contribute a fact

One agent, one test, or one environment is enough to make a useful contribution.

## Contribute a result

1. Clone the repository and install dependencies with `bun install --frozen-lockfile`.
2. Install and authenticate the coding agent you want to test. Read the security model in the repository.
3. Run `bun run hf doctor` and `bun run hf run codex instructions.nested` (substitute your agent/test).
4. Inspect the generated JSON, stdout, stderr, and artifacts. Keep failures and errors; do not rewrite them as passes.
5. Run `bun run validate` and include the result JSON and its entire evidence directory in your pull request. Explain the environment and any adapter changes.

The harness records the exact versions, platform, date, hashes, and community provenance. Never commit secrets. A redaction change requires regenerating the matching evidence hash; disclose it for review.

## Add an agent or test

Adapters live under `adapters/<id>/` and own invocation and native configuration. Tests live under `tests/<category>/<name>/` and own deterministic expectations. Neither should duplicate the other's responsibility. Optional `authors: [{ github: your-handle }]` metadata appears on generated pages.

Start with the repository's [adding an agent guide](https://github.com/LouisDeconinck/harnessfacts/blob/main/docs/adding-an-agent.md) or [adding a test guide](https://github.com/LouisDeconinck/harnessfacts/blob/main/docs/adding-a-test.md). The [launch issue list](https://github.com/LouisDeconinck/harnessfacts/blob/main/docs/launch-issues.md) has concrete opportunities.

## Check your change

```sh
bun run lint
bun run typecheck
bun test
bun run validate
bun run build
```

Project checks do not execute paid coding agents. Never add an actual agent run to ordinary pull-request CI. Explain semantic test changes and increment the test version. Reviews should consider methodology and evidence, not just a green status.

## Community

Be kind, specific, and honest about uncertainty. Attribution belongs to the people who did the work. Contributions are licensed under Apache-2.0. See CONTRIBUTING.md, CODE_OF_CONDUCT.md, and SECURITY.md in the source repository.
