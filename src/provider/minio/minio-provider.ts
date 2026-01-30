import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

    async getPublicUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: env.MINIO_BUCKET,
            Key: key,
        });

        const urlSignerd = getSignedUrl(s3, command, { expiresIn: 60 * 5 });

        return urlSignerd;
    }
}
