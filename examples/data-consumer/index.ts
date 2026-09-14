import {
  getAgent,
  getCapability,
  getObservations,
  latestObservation,
} from "@harnessfacts/data";

const query = {
  agent: "codex",
  capability: "instructions.nested",
  platform: "linux",
};
const agent = getAgent(query.agent);
const capability = getCapability(query.capability);
const observations = getObservations(query);
const latest = latestObservation(query);
if (!agent || !capability || !observations.length || !latest)
  throw new Error("Expected v0.1.0 example observations are missing");

console.log({
  agent: agent.name,
  capability: capability.title,
  observations: observations.length,
  latest: {
    version: latest.agent.version,
    environment: latest.environment,
    date: latest.execution.startedAt,
    status: latest.result.status,
    evidence: latest.evidence,
  },
});
