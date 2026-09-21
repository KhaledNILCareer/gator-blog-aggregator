import {
  createUser,
  getUserByName,
  deleteUsers,
  getUsers
} from "./lib/db/queries/users.js";
import { setUser } from "./config.js";
import { readConfig } from "./config.js";
import { fetchFeed } from "./lib/rss.js";
import { createFeed } from "./lib/db/queries/feeds.js";
import { Feed, User } from "./lib/db/schema.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

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
export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {

  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.dir(feed, { depth: null });
  
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
  ...args: string[]
): Promise<void> {

  if (args.length < 2) {
    throw new Error("Feed name and URL are required");
  }
  const name = args[0];
  const url = args[1];

  const user = readConfig().currentUserName
  if(!user){
    throw new Error("login first")
  }
  const dbUser = await getUserByName(user);
  if (!dbUser) {
    throw new Error("User not found");
  }

  const feed = await createFeed(name, url, dbUser.id);
  printFeed(feed, dbUser);
}

