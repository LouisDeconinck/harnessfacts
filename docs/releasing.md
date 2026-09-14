# Release v0.1.0

The [repository](https://github.com/LouisDeconinck/harnessfacts) and [GitHub Pages site](https://louisdeconinck.github.io/harnessfacts/) are public. npm packages and the v0.1.0 tag remain **unpublished** until the maintainer performs the steps below. Do not run publication commands without explicit authorization and namespace access.

## Preparation audit — 2026-09-08

Base commit: `2b0e392be432d4540335926bc19426b91f10fb87`; release-pass changes are not yet committed. Frozen install, lint, typecheck, all 16 project checks (150 assertions), evidence validation, build (109 pages) and `git diff --check` passed. All 73 real runs, their evidence and generated observation snapshot are unchanged.

Both final archives were inspected and installed in a fresh external project: data has 6 files; CLI has 100. Both include LICENSE and package-specific README. Strict TypeScript 5.9.3 compilation, Node 24.14.0 ESM/JSON exports and Bun 1.3.10 CLI checks passed. All 58 relative code imports resolved within the installed packages, with no workspace symlinks. The audit found and fixed private helper names leaking into data declarations; the build now rejects standalone declaration errors.

Audited tarball SHA-256 values (repacking can change archive metadata; recheck if replaced):

```text
7afcd666845a938374cb4e53c86f00093e338d4462a8a7144823804488784250  harnessfacts-data-0.1.0.tgz
9851d3643c925143940252875db9a27faae6d03a2425abce4592c4c763f4561c  harnessfacts-0.1.0.tgz
```

Ready for maintainer review/publication: **YES**. Actual publication remains pending npm authentication, namespace permission, reviewed commit/tag and explicit authorization. No agent executions or paid API calls were made in this pass.

## Validate and pack

From the repository root, with Bun 1.3.10+, Node 20+, npm, Git and tar:

```sh
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun test
bun run validate
bun run build
git diff --check
(cd packages/data && bun pm pack)
(cd packages/cli && bun pm pack)
tar -tzf packages/data/harnessfacts-data-0.1.0.tgz
tar -tzf packages/cli/harnessfacts-0.1.0.tgz
```

Both archives must contain LICENSE, a package-specific README, and their declared entrypoints. Data must include standalone ESM, declarations and JSON, with no runtime dependencies. The CLI must include all adapters, fixtures, setup/evaluation code and its declared `zod` dependency. It requires Bun; it is not a Node CLI. The build checks emitted declarations independently under strict NodeNext resolution to catch leaked private type names.

Inspect all new evidence for secrets. `validate` checks references and hashes, not authenticity. Keep every existing result and evidence byte; regenerate snapshots with `build` and review the diff. No model credentials are used by these checks.

## Test as an external consumer

This copies the example to a unique temporary directory and installs **tarballs**, not workspace links:

```sh
release_repo="$PWD"
release_consumer=$(mktemp -d /tmp/harnessfacts-consumer-XXXXXX)
cp -R examples/data-consumer/. "$release_consumer/"
cd "$release_consumer"
npm install --ignore-scripts --no-audit --no-fund \
  "$release_repo/packages/data/harnessfacts-data-0.1.0.tgz" \
  "$release_repo/packages/cli/harnessfacts-0.1.0.tgz"
npm start
node --input-type=module -e 'import { results, getCapability } from "@harnessfacts/data"; if (results.length !== 73 || !getCapability("instructions.nested")) throw Error("Invalid release snapshot"); console.log(results.length)'
bun node_modules/harnessfacts/dist/packages/cli/src/index.ts --help
bun node_modules/harnessfacts/dist/packages/cli/src/index.ts tests
bun node_modules/harnessfacts/dist/packages/cli/src/index.ts show codex --json
bun node_modules/harnessfacts/dist/packages/cli/src/index.ts validate
cd "$release_repo"
```

The data example typechecks with `skipLibCheck: false`, then executes under Node using only public exports. The CLI should list twelve tests, while `show` reports local observations as unknown and `validate` reports zero results in this empty consumer. Do not run a real agent merely to audit packaging. Fixture execution must never target the source checkout. Keep the temporary directory until inspection is complete.

The Action lives at `check/action.yml` and `check/action.mjs`. Project tests cover PASS, FAIL, UNKNOWN, exact versions, no cross-version/environment mixing, every current test per capability, invalid inputs, missing/corrupt data, outputs and Node exit codes. There is no network fetch to fail: the Action reads the snapshot bundled with its selected Git revision.

## Publish manually after review and authorization

1. Review and commit the release-pass changes, then push the intended release commit. Check that CI/Pages are green and the generated snapshot contains all 73 runs. Confirm both package manifests are 0.1.0. Re-run the audit if anything changes.
2. Authenticate to npm (`npm login`, then `npm whoami`). Confirm permission to publish `harnessfacts` and to the `@harnessfacts` scope; an anonymous 404 does not establish ownership. No valid npm login was available during the preparation audit.
3. Publish the **audited archives**, not an unreviewed working directory:

```sh
npm publish ./packages/data/harnessfacts-data-0.1.0.tgz --access public
npm publish ./packages/cli/harnessfacts-0.1.0.tgz --access public
```

4. Tag the reviewed release commit and create the release using the prepared notes (do not tag an uncommitted working tree):

```sh
git tag -a v0.1.0 -m 'HarnessFacts v0.1.0'
git push origin v0.1.0
gh release create v0.1.0 --verify-tag --title 'HarnessFacts v0.1.0' \
  --notes-file docs/releases/v0.1.0.md
```

Before publishing the notes, replace their preparation-status sentence with the actual release status. Confirm registry installs and `LouisDeconinck/harnessfacts/check@v0.1.0` from a separate repository after publication. A tag makes the Action available independently of npm; do not document `@v1`.

## Tracker and metadata

[All sixteen real launch issues](launch-issues.md) were checked against GitHub. #12, #14 and #15 have prepared completion notes; the maintainer can close them as completed after review. #1 and #9 now say twelve tests; #2 reflects current adapter/auth constraints and is no longer labeled good first issue. #17/#18 are dependency PRs, not Action/example issues. No replacement issues were created for work completed in this pass.

Repository description was updated to “Open compatibility test suite for coding agents. Evidence-backed tests for instructions, skills, MCP, Git and CI.” Topics now include `ai-coding-agents`, `coding-agents`, `codex`, `antigravity`, `opencode`, `mcp`, `agent-skills`, `conformance-testing`, and `compatibility`; existing relevant topics were preserved.

## Website deployment

Pushes to main run `.github/workflows/pages.yml`: frozen install, lint, typecheck, project tests, result validation, static build and deployment through the github-pages environment. No model credentials or hosting secrets are required. Astro uses `https://louisdeconinck.github.io` with base `/harnessfacts`. Use workflow_dispatch for a manual redeploy. npm publication and tagging are separate maintainer actions.
