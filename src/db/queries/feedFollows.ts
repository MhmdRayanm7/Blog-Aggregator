import { and, eq } from "drizzle-orm";

import { db } from "..";
import { feedFollows, feeds, users } from "../schema";

// Creates a feed follow and returns it with the linked user and feed names.
export async function createFeedFollow(userId: string, feedId: string) {
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({
      userId,
      feedId,
    })
    .returning();

  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

  return result;
}

// Returns all feeds followed by a given user.
export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      id: feedFollows.id,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
}

// Deletes a feed follow using the user ID and feed URL.
export async function deleteFeedFollow(
  userId: string,
  feedUrl: string,
): Promise<void> {
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, feedUrl));

  if (!feed) {
    throw new Error(`Feed not found: ${feedUrl}`);
  }

  await db
    .delete(feedFollows)
    .where(
      and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)),
    );
}
