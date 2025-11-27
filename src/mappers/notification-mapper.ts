import { marshall, NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { nanoid } from "nanoid";

export const intoToDDB = (record: Record<string, NativeAttributeValue>) => {
  const marshalledRecord = marshall(record);
  return {
    id: marshall(`${nanoid(15)}`),
    title: marshalledRecord.title,
    description: marshalledRecord.description,
    image: marshalledRecord.image ?? null,
    time_stamp: marshalledRecord.timeStamp ?? marshall(Date.now()),
    type: marshalledRecord.type,
    receivers: marshalledRecord.receivers ?? null,
    receiver_type: marshalledRecord.receiverType ?? null
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
