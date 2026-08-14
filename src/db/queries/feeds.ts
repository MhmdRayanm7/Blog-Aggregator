import { eq, sql } from "drizzle-orm";

import { db } from "../index.js";

import { feeds, users } from "../schema.js";

// Creates a feed linked to its creator.
export async function createFeed(name: string, url: string, userId: string) {
  const [feed] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return feed;
}

// Returns every feed with its creator name.
export async function getFeeds() {
  return db
    .select({
      name: feeds.name,
      url: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}

// Finds a feed by URL.
export async function getFeedByUrl(url: string) {
  const [feed] = await db.select().from(feeds).where(eq(feeds.url, url));

  return feed;
}

// Records that a feed has just been fetched.
export async function markFeedFetched(feedId: string): Promise<void> {
  const now = new Date();

  await db
    .update(feeds)
    .set({
      lastFetchedAt: now,
      updatedAt: now,
    })
    .where(eq(feeds.id, feedId));
}

// Returns the feed that has waited longest to be fetched.
export async function getNextFeedToFetch() {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return feed;
}
