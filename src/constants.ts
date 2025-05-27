
export const BASE_URLS : string[] = ['http://localhost:8081','http://*'];

export const ERROR_MESSAGES = {
  UNEXPECTED_PROCESSING_ERROR: 'Unexpected processing error'
}

export const SNS_TOPICS = {
  SYSTEM: {
    name: 'SystemNotifications',
    arn: process.env.SYS_NOTIFI_TOPIC_ARN
  },
  LOST_ITEMS: {
    name: 'LostItmesNotifications',
    arn: process.env.LOSTITEM_TOPIC_ARN
  }
}

export const NOTIFICATION_TYPES = {
  SYSTEM: { 
    value: 1, 
    name: 'System notifications',
    snsTopic: SNS_TOPICS.SYSTEM
   },
  LOST_FOUND: { 
    value: 2, 
    name: 'Lost & found notifications',
    snsTopic: SNS_TOPICS.LOST_ITEMS
 }
}

export const TABLES = {
  APPLICATION_ENDPOINTS: "PlatformEndpoints",
  NOTIFICATIONS: "Notifications",
  LOST_OR_FOUND_ITEMS: "LostOrFoundItems"
}

export const CONNECTION_TYPES = {
  BUS: 1,
  PASSENGER: 2,
}

export const S3_BUCKETS = {
  LOST_OR_FOUND_ITEM_IMAGES: "LostOrFoundItemImages"
}

export const S3_OBJECTS_ACL_POLICY = {
  PRIVATE: "private",
  PUBLIC_READ: "public-read",
  PUBLIC_READ_WRITE: "public-read-write",
  AUTHENTICATED_READ: "authenticated-read",
  AWS_EXEC_READ: "aws-exec-read",
  BUCKET_OWNER_READ: "bucket-owner-read",
  BUCKET_OWNER_FULL_CONTROL: "bucket-owner-full-control"
}

export const DEFAULT_LIMIT_UPPER_BOUND = 10;

export const PLATFORM_APPLICATION_ARN = process.env.PLATFORM_APPLICATION_ARN || '';
export const NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || '';