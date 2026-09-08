import generated from "./generated.json";
import {
  agentSummary,
  compare,
  type Data,
  latestResults,
  latestObservation as queryLatestObservation,
  getObservations as queryObservations,
} from "./model.ts";

const data = generated as Data;
export const { agents, capabilities, tests, claims, results } = data;
export const latest = latestResults(results);
export const getAgent = (id: string) => agentSummary(data, id);
export const getCapability = (id: string) =>
  capabilities.find((capability) => capability.id === id);
export const getObservations = (
  query: Parameters<typeof queryObservations>[1] = {},
) => queryObservations(data, query);
export const latestObservation = (
  query: Parameters<typeof queryLatestObservation>[1],
) => queryLatestObservation(data, query);
export const getCapabilities = () => capabilities;
export const compareAgents = (ids: string[]) => compare(data, ids);
export { latestResults } from "./model.ts";
