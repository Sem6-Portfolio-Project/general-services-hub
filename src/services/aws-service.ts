import { createLogger, CustomLogger } from "../lib/logger.js";

const logger: CustomLogger = createLogger({ fileName: "AwsService" });

export class AwsService {
  protected readonly client;
  protected readonly serviceName: string;

  constructor(serviceName: string, client: any) {
    this.serviceName= serviceName;
    this.client = client;
  }

  /**
   * execute the aws command
   * @param cmd
   * @param cmdName
   */
  executeCommand(cmd:any, cmdName:string) {
    logger.debug(
      "Executing %s command: %s with input: %s",
      this.serviceName,
      cmdName,
      JSON.stringify(cmd.input)
    )
    return this.client.send(cmd);
  }
}
