import { 
  NOTIFICATION_QUEUE,
  NOTIFICATION_TYPES,
  S3_BUCKETS,
  S3_OBJECTS_ACL_POLICY,
  TABLES
 } from "../constants";
import { Request, Response } from "express";
import { createLogger, CustomLogger } from "../lib/logger";
import { 
  DDBObjToLostFoundItem,
  getLostFoundItemKey,
  lostFoundItemToDDB
 } from "../mappers/lostfound-mapper";
import { DynamodbService } from "../services/dynamodb-service";
import { S3Service } from "../services/s3-service";
import { SQSService } from "../services/sqs-service";
import { ILostOrFoundItem } from "../types/lostfound-items";
import { generateSQSEventBody } from "../utils/notification-utils";
import { getImageAccessPubUrl } from "../utils/s3-utils";
import { failureResponse, successResponse } from "../lib/response";

const logger: CustomLogger = createLogger({fileName: 'NotificationController'});

export class LostFoundItemController {
  constructor(
    private dynamodbService: DynamodbService,
    private sqsService: SQSService,
    private s3Service: S3Service

  ) {}

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

  getLostOrFoundItems = async(req: Request, res: Response) =>  {

    // fetch the items from the ddb based on the range (1-10 like that)

    // then return them
  }

  deleteLostFoundItem = async(req: Request, res: Response) =>  {

    // delete the item by the id

  }


}
