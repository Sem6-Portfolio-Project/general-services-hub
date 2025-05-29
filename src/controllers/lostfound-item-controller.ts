import { 
  DEFAULT_LIMIT_UPPER_BOUND,
  NOTIFICATION_QUEUE,
  NOTIFICATION_TYPES,
  S3_BUCKETS,
  S3_OBJECTS_ACL_POLICY,
  TABLES
 } from "../constants.js";
import { Request, Response } from "express";
import { createLogger, CustomLogger } from "../lib/logger.js";
import { 
  DDBObjToLostFoundItem,
  getExprAttributeValues,
  getfilterExpression,
  getLostFoundItemKey,
  lostFoundItemToDDB
 } from "../mappers/lostfound-mapper.js";
import { DynamodbService } from "../services/dynamodb-service.js";
import { S3Service } from "../services/s3-service.js";
import { SQSService } from "../services/sqs-service.js";
import { ILostOrFoundItem } from "../types/lostfound-items.js";
import { generateSQSEventBody } from "../utils/notification-utils.js";
import { getImageAccessPubUrl } from "../utils/s3-utils.js";
import { failureResponse, successResponse } from "../lib/response.js";
import { injectable } from "tsyringe";

const logger: CustomLogger = createLogger({fileName: 'NotificationController'});

@injectable()
export class LostFoundItemController {
  constructor(
    private dynamodbService: DynamodbService,
    private sqsService: SQSService,
    private s3Service: S3Service

  ) {}

  /**
   * this will uplaod images to s3, save lost/found data to ddb and create notification sqs event
   * @param req 
   * @param res 
   */
  postLostOrFoundItem = async(req: Request, res: Response) =>  {
    const data = req.body as ILostOrFoundItem;
    const images: string[] = [];
    try {
      if(data?.images && data.images.length != 0) {
        logger.debug('Uploaging images to s3 bucket');

        const uploadedImages = data.images.map(async(image) => {
           const buffer = Buffer.from(image.fileBase64, 'base64');
           
           await this.s3Service.uploadObject(
            S3_BUCKETS.LOST_OR_FOUND_ITEM_IMAGES,
            image.fileName,
            buffer,
            image.fileType,
            S3_OBJECTS_ACL_POLICY.PUBLIC_READ
           );

           images.push(getImageAccessPubUrl(
            S3_BUCKETS.LOST_OR_FOUND_ITEM_IMAGES,
            image.fileName
           ));

        });

        Promise.all(uploadedImages);
      }
      logger.debug('Successfuly saved images to s3 bucket');
    } catch (e) {
      logger.error('Error while uploading the images to s3 bucket: %o', e);
      failureResponse({
        res,
        status: 400,
        body: {
          message: 'Error while uploading the images to s3 bucket'
        }
      });
    }

    try {
      logger.debug(`Saving the ${data.isFoundItem ? 'found': 'lost'} item to the ddb`);

      await this.dynamodbService.put(
        TABLES.LOST_OR_FOUND_ITEMS,
        lostFoundItemToDDB({
          ...data,
          images: images
        })
      );
    } catch (e) {
      logger.error(`Error while saving the ${data.isFoundItem ? 'found':'lost'} item to the ddb: %o`, e);
      failureResponse({
        res,
        status: 400,
        body: {
          message: `Error while saving the ${data.isFoundItem ? 'found':'lost'} item to the ddb.`
        }
      });
    }

    try {
      logger.debug('Creating sqs evet to for the notification invoker');
      await this.sqsService.sendMessageToQueue(
        NOTIFICATION_QUEUE,
        generateSQSEventBody(
          data.title,
          NOTIFICATION_TYPES.LOST_FOUND.value,
          data?.description,
          images[0] ?? undefined,
        )
      );
    } catch (e) {
      logger.error('Error while creating the sqs event for the notification invoker; error: %o', e);
      failureResponse({
        res,
        status: 400,
        body: {
          message: "Error while creating the sqs event for the notification invoker."
        }
      });
    }

    successResponse({
      res,
      body: {
        message: `Successfully posted the ${data.isFoundItem ? 'found':'lost'} item.`
      }
    });
  }

  /**
   * this retrive the lost/found item data 
   * @param req 
   * @param res 
   */
  getLostOrFoundItem = async(req: Request, res: Response) =>  {
    const lostFoundItemId: string = req.query.id as string;
    try {
      logger.debug('Retriving the lost/found item from the ddb with id: %s', lostFoundItemId);

      const record = await this.dynamodbService.getItem(
        TABLES.LOST_OR_FOUND_ITEMS,
        getLostFoundItemKey(lostFoundItemId)
      );

      if(record?.Item) {
        successResponse({
          res,
          body: {
            data: DDBObjToLostFoundItem(record.Item),
            message: 'Successfully retrived item from the ddb.'
          }
        });
      } else {
        failureResponse({
          res,
          status: 400,
          body: {
            message: "Not Item found!"
          }
        });
      }
    } catch (e) {
      logger.error('Error while retriving the lost/found item; error: %o', e);
      failureResponse({
        res,
        status: 400,
        body: {
          message: "Error while retriving the lost/found item"
        }
      });      
    }
  }

  /**
   * this filtered the data from the ddb based on the limit and found/lost.
   * @param req 
   * @param res 
   */
  getLostOrFoundItems = async(req: Request, res: Response) =>  {
    const isFoundItem = req.query.isFound as string === 'true' ? true : false;
    const limitUpperBound = Number(req.query.limit as string) || DEFAULT_LIMIT_UPPER_BOUND;
    const returnItems: ILostOrFoundItem[] = []
    try {
      logger.debug(`Retriving ${isFoundItem ? 'found':'lost'} items with limitUpperBound: %s`, limitUpperBound);
      const filteredData = await this.dynamodbService.scan(
        TABLES.LOST_OR_FOUND_ITEMS,
        limitUpperBound,
        getfilterExpression(),
        getExprAttributeValues(isFoundItem)
      );

      if(filteredData?.Items) {
        filteredData.Items.map((record) => {
          returnItems.push(DDBObjToLostFoundItem(record));
        })
      };

      successResponse({
        res,
        body: {
          data: returnItems,
          message: "Successfuly filtered the data."
        }
      })
    } catch (e) {
      logger.debug('Error while scaning the data from the ddb; error: %o', e);
      failureResponse({
        res,
        status: 400,
        body: {
          message: "Error while scaning the lost/found item"
        }
      });   
    }
  }

  /**
   * deleted the lost/found item from the ddb
   * @param req 
   * @param res 
   */
  deleteLostFoundItem = async(req: Request, res: Response) =>  {
    const lostFoundItemId: string = req.query.id as string;
    try {
      logger.debug('Deleting lost/found item with id: %s', lostFoundItemId);
      await this.dynamodbService.delete(
        TABLES.LOST_OR_FOUND_ITEMS,
        getLostFoundItemKey(lostFoundItemId)
      );
      successResponse({
        res,
        body: {
          message: 'Successfuly deleted the item from the ddb.'
        }
      })
    } catch (e) {
      failureResponse({
        res,
        status: 400,
        body: {
          message: "Error while deleting the lost/found item"
        }
      }); 
    }
  }
}
