import { Request, Response } from "express";
import { createLogger, CustomLogger } from "../lib/logger.js";
import { injectable } from "tsyringe";
import { failureResponse, successResponse } from "../lib/response.js";
import { S3Service } from "../services/s3-service.js";
import { IDocument } from "../types/lostfound-items.js";
import { nanoid } from "nanoid";
import { S3_BUCKETS } from "../constants.js";

const logger: CustomLogger = createLogger({fileName: 'UtilsController'});

@injectable()
export class UtilsController {
  constructor(
    private s3Service: S3Service
  ) {}

  /**
   * generate document upload urls
   * @param req 
   * @param res 
   */
  getDocumentUplaodUrls = async(req: Request, res: Response) => {
    const documents = req.body as IDocument[];
    try {
      logger.debug('Generating the document uplaod the urls.')
      const results = documents.map(async(doc)=> {
        const key = `${nanoid()}_${doc.fileName}`;
        const url = await this.s3Service.getPresignedUrlForUpload(
          S3_BUCKETS.LOST_OR_FOUND_ITEM_IMAGES,
          key,
          doc.fileType
        );
        return {
          key: key,
          uploadUrl: url,
          originalFileName: doc.fileName,
        }
      });

      Promise.all(results);
      successResponse({
        res,
        body: {
          data: results,
          message: 'Successfully generated the uplaod urls.'
        }
      })
    } catch (e) {
      logger.error('Error while generating the document upload urls.');
      failureResponse({
        res,
        body: {
          message: 'Error while generating the document uplaod urls.'
        }
      })
    }
  }

}