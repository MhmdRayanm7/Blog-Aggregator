import {
  type CommandsRegistry,
  registerCommand,
  runCommand,
  handlerLogin,
} from "./commands.js";

// Starts the CLI, reads arguments, and runs the requested command.
function main(): void {
  const registry: CommandsRegistry = {};

  registerCommand(registry, "login", handlerLogin);

  // Remove "node" and the script path.
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  try {
    runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
