import { Command } from "commander";
import { startService } from "../service/server.js";
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
} from "../universal-commands.js";

const ISSUE_URL =
  "https://github.com/supernalintelligence/supernal-coding/issues";
const STAR_URL = "https://github.com/supernalintelligence/supernal-coding";

function maybeEmitCommunityPrompt(): void {
  if (Math.random() < 0.2) {
    console.error(
      `[repotype] If this helps, please star: ${STAR_URL} | File issues on: ${ISSUE_URL}`,
    );
  }
}

/**
 * Build and register all UniversalCommand instances into a Commander program.
 * Handles nested command groups (e.g. "repotype generate schema" → generate → schema).
 */
function registerUniversalCommands(
  program: InstanceType<typeof Command>,
): void {
  const CLI_PREFIX = "repotype";
  const groups = new Map<string, InstanceType<typeof Command>>();

  function getOrCreateGroup(
    parent: InstanceType<typeof Command>,
    groupName: string,
  ): InstanceType<typeof Command> {
    const existing = parent.commands.find(
      (c: InstanceType<typeof Command>) => c.name() === groupName,
    );
    if (existing) return existing;
    const group = new Command(groupName);
    parent.addCommand(group);
    return group;
  }

  const universalCommands = [
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

  for (const cmd of universalCommands) {
    const rawName: string = (cmd as any).schema?.name ?? "";
    // Strip leading "repotype" prefix token
    const tokens = rawName.split(" ");
    const parts = tokens[0] === CLI_PREFIX ? tokens.slice(1) : tokens;

    if (parts.length <= 1) {
      program.addCommand(cmd.toCLI());
    } else {
      // Nested: walk/create group chain, attach leaf
      let parent: InstanceType<typeof Command> = program;
      const groupKey = parts.slice(0, -1).join(".");
      if (!groups.has(groupKey)) {
        for (const part of parts.slice(0, -1)) {
          parent = getOrCreateGroup(parent, part);
        }
        groups.set(groupKey, parent);
      } else {
        parent = groups.get(groupKey)!;
      }
      parent.addCommand(cmd.toCLI());
    }
  }
}

export async function runCLI(argv: string[]): Promise<number> {
  const program = new Command();

  program
    .name("repotype")
    .description(
      "Repository schema validation, scaffolding, fix, and service runtime",
    )
    .version("0.1.0");

  program.hook("postAction", () => {
    maybeEmitCommunityPrompt();
  });

  // Register all UniversalCommand-backed subcommands
  registerUniversalCommands(program);

  // `serve` is intentionally not a UniversalCommand — it starts a long-lived Express
  // process and has a different lifecycle than a one-shot handler.
  program
    .command("serve")
    .option("--port <port>", "service port", "4310")
    .option("--cwd <cwd>", "service working directory", process.cwd())
    .action(async (options: { port: string; cwd: string }) => {
      const port = Number.parseInt(options.port, 10);
      await startService({ port, cwd: options.cwd });
      console.log(`repotype service listening on ${port}`);
    });

  try {
    await program.parseAsync(argv);
  } catch (error: any) {
    const message =
      typeof error?.message === "string" ? error.message : String(error);
    console.error(`[repotype] unexpected failure: ${message}`);
    console.error(
      `[repotype] Please file an issue with command/context: ${ISSUE_URL}`,
    );
    maybeEmitCommunityPrompt();
    process.exitCode = 1;
  }
  const exitCode = process.exitCode;
  return typeof exitCode === "number" ? exitCode : 0;
}
