import { AwsService } from "./aws-service";
import {
  AttributeValue,
  DeleteItemCommand,
  DeleteItemCommandOutput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  ReturnValue,
  ScanCommand,
  ScanCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  NativeAttributeValue,
} from "@aws-sdk/lib-dynamodb";

export class DynamodbService extends AwsService {

  constructor() {
    super(
      "DynamoDB",
      DynamoDBDocumentClient.from(new DynamoDBClient({}), {
        marshallOptions: {
          removeUndefinedValues: true
        }
      })
    );
  }

  /**
   * data put to the dynamodb table
   * @param tableName
   * @param item
   */
  put = (
    tableName: string,
    item: Record<string, NativeAttributeValue>
  ): Promise<PutItemCommandOutput> => {
    return this.executeCommand(
      new PutItemCommand({
        Item: item,
        TableName: tableName
      }),
      "PutCommand"
    )
  };

  /**
   * get item from the dynamodb
   * @param tableName
   * @param key primary key
   */
  getItem = (
    tableName: string,
    key: Record<string, NativeAttributeValue>
  ): Promise<GetItemCommandOutput> => {
    return this.executeCommand(
      new GetItemCommand({
        TableName: tableName,
        Key: key
      }),
      "GetItemCommand"
    )
  };

  /**
   * query items
   * @param tableName
   */
    //TODO: need to add index and rest to query items
  query = (
    tableName: string,
  ): Promise<QueryCommandOutput> => {
    return this.executeCommand(
      new QueryCommand({
        TableName: tableName
      }),
      "QueryCommand"
    )
  };

  /**
   * update an item
   * @param tableName
   * @param key primary key
   * @param expression update expression ( attribute to be updated)
   * @param expAttributeNames expression attribute names
   * @param expAttributeValues expression attribute values
   * @param returnValues expected return values
   */
  updateItem = (
    tableName: string,
    key: Record<string, NativeAttributeValue>,
    expression: string,
    expAttributeNames: Record<string, string>,
    expAttributeValues?: Record<string, NativeAttributeValue>,
    returnValues?: ReturnValue,
  ): Promise<UpdateItemCommandOutput> => {
    return this.executeCommand(
      new UpdateItemCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: expression,
        ExpressionAttributeNames: expAttributeNames,
        ExpressionAttributeValues: expAttributeValues,
        ReturnValues: returnValues
      }),
      "UpdateItemCommand"
    )
  }

  /**
   * delete bus
   * @param tableName
   * @param key primary key
   * @param returnValues expected return values
   */
  delete = (
    tableName: string,
    key: Record<string, NativeAttributeValue>,
    returnValues?: ReturnValue
  ): Promise<DeleteItemCommandOutput> => {
    return this.executeCommand(
      new DeleteItemCommand({
        Key: key,
        TableName: tableName,
        ReturnValues: returnValues
      }),
      "DeleteItemCommand"
    );
  }

  /**
   * Scan the table
   * @param tableName
   */
  scan = (
    tableName: string,
    limit?: number,
    filterExpression?: string,
    expressionAttributeValues?: Record<string, AttributeValue>
  ): Promise<ScanCommandOutput> => {
    return this.executeCommand(
      new ScanCommand({
        TableName: tableName,
        Limit: limit,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues
      }),
      "ScanCommand"
    )
  }
}
