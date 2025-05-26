import { 
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client
 } from "@aws-sdk/client-s3";
import { AwsService } from "./aws-service";

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
    body: string,
    fileType: string,
    policy: 'public-read'
  ): Promise<PutObjectCommandOutput> => {
    return this.executeCommand(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: body,
        ContentType: fileType,
        ACL: policy
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

}