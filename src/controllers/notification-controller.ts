import { 
  IDeviceRegisterReq, 
  INotificationEvent
 } from "../types/notification";
import { 
  createLogger,
  CustomLogger } from "../lib/logger";
import { NOTIFICATION_TYPES, SNS_TOPICS, TABLES } from "../constants";
import { DynamodbService } from "../services/dynamodb-service";
import { 
  getddbKeyofEndpoints, 
  getNotificationData, 
  intoToDDB,
  notificationDataToddb
 } from "../mappers/notification-mapper";
import { SNSService } from "../services/sns-service";

const logger: CustomLogger = createLogger({fileName: 'NotificationController'});

export class NotificationController {
  constructor(
    private dynamodbService: DynamodbService,
    private snsService: SNSService
  ) {
  }

  //TODO: need to fetch connection ids
  getConnectionIds = async(type: string) => {

  }

  //TODO: need to send the notifications for subscribed users
  sendNotification = async(data: INotificationEvent) => {

    logger.debug('Invoked sendNotification with input: %s', JSON.stringify(data));
    
    try {
      if(data?.receivers && data.receivers?.length != 0) {
        logger.debug('Publishing messages to targetEnponts: %s', data.receivers);

        const publishPromises = data.receivers.map((receiver) =>
            this.snsService.publishMessage(data.message, undefined, receiver));
        await Promise.all(publishPromises)

      } else if(data.type == NOTIFICATION_TYPES.LOST_FOUND.value) {
        logger.debug('Publishing message to sns topic: %s', NOTIFICATION_TYPES.LOST_FOUND.snsTopic.name);

        await this.snsService.publishMessage(
          data.message, 
          NOTIFICATION_TYPES.LOST_FOUND.snsTopic.arn, 
          undefined
        );

      } else if(data.type == NOTIFICATION_TYPES.SYSTEM.value) {
        logger.debug('Publishing message to sns topic: %s', NOTIFICATION_TYPES.SYSTEM.snsTopic.name);

        await this.snsService.publishMessage(
          data.message, 
          NOTIFICATION_TYPES.SYSTEM.snsTopic.arn, 
          undefined
        );
      };

      logger.debug('Saving notification to %s', TABLES.NOTIFICATIONS);
      await this.saveNotification(data);

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

  /**
   * register device endpoint in the SNS 
   * @param deviceToken 
   */
  registerDevice = async(reqData: IDeviceRegisterReq) => {
    const {email, deviceToken} = reqData;
    logger.debug('Invoked registerDevice with reqData: %s', reqData);

    try {
      const existingddbData = await this.dynamodbService.getItem(
        TABLES.APPLICATION_ENDPOINTS,
        getddbKeyofEndpoints(email)
      );

      if(existingddbData?.Item) {
        const existingData = getNotificationData(existingddbData.Item);
        try {
          logger.debug('Getting application endpoint attributes.');
          const endpointAttributes = await this.snsService.getEndpointAttributes(existingData.deviceToken);

          if(!endpointAttributes?.Attributes?.Enabled || endpointAttributes?.Attributes?.Token != deviceToken) {
            logger.debug('Deleting application endpoint.');

            try {
              await this.snsService.deleteEndpoint(existingData.endpointArn);
            } catch (e) {
              logger.error('Error while deleting the application endpoint; error: %s', e);
            }
            
            await this.createAndSaveEndpoint(reqData);
          }
        } catch (e: any) {
          if (e.code === 'NotFoundException') {
            logger.error('Endpoint does not exist. error: %s', e);

            await this.createAndSaveEndpoint(reqData);
          } else {
            logger.error('Error while getting endpointAttributes. error: %s', e);
          }
        }
      } else {
        logger.info('No existing endpoint, creating new endpoint...');
        await this.createAndSaveEndpoint(reqData);
      }
    } catch (e) {
      logger.error('Unexpected error during device registration: %o', e);
    }
  }

  /**
   * create endpoint and save it to the ddb
   * @param reqData 
   */
  createAndSaveEndpoint = async(reqData: IDeviceRegisterReq) => {
    const {email, deviceToken} = reqData;
    logger.debug('Creating application endpoint with deviceToken: %s', deviceToken);

    try {
      const newplatformEndpointData = await this.snsService.createApplicationEndpoint(deviceToken);

      if(newplatformEndpointData?.EndpointArn) {
        logger.debug('Saving application endpoint to ddbTable: %s', TABLES.APPLICATION_ENDPOINTS);

        const subscriptionArns = await this.subscribSNSTopics(newplatformEndpointData.EndpointArn);

        if (subscriptionArns?.length == 2) {
          await this.dynamodbService.put(
            TABLES.APPLICATION_ENDPOINTS,
            notificationDataToddb({
              email,
              deviceToken,
              endpointArn: newplatformEndpointData.EndpointArn,
              sysSubscriptionArn: subscriptionArns[0],
              lostItemSubscriptionArn: subscriptionArns[1]
            })
          );
        }
      }
    } catch (e) {
      logger.error('Error while creating and saving application endpoint; error: %o', e);
    }
  }

  /**
   * subscribing to the sns topics
   * @param endpointArn 
   */
  subscribSNSTopics = async(endpointArn: string) => {
    logger.debug('Invoking the subscribSNSTopics with endpointArn: %s', endpointArn);

    try {
      logger.debug('Subscribing the topic : %s', SNS_TOPICS.SYSTEM.name);
      const sysSubscriptionData = await this.snsService.subscribeSNSTopic(
        SNS_TOPICS.SYSTEM.arn ?? '',
        endpointArn,
      );

      logger.debug('Subscribing the topic : %s', SNS_TOPICS.LOST_ITEMS.name);
      const lostItemSubscriptionData = await this.snsService.subscribeSNSTopic(
        SNS_TOPICS.LOST_ITEMS.arn ?? '',
        endpointArn,
      );

      logger.debug('Successfully subscribed the topics');
      return [sysSubscriptionData.SubscriptionArn, lostItemSubscriptionData.SubscriptionArn]
    } catch (e) {
      logger.error('Error while subscribing the topics; error: %o', e);
    }
  }

  /**
   * unsubscribe topics
   * @param subscriptionArns 
   */
  unsubscribeTopics = async(subscriptionArns: string[]) => {
    logger.debug('Invoking the unsubscribSNSTopics');

    try {
      for(const arn of subscriptionArns) {
        await this.snsService.unsubscribeSNSTopic(arn);
        logger.debug('Successfully unsubscribSNSTopic: %s', arn);
      };
    } catch (e) {
      logger.error('Error while unsubscribing subscriptionArns; %o', e);
    }
  }
}
