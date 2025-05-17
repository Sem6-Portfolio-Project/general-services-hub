import { CreatePlatformEndpointCommand, CreatePlatformEndpointCommandOutput, DeleteEndpointCommand, DeleteEndpointCommandOutput, GetEndpointAttributesCommand, GetEndpointAttributesCommandOutput, SNSClient } from "@aws-sdk/client-sns";
import { AwsService } from "./aws-service";
import { PLATFORM_APPLICATION_ARN } from "../constants";

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
  
} 