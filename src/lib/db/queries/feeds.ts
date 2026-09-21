import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { feeds } from "../schema.js";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();

  return result;
}

/* export async function getUserByName(name: string) {
  const [result] = await db
    .select()
    .from(feeds)
    .where(eq(users.name, name));

  return result;
}

export async function getUsers() {
  const result = await db
    .select()
    .from(feeds);

  return result;
}

export async function deleteUsers() {
  await db.delete(feeds);
} */