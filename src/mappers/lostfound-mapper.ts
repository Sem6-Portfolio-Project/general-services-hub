import { marshall, NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { nanoid } from 'nanoid';
import { ILostOrFoundItem } from "../types/lostfound-items";

export const lostFoundItemToDDB = (data: any) => {
  return {
    id: `${data.isFoundItem ? 'Found':'Lost'}_${nanoid(15)}`,
    publisher_email: data.publisherEmail,
    is_found_item: data.isFoundItem,
    contact_info: data.contactInfo,
    lost_or_found_date: Date.now().toString(),
    title: data.title,
    description: data?.description,
    images: data?.images
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