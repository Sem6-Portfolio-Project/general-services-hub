
  export const getImageAccessPubUrl = (bucketName: string, fileName: string) => {
    return `https://${bucketName}.s3.amazonaws.com/${fileName}`;
  }