import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { users, feeds } from "../schema.js";

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
/* export async function getUserByName(name: string) {
  const [result] = await db
    .select()
    .from(feeds)
    .where(eq(users.name, name));

  return result;
}



export async function deleteUsers() {
  await db.delete(feeds);
} */