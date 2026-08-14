import {
  handlerLogin,
  handlerRegister,
  handlerReset,
  handlerUsers,
} from "./commands/auth.js";

import { handlerAddFeed, handlerFeeds } from "./commands/feeds.js";

import {
  handlerFollow,
  handlerFollowing,
  handlerUnfollow,
} from "./commands/follows.js";

import { handlerBrowse } from "./commands/posts.js";
import { handlerAgg } from "./commands/aggregate.js";

import { middlewareLoggedIn } from "./cli/middleware.js";

import { registerCommand, runCommand } from "./cli/registry.js";

import type { CommandsRegistry } from "./cli/types.js";

// Creates and configures all available CLI commands.
function createRegistry(): CommandsRegistry {
  const registry: CommandsRegistry = {};

  registerCommand(registry, "login", handlerLogin);

  registerCommand(registry, "register", handlerRegister);

  registerCommand(registry, "reset", handlerReset);

  registerCommand(registry, "users", handlerUsers);

  registerCommand(registry, "feeds", handlerFeeds);

  registerCommand(registry, "agg", handlerAgg);

  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));

  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));

  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));

  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));

  registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));

  return registry;
}

// Starts the CLI and runs the requested command.
async function main(): Promise<void> {
  const [cmdName, ...args] = process.argv.slice(2);

  if (!cmdName) {
    console.error("Error: command is required");

    process.exit(1);
  }

  const registry = createRegistry();

  try {
    await runCommand(registry, cmdName, ...args);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);

    process.exit(1);
  }

  process.exit(0);
}

main();
