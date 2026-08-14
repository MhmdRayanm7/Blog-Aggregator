import { readConfig } from "../config.js";
import { getUserByName } from "../db/queries/users.js";

import type { CommandHandler, UserCommandHandler } from "./types.js";

// Ensures a user is logged in before running a protected command.
export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("No user is currently logged in");
    }

    const user = await getUserByName(config.currentUserName);

    if (!user) {
      throw new Error(`User "${config.currentUserName}" not found`);
    }

    await handler(cmdName, user, ...args);
  };
}
