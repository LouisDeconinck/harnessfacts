import generated from "./generated.json";
import { agentSummary, compare, type Data, latestResults } from "./model.ts";

const data = generated as Data;
export const { agents, capabilities, tests, claims, results } = data;
export const latest = latestResults(results);
export const getAgent = (id: string) => agentSummary(data, id);
export const getCapabilities = () => capabilities;
export const compareAgents = (ids: string[]) => compare(data, ids);
export { latestResults } from "./model.ts";
