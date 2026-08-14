import { desc, eq } from "drizzle-orm";

import { db } from "..";
import { feedFollows, posts } from "../schema";

// Creates a post and ignores it if its URL already exists.
export async function createPost(
  title: string,
  url: string,
  feedId: string,
  description?: string,
  publishedAt?: Date,
) {
  const [post] = await db
    .insert(posts)
    .values({
      title,
      url,
      feedId,
      description,
      publishedAt,
    })
    .onConflictDoNothing({
      target: posts.url,
    })
    .returning();

  return post;
}

// Returns the latest posts from feeds followed by a user.
export async function getPostsForUser(
  userId: string,
  limit: number,
) {
  return await db
    .select()
    .from(posts)
    .innerJoin(
      feedFollows,
      eq(posts.feedId, feedFollows.feedId),
    )
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}