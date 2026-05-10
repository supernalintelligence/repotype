import { Command } from "commander";
import { UniversalCommand } from "@supernal/universal-command";
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

  // Register all UniversalCommand-backed subcommands via the built-in tree builder.
  // buildCommandTree returns a single 'repotype' parent; its .commands are the leaf
  // subcommands (validate, explain, generate → schema, plugins → status/install, etc.).
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
  const [repotypeGroup] = UniversalCommand.buildCommandTree(universalCommands);
  for (const sub of repotypeGroup.commands) {
    program.addCommand(sub);
  }

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
