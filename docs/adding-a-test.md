# Adding a test

Create `tests/<category>/<name>/test.yaml`, `fixture/`, `evaluate.ts`, and `README.md`. The catalog discovers it automatically. Add its capability to `packages/data/capabilities.json` if needed.

The YAML uses `schema: harnessfacts.test/v1`, id, capability, title, version, description, prompt, expected `{type,value}`, tags, and optional authors. Write a small evaluator exported as `evaluate(context)` returning `{pass,summary}`. `context.read(path)` validates and captures the exact artifact. Tests cannot branch on agent IDs. Adapters map native file layouts and flags.

Optional `setup(base)` may start a local protocol fixture and return configuration, harness-side evidence, and dispose(). Keep service state outside the agent working directory. Always stop services. Never require provider credentials for project tests.

Tests whose `expected.type` is `exit-code` may evaluate a non-zero agent exit. Use this only for a deterministic reached task failure; return `error: true` when the failure action was not reached so provider or setup errors do not become task failures.

## README template

- What behavior does this test measure?
- Why does it matter?
- What exact prompt and fixture are used?
- How is the fixture deterministic?
- What constitutes PASS and FAIL?
- What execution problems are ERROR?
- What limitations and setup differences are known?

Increment the semantic version when the prompt, fixture, expected behavior, or evaluator semantics change. Archive the old test definition in tests/history/ so old results keep valid version references. Historical source remains available through Git; record the relevant commit in the change description. Formatting-only changes do not require a bump. The optional changed-tests CI check conservatively requires a version change for fixture/evaluator edits.
