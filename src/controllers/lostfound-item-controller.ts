import { DynamodbService } from "../services/dynamodb-service";
import { S3Service } from "../services/s3-service";
import { SNSService } from "../services/sns-service";

export class LostFoundItemController {
  constructor(
    private dynamodbService: DynamodbService,
    private snsService: SNSService,
    private s3Service: S3Service

  ) {}

  postLostOrFoundItem = async() =>  {

    // save the images to the s3 and get that public images ulr

    // save the info to the ddb

    // send the success respose with the data

  }

  getLostOrFoundItem = async() =>  {

    // fetch the item from the ddb based on the id 

    // then return it 

  }

  getLostOrFoundItems = async() =>  {

    // fetch the items from the ddb based on the range (1-10 like that)

    // then return them
  }

  deleteLostFoundItem = async() =>  {

    // delete the item by the id

  }
}
