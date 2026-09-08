import { z } from "zod";

const id = z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/);
const version = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]*$/);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const authors = z
  .array(z.object({ github: z.string().regex(/^[a-zA-Z0-9-]+$/) }))
  .default([]);
export const AgentDefinition = z.object({
  schema: z.literal("harnessfacts.agent/v1"),
  id,
  name: z.string().min(1),
  vendor: z.string(),
  website: z.url(),
  documentation: z.url(),
  invocation: z.object({ kind: z.enum(["cli", "manual"]) }),
  platforms: z.object({
    linux: z.boolean(),
    macos: z.boolean(),
    windows: z.boolean(),
  }),
  authors,
});
export type AgentDefinition = z.infer<typeof AgentDefinition>;
export const CapabilityDefinition = z.object({
  schema: z.literal("harnessfacts.capability/v1"),
  id,
  title: z.string(),
  category: z.enum([
    "instructions",
    "mcp",
    "execution",
    "extensibility",
    "git",
  ]),
  description: z.string(),
});
export type CapabilityDefinition = z.infer<typeof CapabilityDefinition>;
export const TestDefinition = z.object({
  schema: z.literal("harnessfacts.test/v1"),
  id,
  capability: id,
  title: z.string(),
  version,
  description: z.string(),
  prompt: z.string().min(1),
  expected: z.object({ type: z.string(), value: z.string() }),
  tags: z.array(z.string()),
  authors,
});
export type TestDefinition = z.infer<typeof TestDefinition>;
export const EnvironmentDefinition = z.object({
  schema: z.literal("harnessfacts.environment/v1"),
  os: z.enum(["linux", "macos", "windows"]),
  osVersion: z.string().min(1),
  arch: z.string().min(1),
  runtime: z.object({ bun: z.string().min(1) }),
});
export type EnvironmentDefinition = z.infer<typeof EnvironmentDefinition>;
export const Evidence = z.object({
  stdoutSha256: hash,
  stderrSha256: hash,
  artifacts: z.array(
    z.object({
      path: z
        .string()
        .refine(
          (path) => !path.includes(":") && !path.includes("\0"),
          "Invalid artifact path",
        )
        .regex(/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^\\]+$/),
      sha256: hash,
    }),
  ),
});
export type Evidence = z.infer<typeof Evidence>;
export const RunResult = z.object({
  schema: z.literal("harnessfacts.run/v1"),
  runId: z.uuid(),
  agent: z.object({ id, version }),
  test: z.object({ id, version }),
  environment: EnvironmentDefinition,
  execution: z.object({
    startedAt: z.iso.datetime(),
    durationMs: z.number().nonnegative(),
    exitCode: z.number().int().nullable(),
  }),
  result: z.object({
    status: z.enum(["pass", "fail", "error", "skipped", "unsupported"]),
    summary: z.string().min(1),
  }),
  evidence: Evidence,
  provenance: z.object({
    kind: z.enum(["official", "community"]),
    contributor: z.string().optional(),
  }),
});
export type RunResult = z.infer<typeof RunResult>;
export const DocumentationClaim = z.object({
  schema: z.literal("harnessfacts.claim/v1"),
  agent: id,
  capability: id,
  status: z.enum(["documented", "not-documented", "unknown"]),
  source: z.object({
    url: z.url(),
    title: z.string().min(1),
    accessedAt: z.iso.date(),
  }),
});
export type DocumentationClaim = z.infer<typeof DocumentationClaim>;
