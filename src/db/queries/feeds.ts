import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds, users } from "../schema";

// Creates a new feed linked to a user.
export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return result;
}

// Returns all feeds with the name of the user who created each feed.
export async function getFeeds() {
  return await db
    .select({
      name: feeds.name,
      url: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}

// Finds a feed by its URL.
export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));

  return result;
}

// Marks a feed as fetched at the current time.
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


// Returns the feed that should be fetched next.
export async function getNextFeedToFetch() {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return feed;
}