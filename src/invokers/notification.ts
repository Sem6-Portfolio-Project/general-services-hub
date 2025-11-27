import "reflect-metadata";
import { Handler, SQSEvent, SQSRecord } from 'aws-lambda';
import { createLogger, CustomLogger } from "../lib/logger.js";
import { NotificationController } from "../controllers/notification-controller.js";
import { INotificationEvent } from "../types/notification.js";
import { DynamodbService } from '../services/dynamodb-service.js';
import { SNSService } from '../services/sns-service.js';

const logger: CustomLogger = createLogger({fileName: 'NotificationInvoker'});
const dynamodb: DynamodbService = new DynamodbService();
const snsService: SNSService = new SNSService(); 
const controller: NotificationController = new NotificationController(dynamodb, snsService);

export const handler: Handler = async(event: SQSEvent): Promise<void> => {
  logger.debug('Invoked with input event: %s', JSON.stringify(event));

  const sqsPayload: SQSRecord = event.Records[0];
  const sqsMessage = JSON.parse(sqsPayload.body) as INotificationEvent;

  try {
    logger.debug('Executing the sendNotification with input : %s', JSON.stringify(sqsMessage));

    await controller.sendNotification(sqsMessage);

  } catch (e) {
    logger.error('Error while invoking handler with error; %s', e);
  }
}
