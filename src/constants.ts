
export const BASE_URLS : string[] = ['http://localhost:8081','http://*'];

export const ERROR_MESSAGES = {
  UNEXPECTED_PROCESSING_ERROR: 'Unexpected processing error'
}

export const NOTIFICATION_TYPES = {
  SYSTEM: { value: 1, name: 'System notifications' },
  LOST_FOUND: { value: 2, name: 'Lost & found notifications' }
}

export const TABLES = {
  APPLICATION_ENDPOINTS: "ApplicationEnpoints",
  NOTIFICATIONS: "Notifications",
}

export const CONNECTION_TYPES = {
  BUS: 1,
  PASSENGER: 2,
}

export const PLATFORM_APPLICATION_ARN = process.env.PLATFORM_APPLICATION_ARN;