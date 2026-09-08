import type {
  AgentDefinition,
  CapabilityDefinition,
  DocumentationClaim,
  RunResult,
  TestDefinition,
} from "../../schema/src/index.ts";
export interface Data {
  schema: "harnessfacts.data/v1";
  testHistory: TestDefinition[];
  agents: AgentDefinition[];
  capabilities: CapabilityDefinition[];
  tests: TestDefinition[];
  claims: DocumentationClaim[];
  results: RunResult[];
}
export interface ObservationQuery {
  agent?: string;
  capability?: string;
  platform?: string;
}
export function latestResults(results: RunResult[]) {
  const latest = new Map<string, RunResult>();
  for (const result of results) {
    const key = JSON.stringify([result.agent, result.test, result.environment]);
    const prior = latest.get(key);
    if (
      !prior ||
      `${result.execution.startedAt}/${result.runId}` >
        `${prior.execution.startedAt}/${prior.runId}`
    )
      latest.set(key, result);
  }
  return [...latest.values()].sort(
    (a, b) =>
      b.execution.startedAt.localeCompare(a.execution.startedAt) ||
      b.runId.localeCompare(a.runId),
  );
}
export function agentSummary(data: Data, id: string) {
  const agent = data.agents.find((a) => a.id === id);
  if (!agent) return undefined;
  const history = data.results.filter((r) => r.agent.id === id);
  const latest = latestResults(history);
  const capabilities = Object.fromEntries(
    data.capabilities.map((capability) => {
      const testIds = new Set(
        data.tests
          .filter((t) => t.capability === capability.id)
          .map((t) => `${t.id}@${t.version}`),
      );
      const observations = latest.filter((r) =>
        testIds.has(`${r.test.id}@${r.test.version}`),
      );
      const completed = latestResults(
        history.filter(
          (r) =>
            testIds.has(`${r.test.id}@${r.test.version}`) &&
            (r.result.status === "pass" || r.result.status === "fail"),
        ),
      );
      const claims = data.claims.filter(
        (c) => c.agent === id && c.capability === capability.id,
      );
      return [
        capability.id,
        {
          observed: completed.at(0)?.result.status ?? "unknown",
          observations,
          completed,
          claims,
          documented: claims.some((c) => c.status === "documented")
            ? "documented"
            : "unknown",
        },
      ];
    }),
  );
  return { ...agent, capabilities, history, latest };
}
export function compare(data: Data, ids: string[]) {
  return ids.map((id) => {
    const agent = agentSummary(data, id);
    if (!agent) throw new Error(`Unknown agent: ${id}`);
    return agent;
  });
}

export function getObservations(data: Data, query: ObservationQuery = {}) {
  const capabilityByTest = new Map(
    data.tests.map((test) => [test.id, test.capability]),
  );
  return data.results.filter(
    (result) =>
      (!query.agent || result.agent.id === query.agent) &&
      (!query.capability ||
        capabilityByTest.get(result.test.id) === query.capability) &&
      (!query.platform || result.environment.os === query.platform),
  );
}

export function latestObservation(data: Data, query: ObservationQuery) {
  return latestResults(getObservations(data, query))[0];
}
