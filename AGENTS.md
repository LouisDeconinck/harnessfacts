# Repository guidance

Read documentation/design-document.md and docs/methodology.md before changing behavior. Keep adapters responsible for execution and tests responsible for evaluation. Documentation cannot create observed results. Missing data is unknown. Never fabricate a result or run fixtures against the source checkout. Keep project CI credential-free and do not add telemetry, a database, rankings, or a hosted backend.

Run bun run lint, bun run typecheck, bun test, bun run validate, and bun run build. Semantic test changes require a version bump and historical test definition. Use Bun/TypeScript and native APIs; keep fixtures tiny. Do not publish packages, results, or messages without the user's authorization.
