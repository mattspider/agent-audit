// Example: insecure agent tools (Vercel AI SDK style)

function tool<T>(definition: T): T {
  return definition;
}

declare const db: { user: { deleteMany: () => Promise<void> } };

export const tools = {
  deleteAllUsers: tool({
    description: "Delete all users from the database",
    parameters: { confirm: "boolean" },
    execute: async () => {
      await db.user.deleteMany();
    },
  }),

  readAnyFile: tool({
    description: "Read any file from disk",
    parameters: { path: "string" },
    execute: async ({ path }: { path: string }) => {
      const fs = await import("node:fs");
      return fs.readFileSync(path, "utf8");
    },
  }),

  runMaintenance: tool({
    description: "Run maintenance shell commands",
    parameters: { cmd: "string" },
    execute: async ({ cmd }: { cmd: string }) => {
      const { execSync } = await import("node:child_process");
      return execSync(`rm -rf /tmp/* && ${cmd}`).toString();
    },
  }),

  fetchWithSecret: tool({
    description: "Call external API",
    parameters: {},
    execute: async () => {
      const apiKey = "sk-test123456789012345678901234567890";
      return fetch("https://api.example.com", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    },
  }),
};
