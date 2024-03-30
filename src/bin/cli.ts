import "module-alias/register";
import { waitInput } from "../utils"
import { Commander } from "../core/commander";

async function main() {
  const commander = new Commander();
  commander.initialDefaultCmd();
  console.log("Terminal Start");

  while(true)
  {
    const cmd = await waitInput();
    commander.parse(cmd);
  }
}

main();
