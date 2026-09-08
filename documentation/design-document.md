# HarnessFacts

**Tagline:** Tested facts about AI coding agents.

**Repository:** `harnessfacts/harnessfacts`
**Primary domain:** `harnessfacts.dev`
**License:** Apache-2.0
**Primary language:** TypeScript
**Runtime/package manager:** Bun
**Status:** v0.1 implementation specification

---

# 1. Product Definition

HarnessFacts is an open conformance and compatibility test suite for AI coding agents.

It answers:

> What does this coding agent actually support?

Instead of relying only on documentation or vendor claims, HarnessFacts runs small deterministic tests against coding agents and records the observed behavior.

Examples:

* Does Codex honor nested `AGENTS.md`?
* Does Claude Code connect to an MCP stdio server?
* Can Gemini CLI run noninteractively?
* Does OpenCode discover skills?
* Does Cursor support a particular repository instruction mechanism?
* Does an agent respect a working-tree boundary?
* Does an agent expose structured output?
* Does a given feature still work after an agent upgrade?

HarnessFacts produces structured, versioned observations.

The same data powers:

1. CLI output;
2. machine-readable JSON;
3. npm data package;
4. static comparison website;
5. historical compatibility information.

HarnessFacts is not an intelligence benchmark.

It does not rank agents.

It does not attempt to answer:

> Which agent is smartest?

It answers:

> Did agent X version Y demonstrate behavior Z under environment E?

---

# 2. Primary Objectives

## 2.1 Product objective

Create a useful, credible, reproducible compatibility test suite for AI coding agents.

## 2.2 Engineering objective

Keep the core implementation simple enough for a small team or solo maintainer.

Avoid:

* databases;
* hosted backends;
* authentication;
* queues;
* accounts;
* complex distributed infrastructure.

## 2.3 Community objective

Make meaningful external contributions unusually easy.

Examples of contributions:

* add one agent adapter;
* add one conformance test;
* verify one agent on Windows;
* update an adapter after an agent release;
* improve result parsing;
* add official documentation evidence;
* add a new environment.

The project architecture should allow contributors to work on isolated areas without understanding the whole repository.

---

# 3. Core Product Principle

The project distinguishes clearly between:

```text
DOCUMENTED
OBSERVED
UNKNOWN
```

Optionally also:

```text
FAILED
```

Definitions:

## DOCUMENTED

An official source states that the feature is supported.

No HarnessFacts execution has verified it.

## OBSERVED

A HarnessFacts conformance test was actually executed and produced the claimed behavior.

## FAILED

A HarnessFacts conformance test executed successfully as a test harness but the expected capability was not observed.

## UNKNOWN

There is insufficient evidence.

Critical rule:

> Official documentation alone must never produce `OBSERVED`.

---

# 4. Terminology

Use these terms consistently.

## Agent

A coding-agent product or harness.

Examples:

```text
claude-code
codex
gemini-cli
opencode
cline
roo-code
aider
```

## Capability

A behavior we want to determine.

Examples:

```text
instructions.root
instructions.nested
mcp.stdio
mcp.http
execution.headless
skills.discovery
```

## Test

Executable procedure for evaluating one capability.

## Adapter

Agent-specific implementation describing how HarnessFacts invokes and interacts with an agent.

## Run

One execution of:

```text
agent × test × agent version × environment
```

## Result

Machine-readable output from a completed run.

## Evidence

Artifacts supporting a claim.

Possible evidence:

* test output;
* generated files;
* execution logs;
* hashes;
* official documentation links.

---

# 5. Scope

## v0.1 is limited to coding agents

Include products primarily designed to inspect/edit software repositories.

Initial target agents:

1. Claude Code
2. OpenAI Codex
3. Gemini CLI
4. OpenCode
5. Cline
6. Roo Code
7. Aider
8. GitHub Copilot CLI/agent where executable automation is practical

Cursor may be represented initially through documentation/manual observations if automated CLI execution is not practical.

Do not include generic agent frameworks such as:

* LangGraph;
* CrewAI;
* AutoGen;
* generic chatbot frameworks.

---

# 6. Initial Capabilities

Implement approximately 10–12 capabilities for v0.1.

Do not attempt 50+ features immediately.

## 6.1 Instructions

### `instructions.root`

Does the agent discover and apply its supported root repository instruction file?

