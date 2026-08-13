import { setUser, readConfig } from "./config";
import { fetchFeed } from "./rss.js";

import {
  createUser,
  getUserByName,
  deleteAllUsers,
  getUsers,
} from "./db/queries/users";

// Fetches and prints the RSS feed used by the aggregator.
export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");

  console.log(JSON.stringify(feed, null, 2));
}

// Defines the shape that every async CLI command handler must follow.
export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

// Prints all users and marks the currently logged-in user.
export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allUsers = await getUsers();
  const config = readConfig();

  allUsers.forEach((user) => {
    const isCurrent = user.name === config.currentUserName;

    console.log(`* ${user.name}${isCurrent ? " (current)" : ""}`);
  });
}

// Deletes all users from the database.
export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteAllUsers();

  console.log("Database reset successfully");
}

// Registers a new user, saves them as current, and prints the created user.
export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("Username is required");
  }

  const userName = args[0];

  const existingUser = await getUserByName(userName);

  if (existingUser) {
    throw new Error(`User "${userName}" already exists`);
  }

  const user = await createUser(userName);

  setUser(userName);

  console.log(`User "${userName}" was created`);
  console.log(user);
}

// Logs in only if the user already exists in the database.
export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("Username is required");
  }

  const userName = args[0];

  const user = await getUserByName(userName);

  if (!user) {
    throw new Error(`User "${userName}" does not exist`);
  }

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

// Runs a registered async command with the provided arguments.
export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}
