import {
  handlerLogin,
  handlerRegister,
  registerCommand,
  runCommand,
  type CommandsRegistry,
} from "./commands.js";

// Starts the CLI, reads arguments, and runs the requested command.
async function main(): Promise<void> {
  const registry: CommandsRegistry = {};

  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);

  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Error: command is required");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  process.exit(0);
}

main();
