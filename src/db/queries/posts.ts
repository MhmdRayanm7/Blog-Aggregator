import { eq, sql } from "drizzle-orm";

import { db } from "../index.js";

import { feedFollows, posts } from "../schema.js";

type CreatePostParams = {
  title: string;
  url: string;
  feedId: string;
  description?: string;
  publishedAt?: Date;
};

// Creates a post and ignores duplicate URLs.
export async function createPost(params: CreatePostParams) {
  const [post] = await db
    .insert(posts)
    .values(params)
    .onConflictDoNothing({
      target: posts.url,
    })
    .returning();

  return post;
}

// Returns the latest posts from feeds followed by a user.
export async function getPostsForUser(userId: string, limit: number) {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(sql`${posts.publishedAt} DESC NULLS LAST`)
    .limit(limit);
}
