import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

// Fetches an RSS feed, parses its XML, and returns validated feed data.
export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }

  const xml = await response.text();

  const parser = new XMLParser({
    processEntities: false,
  });

  const parsed = parser.parse(xml); //=> Js object

  const channel = parsed?.rss?.channel;

  if (!channel) {
    throw new Error("RSS channel not found");
  }

  if (
    typeof channel.title !== "string" ||
    typeof channel.link !== "string" ||
    typeof channel.description !== "string"
  ) {
    throw new Error("Invalid RSS channel metadata");
  }

  const rawItems = channel.item
    ? Array.isArray(channel.item)
      ? channel.item
      : [channel.item]
    : []; // Makes sure channel.item is always an array.


    // Keeps only valid RSS items and converts them to our RSSItem format.
  const items: RSSItem[] = rawItems
    .filter(
      (item: any) =>
        typeof item.title === "string" &&
        typeof item.link === "string" &&
        typeof item.description === "string" &&
        typeof item.pubDate === "string",
    )
    .map((item: any) => ({  //To take only needed fields

      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    }));

  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: items,
    },
  };
}
