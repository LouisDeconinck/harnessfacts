import type { TestDefinition } from "../../schema/src/index.ts";
export interface DetectionResult {
  available: boolean;
  version?: string;
  reason?: string;
}
export interface AgentRunOutput {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  timedOut?: boolean;
}
export interface AdapterPrepareContext {
  cwd: string;
  home: string;
  env: Record<string, string>;
  test: TestDefinition;
  mcp?: { command: string; args: string[]; url?: string };
}
export interface AgentRunContext extends AdapterPrepareContext {
  timeoutMs: number;
}
export interface AgentAdapter {
  id: string;
  detect(): Promise<DetectionResult>;
  getVersion(): Promise<string>;
  isAuthenticated(): Promise<boolean | "unknown">;
  supports(test: TestDefinition): string | undefined;
  prepare(context: AdapterPrepareContext): Promise<void>;
  run(context: AgentRunContext): Promise<AgentRunOutput>;
}
export interface EvaluationContext {
  cwd: string;
  output: AgentRunOutput;
  test: TestDefinition;
  read(path: string): Promise<string | null>;
}
export interface TestSetup {
  mcp?: AdapterPrepareContext["mcp"];
  evidence?(): Promise<Record<string, string>>;
  dispose(): Promise<void>;
}
export interface ConformanceTest {
  setup?(base: string): Promise<TestSetup>;
  definition: TestDefinition;
  directory: string;
  evaluate(
    context: EvaluationContext,
  ): Promise<{ pass: boolean; summary: string }>;
}
