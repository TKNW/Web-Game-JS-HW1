import { ProcessState, CodeMessage } from "../utils";
import type { IResourceOperator, ICommander, ParseResult } from "@/core/types";
import { argsParser } from "../utils/args-parser";

/* Homework */
import { JSONStorage } from "./JSONStorage";
import { CollectOperator } from "../command/collect";


export class Commander implements ICommander {
  private operator_ = new Map<string, IResourceOperator>();
  public port = 1000;

  public initialDefaultCmd(): void 
  {
    const storage = new JSONStorage('defaultdir');
    const collect = new CollectOperator(storage);
    this.load('collect', collect);
  }

  load(label: string, runner: IResourceOperator) {
    /* Homework */
    this.operator_.set(label, runner);
  }

  parse(cmd: string): ParseResult {
    const [_, command, subcommand, ...tokens] = cmd.trim().split(" ");
    let state = ProcessState.SUCCESS;
    const params: Record<string, any> = argsParser(tokens);
    try {
      const runner = this.operator_.get(subcommand);
      if (!runner) throw ProcessState.ERR_UNKNOWN_CMD;
      if(_ !== 'lb')
      {
        state = ProcessState.ERR_UNKNOWN_CMD;
      }
      else
      {
        state = runner.isValidateCmd(command, params);
      }
    } catch (errCode) {
      state = errCode as ProcessState;
    }
    if(state === ProcessState.SUCCESS)
    {
      const runner = this.operator_.get(subcommand);
      if (!runner) throw ProcessState.ERR_UNKNOWN_CMD;
      switch (command)
      {
        case 'drop':
          try
          {
            runner.drop(params);
          }
          catch(err)
          {
            state = err as ProcessState;
          }
          break;
        case 'make':
          try
          {
            runner.make(params);
          }
          catch(err)
          {
            state = err as ProcessState;
          }
          break;
        case 'insert':
          try
          {
            runner.insert(params);
          }
          catch(err)
          {
            state = err as ProcessState;
          }
          break;
        case 'update':
          try
          {
            runner.update(params);
          }
          catch(err)
          {
            state = err as ProcessState;
          }
          break;
        case 'delete':
          try
          {
            runner.delete(params);
          }
          catch(err)
          {
            state = err as ProcessState;
          }
          break;
        case 'import':
          try
          {
            runner.import(params.fileName);
          }
          catch(err)
          {
            state = err as ProcessState;
          }
          break;
        default:
          state = ProcessState.ERR_UNKNOWN_CMD;
          break;
      }
    }
    console.log(CodeMessage[state]);
    return {
      command,
      state,
      params,
    };
  }
}
