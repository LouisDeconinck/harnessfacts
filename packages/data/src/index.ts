import generated from "./generated.json";
import {
  agentSummary,
  compare,
  type Data,
  latestResults,
  type ObservationQuery,
  latestObservation as queryLatestObservation,
  getObservations as queryObservations,
} from "./model.ts";

const data = generated as Data;
export const { agents, capabilities, tests, claims, results } = data;
export const latest = latestResults(results);
export const getAgent = (id: string) => agentSummary(data, id);
export const getCapability = (id: string) =>
  capabilities.find((capability) => capability.id === id);
export const getObservations = (query: ObservationQuery = {}) =>
  queryObservations(data, query);
export const latestObservation = (query: ObservationQuery) =>
  queryLatestObservation(data, query);
export const getCapabilities = () => capabilities;
export const compareAgents = (ids: string[]) => compare(data, ids);
export type { ObservationQuery } from "./model.ts";
export { latestResults } from "./model.ts";
