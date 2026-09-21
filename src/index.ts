import { readConfig, setUser } from "./config.js";

function main() {
  setUser("Khaled");
  console.log(readConfig())
}

main();
