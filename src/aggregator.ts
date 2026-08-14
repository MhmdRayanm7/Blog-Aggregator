import { getNextFeedToFetch, markFeedFetched } from "./db/queries/feeds.js";
import { fetchFeed } from "./rss.js";
import { createPost } from "./db/queries/posts.js";

// Fetches the next feed and saves its posts to the database.
export async function scrapeFeeds(): Promise<void> {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds found");
    return;
  }

  console.log(`Fetching: ${feed.name}`);

  const rssFeed = await fetchFeed(feed.url);

  await markFeedFetched(feed.id);

  for (const item of rssFeed.channel.item) {
    const publishedAt = parsePublishedDate(item.pubDate);

    await createPost(
      item.title,
      item.link,
      feed.id,
      item.description,
      publishedAt,
    );
  }
}

// Converts an RSS date string to a valid Date when possible.
function parsePublishedDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
