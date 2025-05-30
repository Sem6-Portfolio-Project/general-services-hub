import { marshall, NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { INotificationEvent } from "../types/notification.js";

export const intoToDDB = (data: INotificationEvent) => {
  return {
    title: data.title,
    description: data.description,
    image: data?.image,
    time_stamp: data.timeStamp,
    type: data.type,
    receivers: data?.receivers,
    receiver_type: data?.receiverType
  }
}

export const getddbKeyofEndpoints = (email: string) => {
  return {
    email: marshall(email)
  }
};

export const getSubscriptionData = (record: Record<string, NativeAttributeValue>) => {
  const unmarshalledRecord = unmarshall(record);
  return {
    email: unmarshalledRecord.email,
    deviceToken: unmarshalledRecord.device_token,
    endpointArn: unmarshalledRecord.endpoint_arn,
    sysSubscriptionArn: unmarshalledRecord.sys_subscription_arn,
    lostItemSubscriptionArn: unmarshalledRecord.lost_item_subscription_arn
  };
};

export const subscriptionDataToddb = (record: Record<string, NativeAttributeValue>) => {
  const marshalledData = marshall(record);
  return {
    email: marshalledData.email,
    device_token: marshalledData.deviceToken,
    endpoint_arn: marshalledData.endpointArn,
    sys_subscription_arn: marshalledData.sysSubscriptionArn,
    lost_item_subscription_arn: marshalledData.lostItemSubscriptionArn,
  };
};
