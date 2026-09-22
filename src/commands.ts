import {
  createUser,
  getUserByName,
  deleteUsers,
  getUsers
} from "./lib/db/queries/users.js";
import { setUser } from "./config.js";
import { readConfig } from "./config.js";
import { fetchFeed } from "./lib/rss.js";
import { createFeed, getFeeds, getFeedByURL } from "./lib/db/queries/feeds.js";
import { Feed, User } from "./lib/db/schema.js";
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./lib/db/queries/feedFollows.js";
import { scrapeFeeds } from "./lib/db/queries/feeds.js";
import { getPostsForUser } from "./lib/db/queries/posts.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(
  handler: UserCommandHandler
): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {

    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("No current user selected");
    }

    const user = await getUserByName(config.currentUserName);

    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }

    await handler(cmdName, user, ...args);

  };
}

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error("Unknown command");
  }
  await handler(cmdName, ...args)

}

export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if(args.length === 0){
    throw new Error("Username is required")
  }
  const username = args[0];
  const existingUser = await getUserByName(username);
  if (!existingUser) {
    throw new Error("User does not exist");
  }
  setUser(username)
  console.log(`User has been set to ${username}`)

}

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  if(args.length === 0){
    throw new Error("Username is required")
  }
  const username = args[0];

  const existingUser = await getUserByName(username);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await createUser(username)
  setUser(user.name);

  console.log(`User ${user.name} was created`);
  console.log(user);
}

export async function handlerReset(
  cmdName: string
): Promise<void> {
  await deleteUsers();
  console.log("Users deleted successfully");
}

export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  const users = await getUsers();
  const config = readConfig();

  users.forEach((user)=>{
    if (user.name === config.currentUserName){
      console.log(`* ${user.name} (current)`)
    } else {
      console.log(`* ${user.name}`)
    }
    
  })
}

function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("An unknown error occurred:", error);
  }
}

export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length < 1) {
    throw new Error("Time between requests is required");
  }

  const durationStr = args[0];
  const timeBetweenRequests = parseDuration(durationStr);

  console.log(`Collecting feeds every ${durationStr}`);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export function printFeed(feed: Feed, user: User): void {
  console.log(`ID: ${feed.id}`);
  console.log(`Created At: ${feed.createdAt}`);
  console.log(`Updated At: ${feed.updatedAt}`);
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {

  if (args.length < 2) {
    throw new Error("Feed name and URL are required");
  }
  const name = args[0];
  const url = args[1];

  const feed = await createFeed(name, url, user.id);
  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`User: ${feedFollow.userName}`);
  console.log(`Feed: ${feedFollow.feedName}`);
  printFeed(feed, user);
}
export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  const feeds = await getFeeds();
  feeds.forEach((feed) => {
    console.log(`Name: ${feed.feedName}`);
    console.log(`URL: ${feed.feedUrl}`);
    console.log(`User: ${feed.userName}`);
    console.log();
  })
}

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 1) {
    throw new Error("Feed URL is required");
  }

  const url = args[0];

  const feed = await getFeedByURL(url);
  if (!feed) {
    throw new Error("Feed not found");
  }

  const feedFollow = await createFeedFollow(user.id, feed.id);

  console.log(`User: ${feedFollow.userName}`);
  console.log(`Feed: ${feedFollow.feedName}`);
}
export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  
  const follows = await getFeedFollowsForUser(user.id);

  follows.forEach((follow) => {
    console.log(follow.feedName);
  });
}

export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 1) {
    throw new Error("Feed URL is required");
  }

  const url = args[0];

  await deleteFeedFollow(user.id ,url)
}

export function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) {
    throw new Error("Invalid duration");
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      throw new Error("Invalid duration unit");
  }
}


export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  let limit = 2;

  if (args.length > 0) {
    const parsedLimit = Number(args[0]);

    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      throw new Error("Limit must be a positive integer");
    }

    limit = parsedLimit;
  }

  const posts = await getPostsForUser(user.id, limit);

  posts.forEach((post) => {
    console.log(`Title: ${post.title}`);
    console.log(`URL: ${post.url}`);
    console.log(`Description: ${post.description ?? ""}`);
    console.log(`Published At: ${post.publishedAt ?? "Unknown"}`);
    console.log();
  });
}