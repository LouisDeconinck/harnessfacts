export {
  agents,
  capabilities,
  claims,
  getAgent,
  getCapability,
  results,
  tests,
} from "../../../packages/data/src/index.ts";
export const sitePath = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`;
export const testSlug = (id: string) => id.replaceAll(".", "-");
export const runPath = (run: {
  agent: { id: string; version: string };
  environment: { os: string; arch: string };
  test: { id: string };
  runId: string;
}) =>
  sitePath(
    `/results/${run.agent.id}/${run.agent.version}/${run.environment.os}-${run.environment.arch}/${run.test.id}/${run.runId}`,
  );
