import { getNextFeedToFetch, markFeedFetched } from "./db/queries/feeds.js";

import { createPost } from "./db/queries/posts.js";
import { fetchFeed } from "./rss.js";

// Converts an RSS date string to a valid Date.
function parsePublishedDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

// Fetches the next feed and stores its posts.
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
    await createPost({
      title: item.title,
      url: item.link,
      feedId: feed.id,
      description: item.description,
      publishedAt: parsePublishedDate(item.pubDate),
    });
  }
}
