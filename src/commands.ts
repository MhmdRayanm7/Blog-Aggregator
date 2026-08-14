import { setUser, readConfig } from "./config";
import { fetchFeed } from "./rss.js";

import {
  createUser,
  getUserByName,
  deleteAllUsers,
  getUsers,
} from "./db/queries/users";
import { Feed, User } from "./db/schema";
import { createFeed, getFeedByUrl, getFeeds } from "./db/queries/feeds";
import {
  createFeedFollow,
  getFeedFollowsForUser,
} from "./db/queries/feedFollows";

// Prints all feeds followed by the current user.
export async function handlerFollowing(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const config = readConfig();

  const user = await getUserByName(config.currentUserName);

  if (!user) {
    throw new Error("Current user does not exist");
  }

  const follows = await getFeedFollowsForUser(user.id);

  follows.forEach((follow) => {
    console.log(`* ${follow.feedName}`);
  });
}

// Follows an existing feed for the current user.
export async function handlerFollow(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("Feed URL is required");
  }

  const url = args[0];
  const config = readConfig();

  const user = await getUserByName(config.currentUserName);

  if (!user) {
    throw new Error("Current user does not exist");
  }

  const feed = await getFeedByUrl(url);

  if (!feed) {
    throw new Error("Feed does not exist");
  }

  const follow = await createFeedFollow(user.id, feed.id);

  console.log(`${follow.userName} is now following ${follow.feedName}`);
}

// Prints a feed together with the user who added it.
function printFeed(feed: Feed, user: User): void {
  console.log(`Feed ID: ${feed.id}`);
  console.log(`Feed Name: ${feed.name}`);
  console.log(`Feed URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

// Prints all feeds with their URL and creator name.
export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const allFeeds = await getFeeds();

  allFeeds.forEach((feed) => {
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${feed.userName}`);
    console.log();
  });
}


// Adds a new RSS feed for the currently logged-in user.
export async function handlerAddFeed(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error("Feed name and URL are required");
  }

  const feedName = args[0];
  const feedUrl = args[1];

  const config = readConfig();

  const user = await getUserByName(config.currentUserName);

  if (!user) {
    throw new Error("Current user does not exist");
  }

  const feed = await createFeed(feedName, feedUrl, user.id);
  const follow = await createFeedFollow(user.id, feed.id);

  console.log(`${follow.userName} is now following ${follow.feedName}`);

  printFeed(feed, user);
}


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
