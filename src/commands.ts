import { setUser } from "./config";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

export type CommandsRegistry = Record<string, CommandHandler>;

// Set the current user and save it to the config file.
export function handlerLogin(cmdName: string, ...args: string[]) {
  if (!args.length) {
    throw new Error("Username is required");
  }
  const userName = args[0];

  setUser(userName);

  console.log(`User has been set to ${userName}`);
}

// Registers a command name with its handler function.
export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

// Runs a registered command with the provided arguments.
export function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): void {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  handler(cmdName, ...args);
}
