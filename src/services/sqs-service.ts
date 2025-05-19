import { 
  SendMessageCommand,
  SendMessageCommandOutput,
  SQSClient
 } from "@aws-sdk/client-sqs";
import { AwsService } from "./aws-service";

export class SQSService extends AwsService {
  constructor() {
    super(
      "SQSClient",
      new SQSClient({})
      
    );
  };

  /**
   * send message to the queue
   * @param queueUrl 
   * @param messageBody 
   * @param delaySeconds
   */
  sendMessageToQueue = (
    queueUrl: string,
    messageBody: string,
    delaySeconds?: number
  ): Promise<SendMessageCommandOutput> => {
    return this.executeCommand(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: messageBody,
        DelaySeconds: delaySeconds ?? 0
      }),
      'SendMessageCommand'
    );
  }
}