export interface INotification {
  message: string,
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
