import { appendFile } from "node:fs/promises";

const agent = process.env.HARNESSFACTS_AGENT;
const platform = process.env.HARNESSFACTS_PLATFORM;
const requested = (process.env.HARNESSFACTS_REQUIRE || "")
  .split(/\s+/)
  .filter(Boolean);
const ref = process.env.HARNESSFACTS_REF || "main";
if (!agent || !requested.length || !/^[A-Za-z0-9._/-]+$/.test(ref)) {
  console.error("HarnessFacts requires agent, require, and a safe ref.");
  process.exit(1);
}

const url = `https://raw.githubusercontent.com/LouisDeconinck/harnessfacts/${ref}/packages/data/src/generated.json`;
const response = await fetch(url);
if (!response.ok)
  throw new Error(`Could not fetch compatibility data (${response.status})`);
const data = await response.json();
const capabilities = new Map(
  data.tests.map((test) => [test.id, test.capability]),
);
const statuses = new Map();
for (const capability of requested) {
  const observations = data.results
    .filter(
      (result) =>
        result.agent.id === agent &&
        (!platform || result.environment.os === platform) &&
        capabilities.get(result.test.id) === capability &&
        (result.result.status === "pass" || result.result.status === "fail"),
    )
    .sort((a, b) => b.execution.startedAt.localeCompare(a.execution.startedAt));
  statuses.set(
    capability,
    observations[0]?.result.status?.toUpperCase() || "UNKNOWN",
  );
}

for (const [capability, status] of statuses)
  console.log(
    `${status.padEnd(7)} ${agent}${platform ? ` on ${platform}` : ""} ${capability}`,
  );
const overall = [...statuses.values()].every((status) => status === "PASS")
  ? "PASS"
  : [...statuses.values()].some((status) => status === "FAIL")
    ? "FAIL"
    : "UNKNOWN";
console.log(`HarnessFacts result: ${overall}`);
if (process.env.GITHUB_OUTPUT)
  await appendFile(process.env.GITHUB_OUTPUT, `status=${overall}\n`);
if (overall !== "PASS") process.exit(1);
