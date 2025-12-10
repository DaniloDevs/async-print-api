import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env";

export async function getImageFromS3ByKey(
   key: string,
   s3: any
) {
   const command = new GetObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: key
   })
   const urlSignerd = getSignedUrl(s3, command, { expiresIn: 60 * 5 })

   return urlSignerd
}
