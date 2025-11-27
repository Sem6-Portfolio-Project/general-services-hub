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
    default: "Default fallback message",
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
};

export const generateSQSEventBody = (
  title: string,
  type: number,
  description?: string,
  image?: string,
  receivers?: string[],
  receiverType?: number
) => {
  return JSON.stringify({
    title,
    description,
    type,
    image,
    receivers,
    receiverType
  });
}
