import {
  createFeedFollow,
  deleteFeedFollow,
  getFeedFollowsForUser,
} from "../db/queries/feedFollows.js";

import { getFeedByUrl } from "../db/queries/feeds.js";

import type { User } from "../db/schema.js";

// Follows an existing feed for the current user.
export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`Usage: ${cmdName} <url>`);
  }

  const feedUrl = args[0];
  const feed = await getFeedByUrl(feedUrl);

  if (!feed) {
    throw new Error(`Feed not found: ${feedUrl}`);
  }

  const follow = await createFeedFollow(user.id, feed.id);

  console.log(`${follow.userName} is now following ${follow.feedName}`);
}

// Prints all feeds followed by the current user.
export async function handlerFollowing(
  _cmdName: string,
  user: User,
): Promise<void> {
  const follows = await getFeedFollowsForUser(user.id);

  follows.forEach((follow) => {
    console.log(`* ${follow.feedName}`);
  });
}

// Unfollows a feed for the current user.
export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`Usage: ${cmdName} <url>`);
  }

  const feedUrl = args[0];

  await deleteFeedFollow(user.id, feedUrl);

  console.log(`Unfollowed feed: ${feedUrl}`);
}
