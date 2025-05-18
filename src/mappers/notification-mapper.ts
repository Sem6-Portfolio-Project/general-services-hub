import { marshall, NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { INotificationEvent } from "../types/notification";

export const intoToDDB = (data: INotificationEvent) => {
  return {
    message: data.message,
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

export const getNotificationData = (record: Record<string, NativeAttributeValue>) => {
  const unmarshalledRecord = unmarshall(record);
  return {
    email: unmarshalledRecord.email,
    deviceToken: unmarshalledRecord.device_token,
    endpointArn: unmarshalledRecord.endpoint_arn,
    sysSubscriptionArn: unmarshalledRecord.sys_subscription_arn,
    lostItemSubscriptionArn: unmarshalledRecord.lost_item_subscription_arn
  };
};

export const notificationDataToddb = (data: any) => {
  return {
    email: data.email,
    device_token: data.deviceToken,
    endpoint_arn: data.endpointArn,
    sys_subscription_arn: data.sysSubscriptionArn,
    lost_item_subscription_arn: data.lostItemSubscriptionArn,
  };
};