import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCompatibility, runCheck } from "../check/action.mjs";

const query = { agent: "example", platform: "linux", require: "a b" };
const run = (
  id,
  status = "pass",
  version = "1.0",
  startedAt = "2026-01-01T00:00:00Z",
  env = {},
) => ({
  runId: `${id}-${version}-${startedAt}`,
  agent: { id: "example", version },
  test: { id, version: "1.0" },
  environment: {
    os: "linux",
    osVersion: "1",
    arch: "x64",
    runtime: { bun: "1.3.10" },
    ...env,
  },
  execution: { startedAt },
  result: { status },
});
const data = (results) => ({
  schema: "harnessfacts.data/v1",
  agents: [{ id: "example" }, { id: "unverified" }],
  capabilities: [{ id: "a" }, { id: "b" }, { id: "deferred" }],
  tests: [
    { id: "a", capability: "a", version: "1.0" },
    { id: "b", capability: "b", version: "1.0" },
  ],
  results,
});

test("Action distinguishes PASS, FAIL, UNKNOWN and requires every test", () => {
  expect(checkCompatibility(data([run("a"), run("b")]), query).status).toBe(
    "PASS",
  );
  expect(
    checkCompatibility(data([run("a", "fail"), run("b")]), query).status,
  ).toBe("FAIL");
  for (const status of ["error", "skipped", "unsupported"])
    expect(
      checkCompatibility(data([run("a"), run("b", status)]), query).status,
    ).toBe("UNKNOWN");
  expect(checkCompatibility(data([run("a")]), query).status).toBe("UNKNOWN");
  expect(
    checkCompatibility(data([]), { ...query, agent: "unverified" }).status,
  ).toBe("UNKNOWN");
  expect(
    checkCompatibility(data([]), { ...query, require: "deferred" }).status,
  ).toBe("UNKNOWN");
  const paired = data([run("a"), run("b", "fail")]);
  paired.tests[1].capability = "a";
  expect(checkCompatibility(paired, { ...query, require: "a" }).status).toBe(
    "FAIL",
  );
  paired.results.pop();
  expect(checkCompatibility(paired, { ...query, require: "a" }).status).toBe(
    "UNKNOWN",
  );
});

test("Action selects exact versions and never mixes versions or environments", () => {
  const snapshot = data([
    run("a"),
    run("b"),
    run("a", "pass", "2.0", "2026-02-01T00:00:00Z"),
  ]);
  const latest = checkCompatibility(snapshot, query);
  expect(latest.configuration.agent.version).toBe("2.0");
  expect(latest.status).toBe("UNKNOWN");
  expect(
    checkCompatibility(snapshot, { ...query, version: "1.0" }).status,
  ).toBe("PASS");
  expect(
    checkCompatibility(snapshot, { ...query, version: "3.0" }).configuration,
  ).toBeNull();
  for (const env of [
    { os: "macos" },
    { osVersion: "2" },
    { arch: "arm64" },
    { runtime: { bun: "1.4.0" } },
  ]) {
    const split = data([
      run("a"),
      run("b", "pass", "1.0", "2026-02-01T00:00:00Z", env),
    ]);
    expect(
      checkCompatibility(split, { ...query, platform: "", version: "1.0" })
        .status,
    ).toBe("UNKNOWN");
  }
  expect(
    checkCompatibility(snapshot, { ...query, platform: "windows" }).status,
  ).toBe("UNKNOWN");
});

test("Action uses latest attempt and current test definitions with deterministic ties", () => {
  const snapshot = data([
    run("a"),
    run("b"),
    run("b", "error", "1.0", "2026-02-01T00:00:00Z"),
  ]);
  expect(checkCompatibility(snapshot, query).status).toBe("UNKNOWN");
  snapshot.tests[1].version = "2.0";
  expect(checkCompatibility(snapshot, query).status).toBe("UNKNOWN");
  const tied = data([run("a"), run("b", "pass", "2.0")]);
  expect(checkCompatibility(tied, query)).toEqual(
    checkCompatibility(
      { ...tied, results: [...tied.results].reverse() },
      query,
    ),
  );
});

test("Action rejects invalid inputs and malformed data", () => {
  for (const overrides of [
    { agent: "" },
    { agent: "absent" },
    { require: "typo" },
    { require: "" },
    { platform: "unix" },
    { version: ">=1.0" },
  ])
    expect(() =>
      checkCompatibility(data([]), { ...query, ...overrides }),
    ).toThrow();
  for (const invalid of [
    null,
    {},
    { ...data([]), schema: "wrong" },
    data([{}]),
    data([run("a"), run("a")]),
  ])
    expect(() => checkCompatibility(invalid, query)).toThrow();
});

test("Action reports missing/corrupt snapshot as ERROR and writes GitHub outputs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "hf-action-"));
  try {
    const env = {
      HARNESSFACTS_AGENT: "example",
      HARNESSFACTS_REQUIRE: "a b",
      GITHUB_OUTPUT: join(dir, "output"),
    };
    expect((await runCheck(env, join(dir, "missing.json"))).status).toBe(
      "ERROR",
    );
    await writeFile(join(dir, "data.json"), "{");
    expect((await runCheck(env, join(dir, "data.json"))).status).toBe("ERROR");
    await writeFile(
      join(dir, "data.json"),
      JSON.stringify(data([run("a"), run("b")])),
    );
    expect((await runCheck(env, join(dir, "data.json"))).status).toBe("PASS");
    expect(await readFile(env.GITHUB_OUTPUT, "utf8")).toContain(
      "status=PASS\nconfiguration=",
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("Action Node entrypoint exposes distinct statuses and correct exit codes", async () => {
  const action = Bun.YAML.parse(
    await readFile(new URL("../check/action.yml", import.meta.url), "utf8"),
  );
  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal GitHub expression
  expect(action.outputs.status.value).toBe("${{ steps.check.outputs.status }}");
  for (const [agent, required, status] of [
    ["codex", "instructions.root mcp.stdio", "PASS"],
    ["codex", "execution.exit-code", "FAIL"],
    ["gemini-cli", "instructions.root", "UNKNOWN"],
    ["codex", "typo", "ERROR"],
  ]) {
    const child = spawnSync(
      "node",
      [fileURLToPath(new URL("../check/action.mjs", import.meta.url))],
      {
        encoding: "utf8",
        env: {
          PATH: process.env.PATH,
          HARNESSFACTS_AGENT: agent,
          HARNESSFACTS_PLATFORM: "linux",
          HARNESSFACTS_REQUIRE: required,
        },
      },
    );
    expect(child.status).toBe(status === "PASS" ? 0 : 1);
    expect(JSON.parse(child.stdout).status).toBe(status);
  }
});
