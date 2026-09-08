# Structured output

Measures whether the requested machine-readable response contains the expected token. Adapters extract only final response payloads from documented JSON envelopes.

Version: 1.0.0. The fixture is tiny and the evaluator uses exact tokens, not model judgment. PASS requires json-object: `STRUCTURED`. A completed execution without this is FAIL; execution problems are ERROR. Observations apply only to the recorded configuration, agent version, environment, and date. Inspect `fixture/`, `test.yaml`, and `evaluate.ts` for the exact procedure.
