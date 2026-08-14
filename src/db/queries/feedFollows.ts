import { and, eq } from "drizzle-orm";

import { db } from "../index.js";

import { feedFollows, feeds, users } from "../schema.js";

// Creates a feed follow and returns related names.
export async function createFeedFollow(userId: string, feedId: string) {
  const [createdFollow] = await db
    .insert(feedFollows)
    .values({
      userId,
      feedId,
    })
    .returning();

  const [follow] = await db
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
    .where(eq(feedFollows.id, createdFollow.id));

  return follow;
}

// Returns all feeds followed by a user.
export async function getFeedFollowsForUser(userId: string) {
  return db
    .select({
      id: feedFollows.id,
      feedId: feedFollows.feedId,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
}

// Deletes a user's follow for a feed URL.
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
