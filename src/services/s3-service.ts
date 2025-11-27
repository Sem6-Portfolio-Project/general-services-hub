import { 
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client
 } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AwsService } from "./aws-service.js";

export class S3Service extends AwsService {

  constructor() {
    super(
      "S3Service",
      new S3Client({})
    )
  }

  /**
   * this will upload an object to the s3
   * @param bucket bucket name
   * @param fileName file name
   * @param body base64 encorded image
   * @param fileType file type
   * @param policy ACL policy. "private" || "public-read" || "public-read-write" || 
   *              "authenticated-read" || "aws-exec-read" || "bucket-owner-read" || "bucket-owner-full-control"
   */
  uploadObject= (
    bucket: string,
    fileName: string,
    body: Buffer<ArrayBuffer>,
    fileType: string,
    policy: string
  ): Promise<PutObjectCommandOutput> => {
    return this.executeCommand(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: body,
        ContentType: fileType,
        ACL: policy as ObjectCannedACL
      }),
      "PutObjectCommand"
    );
  };

  /**
   * delete an object from the s3 
   * @param bucket 
   * @param key 
   */
  deleteObject = (
    bucket: string,
    key: string
  ): Promise<DeleteObjectCommandOutput> => {
    return this.executeCommand(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      }),
      'DeleteObjectCommand'
    );
  };

  /**
   * generate document uplaod url for s3 
   * @param bucket 
   * @param key 
   * @param contentType 
   * @param expiresIn 
   */
  getPresignedUrlForUpload = (
    bucket: string,
    key: string,
    contentType: string,
    expiresIn: number = 300
  ): Promise<string> => {
    
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType
    });

    return getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * generate download url for the s3
   * @param bucket 
   * @param key 
   * @param expiresIn 
   */
  getPresignedUrlForDownload = (
    bucket: string,
    key: string,
    expiresIn: number = 600
  ): Promise<string> => {
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn })
  }
}