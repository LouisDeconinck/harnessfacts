# Headless execution

Measures noninteractive completion of a deterministic file-writing task with stdin closed.

Version: 1.0.0. The fixture is tiny and the evaluator uses exact tokens, not model judgment. PASS requires file-content: `HEADLESS`. A completed execution without this is FAIL; execution problems are ERROR. Observations apply only to the recorded configuration, agent version, environment, and date. Inspect `fixture/`, `test.yaml`, and `evaluate.ts` for the exact procedure.
