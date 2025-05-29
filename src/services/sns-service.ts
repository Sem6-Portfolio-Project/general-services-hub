import { 
  CreatePlatformEndpointCommand, 
  CreatePlatformEndpointCommandOutput, 
  DeleteEndpointCommand, 
  DeleteEndpointCommandOutput, 
  GetEndpointAttributesCommand, 
  GetEndpointAttributesCommandOutput, 
  PublishCommand, 
  PublishCommandOutput, 
  SNSClient, 
  SubscribeCommand,
  SubscribeCommandOutput,
  UnsubscribeCommand,
  UnsubscribeCommandOutput
 } from "@aws-sdk/client-sns";
import { AwsService } from "./aws-service.js";
import { PLATFORM_APPLICATION_ARN } from "../constants.js";

export class SNSService extends AwsService {
  constructor() {
    super(
      "SNSClient",
      new SNSClient({})
    );
  };

  /**
   * create application endpoint
   * @param deviceToken
   */
  createApplicationEndpoint = (
    deviceToken: string,
  ): Promise<CreatePlatformEndpointCommandOutput>=>{
    return this.executeCommand(
      new CreatePlatformEndpointCommand({
        PlatformApplicationArn: PLATFORM_APPLICATION_ARN,
        Token: deviceToken
      }),
      'CreatePlatformEndpointCommand'
    )
  };

  /**
   * getting application endpoint attributes 
   * @param endpointArn 
   */
  getEndpointAttributes = (
    endpointArn: string
  ): Promise<GetEndpointAttributesCommandOutput> => {
    return this.executeCommand(
      new GetEndpointAttributesCommand({
        EndpointArn: endpointArn
      }),
      'GetEndpointAttributesCommand'
    );
  };

  /**
   * delete application endpoint
   * @param endpointArn 
   */
  deleteEndpoint = (
    endpointArn: string
  ): Promise<DeleteEndpointCommandOutput> => {
    return this.executeCommand(
      new DeleteEndpointCommand({
        EndpointArn: endpointArn
      }),
      'DeleteEndpointCommand'
    );
  };

  /**
   * subscribe the endpoint
   * @param topicArn 
   * @param targetEndpoint
   */
  subscribeSNSTopic = (
    topicArn: string,
    endpointArn: string
  ): Promise<SubscribeCommandOutput> => {
    return this.executeCommand(
      new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: 'application',
        Endpoint: endpointArn
      }),
      'SubscribeCommand'
    );
  };

  /**
   * unsubscribe the subscription
   * @param subscribeArn 
   */
  unsubscribeSNSTopic = (
    subscribeArn: string
  ): Promise<UnsubscribeCommandOutput> => {
    return this.executeCommand(
      new UnsubscribeCommand({
        SubscriptionArn: subscribeArn
      }),
      'UnsubscribeCommand'
    );
  }

  /**
   * publish message to targetEndpoint/topic
   * @param message 
   * @param topicArn 
   * @param targetEndpointArn
   */
  publishMessage = (
    message: string,
    topicArn?: string,
    targetEndpointArn?: string
  ): Promise<PublishCommandOutput> => {
    return this.executeCommand(
      new PublishCommand({
        TopicArn: topicArn,
        TargetArn: targetEndpointArn,
        Message: message
      }),
      'PublishCommand'
    )
  };
  
} 