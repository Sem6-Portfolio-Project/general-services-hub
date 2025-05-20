export interface INotification {
  title: string,
  description: string,
  image?: string,
  timeStamp: string,
  type: number
}

export interface INotificationEvent extends INotification {
  receivers?: string[],
  receiverType?: number
}

export interface IDeviceRegisterReq {
  email: string,
  deviceToken: string,
}
