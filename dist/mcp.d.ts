import { CommandRegistry } from '@supernal/universal-command';

/**
 * MCP entry point for repotype.
 *
 * Exposes all repotype UniversalCommand definitions as MCP tools via
 * @supernal/universal-command's createMCPServer — no hand-coded tool list.
 */

declare function buildRepotypeRegistry(): CommandRegistry;
declare function startMCPServer(): Promise<void>;

export { buildRepotypeRegistry, startMCPServer };
