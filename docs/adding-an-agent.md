# Adding an agent

Create `adapters/<id>/adapter.ts`, `metadata.yaml`, and `README.md`. Follow an existing adapter and export `adapter: AgentAdapter`. The catalog discovers metadata automatically. Use `schema: harnessfacts.agent/v1`, a unique lowercase ID, name/vendor, official URLs, invocation kind, target platforms, and optional authors.

Implement detect, getVersion, isAuthenticated, supports, prepare, and run. Authentication returns boolean or unknown and never prints credentials. `run()` returns exitCode, stdout, stderr, durationMs, and optional timeout information. It cannot assign a capability status. `supports()` returns a skip reason for unmapped interactions; do not call a capability unsupported without evidence.

Use the shared subprocess helper, explicit cwd, inherited clean environment, bounded execution, and narrowly forwarded credentials. Map generic instruction and skill files into the product's native layout in prepare. Do not inject expected tokens or decide whether they matched. Preserve final output accurately when extracting structured response envelopes; never extract an echoed prompt.

Document command flags, supported mappings, authentication requirements, permissions, limits, and links to the official references you consulted. Platform metadata describes intended targets, not observed support. Run the nested-instruction test first with the real CLI when available. Add a credential-free contract check and keep real run artifacts separate from test mocks.
