import { z } from "zod";

export const mcpServerSchema = z
  .object({
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
    url: z.string().optional(),
    env: z.record(z.string()).optional(),
    headers: z.record(z.string()).optional(),
    type: z.string().optional(),
  })
  .passthrough();

export const mcpConfigSchema = z.object({
  mcpServers: z.record(mcpServerSchema),
});

export type RawMcpConfig = z.infer<typeof mcpConfigSchema>;
