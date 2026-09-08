#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { agents, loadAdapter, tests } from "../../core/src/catalog.ts";
import { loadData, validate } from "../../core/src/data.ts";
import { run } from "../../core/src/index.ts";
import { cleanEnvironment, execute } from "../../core/src/process.ts";
import { agentSummary, compare } from "../../data/src/model.ts";

const usage = `HarnessFacts — tested facts about AI coding agents.
Usage: harnessfacts <command>
  agents | tests | doctor | validate
  run <agent> <test> [--json] [--timeout 120000]
  run <agent> --all | run --agent <agent> --tag <tag>
  show <agent> | compare <agent> <agent> [<agent> ...]
Options: --json, --help. Runs use temporary fixtures and your existing agent credentials.`;
function table(rows: string[][]) {
  const widths = rows[0].map((_, i) =>
    Math.max(...rows.map((row) => (row[i] || "").length)),
  );
  console.log(
    rows
      .map((row) =>
        row
          .map((cell, i) => cell.padEnd(widths[i]))
          .join("  ")
          .trimEnd(),
      )
      .join("\n"),
  );
}
try {
  const { positionals, values } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      json: { type: "boolean" },
      help: { type: "boolean" },
      all: { type: "boolean" },
      agent: { type: "string" },
      tag: { type: "string" },
      timeout: { type: "string" },
    },
  });
  const [command, ...args] = positionals;
  const emit = (value: unknown, rows: string[][]) =>
    values.json ? console.log(JSON.stringify(value, null, 2)) : table(rows);
  if (!command || values.help) console.log(usage);
  else if (command === "agents" || command === "doctor") {
    const list = [];
    for (const metadata of await agents()) {
      const adapter = await loadAdapter(metadata.id);
      const detection = await adapter.detect();
      let authentication: boolean | "unknown" = "unknown";
      if (command === "doctor" && detection.available) {
        try {
          authentication = await adapter.isAuthenticated();
        } catch {
          /* Diagnostic remains unknown. */
        }
      }
      list.push({ id: metadata.id, ...detection, authentication });
    }
    const environment =
      command === "doctor"
        ? {
            bun: Bun.version,
            git: await execute(
              ["git", "--version"],
              process.cwd(),
              cleanEnvironment(),
              10_000,
            )
              .then((r) => (r.exitCode === 0 ? r.stdout.trim() : "unavailable"))
              .catch(() => "unavailable"),
          }
        : undefined;
    emit({ environment, agents: list }, [
      [
        "Agent",
        "Detection",
        "Version",
        ...(environment ? ["Authentication"] : []),
      ],
      ...list.map((a) => [
        a.id,
        a.available ? "detected" : "not found",
        a.version || "—",
        ...(environment ? [String(a.authentication)] : []),
      ]),
    ]);
    if (environment && !values.json)
      console.log(`Bun ${environment.bun} · ${environment.git}`);
  } else if (command === "tests") {
    const list = (await tests()).map((t) => t.definition);
    emit(list, [
      ["Test", "Version", "Tags"],
      ...list.map((t) => [t.id, t.version, t.tags.join(", ")]),
    ]);
  } else if (command === "run") {
    const agent = values.agent || args[0];
    const testId = values.agent ? args[0] : args[1];
    if (
      !agent ||
      Number(!!testId) + Number(!!values.all) + Number(!!values.tag) !== 1
    )
      throw new Error("Choose an agent and exactly one test, --all, or --tag");
    const timeoutMs = values.timeout ? Number(values.timeout) : 120000;
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 3600000)
      throw new Error("Timeout must be 1–3600000 milliseconds");
    const selected = (await tests()).filter(
      (t) =>
        values.all ||
        (values.tag
          ? t.definition.tags.includes(values.tag)
          : t.definition.id === testId),
    );
    if (!selected.length) throw new Error("No tests matched");
    const adapter = await loadAdapter(agent);
    const results = [];
    for (const test of selected) {
      const result = await run(adapter, test, { timeoutMs });
      results.push(result);
      if (!values.json)
        console.log(
          `${result.result.result.status.toUpperCase()} ${agent} ${test.definition.id}: ${result.result.result.summary}\n${result.path}`,
        );
      if (["error", "fail"].includes(result.result.result.status))
        process.exitCode = 1;
    }
    if (values.json)
      console.log(
        JSON.stringify(
          results.length === 1
            ? results[0].result
            : results.map((r) => r.result),
          null,
          2,
        ),
      );
  } else if (command === "show" || command === "compare") {
    if (!args.length || (command === "show" && args.length !== 1))
      throw new Error(`${command} requires agent IDs`);
    const data = await loadData();
    const selected = compare(data, args);
    emit(command === "show" ? agentSummary(data, args[0]) : selected, [
      ["Capability", ...selected.map((a) => a.name)],
      ...data.capabilities.map((c) => [
        c.title,
        ...selected.map((a) => {
          const v = a.capabilities[c.id];
          return `${v.observed.toUpperCase()}${v.documented === "documented" ? " / DOC" : ""}`;
        }),
      ]),
    ]);
    if (!values.json)
      console.log(
        "Latest completed observation across recorded versions/environments; use --json for all contexts. UNKNOWN ≠ unsupported. DOC = official documentation only.",
      );
  } else if (command === "validate") {
    const data = await validate();
    emit(
      { valid: true, results: data.results.length, claims: data.claims.length },
      [
        [
          `Valid: ${data.results.length} results, ${data.claims.length} documentation claims.`,
        ],
      ],
    );
  } else throw new Error(`Unknown command: ${command}\n${usage}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Command failed");
  process.exitCode = 1;
}
