import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { feedFollows, posts } from "../schema.js";

export type CreatePostParams = {
  title: string;
  url: string;
  description?: string;
  publishedAt?: Date;
  feedId: string;
};

export async function createPost(post: CreatePostParams) {
  const [result] = await db
    .insert(posts)
    .values(post)
    .onConflictDoNothing({
      target: posts.url,
    })
    .returning();

  return result;
}

export async function getPostsForUser(
  userId: string,
  limit: number
) {
  const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
    })
    .from(posts)
    .innerJoin(
      feedFollows,
      eq(posts.feedId, feedFollows.feedId)
    )
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return result;
}
