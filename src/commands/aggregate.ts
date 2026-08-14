import { scrapeFeeds } from "../aggregator.js";

// Converts a duration such as 10s or 1m to milliseconds.
function parseDuration(durationStr: string): number {
  const match = durationStr.match(/^(\d+)(ms|s|m|h)$/);

  if (!match) {
    throw new Error(`Invalid duration: ${durationStr}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
  };

  return value * multipliers[unit];
}

// Runs one scrape cycle and prints errors without stopping the loop.
async function runScrape(): Promise<void> {
  try {
    await scrapeFeeds();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  }
}

// Continuously collects feeds at the requested interval.
export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error(`Usage: ${cmdName} <time_between_requests>`);
  }

  const duration = args[0];
  const timeBetweenRequests = parseDuration(duration);

  console.log(`Collecting feeds every ${duration}`);

  await runScrape();

  const interval = setInterval(() => {
    void runScrape();
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.once("SIGINT", () => {
      clearInterval(interval);

      console.log("Shutting down feed aggregator...");

      resolve();
    });
  });
}
