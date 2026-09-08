# Result model

Canonical schemas and TypeScript types live in `packages/schema/src/index.ts`. JSON and YAML documents carry a `harnessfacts.<format>/v1` identifier; tests and adapters also have semantic or detected product versions. Fixtures and logs are evidence bytes, not versioned configuration formats.

A `harnessfacts.run/v1` record has `runId`, `agent`, `test`, `environment`, `execution`, `result`, `evidence`, and `provenance`. Status is one of pass, fail, error, skipped, unsupported. No boolean substitutes for these distinctions.

Results are stored at `results/<agent>/<version>/<os>-<arch>/<test>/<runId>.json`. The sibling `<runId>/` directory contains stdout.txt, stderr.txt, and artifacts/. UUIDs preserve repeated runs. Timestamps remain in JSON. Hashes cover the redacted evidence bytes. Validation checks references, duplicates, schema versions, paths, and evidence integrity.

Documentation claims are stored separately under claims/ and never become RunResult objects. The generated `harnessfacts.data/v1` snapshot contains agents, capabilities, tests, claims, and complete run history. `latestResults()` keeps the latest attempt per full environment and exact agent/test version. Capability summaries separately select the latest completed observation. An error is not a failure of the capability.

Use `bun run hf show codex --json` for full context or `packages/data/dist/data.json` for the built snapshot. Never hand-edit result statuses or hashes to make a run pass.