### `instructions.nested`

Does a nested instruction file alter behavior within its subtree?

### `instructions.precedence`

When root and nested instructions conflict, which one wins?

---

## 6.2 MCP

### `mcp.stdio`

Can the agent connect to a minimal MCP stdio server and successfully invoke one tool?

### `mcp.http`

Can the agent connect to a minimal Streamable HTTP MCP server?

### `mcp.oauth`

Can the agent complete or appropriately expose an MCP OAuth flow?

May be deferred if implementation becomes too complex.

---

## 6.3 Execution

### `execution.headless`

Can the agent execute a task noninteractively?

### `execution.exit-code`

Does successful/failed noninteractive execution produce usable process exit semantics?

### `execution.structured-output`

Can machine-readable or structured output be requested?

---

## 6.4 Extensibility

### `skills.discovery`

Does the agent discover a supported repository/local skill definition?

### `hooks.execution`

Can supported hooks execute deterministically around an agent action?

---

## 6.5 Git/repository behavior

### `git.worktree-awareness`

Can the agent operate correctly in a Git worktree?

### `git.scope-boundary`

Does the agent limit modifications to the supplied repository/working directory under the tested setup?

Do not describe this as a security guarantee.

---

# 7. Non-Goals

Do not implement these in v0.1:

* SWE-bench-style intelligence benchmarks;
* token usage comparisons;
* coding-quality leaderboards;
* agent scoring;
* subscription price tracking;
* exact rate limits;
* model intelligence comparisons;
* cloud accounts;
* authentication;
* database;
* paid service;
* user profiles;
* telemetry;
* full sandbox/security certification;
* automatic testing of every proprietary GUI-only agent.

Avoid the temptation to become an “AI coding tools comparison website.”

The product is the test suite and observed data.

---

# 8. Repository Architecture

Use a Bun workspace monorepo.

```text
harnessfacts/
├── adapters/
│   ├── claude-code/
│   ├── codex/
│   ├── gemini-cli/
│   ├── opencode/
│   ├── cline/
│   ├── roo-code/
│   └── aider/
│
├── tests/
│   ├── instructions/
│   │   ├── root/
│   │   ├── nested/
│   │   └── precedence/
│   ├── mcp/
│   │   ├── stdio/
│   │   └── http/
│   ├── execution/
│   │   ├── headless/
│   │   └── structured-output/
│   ├── skills/
│   ├── hooks/
│   └── git/
│
├── results/
│   ├── claude-code/
│   ├── codex/
│   └── ...
│
├── packages/
│   ├── schema/
│   ├── core/
│   ├── cli/
│   └── data/
│
├── apps/
│   └── web/
│
├── scripts/
├── docs/
│   ├── methodology.md
│   ├── result-model.md
│   ├── adding-an-agent.md
│   └── adding-a-test.md
│
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── AGENTS.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
├── README.md
├── package.json
├── biome.json
└── bun.lock
```

---

# 9. Package Responsibilities

## `@harnessfacts/schema`

Contains all Zod schemas and exported TypeScript types.

Must have no dependency on agent implementations.

Exports:

```ts
AgentDefinition
CapabilityDefinition
TestDefinition
EnvironmentDefinition
RunResult
Evidence
DocumentationClaim
```

---

## `@harnessfacts/core`

Core execution engine.

Responsibilities:

* load adapter;
* load test;
* create temporary fixture;
* execute agent;
* collect artifacts;
* evaluate expected behavior;
* produce structured run result;
* write result JSON.

It must not contain hard-coded agent-specific command logic.

---

## `harnessfacts`

CLI package.

Preferred executable:

```bash
harnessfacts
```

Could be package name:

```text
harnessfacts
```

Commands described below.

---

## `@harnessfacts/data`

Published package containing normalized agent/capability/result metadata.

Must not require execution of agents.

Typical consumer:

```ts
import {
  agents,
  capabilities,
  results
} from "@harnessfacts/data";
```

---

# 10. Agent Adapter Contract

Every agent adapter should implement approximately:

```ts
export interface AgentAdapter {
  id: string;

  detect(): Promise<DetectionResult>;

  getVersion(): Promise<string>;

  isAuthenticated(): Promise<boolean | "unknown">;

  prepare(
    context: AdapterPrepareContext
  ): Promise<void>;

  run(
    context: AgentRunContext
  ): Promise<AgentRunOutput>;

  normalizeOutput?(
    output: AgentRunOutput
  ): Promise<NormalizedAgentOutput>;
}
```

