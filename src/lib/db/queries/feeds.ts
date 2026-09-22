import { eq, and, sql } from "drizzle-orm";
import { db } from "../index.js";
import { users, feeds } from "../schema.js";
import { fetchFeed } from "../../rss.js";
import { createPost } from "./posts.js";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();

  return result;
}

export async function getFeeds() {
  const result = await db
    .select({
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));

  return result;
}
export async function getFeedByURL(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}

export async function markFeedFetched(feedId: string) {
  const now = new Date();

  await db
    .update(feeds)
    .set({
      lastFetchedAt: now,
      updatedAt: now,
    })
    .where(eq(feeds.id, feedId));
}

export async function getNextFeedToFetch() {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return feed;
}

function parsePublishedDate(dateStr: string): Date | undefined {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export async function scrapeFeeds(): Promise<void> {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    throw new Error("No feeds found");
  }

  console.log(`Fetching feed: ${feed.name} (${feed.url})`);

  const rssFeed = await fetchFeed(feed.url);

  await markFeedFetched(feed.id);

  for (const item of rssFeed.channel.item) {
    const publishedAt = parsePublishedDate(item.pubDate);

    await createPost({
      title: item.title,
      url: item.link,
      description: item.description,
      publishedAt,
      feedId: feed.id,
    });
  }
}