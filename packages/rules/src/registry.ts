import { broadFilesystem } from "./rules/broad-filesystem.js";
import { secretInConfig } from "./rules/secret-in-config.js";
import { dangerousCommand } from "./rules/dangerous-command.js";
import { noAuth } from "./rules/no-auth.js";
import { envSecrets } from "./rules/env-secrets.js";
import { unrestrictedDatabase } from "./rules/unrestricted-database.js";
import { httpServerInsecure } from "./rules/http-server-insecure.js";
import { wildcardOrigin } from "./rules/wildcard-origin.js";
import { tooManyServers } from "./rules/too-many-servers.js";
import { unknownServer } from "./rules/unknown-server.js";
import { destructiveToolName } from "./rules/code-destructive-tool-name.js";
import { dangerousExecute } from "./rules/code-dangerous-execute.js";
import { secretInCode } from "./rules/code-secret-in-tool.js";
import { unrestrictedFileAccess } from "./rules/code-unrestricted-file-access.js";
import { tooManyTools } from "./rules/code-too-many-tools.js";
import type { Rule } from "@agent-audit/core";

export const mcpRules: Rule[] = [
  broadFilesystem,
  secretInConfig,
  dangerousCommand,
  noAuth,
  envSecrets,
  unrestrictedDatabase,
  httpServerInsecure,
  wildcardOrigin,
  tooManyServers,
  unknownServer,
];

export const codeRules: Rule[] = [
  destructiveToolName,
  dangerousExecute,
  secretInCode,
  unrestrictedFileAccess,
  tooManyTools,
];

export const builtinRules: Rule[] = [...mcpRules, ...codeRules];

export {
  broadFilesystem,
  secretInConfig,
  dangerousCommand,
  noAuth,
  envSecrets,
  unrestrictedDatabase,
  httpServerInsecure,
  wildcardOrigin,
  tooManyServers,
  unknownServer,
  destructiveToolName,
  dangerousExecute,
  secretInCode,
  unrestrictedFileAccess,
  tooManyTools,
};

export function getRuleById(id: string): Rule | undefined {
  return builtinRules.find((r) => r.id === id);
}
