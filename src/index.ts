import { 
  CommandsRegistry, 
  handlerLogin, 
  registerCommand, 
  runCommand, 
  handlerRegister, 
  handlerReset, 
  handlerUsers,
  handlerAgg,
  handlerAddFeed,
  handlerFeeds
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
  registerCommand(registry, "addfeed", handlerAddFeed)
  registerCommand(registry, "feeds", handlerFeeds);

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