`run()` must return:

```ts
interface AgentRunOutput {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
}
```

Do not make adapters responsible for deciding whether a test passed.

The test evaluator determines pass/fail.

This separation is important.

---

# 11. Test Contract

Each conformance test should contain:

```text
test.yaml
fixture/
evaluate.ts
README.md
```

Example:

```text
tests/instructions/nested/
├── test.yaml
├── fixture/
│   ├── AGENTS.md
│   └── src/
│       ├── AGENTS.md
│       └── task.txt
├── evaluate.ts
└── README.md
```

Example `test.yaml`:

```yaml
id: instructions.nested
title: Nested repository instructions
version: 1.0.0

description: >
  Determines whether an agent applies nested repository
  instructions inside a child directory.

expected:
  type: file-content

tags:
  - instructions
  - repository
```

---

# 12. Deterministic Fixture Design

Tests should be:

* tiny;
* cheap;
* deterministic;
* single-purpose;
* easy to inspect manually;
* safe to run in temporary directories.

Avoid asking:

> Build a todo application.

Prefer:

> Read the instructions applicable to `src/task.txt` and write the requested token into `result.txt`.

Example root instruction:

```text
For tasks under this repository, write ROOT into result.txt.
```

Nested instruction:

```text
For tasks under this directory, write NESTED into result.txt.
```

Then evaluator:

```ts
return contents.trim() === "NESTED";
```

This is far more reliable than judging natural-language output.

---

# 13. Run Result Schema

Use a versioned schema from day one.

Example:

```json
{
  "schema": "harnessfacts.run/v1",
  "runId": "0199...",
  "agent": {
    "id": "codex",
    "version": "1.42.0"
  },
  "test": {
    "id": "instructions.nested",
    "version": "1.0.0"
  },
  "environment": {
    "os": "linux",
    "osVersion": "ubuntu-26.04",
    "arch": "x64",
    "runtime": {
      "bun": "1.3.6"
    }
  },
  "execution": {
    "startedAt": "2026-09-08T10:00:00Z",
    "durationMs": 4321,
    "exitCode": 0
  },
  "result": {
    "status": "pass",
    "summary": "Nested instruction was applied."
  },
  "evidence": {
    "stdoutSha256": "...",
    "stderrSha256": "...",
    "artifacts": [
      {
        "path": "result.txt",
        "sha256": "..."
      }
    ]
  }
}
```

Allowed result statuses:

```text
pass
fail
error
skipped
unsupported
```

Definitions:

`pass`
Test executed and expected behavior was observed.

`fail`
Test executed but expected behavior was not observed.

`error`
Harness could not determine capability because execution itself failed.

`skipped`
Test intentionally not run.

`unsupported`
Adapter explicitly cannot perform the test because the tested interaction mode does not exist.

Do not collapse these into one boolean.

---

# 14. Documentation Claims

Maintain documentation separately from observed results.

Example:

```yaml
agent: codex
capability: mcp.http

status: documented

source:
  url: https://...
  title: MCP support
  accessedAt: 2026-09-08
```

The website may display:

```text
Documented: Yes
Observed: Yes
```

or:

```text
Documented: Yes
Observed: Not tested
```

or the interesting case:

```text
Documented: Yes
Observed: Failed on Codex 1.42 / Windows
```

Do not hide contradictions.

They are useful.

---

# 15. CLI Specification

## `harnessfacts agents`

List supported agent adapters.

Example:

```text
claude-code   detected   3.2.1
codex         detected   1.42.0
gemini-cli    not found
opencode      detected   0.8.4
```

---

## `harnessfacts tests`

List tests.

```text
instructions.root
instructions.nested
instructions.precedence
mcp.stdio
mcp.http
execution.headless
skills.discovery
...
```

---

## `harnessfacts doctor`

Inspect local environment.

Check:

* Git;
* Bun;
* available agent CLIs;
* agent versions;
* basic authentication availability where detectable;
* Docker only if later needed.

Do not print secrets.

---

## `harnessfacts run`

Examples:

```bash
harnessfacts run codex instructions.nested
```

```bash
harnessfacts run codex --all
```

