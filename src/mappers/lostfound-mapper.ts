import { marshall, NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { nanoid } from 'nanoid';
import { ILostOrFoundItem } from "../types/lostfound-items.js";

export const lostFoundItemToDDB = (record: Record<string, NativeAttributeValue>) => {
  const marshalledRecord = marshall(record);
  return {
    id: marshall(`${record.isFoundItem ? 'Found':'Lost'}_${nanoid(15)}`),
    publisher_email: marshalledRecord.publisherEmail,
    is_found_item: marshalledRecord.isFoundItem,
    contact_info: marshalledRecord.contactInfo,
    lost_or_found_date: marshall(Date.now().toString()),
    title: marshalledRecord.title,
    description: marshalledRecord.description ?? null,
    images: marshalledRecord.images ?? null
  }
};

export const getLostFoundItemKey = (id: string) => {
  return {
    id: marshall(id)
  }
};

export const DDBObjToLostFoundItem = (record: Record<string, NativeAttributeValue>) => {
  const unmarshalledRecord = unmarshall(record);
  return {
    id: unmarshalledRecord.id,
    publisherEmail: unmarshalledRecord.publisher_email,
    isFoundItem: unmarshalledRecord.is_found_item,
    contactInfo: unmarshalledRecord.contact_info,
    title: unmarshalledRecord.title,
    description: unmarshalledRecord?.description,
    images: unmarshalledRecord?.images,
    lostOrFoundDate: unmarshalledRecord.lost_or_found_date
  } as ILostOrFoundItem;
}

export const getfilterExpression = () => {
  return "isFoundItem = :val"
}

export const getExprAttributeValues = (isFoundItem: boolean) => {
  return {
    ":val": marshall(isFoundItem)
  };
}