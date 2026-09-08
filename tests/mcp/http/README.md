# MCP http

Measures actual invocation of a deterministic get_token MCP tool. A server-side receipt and matching output are both required. HTTP uses a loopback-only Streamable HTTP endpoint.

Version: 1.0.0. The fixture is tiny and the evaluator uses exact tokens, not model judgment. PASS requires tool-call-and-file: `server-generated token`. A completed execution without this is FAIL; execution problems are ERROR. Observations apply only to the recorded configuration, agent version, environment, and date. Inspect `fixture/`, `test.yaml`, and `evaluate.ts` for the exact procedure.