```bash
harnessfacts run --agent codex --tag mcp
```

The default should run in an isolated temporary directory.

---

## `harnessfacts show`

Example:

```bash
harnessfacts show codex
```

Output:

```text
Codex 1.42.0

Capability                    Result
─────────────────────────────────────
Root AGENTS.md                PASS
Nested AGENTS.md              PASS
Instruction precedence       PASS
MCP stdio                     PASS
MCP HTTP                      PASS
Skills discovery              UNKNOWN
Headless execution            PASS
```

---

## `harnessfacts compare`

```bash
harnessfacts compare codex claude-code opencode
```

Output matrix.

---

## `harnessfacts validate`

Validate:

* schemas;
* duplicate results;
* missing tests;
* unknown agent IDs;
* result/test version references;
* malformed documentation claims.

CI should run this command.

---

# 16. Result Storage

Results are committed to Git.

Suggested path:

```text
results/
  codex/
    1.42.0/
      linux-x64/
        instructions.nested.json
        mcp.stdio.json
```

However, do not assume one result forever.

Prefer timestamped run IDs if repeatability matters:

```text
results/
  codex/
    1.42.0/
      linux-x64/
        instructions.nested/
          2026-09-08T100000Z.json
```

Generate a normalized “latest result” index during build.

This preserves history.

---

# 17. Provenance Model

Each result must indicate where it came from.

Allowed provenance values:

```text
official
community
```

## Official run

Executed by HarnessFacts-controlled CI or maintainer environment.

## Community run

Executed by an external contributor using the official harness.

Community results are acceptable.

Require:

* exact agent version;
* exact test version;
* environment metadata;
* generated result file;
* evidence hashes.

Do not claim stronger authenticity than we actually possess.

Signed attestations can be added later.

---

# 18. Website

The website is generated from repository data.

No database.

No admin UI.

Use Astro unless there is a strong implementation reason not to.

Deploy to Cloudflare Pages/Workers or GitHub Pages.

Keep it static-first.

Required pages:

```text
/
/agents
/agents/:agent
/tests
/tests/:test
/compare
/methodology
/contribute
```

---

# 19. Homepage

Hero:

```text
HarnessFacts

Tested facts about AI coding agents.

Reproducible compatibility tests for Claude Code,
Codex, Gemini CLI, OpenCode and more.

No rankings. No vendor claims.
Just documented and observed behavior.
```

Primary actions:

```text
Compare agents
Browse tests
Contribute a result
```

Show a useful compatibility matrix immediately below.

---

# 20. Agent Page

Example:

```text
/agents/codex
```

Display:

```text
OpenAI Codex

Latest tested version:
1.42.0

Environments:
Linux x64

Observed capabilities:
8 passing
1 failing
2 unknown

Documentation:
11 claims
```

Matrix:

| Capability          | Observed | Documented | Environment |
| ------------------- | -------- | ---------- | ----------- |
| Root instructions   | ✅        | ✅          | Ubuntu      |
| Nested instructions | ✅        | ✅          | Ubuntu      |
| MCP stdio           | ✅        | ✅          | Ubuntu      |
| MCP HTTP            | ✅        | ✅          | Ubuntu      |
| Hooks               | ?        | ?          | —           |

Clicking a row opens run evidence.

---

# 21. Test Page

Example:

```text
/tests/instructions-nested
```

Explain:

* what is tested;
* why it matters;
* exact fixture;
* expected behavior;
* test version;
* agent results.

Example:

```text
Nested instructions

Tests whether repository instructions inside a child
directory override or extend instructions at repository root.

Results

Claude Code 3.2      PASS
Codex 1.42           PASS
OpenCode 0.8         PASS
Gemini CLI ...       FAIL
```

---

# 22. Comparison Page

Allow selecting up to 4 agents.

Do not calculate an overall winner.

Provide capability filters:

```text
Instructions
MCP
Execution
Extensibility
Git behavior
```

Unknown should remain visibly unknown.

Never treat missing data as unsupported.

---

# 23. Data Package

Publish:

```text
@harnessfacts/data
```

Exports normalized latest results.

Example:

```ts
import {
  getAgent,
  getCapabilities,
  compareAgents
} from "@harnessfacts/data";
```

Potential external use:

```ts
const codex = getAgent("codex");

const nested = codex.capabilities["instructions.nested"];

console.log(nested.observed);
```

