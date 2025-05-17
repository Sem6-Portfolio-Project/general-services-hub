import { Handler, SNSEvent, SNSMessage } from 'aws-lambda';
import { createLogger, CustomLogger } from "../lib/logger";
import { NotificationController } from "../controllers/notification-controller";
import { INotificationEvent } from "../types/notification";
import { DynamodbService } from '../services/dynamodb-service';
import { SNSService } from '../services/sns-service';

const logger: CustomLogger = createLogger({fileName: 'NotificationInvoker'});
const dynamodb: DynamodbService = new DynamodbService();
const snsService: SNSService = new SNSService(); 
const controller: NotificationController = new NotificationController(dynamodb, snsService);

export const handler: Handler = async(event: SNSEvent): Promise<void> => {
  logger.debug('Invoked with input event: %s', JSON.stringify(event));
  const snsPayload: SNSMessage = event.Records[0].Sns;
  const snsMessage = JSON.parse(snsPayload.Message) as INotificationEvent;

  try {
    logger.debug('Executing the sendNotification with input : %s', JSON.stringify(snsMessage));
    await controller.sendNotification(snsMessage);
  } catch (e) {
    logger.error('Error while invoking with error; %s', e);
  }
}
