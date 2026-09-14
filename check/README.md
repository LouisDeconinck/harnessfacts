# Compatibility dataset assertion

After the v0.1.0 tag is published:

```yaml
- uses: LouisDeconinck/harnessfacts/check@v0.1.0
  with:
    agent: codex
    version: '0.153.4' # optional exact version; no ranges
    platform: linux
    require: |
      instructions.root
      mcp.stdio
```

This checks the **dataset shipped at the Action's Git revision**, not the agent in your repository. It never launches an agent, reads credentials, fetches a newer dataset, or installs dependencies. The runner needs Node 20+ and Bash (available on GitHub-hosted Ubuntu runners). No checkout step is needed. Pin the release commit SHA instead of a tag for immutable consumption.

## Selection and outputs

1. Filter by `agent`, optional exact `version`, optional `platform`, and current test definitions (ID **and** version).
2. Select the configuration of the newest remaining attempt, including errors. Timestamp ties use descending run ID. Configuration means agent ID/version plus OS, OS version, architecture, and Bun version. Every requirement uses that **one configuration**, even when `version` or `platform` is omitted. No fallback to an older or more complete configuration.
3. For each requested capability, inspect the latest attempt for **every** current test mapped to it within that configuration. A failure gives `FAIL`; otherwise all tests must have `pass` for `PASS`. Missing tests/runs, errors, skipped and unsupported attempts give `UNKNOWN`. A newer error is not replaced by an older pass. Documentation claims never satisfy requirements.

Overall `status` is `FAIL` if any capability fails, otherwise `PASS` if all pass, otherwise `UNKNOWN`. A missing/unknown agent ID, invalid capability ID/input, or missing/malformed snapshot gives `ERROR`. A known agent with no observations gives `UNKNOWN`. Only `PASS` exits zero; the other statuses fail the step without equating uncertainty with incompatibility. The `configuration` output is JSON, or `null` when no configuration was selected. Logs also list the selected run IDs for each requirement.

No freshness limit is imposed: inspect run dates in the pinned snapshot or choose a newer reviewed release. Configuration grouping covers the recorded fields, not unrecorded model defaults or settings. The release build validates evidence hashes; this Action reads the snapshot and does not independently authenticate the observations or prove universal support.

See the [complete workflow example](../examples/compatibility.yml). To branch on a non-PASS output, give the step an `id` and use `continue-on-error: true` explicitly; otherwise leave the failing gate intact.