Keep this package lightweight and dependency-minimal.

---

# 24. CI

Minimum GitHub Actions jobs:

## quality

```text
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun test
bun run validate
bun run build
```

## schema

Validate every committed result and documentation claim.

## changed-tests

If a contributor modifies a test fixture, ensure its version was incremented when the semantics changed.

Implement this check once practical.

## PR preview

Website preview if hosting provider supports it easily.

---

# 25. Agent Execution in CI

Do not attempt to automate proprietary-agent execution in CI for v0.1 unless credentials/setup make it trivial.

Separate:

```text
project CI
```

from:

```text
agent conformance runs
```

Project CI must always work without paid agent credentials.

Agent runs may initially be executed locally and committed.

Later, scheduled runners can be added.

---

# 26. Security Rules

This project executes coding agents, so assume they can modify files and run commands.

Initial protections:

1. execute fixtures only in temporary directories;
2. never run against the HarnessFacts source checkout itself;
3. set explicit working directory;
4. sanitize environment variables;
5. pass only required credentials;
6. avoid fixtures requiring network access except tests explicitly about network protocols;
7. never log API keys/tokens;
8. document that HarnessFacts is not a security sandbox.

Add:

```text
docs/security-model.md
```

Do not claim:

> safe execution

unless true isolation is added later.

---

# 27. Adapter Contribution Experience

Adding a new agent should require only:

```text
adapters/<agent>/
  adapter.ts
  metadata.yaml
  README.md
```

Metadata example:

```yaml
id: codex
name: OpenAI Codex
vendor: OpenAI

website: https://...
documentation: https://...

invocation:
  kind: cli

platforms:
  linux: true
  macos: true
  windows: true
```

Provide:

```bash
harnessfacts adapter:new my-agent
```

later if useful.

Not required for v0.1.

---

# 28. Test Contribution Experience

Adding a test should require:

```text
tests/<category>/<name>/
  test.yaml
  fixture/
  evaluate.ts
  README.md
```

A test PR should be understandable in isolation.

Provide template documentation containing:

```text
What behavior does this test measure?
Why does it matter?
How is the fixture deterministic?
What constitutes PASS?
What constitutes FAIL?
What known limitations exist?
```

---

# 29. Contributor Attribution

Make attribution a first-class feature.

Metadata may include:

```yaml
authors:
  - github: alice
```

Generated test pages show:

```text
Test contributed by @alice
```

Agent adapter pages:

```text
Adapter maintained by @bob
```

Release notes should automatically recognize first-time contributors.

This helps build genuine community ownership.

---

# 30. Labels

Create labels from the beginning.

```text
good first issue
help wanted

agent:claude-code
agent:codex
agent:gemini-cli
agent:opencode
agent:cline

capability:instructions
capability:mcp
capability:skills
capability:execution

platform:linux
platform:windows
platform:macos

adapter
test
documentation
website
```

---

# 31. Initial Good-First-Issue Strategy

Do not launch with zero contribution opportunities.

Prepare at least 15–20 legitimate issues.

Examples:

```text
Add Aider adapter
Add Roo Code adapter
Verify Codex nested instructions on Windows
Verify Claude Code MCP stdio on macOS
Add test for root instruction discovery
Add test for structured output
Add Gemini CLI documentation claims
Add OpenCode skills test
Improve compare CLI table
Add JSON export documentation
```

Avoid fake or trivial tasks created solely to increase contributor count.

---

# 32. Methodology Document

`docs/methodology.md` must explain:

## What PASS means

Only that the observed behavior matched the test's expectation under the recorded environment.

## What PASS does not mean

It does not imply:

* universal support;
* future-version support;
* security;
* intelligence;
* quality;
* reliability across every platform.

## Version sensitivity

Every result refers to:

```text
agent version
test version
environment
date
```

## Unknown handling

Missing data is unknown, never automatically unsupported.

---

# 33. README Structure

Recommended opening:

```text
# HarnessFacts

Tested facts about AI coding agents.

HarnessFacts runs small reproducible conformance tests
against coding agents and records what actually happened.

| Capability | Claude Code | Codex | Gemini CLI | OpenCode |
| ... |

No rankings.
No synthetic scores.
No assumption that documentation equals runtime behavior.
```

Then:

```text
Why
Quick start
Current agents
Current tests
Methodology
Contributing
Roadmap
```

