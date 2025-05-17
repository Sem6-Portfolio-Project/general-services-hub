import { 
  IDeviceRegisterReq, 
  INotificationEvent
 } from "../types/notification";
import { 
  createLogger,
  CustomLogger } from "../lib/logger";
import { TABLES } from "../constants";
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

  /**
   * create device endpoint in the SNS 
   * @param deviceToken 
   */
  registerDevice = async(reqData: IDeviceRegisterReq) => {
    const {email, deviceToken} = reqData;
    logger.debug('Invoked registerDevice with reqData: %s', reqData);

    const createAndSaveEndpoint = async() => {
      logger.debug('Creating application endpoint with deviceToken: %s', deviceToken);

      try {
        const newplatformEndpointData = await this.snsService.createApplicationEndpoint(deviceToken);

        if(newplatformEndpointData?.EndpointArn) {
          logger.debug('Saving application endpoint to ddbTable: %s', TABLES.APPLICATION_ENDPOINTS);

          await this.dynamodbService.put(
            TABLES.APPLICATION_ENDPOINTS,
            notificationDataToddb({
              email,
              deviceToken,
              endpointArn: newplatformEndpointData.EndpointArn
            })
          );
        }
      } catch (e) {
        logger.error('Error while creating and saving application endpoint; error: %o', e);
      }
    }

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
            
            await createAndSaveEndpoint();
          }
        } catch (e: any) {
          if (e.code === 'NotFoundException') {
            logger.error('Endpoint does not exist. error: %s', e);

            await createAndSaveEndpoint();
          } else {
            logger.error('Error while getting endpointAttributes. error: %s', e);
          }
        }
      } else {
        logger.info('No existing endpoint, creating new endpoint...');
        await createAndSaveEndpoint();
      }
    } catch (e) {
      logger.error('Unexpected error during device registration: %o', e);
    }
  }
}
