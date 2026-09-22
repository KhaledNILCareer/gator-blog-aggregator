import { 
  CommandsRegistry, 
  middlewareLoggedIn,
  handlerLogin, 
  registerCommand, 
  runCommand, 
  handlerRegister, 
  handlerReset, 
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds,
  handlerFollow,
  handlerFollowing,
  handlerUnfollow
} from "./commands.js";

async function  main() {
  const processArgs = process.argv.slice(2);
  if (processArgs.length === 0) {
    console.error("Not enough arguments");
    process.exit(1);
  }
  const cmdName = processArgs[0];
  const args = processArgs.slice(1);
  const registry :CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin)
  registerCommand(registry, "register", handlerRegister)
  registerCommand(registry, "reset", handlerReset)
  registerCommand(registry, "users", handlerUsers)
  registerCommand(registry, "agg", handlerAgg)
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed))
  registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
  try {
    await runCommand(registry, cmdName, ...args)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
    
    process.exit(1);
  }

  process.exit(0);
}

main();
