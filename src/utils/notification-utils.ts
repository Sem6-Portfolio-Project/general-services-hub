
/**
 * this will generate the notification across all device ( ios, android, web ).
 * if you need platform specific one, then it should be handled differently.
 * @param title
 * @param description
 * @param image
 */
export const generateFCMNotification = (
  title: string,
  description: string,
  image?: string
): string => {
  const payload = {
    GCM: JSON.stringify({
      fcmV1Message: {
        message: {
          notification: {
            title: title,
            body: description,
            ...(image && { image: image })
          }
        }
      }
    })
  };
  return JSON.stringify(payload);
}
