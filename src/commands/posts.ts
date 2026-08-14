import { getPostsForUser } from "../db/queries/posts.js";

import type { User } from "../db/schema.js";

// Prints the latest posts from feeds followed by the current user.
export async function handlerBrowse(
  _cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  const limit = args[0] === undefined ? 2 : Number(args[0]);

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("Limit must be a positive integer");
  }

  const posts = await getPostsForUser(user.id, limit);

  posts.forEach((post) => {
    console.log(post.title);
    console.log(post.url);

    if (post.description) {
      console.log(post.description);
    }

    if (post.publishedAt) {
      console.log(`Published: ${post.publishedAt.toISOString()}`);
    }

    console.log();
  });
}
