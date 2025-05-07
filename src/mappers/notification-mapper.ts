import { INotificationEvent } from "../types/notification";

export const intoToDDB = (data: INotificationEvent) => {
  return {
    title: data.title,
    description: data.description,
    time_stamp: data.timeStamp,
    type: data.type,
    receivers: data?.receivers,
    receiver_type: data?.receiverType
  }
}
