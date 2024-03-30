import readline from "node:readline";
import { exit, stdin, stdout } from "process";

export function waitInput() {
  /* Homework */
  const rl = readline.createInterface({
    input: stdin,
    output: stdout
  });
  return new Promise<string>((resolve, reject) =>
  {
    const exitcmd = '.exit .quit'.split(' ');
    rl.on('line', input => {
      console.log(">", input);
      rl.close();
      if(input === exitcmd[0] || input === exitcmd[1])
      {
        exit(0);
      }
      resolve(input);
    })
  })
}