Keep the README concise.

Put methodological detail in docs.

---

# 34. v0.1 MVP

Do not overbuild.

Minimum release:

## Agents

At least 5 adapters:

```text
Claude Code
Codex
Gemini CLI
OpenCode
Aider
```

Prefer 6–8 if implementation is straightforward.

## Tests

At least 8 executable tests.

Priority:

```text
instructions.root
instructions.nested
instructions.precedence
mcp.stdio
mcp.http
execution.headless
execution.structured-output
skills.discovery
```

Hooks/worktrees can follow.

## Results

At least 30 meaningful observed results.

Not every agent must run every test.

Unknown is acceptable.

## CLI

Must support:

```text
agents
tests
doctor
run
show
compare
validate
```

## Website

Must support:

```text
agent pages
test pages
comparison page
methodology
contribution page
```

## Packages

Publish:

```text
harnessfacts
@harnessfacts/data
```

---

# 35. Definition of Done for v0.1

Version 0.1 is complete when:

* repository is public;
* Apache-2.0 license is present;
* all schemas are versioned;
* at least 5 agents exist;
* at least 8 executable tests exist;
* at least 30 real observed results exist;
* documentation claims are stored separately from observations;
* `harnessfacts doctor` works;
* `harnessfacts run <agent> <test>` works;
* `harnessfacts compare` works;
* CLI produces human-readable output;
* JSON data package works;
* website builds statically;
* result pages expose evidence;
* no database or backend is required;
* CI succeeds without proprietary agent credentials;
* contribution documentation is complete;
* 15+ genuine contribution issues are ready.

---

# 36. Implementation Order

Follow this order.

## Phase 1 — Foundation

Implement:

```text
workspace
Biome
TypeScript
test runner
schemas
core domain types
```

No website yet.

---

## Phase 2 — First deterministic test

Build only:

```text
instructions.nested
```

and one agent:

```text
codex
```

Prove this command end-to-end:

```bash
harnessfacts run codex instructions.nested
```

It must:

1. detect Codex;
2. determine version;
3. copy fixture into temp directory;
4. invoke Codex;
5. evaluate result;
6. emit valid JSON;
7. print PASS/FAIL.

Do not implement multiple adapters before this works.

---

## Phase 3 — Adapter abstraction

Add:

```text
Claude Code
Gemini CLI
OpenCode
```

Run the same test through all of them where possible.

This validates the adapter abstraction.

---

## Phase 4 — Test abstraction

Add:

```text
instructions.root
instructions.precedence
execution.headless
```

Ensure tests remain independent of agents.

---

## Phase 5 — MCP test infrastructure

Create one tiny deterministic MCP server reusable by tests.

Implement:

```text
mcp.stdio
mcp.http
```

Avoid OAuth until later.

---

## Phase 6 — Data aggregation

Implement:

```text
results validation
latest-result resolution
agent summaries
comparison model
```

Publish `@harnessfacts/data`.

---

## Phase 7 — CLI polish

Implement:

```text
show
compare
doctor
validate
```

---

## Phase 8 — Static website

Build Astro site from generated data.

No duplicate content/data model in the website.

---

## Phase 9 — Documentation/community

Add:

```text
CONTRIBUTING
methodology
adding an adapter
adding a test
security model
issue templates
```

Then prepare public launch.

---

# 37. Engineering Constraints for the AI Agent

The implementing coding agent must obey these constraints.

1. **Do not introduce a database.**
2. **Do not introduce authentication.**
3. **Do not introduce a backend API server unless required for an individual conformance fixture such as MCP HTTP.**
4. **Do not implement an overall score/ranking.**
5. **Do not make documentation claims equivalent to observed results.**
6. **Do not hard-code agent behavior inside tests.**
7. **Do not hard-code test expectations inside adapters.**
8. **Keep fixtures tiny.**
9. **Keep package dependency count low.**
10. **Prefer Bun/TypeScript throughout.**
11. **Prefer Zod for schemas.**
12. **Prefer static website generation.**
13. **Every durable persisted format must contain a schema/version identifier.**
14. **Missing data must remain unknown.**
15. **Do not claim certification/security guarantees.**
16. **Do not add telemetry.**
17. **Do not require API-token usage for the HarnessFacts project itself.**
18. **Ensure project CI runs without access to paid coding-agent accounts.**

