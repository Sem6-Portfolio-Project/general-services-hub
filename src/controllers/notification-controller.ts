import { INotificationEvent } from "../types/notification";
import { createLogger, CustomLogger } from "../lib/logger";
import { TABLES } from "../constants";
import { DynamodbService } from "../services/dynamodb-service";
import { intoToDDB } from "../mappers/notification-mapper";

const logger: CustomLogger = createLogger({fileName: 'NotificationController'});

export class NotificationController {
  constructor(
    private dynamodbService: DynamodbService,
  ) {
  }

  //TODO: need to fetch connection ids
  getConnectionIds = async(type: string) => {

  }

  //TODO: need to send the notifications for subscribed users
  sendNotification = async(data: INotificationEvent) => {
    logger.debug('Invoked sendNotification with input: %s', JSON.stringify(data));
    
    try {
      logger.debug('Saving notification to %s', TABLES.NOTIFICATIONS);
      await this.saveNotification(data);
      // todo: send notification

    } catch (e) {
      logger.error('Error while executing the sendNotification; error: %s', e);
    }
  }

  /**
   * saving notification data to ddb
   * @param data
   */
  saveNotification = async(data: INotificationEvent) => {
    logger.debug('Invoked saveNotification');

    try {
      await this.dynamodbService.put(
        TABLES.NOTIFICATIONS,
        intoToDDB(data)
      );
      logger.debug('Successfully saved data to the %s', TABLES.NOTIFICATIONS);
    } catch (e) {
      logger.error('Error while executing the saveNotification; error: %s', e);
    }

  }

  //TODO: need to handle offline notifications ( for lost items posts/very important )
}
