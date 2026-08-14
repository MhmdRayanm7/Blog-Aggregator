import { createFeed, getFeeds } from "../db/queries/feeds.js";

import { createFeedFollow } from "../db/queries/feedFollows.js";

import type { Feed, User } from "../db/schema.js";

// Prints a feed with its creator information.
function printFeed(feed: Feed, user: User): void {
  console.log(`Feed ID: ${feed.id}`);
  console.log(`Feed Name: ${feed.name}`);
  console.log(`Feed URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

// Adds a feed and automatically follows it for the current user.
export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error(`Usage: ${cmdName} <name> <url>`);
  }

  const [feedName, feedUrl] = args;

  const feed = await createFeed(feedName, feedUrl, user.id);

  const follow = await createFeedFollow(user.id, feed.id);

  console.log(`${follow.userName} is now following ${follow.feedName}`);

  printFeed(feed, user);
}

// Prints every feed with its URL and creator.
export async function handlerFeeds(): Promise<void> {
  const feeds = await getFeeds();

  feeds.forEach((feed) => {
    console.log(`Name: ${feed.name}`);
    console.log(`URL: ${feed.url}`);
    console.log(`User: ${feed.userName}`);
    console.log();
  });
}
