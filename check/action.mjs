import { appendFile, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const platforms = ["linux", "macos", "windows"];
const nonempty = (value) => typeof value === "string" && value.length > 0;
// Only fields used by the assertion are checked here. The release build validates
// the complete schema and evidence hashes; this Action does not re-verify evidence.
function validateData(data) {
  if (
    data?.schema !== "harnessfacts.data/v1" ||
    !["agents", "capabilities", "tests", "results"].every((key) =>
      Array.isArray(data[key]),
    ) ||
    ![data.agents, data.capabilities].every(
      (items) =>
        items.every((item) => nonempty(item?.id)) &&
        new Set(items.map((item) => item.id)).size === items.length,
    ) ||
    !data.tests.every(
      (test) =>
        nonempty(test?.id) &&
        nonempty(test.version) &&
        data.capabilities.some(
          (capability) => capability.id === test.capability,
        ),
    ) ||
    new Set(data.tests.map((test) => test.id)).size !== data.tests.length ||
    !data.results.every(
      (run) =>
        nonempty(run?.runId) &&
        nonempty(run.agent?.version) &&
        data.agents.some((agent) => agent.id === run.agent?.id) &&
        nonempty(run.test?.id) &&
        nonempty(run.test?.version) &&
        platforms.includes(run.environment?.os) &&
        nonempty(run.environment.osVersion) &&
        nonempty(run.environment.arch) &&
        nonempty(run.environment.runtime?.bun) &&
        Number.isFinite(Date.parse(run.execution?.startedAt)) &&
        ["pass", "fail", "error", "skipped", "unsupported"].includes(
          run.result?.status,
        ),
    ) ||
    new Set(data.results.map((run) => run.runId)).size !== data.results.length
  )
    throw new Error("Invalid compatibility dataset");
}

// Fixed field order avoids treating JSON property ordering as an environment change.
const configuration = (run) => ({
  agent: { id: run.agent.id, version: run.agent.version },
  environment: {
    os: run.environment.os,
    osVersion: run.environment.osVersion,
    arch: run.environment.arch,
    runtime: { bun: run.environment.runtime.bun },
  },
});

export function checkCompatibility(
  data,
  { agent, version = "", platform = "", require: required = "" },
) {
  validateData(data);
  if (!data.agents.some((item) => item.id === agent))
    throw new Error("Missing or unknown agent ID");
  if (version && !/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,99}$/.test(version))
    throw new Error("version must be an exact agent version");
  if (platform && !platforms.includes(platform))
    throw new Error("Invalid platform");
  const requested = [...new Set(required.split(/\s+/).filter(Boolean))];
  if (
    !requested.length ||
    requested.some((id) => !data.capabilities.some((item) => item.id === id))
  )
    throw new Error("Missing or unknown capability ID");

  const candidates = data.results
    .filter(
      (run) =>
        run.agent.id === agent &&
        (!version || run.agent.version === version) &&
        (!platform || run.environment.os === platform) &&
        data.tests.some(
          (test) =>
            test.id === run.test.id && test.version === run.test.version,
        ),
    )
    .sort(
      (a, b) =>
        Date.parse(b.execution.startedAt) - Date.parse(a.execution.startedAt) ||
        b.runId.localeCompare(a.runId),
    );
  // Choose the newest current-test attempt, not the configuration with most passes.
  const selected = candidates[0] ? configuration(candidates[0]) : null;
  const key = JSON.stringify(selected);
  const runs = candidates.filter(
    (run) => JSON.stringify(configuration(run)) === key,
  );
  const capabilities = requested.map((id) => {
    const tests = data.tests.filter((test) => test.capability === id);
    const observations = tests.map((test) =>
      runs.find((run) => run.test.id === test.id),
    );
    const status = observations.some((run) => run?.result.status === "fail")
      ? "FAIL"
      : tests.length > 0 &&
          observations.every((run) => run?.result.status === "pass")
        ? "PASS"
        : "UNKNOWN";
    return { id, status, runs: observations.map((run) => run?.runId ?? null) };
  });
  return {
    status: capabilities.some((item) => item.status === "FAIL")
      ? "FAIL"
      : capabilities.every((item) => item.status === "PASS")
        ? "PASS"
        : "UNKNOWN",
    configuration: selected,
    capabilities,
  };
}

export async function runCheck(
  env = process.env,
  dataPath = new URL("../packages/data/src/generated.json", import.meta.url),
) {
  let result;
  try {
    result = checkCompatibility(JSON.parse(await readFile(dataPath, "utf8")), {
      agent: env.HARNESSFACTS_AGENT,
      version: env.HARNESSFACTS_VERSION,
      platform: env.HARNESSFACTS_PLATFORM,
      require: env.HARNESSFACTS_REQUIRE,
    });
  } catch (error) {
    result = { status: "ERROR", configuration: null, error: error.message };
  }
  console.log(JSON.stringify(result, null, 2));
  if (env.GITHUB_OUTPUT)
    await appendFile(
      env.GITHUB_OUTPUT,
      `status=${result.status}\nconfiguration=${JSON.stringify(result.configuration)}\n`,
    );
  return result;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    process.exitCode = (await runCheck()).status === "PASS" ? 0 : 1;
  } catch (error) {
    console.error(`HarnessFacts output error: ${error.message}`);
    process.exitCode = 1;
  }
}