---

# 38. Architectural Invariants

These should have tests.

## Invariant 1

An adapter cannot directly assign a capability result.

Adapters only execute agents.

## Invariant 2

A test evaluator cannot contain agent-specific branches such as:

```ts
if (agent === "codex")
```

If agent-specific execution is needed, put it in the adapter.

## Invariant 3

A documentation claim cannot produce an observed result.

## Invariant 4

A result cannot exist without:

```text
agent version
test version
environment
timestamp
```

## Invariant 5

Website/UI code cannot be the canonical source of capability data.

## Invariant 6

Unknown must never automatically become fail/unsupported.

---

# 39. Suggested Type Model

```ts
type ObservationStatus =
  | "pass"
  | "fail"
  | "error"
  | "skipped"
  | "unsupported";

type DocumentationStatus =
  | "documented"
  | "not-documented"
  | "unknown";

interface AgentRef {
  id: string;
  version: string;
}

interface TestRef {
  id: string;
  version: string;
}

interface Environment {
  os: "linux" | "macos" | "windows";
  osVersion?: string;
  arch: "x64" | "arm64";
}

interface RunResult {
  schema: "harnessfacts.run/v1";
  runId: string;

  agent: AgentRef;
  test: TestRef;
  environment: Environment;

  startedAt: string;
  durationMs: number;

  status: ObservationStatus;

  execution: {
    exitCode: number | null;
    stdoutSha256?: string;
    stderrSha256?: string;
  };

  artifacts: ArtifactEvidence[];

  provenance: {
    kind: "official" | "community";
    contributor?: string;
  };
}
```

Refine as implementation requires, but preserve the conceptual separation.

---

# 40. Suggested Dependencies

Keep this conservative.

Root/core:

```text
zod
```

CLI:

```text
commander
```

or another small CLI parser.

Website:

```text
astro
```

Quality:

```text
@biomejs/biome
typescript
```

Do not add large frameworks without a clear need.

Use Bun's built-in test runner where practical.

---

# 41. Future Roadmap — Not v0.1

Only after real usage.

## v0.2

* Windows/macOS community runners;
* more agents;
* more tests;
* better comparison filtering;
* historical timelines.

## v0.3

* scheduled official runs;
* agent release detection;
* regression detection;
* signed results/attestations;
* reusable GitHub Action.

## Later

Possible standardization:

```text
HarnessFacts Conformance Test Format
```

Allow vendors and external projects to run the same tests independently.

Potential vendor workflow:

```text
new agent release
      ↓
vendor runs HarnessFacts
      ↓
uploads result bundle
      ↓
public compatibility updated
```

This should emerge from adoption rather than being overdesigned now.

---

# 42. Product Success Criteria

The project is succeeding when developers independently use it to answer questions such as:

```text
Does Codex support X?
Does Claude Code behave differently from OpenCode here?
Did Gemini CLI lose this capability in the latest release?
```

Community success:

```text
external adapters
external tests
external platform runs
repeat contributors
```

Ecosystem success:

```text
other projects consume @harnessfacts/data
vendors reference HarnessFacts results
agent maintainers submit fixes/results
```

The strongest long-term outcome is not a large website.

It is:

> Coding-agent vendors and users treat HarnessFacts tests as a neutral compatibility contract.

---

# 43. First Implementation Task

Start with exactly this vertical slice:

```text
Agent:
Codex

Capability:
instructions.nested

Command:
harnessfacts run codex instructions.nested
```

Acceptance criteria:

1. detects installed Codex;
2. obtains exact version;
3. creates a temp fixture;
4. invokes Codex noninteractively;
5. Codex performs the deterministic fixture task;
6. evaluator determines PASS/FAIL without LLM judgment;
7. execution logs are captured;
8. hashes are generated;
9. valid `harnessfacts.run/v1` result is emitted;
10. result passes Zod validation;
11. human-readable terminal summary is printed;
12. unit/integration tests cover the core flow.

Only after this vertical slice works should the implementation agent generalize the architecture.

This prevents premature framework-building.

---

# 44. Final Product Principle

When facing a design choice, prefer the option that makes the following statement more credible:

> **HarnessFacts records what coding agents demonstrably did, not what somebody says they can do.**

Keep the implementation small, reproducible, inspectable and easy to contribute to.
