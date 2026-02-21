import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../env";

export const s3 = new S3Client({
    region: "sa-east-1",
    endpoint: env.MINIO_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: env.MINIO_ACCESS_KEY,
        secretAccessKey: env.MINIO_SECRET_KEY,
    },
});
