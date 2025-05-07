export interface INotification {
  title: string,
  description: string,
  timeStamp: string,
  type: number
}

export interface INotificationEvent extends INotification{
  receivers?: string[],
  receiverType?: number
}
