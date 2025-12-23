import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../connections/minio";
import { env } from "../../env";
import type { IStorageProvider, uploadInput } from "../storage-provider";

export class MinioStorageProvider implements IStorageProvider {
   async upload({ file, filename, contentType }: uploadInput) {
      await s3.send(
         new PutObjectCommand({
            Bucket: env.MINIO_BUCKET,
            Key: filename,
            Body: file,
            ContentType: contentType,
         }),
      );

      return filename;
   }
}
