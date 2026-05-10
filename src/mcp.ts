/**
 * MCP entry point for repotype.
 *
 * Exposes all repotype UniversalCommand definitions as MCP tools via
 * @supernal/universal-command's createMCPServer — no hand-coded tool list.
 */

import { CommandRegistry } from "@supernal/universal-command";
import { createMCPServer } from "@supernal/universal-command/mcp";
import {
  repotypeValidateCommand,
  repotypeExplainCommand,
  repotypeStatusCommand,
  repotypeApplyCommand,
  repotypeReportCommand,
  repotypeFixCommand,
  repotypeCleanupRunCommand,
  repotypeInstallChecksCommand,
  repotypeInstallWatcherCommand,
  repotypeScaffoldCommand,
  repotypeGenerateSchemaCommand,
  repotypeInitCommand,
  repotypePluginsStatusCommand,
  repotypePluginsInstallCommand,
} from "./universal-commands.js";

export function buildRepotypeRegistry(): CommandRegistry {
  const registry = new CommandRegistry();
  const commands = [
    repotypeValidateCommand,
    repotypeExplainCommand,
    repotypeStatusCommand,
    repotypeApplyCommand,
    repotypeReportCommand,
    repotypeFixCommand,
    repotypeCleanupRunCommand,
    repotypeInstallChecksCommand,
    repotypeInstallWatcherCommand,
    repotypeScaffoldCommand,
    repotypeGenerateSchemaCommand,
    repotypeInitCommand,
    repotypePluginsStatusCommand,
    repotypePluginsInstallCommand,
  ];
  for (const cmd of commands) {
    registry.register(cmd);
  }
  return registry;
}

export async function startMCPServer(): Promise<void> {
  const registry = buildRepotypeRegistry();
  const server = await createMCPServer(registry, {
    name: "repotype",
    version: "0.1.0",
  });
  const { StdioServerTransport } =
    await import("@modelcontextprotocol/sdk/server/stdio.js");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("repotype MCP server running on stdio\n");
}
